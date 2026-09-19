import { Recommendation } from '@momo/catalog-feature-recommendation';
import { FlashSale } from '@momo/home-feature-flash-sale';

import { BannerCarousel } from '../blocks/banner-carousel';
import { BannerGrid } from '../blocks/banner-grid';
import { Hero } from '../blocks/hero';
import { Notice } from '../blocks/notice';
import { ProductRail } from '../blocks/product-rail';
import { ShortcutBar } from '../blocks/shortcut-bar';
import type { SectionRegistry } from './registry';

/**
 * 首頁每一種區塊（type）用哪個元件渲染。少註冊一種會編譯失敗（見 SectionRegistry）。
 * 區塊的順序與內容不在這裡，在 home/data-access 的 fixtures/home-layout.ts。
 */
export const SECTION_REGISTRY: SectionRegistry = {
  // ── 首頁私有的通用 block：沒有自己的邏輯，長相由資料決定 ──

  // 主要活動輪播 + 右側「今日大牌」
  hero: Hero,

  // 可翻頁的一排圖：官方優惠圖示、品牌折扣、信用卡加碼優惠、猜你想搜、moPro 會員專屬價
  'banner-carousel': BannerCarousel,

  // 不翻頁的一排圖：官方優惠的超大牌（3 欄）、官方旗艦名店（4 欄）
  'banner-grid': BannerGrid,

  // 官方優惠的圓形捷徑：秒殺、簽到、分次配、領券、看更多
  'shortcut-bar': ShortcutBar,

  // 單張橫幅公告：詐騙發票提醒
  notice: Notice,

  // 商品列：降價好貨（直式卡）、momo 店取與今日暢銷榜（橫式卡）；商品來自 catalog，可點進詳情頁
  'product-rail': ProductRail,

  // ── 有自己邏輯的區塊：各自是獨立的 feature package，這裡只轉交標題 ──

  // 限時搶購（倒數 + 每頁 2×5 件）→ home/feature-flash-sale
  'flash-sale': ({ section }) => (
    <FlashSale lead={section.title.lead} title={section.title.text} />
  ),

  // 你可能會喜歡 → catalog/feature-recommendation（詳情頁之後也會用，所以放 catalog）
  recommendation: ({ section }) => (
    <Recommendation lead={section.title.lead} title={section.title.text} />
  ),
};
