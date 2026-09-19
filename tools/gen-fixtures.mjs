// Generates the product fixtures from the artwork in apps/shop/public/assets.
//
//   node tools/gen-fixtures.mjs           write the files
//   node tools/gen-fixtures.mjs --check   fail if the files on disk are stale
//
// Deterministic: a product's name, price and description are derived from a
// hash of its id. No randomness, no clock - the same artwork always produces
// byte-identical files, so a diff in them means the artwork changed.
//
// The ids are real (they come from the file names). Names and prices are made
// up, and the brands are fictional on purpose: the photo next to a generated
// name is not that product.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'apps/shop/public/assets');
const outDir = join(root, 'packages/catalog/data-access/src/fixtures');

// key -> folder under public/assets. The order is the priority used to pick a
// product's main image when the same id has artwork in several folders.
const COLLECTIONS = [
  ['price-drop', 'home/price-drop'],
  ['store-pickup', 'home/store-pickup'],
  ['flash-sale', 'home/flash-sale'],
  ['best-sellers', 'home/best-sellers'],
  ['recommendations', 'home/recommendations'],
];
const FLASH_SALE_KEY = 'flash-sale';
// The rails shown as horizontal cards, which carry a promo line on the live
// site. The line belongs to the product, so it is the same wherever the
// product appears; whether a card shows it is the rail's decision.
const PROMO_LINE_KEYS = ['store-pickup', 'best-sellers'];

const BRANDS = [
  '沐光',
  '禾日',
  '青嶼',
  '木森',
  '暖居',
  '原野',
  '晨露',
  '安禾',
  '海風',
  '樂活家',
  'LUMO',
  'NORDA',
  'KAITO',
  'VELA',
  'MORI',
  'ARLO',
];

// [name, variants, lowest price, highest price]
const TEMPLATES = [
  ['保濕精華液', ['30ml', '50ml', '2入組'], 590, 2480],
  ['高效防曬乳', ['SPF50+ 50ml', '2入組'], 390, 1280],
  ['無線吸塵器', ['輕量款', '旗艦款'], 3990, 16900],
  ['氣炸鍋', ['4L', '5.5L'], 1690, 4990],
  ['空氣清淨機', ['8坪', '12坪'], 4990, 15900],
  ['除濕機', ['10L', '16L'], 6990, 14900],
  ['快煮壺', ['1.2L', '1.7L'], 590, 1990],
  ['藍牙耳機', ['降噪版', '運動版'], 990, 6990],
  ['智慧手錶', ['GPS版', 'LTE版'], 2990, 12900],
  ['行動電源', ['10000mAh', '20000mAh'], 490, 1690],
  ['機械鍵盤', ['青軸', '紅軸'], 1290, 4590],
  ['純棉床包四件組', ['雙人', '加大'], 1290, 3990],
  ['不鏽鋼保溫瓶', ['500ml', '750ml'], 390, 1290],
  ['運動休閒鞋', ['男款', '女款'], 1290, 3890],
  ['洗衣精補充包', ['1.5kg x6', '2kg x4'], 399, 990],
  ['抽取式衛生紙', ['100抽 x24包', '110抽 x72包'], 299, 1190],
  ['綜合堅果', ['600g', '1kg 家庭號'], 299, 890],
  ['精選咖啡豆', ['半磅', '一磅'], 350, 990],
  ['滴雞精', ['10入', '20入'], 990, 2990],
  ['低敏貓砂', ['7L x3', '礦砂 10kg'], 399, 1190],
];

const SERVICE_LINES = [
  '24 小時快速到貨',
  '滿額免運，可超商取貨',
  '支援信用卡分期 0 利率',
  '七天鑑賞期，安心退換',
  '台灣製造，品質把關',
  '限時加贈好禮，送完為止',
];

const DISCOUNTS = [0.62, 0.68, 0.75, 0.8, 0.85, 0.9];
const PROMO_TEXTS = [
  '限時下殺',
  '獨家破盤',
  '今日最低',
  '限量搶購',
  '加碼折 100',
  '結帳再折',
];
const PROMO_LINES = [
  '滿1件折100',
  '滿3000折200',
  '滿額登記送mo幣',
  '下單再折5%',
  '超取免運',
  '正品販售',
];

