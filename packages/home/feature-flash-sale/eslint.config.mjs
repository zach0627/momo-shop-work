import nx from '@nx/eslint-plugin';
import baseConfig, { dependencyChecks } from '../../../eslint.config.mjs';

export default [
  ...nx.configs['flat/react'],
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {},
  },
  {
    ignores: ['**/out-tsc'],
  },
  // 這個 package 只寫 JSX、沒有明寫 import react，規則看不到；執行期仍需要 react，所以保留宣告
  dependencyChecks(['react']),
];
