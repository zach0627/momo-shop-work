import nx from '@nx/eslint-plugin';
import baseConfig, { restrictedImports } from '../../eslint.config.mjs';

export default [
  ...nx.configs['flat/react'],
  ...baseConfig,
  // The app is the composition root: the only project allowed to import the router.
  restrictedImports(['react-router']),
];
