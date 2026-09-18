import nx from '@nx/eslint-plugin';

/**
 * Layering rules (see docs/MoMO面試/Phase 1 §3).
 *
 *   app -> page -> feature -> ui / data-access -> util
 *
 * A project must satisfy BOTH its `type:` and its `scope:` constraint.
 * `page` is the only layer that may compose several features, so
 * feature -> feature (and data-access -> data-access) is an error.
 */
const typeConstraints = [
  {
    sourceTag: 'type:app',
    onlyDependOnLibsWithTags: [
      'type:page',
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
  {
    sourceTag: 'scope:layout',
    onlyDependOnLibsWithTags: ['scope:layout', 'scope:catalog', 'scope:shared'],
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
];
