import type {
  Banner,
  HomeSection,
  HotSearch,
  Shortcut,
} from '../models/home-section';

/** 首頁的版位資料。檔名裡的數字（e12、e22、e102…）是位置，所以檔案順序用寫的、不用排序（字串排序會把 e102 排在 e12 前面）。 */

const ASSETS = 'assets/home';

function banners(
  folder: string,
  label: string,
  [width, height]: [number, number],
  files: string[],
  captions: string[] = [],
): Banner[] {
  return files.map((file, index) => ({
    id: `${folder}/${file}`,
    imageUrl: `${ASSETS}/${folder}/${file}`,
    // 圖上的文字沒有逐張抄寫，alt 用「區塊名 + 序號」
    alt: captions[index] ?? `${label} ${index + 1}`,
    width,
    height,
    ...(captions[index] ? { caption: captions[index] } : {}),
  }));
}

const e = (code: string, positions: number[], suffix: string, ext = 'png') =>
  positions.map((position) => `${code}_e${position}${suffix}.${ext}`);

const MAIN_EVENTS = [
  'bt_7_701_01_e21.jpg',
  'bt_7_701_01_e41.jpg',
  'bt_7_701_01_e51.jpg',
  'bt_7_701_01_e71.jpg',
  'bt_7_701_01_e81.jpg',
  'bt_7_701_01_e91.jpg',
  'bt_7_701_01_e101.jpg',
  'bt_7_701_01_e111.jpg',
  'bt_7_701_01_e121.png',
  'bt_7_701_01_e141.jpg',
  'bt_7_701_01_e161.jpg',
];

// 熱搜排行：照目標截圖（名次、熱度、上升、新上榜）。第 5、8 名在截圖上被截斷，以真站當天的完整關鍵字補上
const HOT_SEARCHES: HotSearch[] = [
  { keyword: '中秋禮盒', heat: 1089 },
  { keyword: 'on 昂跑', heat: 951 },
  { keyword: '即享券', heat: 924 },
  { keyword: '買一送一', heat: 916 },
  { keyword: 'iphone 18 pro', heat: 908, rising: true },
  { keyword: '即期品', heat: 894, rising: true },
  { keyword: '電競筆電', heat: 892, isNew: true },
  { keyword: 'longchamp', heat: 887, rising: true },
  { keyword: 'ps5', heat: 883 },
];

const SHORTCUTS: Shortcut[] = [
  ['flash-store', '秒殺'],
  ['check-in', '簽到'],
  ['installments', '分次配'],
  ['coupons', '領券'],
  ['more', '看更多'],
].map(([slug, label]) => ({
  id: slug,
  iconUrl: `${ASSETS}/official-deals/shortcut-${slug}.png`,
  label,
}));

// 前 6 個關鍵字來自目標截圖；後 3 個截圖上被切掉，依圖片內容命名
const SEARCH_SUGGESTIONS: Array<[file: string, keyword: string]> = [
  ['13341932_O_m.webp', '即期促銷品'],
  ['10029312_O_m.webp', '內褲 女'],
  ['13326308_O_m.webp', '護色洗髮精'],
  ['8938732_O_m.webp', '光泉保久乳'],
  ['10536422_O_m.webp', '桂格養氣人參'],
  ['11115416_O_m.webp', '耳夾式耳機'],
  ['12683905_O_m.webp', '哈利波特'],
  ['14816038_O_m.webp', '必勝客 餐券'],
  ['TP00096700000002_O.webp', '按摩球'],
];

