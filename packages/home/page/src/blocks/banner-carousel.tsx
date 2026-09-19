import type { BannerCarouselSection } from '@momo/home-data-access';
import { Carousel } from '@momo/shared-ui';

import { BannerImage } from '../ui/banner-image';
import { SectionFrame } from '../ui/section-frame';

/** 可左右翻頁的一排圖。首頁有 5 個區塊共用它，差別只在資料（一次幾張、間距、有沒有說明文字）。 */
export function BannerCarousel({
  section,
}: {
  section: BannerCarouselSection;
}) {
  return (
    <SectionFrame label={section.label} title={section.title} endsWithDots>
      <Carousel
        label={section.label}
        perView={section.perView}
        gap={section.gap}
        dots
      >
        {section.banners.map((banner) => (
          <figure key={banner.id}>
            <BannerImage banner={banner} />
            {banner.caption && (
              <figcaption className="text-ec-base text-ink from-surface to-surface-caption rounded-b-tile flex h-12 items-center justify-center bg-linear-to-b from-5% font-bold">
                <span className="truncate px-2">{banner.caption}</span>
              </figcaption>
            )}
          </figure>
        ))}
      </Carousel>
    </SectionFrame>
  );
}
