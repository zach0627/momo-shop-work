// 由 apps/shop/public/assets 的素材產生商品 fixtures。
//   node tools/gen-fixtures.mjs           寫入檔案
//   node tools/gen-fixtures.mjs --check   磁碟上的檔案過期時失敗
// 決定性：規格、價格、說明由 id 的雜湊決定，不用亂數、不讀時鐘。
// id 是真的（來自檔名）；名稱、價格與品牌是編的，但**品項來自圖片**：
// 每個 id 對應到哪一種商品寫在 tools/product-catalog.mjs（逐張看圖決定的）。
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';

import { KINDS, PRODUCTS as PRODUCT_KINDS } from './product-catalog.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'apps/shop/public/assets');
const outDir = join(root, 'packages/catalog/data-access/src/fixtures');

// collection key → public/assets 底下的資料夾。順序 = 同一個 id 在多個資料夾都有圖時，主圖的優先順序
const COLLECTIONS = [
  ['price-drop', 'home/price-drop'],
  ['store-pickup', 'home/store-pickup'],
  ['flash-sale', 'home/flash-sale'],
  ['best-sellers', 'home/best-sellers'],
  ['recommendations', 'home/recommendations'],
];
const FLASH_SALE_KEY = 'flash-sale';
// 以橫式商品卡呈現的商品列：這些商品要有一行促銷文字
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

// 每件商品都有的服務說明。分期只給貴的商品：$30 的點數卡不該寫「分期 0 利率」
const SERVICE_LINES = [
  '24 小時快速到貨',
  '滿額免運，可超商取貨',
  '七天鑑賞期，安心退換',
  '限時加贈好禮，送完為止',
];
const INSTALMENT_LINE = '支援信用卡分期 0 利率';
const INSTALMENT_FROM = 3000;

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

// FNV-1a（32 bit）。salt 讓同一個 id 得到彼此獨立的數字
function hash(id, salt) {
  let h = 0x811c9dc5;
  for (const char of `${salt}:${id}`) {
    h ^= char.codePointAt(0);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
const pick = (list, id, salt) => list[hash(id, salt) % list.length];
const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0); // 不受語系影響的字串比較

/**
 * 一件商品的名稱、價格與說明。**品項來自它的圖片**（`tools/product-catalog.mjs`），
 * 規格與價格則由 id 的雜湊在該品項的範圍內決定，所以同一個 id 永遠得到同樣的結果。
 */
function describe(id, inFlashSale) {
  const entry = PRODUCT_KINDS[id];
  if (!entry) return null; // 沒有看過這張圖：由呼叫端報錯
  const spec = typeof entry === 'string' ? { kind: entry } : entry;
  const kind = KINDS[spec.kind];
  if (!kind) throw new Error(`${id}: unknown kind ${spec.kind}`);

  const index = hash(id, 'variant') % kind.variants.length;
  const variant = spec.variant ?? kind.variants[index];
  // 售價：品項的價格區間依規格分段，規格由小排到大，所以「72 包」不會比「12 包」便宜。
  // 尾數調成 9（例：1289）。點數卡的價格是面額，不動
  const [low, high] = kind.price;
  const band = (high - low) / kind.variants.length;
  const bandLow = low + band * index;
  const raw = bandLow + (hash(id, 'price') % Math.max(1, Math.round(band)));
  const price = spec.price ?? Math.round(raw / 10) * 10 - 1;
  // 約七成的商品有原價；限時搶購的一定有。面額商品與黃金沒有原價
  const discounted =
    !spec.exact &&
    !kind.noDiscount &&
    (inFlashSale || hash(id, 'discounted') % 10 < 7);
  const originalPrice = discounted
    ? Math.ceil(price / pick(DISCOUNTS, id, 'discount') / 10) * 10
    : undefined;

  const services = [
    ...SERVICE_LINES,
    ...(price >= INSTALMENT_FROM ? [INSTALMENT_LINE] : []),
  ];
  // 兩行服務說明：第二行的位移保證和第一行不同
  const first = hash(id, 'service') % services.length;
  const second =
    (first + 1 + (hash(id, 'service-2') % (services.length - 1))) %
    services.length;

  const brand = kind.noBrand ? '' : `【${pick(BRANDS, id, 'brand')}】`;
  return {
    name: `${brand}${kind.noun} ${variant}`,
    price,
    ...(originalPrice ? { originalPrice } : {}),
    description: [...kind.lines, services[first], services[second]],
  };
}

// --- 讀取素材 ---
const images = new Map(); // id → 圖片網址（依 collection 優先順序）
const seenContent = new Map(); // id → 已收進 gallery 的內容雜湊
const collections = {};
const problems = [];
for (const [key, folder] of COLLECTIONS) {
  collections[key] = [];
  // 只看檔案：card/ 是 tools/import-assets.mjs 產生的商品卡縮圖
  const files = readdirSync(join(assets, folder), { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  for (const file of files.sort(compare)) {
    const id = /^([A-Za-z]*\d+)_/.exec(file)?.[1];
    if (!id) {
      problems.push(`${folder}/${file}: no product id in the file name`);
      continue;
    }
    if (!images.has(id)) images.set(id, []);
    if (!seenContent.has(id)) seenContent.set(id, new Set());
    // 同一張圖常在多個區塊各給一份：gallery 只留一份，但商品仍屬於每個 collection
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
// 商品卡用主圖的縮圖（card/ 底下同名的檔案），詳情頁用原本的大圖
const cardImage = (path) => path.replace(/\/([^/]+)$/, '/card/$1');
for (const [id, paths] of images) {
  const card = cardImage(paths[0]);
  if (!existsSync(join(root, 'apps/shop/public', card)))
    problems.push(
      `${id}: no card image at ${card} - run tools/import-assets.mjs`,
    );
}
if (problems.length) {
  for (const p of problems) console.error(`x ${p}`);
  process.exit(1);
}

const products = [...images.keys()].sort(compare).map((id) => {
  const described = describe(id, flashSaleIds.has(id));
  // 沒分類過就不出貨：不然又會配出和圖片無關的名稱（Human 第 14 次糾正）
  if (!described)
    problems.push(
      `${id}: not classified - look at ${images.get(id)[0]} and add it to tools/product-catalog.mjs`,
    );
  return {
    id,
    imageUrl: cardImage(images.get(id)[0]),
    images: images.get(id),
    ...described,
    ...(promoLineIds.has(id)
      ? { promoText: pick(PROMO_LINES, id, 'promo-line') }
      : {}),
  };
});
if (problems.length) {
  for (const p of problems) console.error(`x ${p}`);
  process.exit(1);
}

const flashSaleExtras = Object.fromEntries(
  collections[FLASH_SALE_KEY].map((id) => [
    id,
    {
      promoText: pick(PROMO_TEXTS, id, 'promo'),
      stockLeft: 5 + (hash(id, 'stock') % 95),
    },
  ]),
);

// --- 寫入 ---
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
      // 檔案不存在也算過期
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
