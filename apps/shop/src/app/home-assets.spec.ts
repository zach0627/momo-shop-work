import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  createMockHomeRepository,
  type HomeSection,
} from '@momo/home-data-access';

const PUBLIC_DIR = resolve(import.meta.dirname, '../../public');

function imageUrlsOf(section: HomeSection): string[] {
  switch (section.type) {
    case 'hero':
      return [...section.banners, ...section.aside.items].map(
        (banner) => banner.imageUrl,
      );
    case 'banner-carousel':
    case 'banner-grid':
      return section.banners.map((banner) => banner.imageUrl);
    case 'shortcut-bar':
      return section.items.map((item) => item.iconUrl);
    case 'notice':
      return [section.banner.imageUrl];
    default:
      return [];
  }
}

// 版位資料指到的圖檔都要存在於 public/，否則只會在瀏覽器裡變成破圖
describe('the artwork of the home layout', () => {
  it('exists in public/ for every image the layout points at', async () => {
    const sections = await createMockHomeRepository().getLayout();
    const urls = sections.flatMap(imageUrlsOf);

    expect(urls.length).toBeGreaterThan(60);
    const missing = urls.filter((url) => !existsSync(resolve(PUBLIC_DIR, url)));
    expect(missing).toEqual([]);
  });
});
