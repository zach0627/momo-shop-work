import nx from '@nx/eslint-plugin';
import * as jsoncParser from 'jsonc-eslint-parser';

/**
 * 依賴方向：app → layout / page → feature → ui / data-access → util
 * 每個專案要同時符合自己的 type 與 scope 規則。
 * layout 與 page 同層、互不 import；只有它們能組合多個 feature。
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
  // shop：全站共用的外框
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

/** 框架耦合各只准一個專案使用。預設全禁，允許的專案在自己的 eslint 設定用 restrictedImports([...]) 放行。 */
const RESTRICTED_PACKAGES = {
  'react-router': {
    group: [
      'react-router',
      'react-router/*',
      'react-router-dom',
      'react-router-dom/*',
    ],
    message:
      'Only apps/shop may import the router. Packages take route params as props and link through AppLink from @momo/shared-ui.',
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
 * 每個 package 要宣告自己 src/ 裡 import 的依賴。
 * 注意 buildTargets：專案若沒有清單裡的 target，這條規則會「靜默地什麼都不檢查」；
 * 預設的 ['build'] 只有 app 有，所以改用每個專案都有的 typecheck。
 * tslib 一律忽略：packages 只輸出型別宣告，不會真的 import 它。
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
            '{projectRoot}/playwright.config.ts',
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