// FNV-1a, 32 bit. `salt` gives independent numbers for the same id.
function hash(id, salt) {
  let h = 0x811c9dc5;
  for (const char of `${salt}:${id}`) {
    h ^= char.codePointAt(0);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
const pick = (list, id, salt) => list[hash(id, salt) % list.length];
const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0); // no locale involved

function describe(id, inFlashSale) {
  const brand = pick(BRANDS, id, 'brand');
  const [noun, variants, low, high] = pick(TEMPLATES, id, 'template');
  const variant = pick(variants, id, 'variant');

  const raw = low + (hash(id, 'price') % (high - low));
  const price = Math.round(raw / 10) * 10 - 1;
  const discounted = inFlashSale || hash(id, 'discounted') % 10 < 7;
  const originalPrice = discounted
    ? Math.ceil(price / pick(DISCOUNTS, id, 'discount') / 10) * 10
    : undefined;

  const first = hash(id, 'service') % SERVICE_LINES.length;
  const second =
    (first + 1 + (hash(id, 'service-2') % 4)) % SERVICE_LINES.length;

  return {
    name: `【${brand}】${noun} ${variant}`,
    price,
    ...(originalPrice ? { originalPrice } : {}),
    description: [
      `${brand}原廠公司貨，享完整保固`,
      `${noun}人氣款式：${variant}`,
      SERVICE_LINES[first],
      SERVICE_LINES[second],
    ],
  };
}

// --- read the artwork --------------------------------------------------------
const images = new Map(); // id -> image urls, in collection priority order
const seenContent = new Map(); // id -> content hashes already in its gallery
const collections = {};
const problems = [];
for (const [key, folder] of COLLECTIONS) {
  collections[key] = [];
  for (const file of readdirSync(join(assets, folder)).sort(compare)) {
    const id = /^([A-Za-z]*\d+)_/.exec(file)?.[1];
    if (!id) {
      problems.push(`${folder}/${file}: no product id in the file name`);
      continue;
    }
    if (!images.has(id)) images.set(id, []);
    if (!seenContent.has(id)) seenContent.set(id, new Set());
    // The same picture is often supplied once per section. One copy in the
    // gallery is enough; the product still belongs to every collection.
    const content = createHash('sha256')
      .update(readFileSync(join(assets, folder, file)))
      .digest('hex');
    if (!seenContent.get(id).has(content)) {
      seenContent.get(id).add(content);
      images.get(id).push(`assets/${folder}/${file}`);
    }
    if (!collections[key].includes(id)) collections[key].push(id);
  }
}
if (problems.length) {
  for (const p of problems) console.error(`x ${p}`);
  process.exit(1);
}

const flashSaleIds = new Set(collections[FLASH_SALE_KEY]);
const promoLineIds = new Set(
  PROMO_LINE_KEYS.flatMap((key) => collections[key]),
);
const products = [...images.keys()].sort(compare).map((id) => ({
  id,
  imageUrl: images.get(id)[0],
  images: images.get(id),
  ...describe(id, flashSaleIds.has(id)),
  ...(promoLineIds.has(id)
    ? { promoText: pick(PROMO_LINES, id, 'promo-line') }
    : {}),
}));

const flashSaleExtras = Object.fromEntries(
  collections[FLASH_SALE_KEY].map((id) => [
    id,
    {
      promoText: pick(PROMO_TEXTS, id, 'promo'),
      stockLeft: 5 + (hash(id, 'stock') % 95),
    },
  ]),
);

// --- write ------------------------------------------------------------------
const HEADER =
  '// GENERATED by tools/gen-fixtures.mjs from the artwork in\n' +
  '// apps/shop/public/assets. Do not edit: change the generator and re-run it.\n';

const files = {
  'products.generated.ts':
    HEADER +
    "import type { Product } from '../models/product';\n\n" +
    `export const PRODUCTS = ${JSON.stringify(products)} satisfies Product[];\n`,
  'collections.generated.ts':
    HEADER +
    '\n/** Collection key -> product ids, in display order. */\n' +
    `export const COLLECTIONS: Record<string, string[]> = ${JSON.stringify(collections)};\n\n` +
    '/** What a product gains while it is on flash sale, by product id. */\n' +
    `export const FLASH_SALE_EXTRAS: Record<string, { promoText: string; stockLeft: number }> = ${JSON.stringify(flashSaleExtras)};\n`,
};

const check = process.argv.includes('--check');
let stale = 0;
for (const [name, source] of Object.entries(files)) {
  const path = join(outDir, name);
  const options = await prettier.resolveConfig(path);
  const formatted = await prettier.format(source, {
    ...options,
    filepath: path,
  });
  if (check) {
    let current = null;
    try {
      current = readFileSync(path, 'utf8');
    } catch {
      // missing counts as stale
    }
    if (current !== formatted) {
      stale++;
      console.error(
        `x ${name} is out of date - run node tools/gen-fixtures.mjs`,
      );
    }
  } else {
    writeFileSync(path, formatted);
  }
}

console.log(
  `${products.length} products, ${Object.entries(collections)
    .map(([key, ids]) => `${key}=${ids.length}`)
    .join(' ')}${check ? (stale ? '' : ' - up to date') : ' - written'}`,
);
process.exit(stale ? 1 : 0);
