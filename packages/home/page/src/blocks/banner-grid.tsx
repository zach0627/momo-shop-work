import type { BannerGridSection } from '@momo/home-data-access';

import { BannerImage } from '../ui/banner-image';
import { SectionFrame } from '../ui/section-frame';

/** 一次全部攤開的一排圖：貼齊容器、沒有間距（素材自己帶留白）。 */
export function BannerGrid({ section }: { section: BannerGridSection }) {
  return (
    <SectionFrame label={section.label} title={section.title} padded={false}>
      {/* 欄數來自資料，沒辦法寫成 Tailwind class */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${section.columns}, minmax(0, 1fr))`,
        }}
      >
        {section.banners.map((banner) => (
          <BannerImage key={banner.id} banner={banner} />
        ))}
      </div>
    </SectionFrame>
  );
}
