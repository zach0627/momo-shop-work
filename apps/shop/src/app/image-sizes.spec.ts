import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { createMockCatalogRepository } from '@momo/catalog-data-access';
import { createMockHomeRepository } from '@momo/home-data-access';

const PUBLIC_DIR = resolve(import.meta.dirname, '../../public');

// 顯示尺寸的兩倍：卡片最大 225px、詳情頁主圖 440px、猜你想搜 186px
const CARD_MAX = 480;
const DETAIL_MAX = 880;
const SEARCH_SUGGEST_MAX = 372;

/** 只讀檔頭，不解碼：WebP（VP8 / VP8L / VP8X）、PNG、JPEG 的寬高。 */
function imageSize(path: string): {
  width: number;
  height: number;
  webp: boolean;
} {
  const b = readFileSync(path);
  if (
    b.toString('ascii', 0, 4) === 'RIFF' &&
    b.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8 ')
      return {
        width: b.readUInt16LE(26) & 0x3fff,
        height: b.readUInt16LE(28) & 0x3fff,
        webp: true,
      };
    if (chunk === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
        webp: true,
      };
    }
    return {
      width: 1 + b.readUIntLE(24, 3),
      height: 1 + b.readUIntLE(27, 3),
      webp: true,
    };
  }
  if (b[0] === 0x89)
    return {
      width: b.readUInt32BE(16),
      height: b.readUInt32BE(20),
      webp: false,
    };
  for (let i = 2; i < b.length; i += 2 + b.readUInt16BE(i + 2)) {
    const marker = b[i + 1];
    if (marker >= 0xc0 && marker <= 0xc3)
      return {
        width: b.readUInt16BE(i + 7),
        height: b.readUInt16BE(i + 5),
        webp: false,
      };
  }
  throw new Error(`unknown image format: ${path}`);
}

// 各區商品卡的圖顯示多寬（實測）
const CARD_WIDTHS: Record<string, number> = {
  'price-drop': 128,
  'store-pickup': 140,
  'flash-sale': 208,
  'best-sellers': 140,
  recommendations: 225,
};

// 每件商品都屬於某個 collection；五個加起來就是全部商品
const COLLECTIONS = [
  'price-drop',
  'store-pickup',
  'flash-sale',
  'best-sellers',
  'recommendations',
];

async function allProducts() {
  const catalog = createMockCatalogRepository();
  const lists = await Promise.all(
    COLLECTIONS.map((key) => catalog.getCollection(key)),
  );
  const byId = new Map(lists.flat().map((product) => [product.id, product]));
  return [...byId.values()];
}

const longest = ({ width, height }: { width: number; height: number }) =>
  Math.max(width, height);

// 為了 GitHub Pages 上的 demo 載入快一點：圖不比畫面需要的大太多（見 docs/architecture.md §9）
describe('the images the site serves', () => {
  it('gives every product a WebP card image no larger than twice the largest card', async () => {
    const products = await allProducts();

    const oversized = products
      .map((product) => ({
        id: product.id,
        ...imageSize(resolve(PUBLIC_DIR, product.imageUrl)),
      }))
      .filter((image) => !image.webp || longest(image) > CARD_MAX);

    expect(products.length).toBeGreaterThan(100);
    expect(oversized).toEqual([]);
  });

  // 卡片圖 = 這件商品出現過的最大卡片 × 2（原圖比較小就是原圖大小）：不多、也不少
  it('sizes each card image for the widest card the product appears on', async () => {
    const catalog = createMockCatalogRepository();
    const widest = new Map<string, number>();
    for (const [key, width] of Object.entries(CARD_WIDTHS))
      for (const product of await catalog.getCollection(key))
        widest.set(product.id, Math.max(widest.get(product.id) ?? 0, width));

    const wrong = [];
    for (const product of await allProducts()) {
      const card = longest(imageSize(resolve(PUBLIC_DIR, product.imageUrl)));
      const detail = longest(imageSize(resolve(PUBLIC_DIR, product.images[0])));
      const wanted = Math.min(2 * (widest.get(product.id) ?? 0), detail);
      if (Math.abs(card - wanted) > 1)
        wrong.push(`${product.id}: ${card}px, wanted ${wanted}px`);
    }
    expect(wrong).toEqual([]);
  });

  it('gives the detail page a larger version of the same picture, capped at twice its size', async () => {
    const products = await allProducts();

    for (const product of products) {
      const [main, ...rest] = product.images;
      // 卡片圖是主圖在 card/ 底下的縮小版
      expect(product.imageUrl).toBe(main.replace(/\/([^/]+)$/, '/card/$1'));
      for (const path of [main, ...rest]) {
        const image = imageSize(resolve(PUBLIC_DIR, path));
        expect(image.webp).toBe(true);
        expect(longest(image)).toBeLessThanOrEqual(DETAIL_MAX);
      }
      expect(
        longest(imageSize(resolve(PUBLIC_DIR, main))),
      ).toBeGreaterThanOrEqual(
        longest(imageSize(resolve(PUBLIC_DIR, product.imageUrl))),
      );
    }
  });

  it('keeps the search suggestion tiles within twice their displayed size', async () => {
    const sections = await createMockHomeRepository().getLayout();
    const tiles = sections.flatMap((section) =>
      section.id === 'search-suggest' && section.type === 'banner-carousel'
        ? section.banners
        : [],
    );

    expect(tiles).toHaveLength(9);
    for (const tile of tiles) {
      const image = imageSize(resolve(PUBLIC_DIR, tile.imageUrl));
      expect(existsSync(resolve(PUBLIC_DIR, tile.imageUrl))).toBe(true);
      expect(longest(image)).toBeLessThanOrEqual(SEARCH_SUGGEST_MAX);
      // 版位資料記的尺寸就是檔案的尺寸，瀏覽器才能先留對位置
      expect([tile.width, tile.height]).toEqual([image.width, image.height]);
    }
  });
});
