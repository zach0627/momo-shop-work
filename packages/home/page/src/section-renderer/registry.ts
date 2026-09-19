import type { ComponentType } from 'react';

import type { HomeSection, HomeSectionType } from '@momo/home-data-access';

/**
 * One component per section type. A mapped type, so adding a type to the
 * `HomeSection` union without registering its component is a compile error
 * - and each component receives exactly its own variant of the union.
 */
export type SectionRegistry = {
  [Type in HomeSectionType]: ComponentType<{
    section: Extract<HomeSection, { type: Type }>;
  }>;
};
