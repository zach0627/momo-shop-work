import nx from '@nx/eslint-plugin';
import * as jsoncParser from 'jsonc-eslint-parser';

/**
 * Layering rules (see docs/MoMO面試/Phase 1 §3).
 *
 *   app -> layout / page -> feature -> ui / data-access -> util
 *
 * A project must satisfy BOTH its `type:` and its `scope:` constraint.
 * `layout` and `page` are the two layers that may compose several features,
 * so feature -> feature (and data-access -> data-access) is an error.
 *
 * `layout` and `page` are siblings: the router nests a page inside a layout,
 * neither imports the other. Only the app may depend on a layout.
 */
const typeConstraints = [
  {
    sourceTag: 'type:app',
    onlyDependOnLibsWithTags: [
      'type:layout',
      'type:page',
      'type:feature',
      'type:ui',
      'type:data-access',
      'type:util',
    ],
  },
  {
    sourceTag: 'type:layout',
    onlyDependOnLibsWithTags: [
      'type:feature',
      'type:ui',
      'type:data-access',
      'type:util',
    ],
  },
  {
    sourceTag: 'type:page',
    onlyDependOnLibsWithTags: [
      'type:feature',
      'type:ui',
      'type:data-access',
      'type:util',
    ],
  },
  {
    sourceTag: 'type:feature',
    onlyDependOnLibsWithTags: ['type:ui', 'type:data-access', 'type:util'],
  },
  { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:util'] },
  { sourceTag: 'type:data-access', onlyDependOnLibsWithTags: ['type:util'] },
  { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util'] },
];

const scopeConstraints = [
  {
    sourceTag: 'scope:home',
    onlyDependOnLibsWithTags: ['scope:home', 'scope:catalog', 'scope:shared'],
  },
  {
    sourceTag: 'scope:goods',
    onlyDependOnLibsWithTags: ['scope:goods', 'scope:catalog', 'scope:shared'],
  },
  // what the whole storefront shares: the chrome around every page
  {
    sourceTag: 'scope:shop',
    onlyDependOnLibsWithTags: ['scope:shop', 'scope:catalog', 'scope:shared'],
  },
  {
    sourceTag: 'scope:catalog',
    onlyDependOnLibsWithTags: ['scope:catalog', 'scope:shared'],
  },
  { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
];

/**
 * Framework coupling is confined to one place each, so swapping the router
 * (e.g. for Next) or the carousel library is a single-project change.
 * Restricted everywhere by default; the one project allowed to use a package
 * opts in from its own eslint config via `restrictedImports([...])`.
 */
const RESTRICTED_PACKAGES = {
  'react-router': {
    group: [
      'react-router',
      'react-router/*',
      'react-router-dom',
      'react-router-dom/*',
    ],
    message:
      'Only apps/shop may import the router. Libs take route params as props and link through AppLink from @momo/shared-ui.',
  },
  'embla-carousel-react': {
    group: ['embla-carousel', 'embla-carousel/*', 'embla-carousel-*'],
    message:
      'Only @momo/shared-ui may import embla. Use the Carousel component from @momo/shared-ui instead.',
  },
};

export function restrictedImports(allowed = []) {
  const patterns = Object.entries(RESTRICTED_PACKAGES)
    .filter(([name]) => !allowed.includes(name))
    .map(([, pattern]) => pattern);

  return {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'no-restricted-imports': patterns.length
        ? ['error', { patterns }]
        : 'off',
    },
  };
}

/**
 * A package declares what its `src/` imports (pnpm gives it access to nothing
 * else once the root stops providing it). Versions come from the catalog in
 * pnpm-workspace.yaml.
 *
 * `buildTargets` matters twice over. The rule silently checks NOTHING for a
 * project that has none of the listed targets, and the default is ['build'],
 * which only the app has. And a workspace package only counts as a dependency
 * if it has the same target as the project being checked - so everything is
 * matched through `typecheck`, the one target every project has.
 *
 * Out of scope on purpose: spec files and tool configs. Test and build
 * tooling is shared and lives in the root package.json.
 *
 * Always ignored: tslib. tsconfig.base.json sets `importHelpers`, so the rule
 * assumes compiled output needs it; these packages only emit declarations and
 * Vite transpiles the source, so nothing ever imports it.
 *
 * A project may pass more names to ignore from its own eslint config - the
 * exception is written where it applies, like `restrictedImports`.
 */
export function dependencyChecks(ignoredDependencies = []) {
  return {
    files: ['**/package.json'],
    languageOptions: { parser: jsoncParser },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          buildTargets: ['typecheck'],
          ignoredDependencies: ['tslib', ...ignoredDependencies],
          ignoredFiles: [
            '{projectRoot}/**/*.spec.{ts,tsx}',
            '{projectRoot}/eslint.config.{js,cjs,mjs}',
            '{projectRoot}/vite.config.{js,ts,mjs,mts}',
            '{projectRoot}/vitest.config.{js,ts,mjs,mts}',
          ],
        },
      ],
    },
  };
}

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [...typeConstraints, ...scopeConstraints],
        },
      ],
    },
  },
  restrictedImports(),
  dependencyChecks(),
];
