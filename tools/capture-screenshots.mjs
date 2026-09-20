/**
 * README 用的畫面截圖：對跑起來的網站截整頁，再依區塊裁切成 1220px 寬的 WebP。
 *
 * 先把網站跑起來，再跑這支：
 *   pnpm nx preview shop                 （build 產物，port 4300）
 *   pnpm capture:screenshots
 * 也可以指向別的位址：pnpm capture:screenshots --base-url=http://localhost:4200/
 *
 * 只為了讓 README 上看得到畫面，不是驗證工具；驗證由測試與 E2E 負責。
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from '@playwright/test';
import sharp from 'sharp';

const BASE_URL = (
  process.argv
    .find((a) => a.startsWith('--base-url='))
    ?.slice('--base-url='.length) ?? 'http://localhost:4300/'
).replace(/\/?$/, '/');

const OUT_DIR = 'docs/screenshots';
const VIEWPORT = { width: 1440, height: 900 }; // 版面固定 1220，兩側是頁面底色
const SCALE = 2; // 先用兩倍像素截，縮小後文字才不會糊
const OUTPUT_WIDTH = 1220; // README 上的顯示寬度
const PAD = 8; // 裁切時上下各留一點，避免切到邊框

/**
 * 還沒載完、而且**畫面上看得到**的圖。
 * 輪播裡橫向捲出去的圖（`loading="lazy"`）不會載入，也不會出現在截圖裡，所以不算。
 */
const notReady = () => ({
  pulsing: document.querySelectorAll('.animate-pulse').length,
  images: [...document.images]
    .filter((img) => {
      const rect = img.getBoundingClientRect();
      return rect.width > 0 && rect.right > 0 && rect.left < window.innerWidth;
    })
    .filter((img) => !img.complete || img.naturalWidth === 0)
    .map((img) => img.currentSrc || img.src),
});

/** 捲過整頁讓 lazy 的圖開始載入，再等到看得到的圖全部載完、佔位都不見了。 */
async function waitUntilEverythingLoaded(page) {
  const scrollThrough = () =>
    page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 200));
      }
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 400));
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 300));
    });

  // 沒載完就截圖會拍到半張圖或灰色佔位，所以這是硬性條件：等不到就失敗，不出圖
  let state;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await scrollThrough();
    state = await page.evaluate(notReady);
    if (state.pulsing === 0 && state.images.length === 0) {
      await page.evaluate(() => document.fonts.ready);
      await page.waitForLoadState('networkidle');
      return;
    }
  }
  throw new Error(
    `畫面還沒就緒，不截圖：${state.pulsing} 個載入中的佔位、${state.images.length} 張沒載完的圖\n${state.images.join('\n')}`,
  );
}

/**
 * 區塊、商品卡、按鈕的位置（頁面座標）。裁切範圍都從這裡算，不寫死數字。
 * 用「連同子孫的最外緣」而不是元素自己的框：卡片上的「搶」標籤、詳情頁的主圖都會超出父元素，
 * 只看父元素就會把它們切掉。
 */
function measure() {
  const top = (el) => el.getBoundingClientRect().top + scrollY;
  const bottom = (el) => el.getBoundingClientRect().bottom + scrollY;
  const all = (root) => [root, ...root.querySelectorAll('*')];
  const outerTop = (root) => Math.min(...all(root).map(top));
  const outerBottom = (root) => Math.max(...all(root).map(bottom));
  const section = (label) => {
    const el = document.querySelector(`section[aria-label="${label}"]`);
    if (!el) throw new Error(`找不到區塊：${label}`);
    return { top: top(el), bottom: bottom(el) };
  };
  const cardsOf = (label) => [
    ...document.querySelectorAll(`section[aria-label="${label}"] article`),
  ];

  // 「你可能會喜歡」的最後一列：依卡片的 top 分列，取最下面那一列
  const likeCards = cardsOf('你可能會喜歡!');
  const cardTops = likeCards.map((card) => Math.round(top(card)));
  const lastRowTop = Math.max(...cardTops);
  const lastRow = likeCards.filter((_, i) => cardTops[i] === lastRowTop);
  const moreButton = document.querySelector(
    'section[aria-label="你可能會喜歡!"] button',
  );

  return {
    pageHeight: document.documentElement.scrollHeight,
    officialDeals: section('官方優惠'),
    megaBrand: section('超大牌'),
    priceDrop: section('降價好貨'),
    flashSale: section('限時搶購'),
    // 第一列 5 張卡片，連同貼在右下角的「搶」標籤；不要切進第二列
    flashFirstRowBottom: Math.max(
      ...cardsOf('限時搶購').slice(0, 5).map(outerBottom),
    ),
    flashSecondRowTop: top(cardsOf('限時搶購')[5]),
    likeLastRowTop: Math.min(...lastRow.map(outerTop)),
    likeBottom: moreButton
      ? outerBottom(moreButton)
      : section('你可能會喜歡!').bottom,
  };
}

