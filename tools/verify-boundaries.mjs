// Proves the module boundary rules are (1) applied to every project and
// (2) respected by every edge of the real project graph.
//
//   node tools/verify-boundaries.mjs
//
// Lint already enforces the rules per file. This script answers the questions
// lint cannot: "is the rule actually switched on in every project?" and "are
// the tags well-formed?". A package whose tags are malformed is silently exempt
// from every constraint, and lint stays green. The same goes for the rule that
// makes packages declare their dependencies: it silently skips a project that
// lacks the target it is matched through.
//
// The constraints are read from the *effective* ESLint config, so there is no
// second copy of the rules to keep in sync.
import { execSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { ESLint } = createRequire(join(root, 'package.json'))('eslint');

const BOUNDARIES = '@nx/enforce-module-boundaries';
const RESTRICTED = 'no-restricted-imports';
const DEPENDENCY_CHECKS = '@nx/dependency-checks';
// package -> the only project allowed to import it
const SINGLE_OWNER = { 'react-router': 'shop', 'embla-carousel': 'shared-ui' };

const failures = [];
const fail = (msg) => failures.push(msg);

// --- project graph ---------------------------------------------------------
const graphFile = join(mkdtempSync(join(tmpdir(), 'nx-graph-')), 'graph.json');
execSync(`pnpm nx graph --file="${graphFile}"`, { cwd: root, stdio: 'pipe' });
const { nodes, dependencies } = JSON.parse(
  readFileSync(graphFile, 'utf8'),
).graph;
const projects = Object.values(nodes).sort((a, b) =>
  a.name.localeCompare(b.name),
);

// --- 1. tags ---------------------------------------------------------------
console.log('\n1. Tags');
for (const p of projects) {
  // Nx adds implicit npm:public / npm:private tags derived from package.json.
  const implicit = (p.data.tags ?? []).filter((t) => t.startsWith('npm:'));
  const tags = (p.data.tags ?? []).filter((t) => !t.startsWith('npm:'));
  const types = tags.filter((t) => t.startsWith('type:'));
  const scopes = tags.filter((t) => t.startsWith('scope:'));
  const malformed = tags.filter((t) => !/^(type|scope):[a-z-]+$/.test(t));

  if (malformed.length)
    fail(`${p.name}: malformed tag(s) ${JSON.stringify(malformed)}`);
  if (!implicit.includes('npm:private'))
    fail(
      `${p.name}: package.json must set "private": true (nothing here is published)`,
    );
  if (types.length !== 1)
    fail(`${p.name}: expected exactly one type: tag, got ${types.length}`);
  if (p.type === 'lib' && scopes.length !== 1)
    fail(`${p.name}: a lib needs exactly one scope: tag, got ${scopes.length}`);

  console.log(`   ${p.name.padEnd(32)} ${tags.join('  ')}`);
}

// --- 2. effective ESLint config per project --------------------------------
console.log('\n2. Effective ESLint config');
let constraints;
for (const p of projects) {
  const dir = join(root, p.data.root);
  const entry = ['src/index.ts', 'src/main.tsx']
    .map((f) => join(dir, f))
    .find(existsSync);
  if (!entry) {
    fail(`${p.name}: no entry file to resolve a config for`);
    continue;
  }

  const { rules = {} } = await new ESLint({ cwd: dir }).calculateConfigForFile(
    entry,
  );
  const [severity, options] = [].concat(rules[BOUNDARIES] ?? [0]);
  const depConstraints = options?.depConstraints ?? [];

  if (severity !== 2) fail(`${p.name}: ${BOUNDARIES} is not "error"`);
  constraints ??= depConstraints;
  if (JSON.stringify(depConstraints) !== JSON.stringify(constraints))
    fail(`${p.name}: depConstraints differ from the other projects`);

  const [restrictedSeverity, restrictedOptions] = [].concat(
    rules[RESTRICTED] ?? [0],
  );
  const restrictedGroups =
    restrictedSeverity === 2
      ? (restrictedOptions?.patterns ?? []).flatMap((x) => x.group)
      : [];

  const allowed = [];
  for (const [pkg, owner] of Object.entries(SINGLE_OWNER)) {
    const isRestricted = restrictedGroups.includes(pkg);
    if (!isRestricted) allowed.push(pkg);
    if (p.name === owner && isRestricted)
      fail(`${p.name}: should be allowed to import ${pkg}`);
    if (p.name !== owner && !isRestricted)
      fail(`${p.name}: must not be allowed to import ${pkg}`);
  }

  // @nx/dependency-checks does nothing, without a word, for a project that has
  // none of the targets listed in `buildTargets`. So "the rule is on" has to
  // mean: severity error AND the project really has one of those targets.
  const { rules: manifestRules = {} } = await new ESLint({
    cwd: dir,
  }).calculateConfigForFile(join(dir, 'package.json'));
  const [depSeverity, depOptions] = [].concat(
    manifestRules[DEPENDENCY_CHECKS] ?? [0],
  );
  const depTarget = (depOptions?.buildTargets ?? ['build']).find(
    (target) => p.data.targets?.[target],
  );
  if (depSeverity !== 2) fail(`${p.name}: ${DEPENDENCY_CHECKS} is not "error"`);
  else if (!depTarget)
    fail(
      `${p.name}: ${DEPENDENCY_CHECKS} is on but the project has none of its buildTargets, so it checks nothing`,
    );

  console.log(
    `   ${p.name.padEnd(32)} boundaries=error  constraints=${depConstraints.length}` +
      `  dependency-checks=${depTarget ? `via ${depTarget}` : 'OFF'}` +
      `  may import: ${allowed.length ? allowed.join(', ') : '-'}`,
  );
}

// --- 3. every workspace edge against the constraints -----------------------
console.log('\n3. Project graph edges');
const allowedFor = new Map(
  (constraints ?? []).map((c) => [c.sourceTag, c.onlyDependOnLibsWithTags]),
);
let edges = 0;
for (const deps of Object.values(dependencies)) {
  for (const { source, target } of deps) {
    if (!nodes[source] || !nodes[target]) continue; // npm packages
    edges++;
    const targetTags = nodes[target].data.tags ?? [];
    const broken = (nodes[source].data.tags ?? []).filter(
      (tag) =>
        allowedFor.has(tag) &&
        !targetTags.some((t) => allowedFor.get(tag).includes(t)),
    );
    if (broken.length)
      fail(`${source} -> ${target} violates ${broken.join(', ')}`);
    console.log(
      `   ${source} -> ${target}   ${broken.length ? 'VIOLATION' : 'ok'}`,
    );
  }
}
if (!edges) console.log('   (no dependencies between workspace projects yet)');

// --- result ----------------------------------------------------------------
console.log(
  `\n${projects.length} projects, ${constraints?.length ?? 0} constraints, ${edges} workspace edges, ${failures.length} problem(s)`,
);
for (const f of failures) console.error(`   x ${f}`);
process.exit(failures.length ? 1 : 0);
