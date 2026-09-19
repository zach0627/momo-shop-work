import nx from '@nx/eslint-plugin';
import baseConfig, { restrictedImports } from '../../eslint.config.mjs';

export default [
  ...nx.configs['flat/react'],
  ...baseConfig,
  // app 是唯一可以 import router 的專案
  restrictedImports(['react-router']),
];