/** 從整頁的截圖裁下一段，縮成 1220 寬的 WebP。 */
async function crop(buffer, { name, top, bottom, caption }) {
  const height = Math.round(bottom - top);
  const output = await sharp(buffer)
    .extract({
      left: 0,
      top: Math.round(top * SCALE),
      width: VIEWPORT.width * SCALE,
      height: height * SCALE,
    })
    .resize({ width: OUTPUT_WIDTH })
    .webp({ quality: 80 })
    .toBuffer();
  const file = join(OUT_DIR, `${name}.webp`);
  writeFileSync(file, output);
  console.log(
    `${file}  ${OUTPUT_WIDTH} × ${Math.round((height * OUTPUT_WIDTH) / VIEWPORT.width)}  ${Math.round(output.length / 1024)} KB  ${caption}`,
  );
}

const browser = await chromium.launch({
  // 用機器上已有的瀏覽器，不另外下載（和 E2E 同一條規則）
  channel: process.env.CI ? 'chrome' : 'msedge',
});
const page = await browser.newPage({
  viewport: VIEWPORT,
  deviceScaleFactor: SCALE,
  reducedMotion: 'reduce', // 佔位的閃爍與輪播的過場都停下來，才不會拍到動畫中間
});

try {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
} catch (error) {
  console.error(
    `連不上 ${BASE_URL}\n先啟動網站：pnpm nx preview shop（或 pnpm nx dev shop 搭配 --base-url=http://localhost:4200/）\n${error.message}`,
  );
  await browser.close();
  process.exit(1);
}

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

await waitUntilEverythingLoaded(page);
const home = await page.evaluate(measure);
const homeShot = await page.screenshot({ fullPage: true });

await crop(homeShot, {
  name: '01-home-top',
  top: 0,
  bottom: home.officialDeals.top,
  caption: '首頁最上面：頂部列、搜尋框、分類列、主要活動',
});
await crop(homeShot, {
  name: '02-official-deals',
  top: home.officialDeals.top,
  bottom: home.megaBrand.bottom,
  caption: '官方優惠：圖示輪播、捷徑與熱搜排行、超大牌',
});
await crop(homeShot, {
  name: '03-price-drop',
  top: home.priceDrop.top,
  bottom: home.priceDrop.bottom,
  caption: '降價好貨：可換頁的商品輪播',
});
await crop(homeShot, {
  name: '04-flash-sale',
  top: home.flashSale.top,
  bottom: Math.min(
    home.flashFirstRowBottom + PAD * 2,
    home.flashSecondRowTop - 2,
  ),
  caption: '限時搶購：倒數與限搶價（第一列）',
});
await crop(homeShot, {
  name: '05-you-may-like',
  top: home.likeLastRowTop - PAD * 2,
  bottom: home.likeBottom + PAD * 2,
  caption: '你可能會喜歡：最後一列與「看更多」',
});

// 分類面板：頁面在最上面時點開，面板疊在分類列下方
await page.evaluate(() => window.scrollTo(0, 0));
await page.getByRole('button', { name: '展開全部分類' }).click();
const panel = await page.evaluate(() => {
  const el = document.querySelector(
    'nav[aria-label="商品分類"] div[class*="absolute"]',
  );
  if (!el) throw new Error('找不到分類面板');
  return { bottom: el.getBoundingClientRect().bottom + scrollY };
});
await crop(await page.screenshot(), {
  name: '06-category-panel',
  top: 0,
  // 剛好切在面板下緣：再往下是被面板蓋住的主要活動，留白會變成半截的 banner
  bottom: panel.bottom,
  caption: '分類列展開後的 40 個分類',
});

// 商品詳情頁：從首頁第一張商品卡連過去，畫面上的商品就是資料裡的商品
const href = await page
  .getByRole('region', { name: '降價好貨' })
  .getByRole('article')
  .first()
  .getByRole('link')
  .getAttribute('href');
await page.goto(new URL(href.replace(/^\//, ''), BASE_URL).href, {
  waitUntil: 'domcontentloaded',
});
await waitUntilEverythingLoaded(page);
const detail = await page.evaluate(() => {
  const main = document.querySelector('main');
  if (!main?.querySelector('button')) throw new Error('找不到詳情頁的內容');
  // 主圖比右欄長，所以取兩欄一起算的最外緣；下緣不要切進 footer
  const content = Math.max(
    ...[...main.querySelectorAll('*')].map(
      (el) => el.getBoundingClientRect().bottom + scrollY,
    ),
  );
  const footer = document.querySelector('footer');
  const footerTop = footer
    ? footer.getBoundingClientRect().top + scrollY
    : Infinity;
  return { bottom: Math.min(content + 24, footerTop - 1) };
});
await crop(await page.screenshot({ fullPage: true }), {
  name: '07-goods-detail',
  top: 0,
  bottom: detail.bottom,
  caption: '商品詳情頁（展示用：三顆按鈕不綁行為）',
});

await browser.close();
console.log(`\n${readdirSync(OUT_DIR).length} 張，輸出在 ${OUT_DIR}/`);
