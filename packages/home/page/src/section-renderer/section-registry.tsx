import { Recommendation } from '@momo/catalog-feature-recommendation';
import { FlashSale } from '@momo/home-feature-flash-sale';
import { Ranking } from '@momo/home-feature-ranking';

import { BannerCarousel } from '../blocks/banner-carousel';
import { BannerGrid } from '../blocks/banner-grid';
import { Hero } from '../blocks/hero';
import { Notice } from '../blocks/notice';
import { ProductRail } from '../blocks/product-rail';
import { ShortcutBar } from '../blocks/shortcut-bar';
import type { SectionRegistry } from './registry';

/**
 * Which component renders which section type. Six are blocks private to
 * this page, driven entirely by the section's data. Three belong to feature
 * packages with logic and data of their own: the layout only says where
 * they go and what they are called.
 *
 * Leaving a type out of this object is a compile error (see SectionRegistry).
 */
export const SECTION_REGISTRY: SectionRegistry = {
  hero: Hero,
  'banner-carousel': BannerCarousel,
  'banner-grid': BannerGrid,
  'shortcut-bar': ShortcutBar,
  notice: Notice,
  'product-rail': ProductRail,
  'flash-sale': ({ section }) => (
    <FlashSale lead={section.title.lead} title={section.title.text} />
  ),
  ranking: ({ section }) => (
    <Ranking lead={section.title.lead} title={section.title.text} />
  ),
  recommendation: ({ section }) => (
    <Recommendation lead={section.title.lead} title={section.title.text} />
  ),
};
