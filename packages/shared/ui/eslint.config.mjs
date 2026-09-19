import nx from '@nx/eslint-plugin';
import baseConfig, { restrictedImports } from '../../../eslint.config.mjs';

export default [
  ...nx.configs['flat/react'],
  ...baseConfig,
  // Carousel 在這裡：唯一可以 import embla 的專案
  restrictedImports(['embla-carousel-react']),
  {
    ignores: ['**/out-tsc'],
  },
];
