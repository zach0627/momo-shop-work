import type { Banner, HomeSection, Shortcut } from '../models/home-section';

/**
 * The home page, top to bottom: 13 business blocks as 15 sections (官方優惠 is
 * three). Reordering or removing a block is an edit to this list and nothing
 * else. Sizes and gaps were measured on the live site at its 1220px layout.
 *
 * File order is display order, written out rather than sorted: the numbers
 * in the artwork's file names (e12, e22, e102 ...) are positions, and a plain
 * sort would put e102 before e12.
 */

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
    // The artwork has its text baked in and was not transcribed: the alt
    // names the block and the position, not what the image says.
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

// The first six keywords are the ones in the target screenshot. The last
// three tiles are cut off there, so their keywords were written to match
// what each image shows.
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

export const HOME_LAYOUT: HomeSection[] = [
  {
    id: 'main-events',
    type: 'hero',
    banners: banners('main-events', '主要活動', [466, 634], MAIN_EVENTS),
    aside: {
      title: '今日大牌',
      // Only one of the four tiles of this panel was supplied.
      items: banners(
        'main-events/today-brand',
        '今日大牌',
        [233, 317],
        ['bt_7_701_01_e6.png'],
      ),
    },
  },
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
  { id: 'official-deals-shortcuts', type: 'shortcut-bar', items: SHORTCUTS },
  {
    id: 'official-deals-mega-brand',
    type: 'banner-grid',
    columns: 3,
    banners: banners(
      'official-deals',
      '超大牌',
      [406, 343],
      ['mega-brand-left.png', 'mega-brand-center.gif', 'mega-brand-right.jpg'],
    ),
  },
  {
    id: 'price-drop',
    type: 'product-rail',
    title: { lead: '降價', text: '好貨' },
    collection: 'price-drop',
    card: 'vertical',
    perView: 8.45,
  },
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
  {
    id: 'fraud-notice',
    type: 'notice',
    banner: {
      id: 'fraud-notice',
      imageUrl: `${ASSETS}/fraud-notice/fraud-notice.gif`,
      alt: '當心「發票中獎」假信件！請勿點擊不明連結',
      width: 960,
      height: 96,
    },
  },
  {
    id: 'flagship-stores',
    type: 'banner-grid',
    title: { text: '官方旗艦名店' },
    columns: 4,
    banners: banners(
      'flagship-stores',
      '官方旗艦名店',
      [305, 343],
      [1, 2, 3, 4].map((n) => `bt_7_707_03_P1_${n}_e2.jpg`),
    ),
  },
  {
    id: 'store-pickup',
    type: 'product-rail',
    title: { lead: '超取', text: '$290免運無限次' },
    collection: 'store-pickup',
    card: 'horizontal',
    perView: 3.45,
  },
  {
    id: 'card-offers',
    type: 'banner-carousel',
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
      [1000, 1000],
      SEARCH_SUGGESTIONS.map(([file]) => file),
      SEARCH_SUGGESTIONS.map(([, keyword]) => keyword),
    ),
  },
  { id: 'flash-sale', type: 'flash-sale', title: { text: '限時搶購' } },
  { id: 'best-sellers', type: 'ranking', title: { text: '今日暢銷榜' } },
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
  {
    id: 'recommendations',
    type: 'recommendation',
    title: { lead: '你可能會', text: '喜歡!' },
  },
];
