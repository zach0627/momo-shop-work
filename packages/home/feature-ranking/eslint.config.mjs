import nx from '@nx/eslint-plugin';
import baseConfig, { dependencyChecks } from '../../../eslint.config.mjs';

export default [
  ...nx.configs['flat/react'],
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  {
    ignores: ['**/out-tsc'],
  },
  // This package writes JSX but never imports from 'react', and the rule only
  // sees explicit imports. JSX still needs react at runtime (react/jsx-runtime),
  // so the declaration stays. Remove this once the package imports react.
  dependencyChecks(['react']),
];
