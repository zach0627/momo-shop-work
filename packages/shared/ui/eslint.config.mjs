import nx from '@nx/eslint-plugin';
import baseConfig, { restrictedImports } from '../../../eslint.config.mjs';

export default [
  ...nx.configs['flat/react'],
  ...baseConfig,
  // The Carousel wrapper lives here: the only project allowed to import embla.
  restrictedImports(['embla-carousel-react']),
  {
    ignores: ['**/out-tsc'],
  },
];
