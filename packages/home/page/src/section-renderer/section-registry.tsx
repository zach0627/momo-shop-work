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
 *
 * ---------------------------------------------------------------------------
 * 首頁由上到下 15 個區塊 → 各自用的是哪一種 type
 * （順序與內容寫在 home/data-access 的 fixtures/home-layout.ts，不在這裡；
 *   這裡只決定「這種 type 長什麼樣子」）
 *
 *    1. 主要活動 + 右側今日大牌          hero
 *    2. 官方優惠：8 格圖示輪播           banner-carousel
 *    3. 官方優惠：秒殺 / 簽到 / 分次配…  shortcut-bar
 *    4. 官方優惠：超大牌（左 / 中 / 右） banner-grid（3 欄）
 *    5. 降價好貨                         product-rail（直式商品卡）
 *    6. 品牌折扣                         banner-carousel
 *    7. 詐騙發票提醒                     notice
 *    8. 官方旗艦名店                     banner-grid（4 欄）
 *    9. momo 店取（超取$290免運無限次）  product-rail（橫式商品卡）
 *   10. 信用卡加碼優惠                   banner-carousel
 *   11. 猜你想搜                         banner-carousel（圖 + 關鍵字）
 *   12. 限時搶購                         flash-sale      → feature package
 *   13. 今日暢銷榜                       ranking         → feature package
 *   14. moPro 會員專屬價                 banner-carousel
 *   15. 你可能會喜歡                     recommendation  → feature package
 * ---------------------------------------------------------------------------
 */
export const SECTION_REGISTRY: SectionRegistry = {
  // ── 以下 6 種是首頁私有的通用 block：沒有自己的邏輯，長相完全由資料決定 ──

  // 【主要活動 + 今日大牌】首頁最上面那一塊：
  // 左邊是大張活動 banner 的輪播，右邊是「今日大牌」面板。
  hero: Hero,

  // 【可左右翻頁的一排圖】首頁有 5 個區塊都是它，差別只在資料
  // （一次顯示幾張、間距、圖下方有沒有說明文字）：
  //   ・官方優惠的 8 格圖示輪播（3C新機、家電集購…）
  //   ・品牌折扣（直式的品牌活動磚）
  //   ・信用卡加碼優惠（各銀行的優惠圖）
  //   ・猜你想搜（商品圖 + 下方關鍵字）
  //   ・moPro 會員專屬價（整張做好的促銷磚，不可點）
  'banner-carousel': BannerCarousel,

  // 【一次全部攤開、不翻頁的一排圖】圖片貼齊 1220px、彼此沒有間距：
  //   ・官方優惠的「超大牌」左 / 中 / 右三張（3 欄）
  //   ・官方旗艦名店的四張品牌圖（4 欄）
  'banner-grid': BannerGrid,

  // 【官方優惠的圓形捷徑】秒殺、簽到、分次配、領券、看更多。
  // 文字印在圖上，所以這裡只有圖；不可點。
  'shortcut-bar': ShortcutBar,

  // 【單張橫幅公告】「當心發票中獎假信件」那一條詐騙提醒。
  notice: Notice,

  // 【有標題的商品列】首頁上唯一會顯示「真的商品」的通用 block：
  // 版位資料只給 collection key，商品由 catalog 提供，每張卡片可點進詳情頁。
  //   ・降價好貨：直式商品卡（圖在上）
  //   ・momo 店取：橫式商品卡（圖在左，帶一行紅色促銷文字）
  'product-rail': ProductRail,

  // ── 以下 3 種有自己的邏輯與資料，各自是獨立的 feature package ──
  // 這裡只是轉接：把版位資料裡的標題交給 feature，其餘由 feature 自己處理。

  // 【限時搶購】倒數計時 + 每頁 2 列 × 5 件的商品。
  // → packages/home/feature-flash-sale（目前是 placeholder，Step 11 實作）
  'flash-sale': ({ section }) => (
    <FlashSale lead={section.title.lead} title={section.title.text} />
  ),

  // 【今日暢銷榜】橫式商品卡，沒有名次徽章。
  // → packages/home/feature-ranking（目前是 placeholder，Step 12 實作）
  ranking: ({ section }) => (
    <Ranking lead={section.title.lead} title={section.title.text} />
  ),

  // 【你可能會喜歡】商品格狀排列，顯示 3 列後出現「看更多」。
  // 放在 catalog 而不是 home，因為商品詳情頁之後也會用到它。
  // → packages/catalog/feature-recommendation（目前是 placeholder，Step 9 實作）
  recommendation: ({ section }) => (
    <Recommendation lead={section.title.lead} title={section.title.text} />
  ),
};
