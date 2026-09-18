// Copies the supplied artwork into the app's public folder.
//
//   node tools/import-assets.mjs <path to the artwork root>
//
// The source folders and a few files have Chinese names. Those would have to
// be percent-encoded in every URL, so each one gets an ASCII slug here. The
// mapping is the record of where every asset came from.
//
// Every source file has to be accounted for: copied, or skipped for a stated
// reason. Anything else (a folder without a slug, a name that is not ASCII)
// makes the script exit with 1 - that is how a nested folder that had been
// overlooked was found.
//
// Safe to re-run: same input, same output. Files are copied, never deleted.
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'apps/shop/public/assets');
const source = process.argv[2];
if (!source) {
  console.error('usage: node tools/import-assets.mjs <artwork root>');
  process.exit(1);
}

// source folder (relative to the artwork root) -> folder under public/assets
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

// "10019468_OR_m (1).webp": a second download of a file that is already there
const isDuplicateDownload = (name) => / \(\d+\)\.[a-z]+$/i.test(name);
const isAscii = (name) => /^[\x20-\x7e]+$/.test(name);

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
  )) {
    if (entry.name.startsWith('.')) continue; // tool folders such as .claude
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

let total = 0;
let copied = 0;
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
  else {
    mkdirSync(join(target, slug), { recursive: true });
    copyFileSync(file, join(target, slug, renamed));
    copied++;
  }
}

console.log(
  `${total} source file(s): ${copied} copied, ${duplicates.length} duplicate download(s) skipped, ${problems.length} unaccounted for`,
);
for (const entry of duplicates) console.log(`   duplicate: ${entry}`);
for (const entry of problems) console.error(`   x ${entry}`);
process.exit(problems.length ? 1 : 0);
