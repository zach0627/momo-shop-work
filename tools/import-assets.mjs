// 把素材複製到 app 的 public 資料夾，中文資料夾與檔名改成 ASCII slug。
//   node tools/import-assets.mjs <素材根目錄>
// 每個來源檔案都必須有交代（複製、縮圖，或有理由地略過），否則以 exit 1 結束。
// 可重複執行：縮圖的資料夾每次整個重新產生，其餘只複製、不刪除。
// 縮圖是為了 GitHub Pages 上的 demo：素材是原圖（最寬 1000px），畫面只需要一小部分。
import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, parse, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'apps/shop/public/assets');
const source = process.argv[2];
if (!source) {
  console.error('usage: node tools/import-assets.mjs <artwork root>');
  process.exit(1);
}

// 來源資料夾（相對於素材根目錄）→ public/assets 底下的資料夾
const FOLDERS = {
  logo: 'brand',
  Footer: 'footer',
  '首頁網站/主要活動': 'home/main-events',
  '首頁網站/主要活動/今日大牌': 'home/main-events/today-brand',
  '首頁網站/官方優惠': 'home/official-deals',
  '首頁網站/降價好貨': 'home/price-drop',
  '首頁網站/品牌折扣': 'home/brand-discount',
  '首頁網站/發票詐騙提醒': 'home/fraud-notice',
  '首頁網站/官方旗艦名店': 'home/flagship-stores',
  '首頁網站/momo店快取': 'home/store-pickup',
  '首頁網站/信用卡加碼優惠': 'home/card-offers',
  '首頁網站/猜你想搜': 'home/search-suggest',
  '首頁網站/限時搶購': 'home/flash-sale',
  '首頁網站/今日暢銷榜': 'home/best-sellers',
  '首頁網站/momopro訂閱享會員專屬價': 'home/mopro',
  '首頁網站/你可能會喜歡': 'home/recommendations',
};

const RENAMES = {
  'momologo.png': 'momo-logo.png',
  'bt_0_203_01_P1_1_e2.jpg': 'app-qr.jpg',
  '秒殺店符號圖.png': 'shortcut-flash-store.png',
  '簽到符號圖.png': 'shortcut-check-in.png',
  '分次配符號圖.png': 'shortcut-installments.png',
  '領卷符號圖.png': 'shortcut-coupons.png',
  '看更多符號圖.png': 'shortcut-more.png',
  '超大牌左.png': 'mega-brand-left.png',
  '超大牌中間.gif': 'mega-brand-center.gif',
  '超大牌右邊.jpg': 'mega-brand-right.jpg',
  '1112.gif': 'fraud-notice.gif',
};

// 商品圖：兩個 WebP 版本，最長邊為顯示尺寸的兩倍，不放大。
//   <資料夾>/<名稱>.webp       詳情頁主圖（顯示 440px → 880）
//   <資料夾>/card/<名稱>.webp  商品卡（這件商品出現過的最大卡片 × 2）
// 資料夾 → 那一區商品卡的圖顯示多寬（Step 8、9、11 實測）
const PRODUCT_FOLDERS = {
  'home/price-drop': 128,
  'home/store-pickup': 140,
  'home/flash-sale': 208,
  'home/best-sellers': 140,
  'home/recommendations': 225,
};
const DETAIL_MAX = 880;
// 其他比畫面大很多的圖：縮到顯示尺寸的兩倍，格式與檔名不變（猜你想搜：原圖 1000px、顯示 186px）
const RESIZE_IN_PLACE = { 'home/search-suggest': 372 };
const WEBP_QUALITY = 80;

const shrink = (file, max) =>
  sharp(file).resize(max, max, { fit: 'inside', withoutEnlargement: true });
// 和 tools/gen-fixtures.mjs 同一條規則：檔名開頭是商品 id
const productId = (name) => /^([A-Za-z]*\d+)_/.exec(name)?.[1];

// "10019468_OR_m (1).webp"：重複下載的檔案
const isDuplicateDownload = (name) => / \(\d+\)\.[a-z]+$/i.test(name);
const isAscii = (name) => /^[\x20-\x7e]+$/.test(name);

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
  )) {
    if (entry.name.startsWith('.')) continue; // 工具資料夾，例如 .claude
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

// 縮圖的資料夾整個重新產生，換了格式的舊檔不會留下來
for (const slug of [
  ...Object.keys(PRODUCT_FOLDERS),
  ...Object.keys(RESIZE_IN_PLACE),
])
  rmSync(join(target, slug), { recursive: true, force: true });

// 同一件商品可能出現在好幾區（例：限時搶購也在「你可能會喜歡」）：卡片圖依它出現過的最大卡片決定
const widestCard = new Map();
for (const file of walk(source)) {
  const slug = FOLDERS[relative(source, dirname(file)).split(sep).join('/')];
  const id = productId(file.slice(dirname(file).length + 1));
  if (slug in PRODUCT_FOLDERS && id)
    widestCard.set(
      id,
      Math.max(widestCard.get(id) ?? 0, PRODUCT_FOLDERS[slug]),
    );
}

let total = 0;
let copied = 0;
let resized = 0;
const written = new Set();
const duplicates = [];
const problems = [];
for (const file of walk(source)) {
  total++;
  const folder = relative(source, dirname(file)).split(sep).join('/');
  const name = file.slice(dirname(file).length + 1);
  const label = `${folder}/${name}`;

  if (isDuplicateDownload(name)) {
    duplicates.push(label);
    continue;
  }
  const slug = FOLDERS[folder];
  const renamed = RENAMES[name] ?? name;
  if (!slug) problems.push(`${label}: its folder has no slug`);
  else if (!isAscii(renamed)) problems.push(`${label}: name is not ASCII`);
  else if (slug in PRODUCT_FOLDERS) {
    const out = `${parse(renamed).name}.webp`;
    const cardMax =
      2 * (widestCard.get(productId(renamed)) ?? PRODUCT_FOLDERS[slug]);
    if (written.has(`${slug}/${out}`)) {
      problems.push(`${label}: another file already became ${slug}/${out}`);
      continue;
    }
    written.add(`${slug}/${out}`);
    mkdirSync(join(target, slug, 'card'), { recursive: true });
    // 已經是 880px 以內的 WebP 就原檔照搬：重新壓縮會再小一些（實測 0–38%），但會多損失一次畫質；
    // 詳情頁一次只載入一張，選畫質
    const { format, width, height } = await sharp(file).metadata();
    if (format === 'webp' && Math.max(width, height) <= DETAIL_MAX)
      copyFileSync(file, join(target, slug, out));
    else
      await shrink(file, DETAIL_MAX)
        .webp({ quality: WEBP_QUALITY })
        .toFile(join(target, slug, out));
    await shrink(file, cardMax)
      .webp({ quality: WEBP_QUALITY })
      .toFile(join(target, slug, 'card', out));
    resized++;
  } else if (slug in RESIZE_IN_PLACE) {
    mkdirSync(join(target, slug), { recursive: true });
    await shrink(file, RESIZE_IN_PLACE[slug]).toFile(
      join(target, slug, renamed),
    );
    resized++;
  } else {
    mkdirSync(join(target, slug), { recursive: true });
    copyFileSync(file, join(target, slug, renamed));
    copied++;
  }
}

console.log(
  `${total} source file(s): ${copied} copied, ${resized} resized, ${duplicates.length} duplicate download(s) skipped, ${problems.length} unaccounted for`,
);
for (const entry of duplicates) console.log(`   duplicate: ${entry}`);
for (const entry of problems) console.error(`   x ${entry}`);
process.exit(problems.length ? 1 : 0);
