import type { ComponentType } from 'react';

import type { HomeSection, HomeSectionType } from '@momo/home-data-access';

/** 每種 section type 對應一個元件。用 mapped type：union 多了 type 卻沒註冊元件，編譯就會報錯。 */
export type SectionRegistry = {
  [Type in HomeSectionType]: ComponentType<{
    section: Extract<HomeSection, { type: Type }>;
  }>;
};
