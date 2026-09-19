import type { BannerGridSection } from '@momo/home-data-access';

import { BannerImage } from '../ui/banner-image';
import { SectionFrame } from '../ui/section-frame';

/**
 * Banners side by side, all visible at once. Edge to edge and without a
 * gap, as on the live site: this artwork carries its own margins (three
 * 406px tiles and four 305px tiles both add up to the 1220px column).
 */
export function BannerGrid({ section }: { section: BannerGridSection }) {
  return (
    <SectionFrame label={section.label} title={section.title} padded={false}>
      {/* The column count is data, so it cannot be a Tailwind class. */}
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