// 首頁由上到下的 15 個區塊。陣列順序 = 畫面順序：調整順序就搬動整筆，下架就刪掉那一筆。
// perView：一次看得到幾張（小數 = 最後一張露出一部分）；gap：間距 px；columns：一列幾張。
// 每一種 type 長什麼樣子，見 home/page 的 section-registry.tsx。
export const HOME_LAYOUT: HomeSection[] = [
  // 1. 主要活動輪播 + 右側今日大牌（素材只有四格中的一格）
  {
    id: 'main-events',
    type: 'hero',
    banners: banners('main-events', '主要活動', [466, 634], MAIN_EVENTS),
    aside: {
      title: '今日大牌',
      items: banners(
        'main-events/today-brand',
        '今日大牌',
        [233, 317],
        ['bt_7_701_01_e6.png'],
      ),
    },
  },
  // 2. 官方優惠：8 格圖示輪播（3C新機、家電集購…）
  {
    id: 'official-deals-icons',
    type: 'banner-carousel',
    label: '官方優惠',
    perView: 8,
    gap: 0,
    banners: banners(
      'official-deals',
      '官方優惠',
      [210, 210],
      e('bt_7_708_01', [1, 2, 4, 5, 10, 11, 13, 14, 15], '2'),
    ),
  },
  // 3. 官方優惠：左邊圓形捷徑（秒殺、簽到、分次配、領券、看更多），右邊熱搜排行
  {
    id: 'official-deals-shortcuts',
    type: 'shortcut-bar',
    items: SHORTCUTS,
    hotSearches: HOT_SEARCHES,
  },
  // 4. 官方優惠：超大牌，左 / 中 / 右三張
  {
    id: 'official-deals-mega-brand',
    type: 'banner-grid',
    label: '超大牌',
    columns: 3,
    banners: banners(
      'official-deals',
      '超大牌',
      [406, 343],
      ['mega-brand-left.png', 'mega-brand-center.gif', 'mega-brand-right.jpg'],
    ),
  },
  // 5. 降價好貨：直式商品卡，商品來自 catalog，可點進詳情頁
  {
    id: 'price-drop',
    type: 'product-rail',
    title: { lead: '降價', text: '好貨' },
    collection: 'price-drop',
    card: 'vertical',
    perView: 8.52,
  },
  // 6. 品牌折扣：直式品牌活動磚的輪播（沒有標題）
  {
    id: 'brand-discount',
    type: 'banner-carousel',
    label: '品牌折扣',
    perView: 5.43,
    gap: 0,
    banners: banners(
      'brand-discount',
      '品牌折扣',
      [285, 475],
      e('bt_7_703_01', [1, 2, 4, 5, 6, 7, 8, 9, 11, 12, 15, 16], '2'),
    ),
  },
  // 7. 詐騙發票提醒：一條橫幅
  {
    id: 'fraud-notice',
    type: 'notice',
    gapAfter: true,
    banner: {
      id: 'fraud-notice',
      imageUrl: `${ASSETS}/fraud-notice/fraud-notice.gif`,
      alt: '當心「發票中獎」假信件！請勿點擊不明連結',
      width: 960,
      height: 96,
    },
  },
  // 8. 官方旗艦名店：四張品牌圖
  {
    id: 'flagship-stores',
    type: 'banner-grid',
    title: { text: '官方旗艦名店' },
    label: '官方旗艦名店',
    columns: 4,
    banners: banners(
      'flagship-stores',
      '官方旗艦名店',
      [305, 343],
      [1, 2, 3, 4].map((n) => `bt_7_707_03_P1_${n}_e2.jpg`),
    ),
  },
  // 9. momo 店取：橫式商品卡（帶紅色促銷文字），可點進詳情頁
  {
    id: 'store-pickup',
    type: 'product-rail',
    gapAfter: true,
    title: { lead: '超取', text: '$290免運無限次' },
    collection: 'store-pickup',
    card: 'horizontal',
    perView: 3.47,
  },
  // 10. 信用卡加碼優惠：各銀行優惠圖的輪播（沒有標題）
  {
    id: 'card-offers',
    type: 'banner-carousel',
    gapAfter: true,
    label: '信用卡加碼優惠',
    perView: 4.75,
    gap: 0,
    banners: banners(
      'card-offers',
      '信用卡加碼優惠',
      [630, 315],
      e('bt_7_706_01', [1, 2, 3, 4, 5, 6, 7], '2'),
    ),
  },
  // 11. 猜你想搜：商品圖 + 下方關鍵字
  {
    id: 'search-suggest',
    type: 'banner-carousel',
    title: { lead: '猜你', text: '想搜' },
    label: '猜你想搜',
    perView: 6.11,
    gap: 10,
    banners: banners(
      'search-suggest',
      '猜你想搜',
      [372, 372],
      SEARCH_SUGGESTIONS.map(([file]) => file),
      SEARCH_SUGGESTIONS.map(([, keyword]) => keyword),
    ),
  },
  // 12. 限時搶購：只給標題，倒數與商品由 home/feature-flash-sale 負責
  {
    id: 'flash-sale',
    type: 'flash-sale',
    title: { text: '限時搶購' },
    gapAfter: true,
  },
  // 13. 今日暢銷榜：和 momo 店取同一種商品列，只差商品、粉色底與「即時更新」標籤
  {
    id: 'best-sellers',
    type: 'product-rail',
    title: { text: '今日暢銷榜', badge: '即時更新' },
    collection: 'best-sellers',
    card: 'horizontal',
    perView: 3.47,
    background: '#f6e8eb',
  },
  // 14. moPro 會員專屬價：整張做好的促銷磚，不可點
  {
    id: 'mopro',
    type: 'banner-carousel',
    title: { lead: 'moPro', text: '訂閱享會員專屬價' },
    label: 'moPro 會員專屬價',
    perView: 5.43,
    gap: 0,
    banners: banners(
      'mopro',
      'moPro 會員專屬價',
      [285, 475],
      e('bt_7_703_02', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], '2'),
    ),
  },
  // 15. 你可能會喜歡：只給標題，內容由 catalog/feature-recommendation 負責（佔位中）
  {
    id: 'recommendations',
    type: 'recommendation',
    title: { lead: '你可能會', text: '喜歡!' },
  },
];
