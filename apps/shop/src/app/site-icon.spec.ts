import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const APP_DIR = resolve(import.meta.dirname, '../..');
const PUBLIC_DIR = resolve(APP_DIR, 'public');

const iconHrefs = () =>
  [
    ...readFileSync(resolve(APP_DIR, 'index.html'), 'utf8').matchAll(
      /<link\s+rel="icon"[^>]*href="\/([^"]+)"/g,
    ),
  ].map((match) => match[1]);

// 分頁上的圖示：index.html 指到的檔案不存在時，瀏覽器只會默默顯示預設圖示
describe('the site icon', () => {
  it('links a vector icon and an .ico fallback, and both files exist', () => {
    const hrefs = iconHrefs();

    expect(hrefs).toEqual(['favicon.svg', 'favicon.ico']);
    expect(
      hrefs.filter((href) => !existsSync(resolve(PUBLIC_DIR, href))),
    ).toEqual([]);
  });

  // ICO 檔頭：reserved 0、type 1（圖示）、接著是圖片張數
  it('packs 16, 32 and 48 pixel images into the .ico', () => {
    const ico = readFileSync(resolve(PUBLIC_DIR, 'favicon.ico'));

    expect([ico.readUInt16LE(0), ico.readUInt16LE(2)]).toEqual([0, 1]);
    const count = ico.readUInt16LE(4);
    const sizes = Array.from({ length: count }, (_, index) =>
      ico.readUInt8(6 + index * 16),
    );
    expect(sizes.sort((a, b) => a - b)).toEqual([16, 32, 48]);
  });
});
