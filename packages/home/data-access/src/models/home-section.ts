/**
 * What a CMS would send to describe the home page. A section says WHAT goes
 * where; how each type looks is the page's business. Nothing in here is a
 * link: banners are not clickable in this project (spec home-page).
 */

/** An image with its intrinsic size, so the page can reserve its space. */
export interface Banner {
  id: string;
  imageUrl: string;
  alt: string;
  width: number;
  height: number;
  /** Text under the image, e.g. the keyword of a search suggestion. */
  caption?: string;
}

export interface Shortcut {
  id: string;
  iconUrl: string;
  label: string;
}

/** `lead` is the lighter first part of a title: "降價" + "好貨". */
export interface SectionTitle {
  lead?: string;
  text: string;
}

interface SectionBase {
  /** Unique within a layout; the React key of the section. */
  id: string;
}

export interface HeroSection extends SectionBase {
  type: 'hero';
  banners: Banner[];
  aside: { title: string; items: Banner[] };
}

export interface BannerCarouselSection extends SectionBase {
  type: 'banner-carousel';
  title?: SectionTitle;
  /** Names the carousel for assistive technology when there is no title. */
  label: string;
  perView: number;
  /** Space between banners, in px. */
  gap: number;
  banners: Banner[];
}

export interface BannerGridSection extends SectionBase {
  type: 'banner-grid';
  title?: SectionTitle;
  columns: number;
  banners: Banner[];
}

export interface ShortcutBarSection extends SectionBase {
  type: 'shortcut-bar';
  items: Shortcut[];
}

export interface NoticeSection extends SectionBase {
  type: 'notice';
  banner: Banner;
}

export interface ProductRailSection extends SectionBase {
  type: 'product-rail';
  title: SectionTitle;
  /** A key of the product catalog. The CMS names the collection; the
      products themselves come from the catalog. */
  collection: string;
  card: 'vertical' | 'horizontal';
  perView: number;
}

/** Sections with logic of their own: a feature package fetches for itself. */
export interface FlashSaleSection extends SectionBase {
  type: 'flash-sale';
  title: SectionTitle;
}

export interface RankingSection extends SectionBase {
  type: 'ranking';
  title: SectionTitle;
}

export interface RecommendationSection extends SectionBase {
  type: 'recommendation';
  title: SectionTitle;
}

export type HomeSection =
  | HeroSection
  | BannerCarouselSection
  | BannerGridSection
  | ShortcutBarSection
  | NoticeSection
  | ProductRailSection
  | FlashSaleSection
  | RankingSection
  | RecommendationSection;

export type HomeSectionType = HomeSection['type'];
