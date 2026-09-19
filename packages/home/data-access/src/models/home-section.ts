/** CMS 會送來的首頁版位資料：只說「哪裡放什麼」，長相由頁面決定。banner 都不可點。 */

/** 帶原始尺寸的圖，讓瀏覽器先留好位置。 */
export interface Banner {
  id: string;
  imageUrl: string;
  alt: string;
  width: number;
  height: number;
  /** 圖下方的文字，例：猜你想搜的關鍵字。 */
  caption?: string;
}

export interface Shortcut {
  id: string;
  iconUrl: string;
  label: string;
}

/** lead 是標題前半較淺的字：「降價」+「好貨」。 */
export interface SectionTitle {
  lead?: string;
  text: string;
}

interface SectionBase {
  /** 版位內唯一；也是 React 的 key。 */
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
  /** 沒有標題時給螢幕閱讀器念的名稱。 */
  label: string;
  perView: number;
  /** 圖與圖的間距（px）。 */
  gap: number;
  banners: Banner[];
}

export interface BannerGridSection extends SectionBase {
  type: 'banner-grid';
  title?: SectionTitle;
  /** 沒有標題時給螢幕閱讀器念的名稱。 */
  label: string;
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
  /** 商品目錄的 collection key；商品本身由 catalog 提供。 */
  collection: string;
  card: 'vertical' | 'horizontal';
  perView: number;
}

/** 以下三種有自己的邏輯，由各自的 feature package 抓資料。 */
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
