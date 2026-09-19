import type { BannerCarouselSection } from '@momo/home-data-access';
import { Carousel } from '@momo/shared-ui';

import { BannerImage } from '../ui/banner-image';
import { SectionFrame } from '../ui/section-frame';

/**
 * A row of banners that pages sideways: the deal icons, brand discounts,
 * card offers, search suggestions and moPro tiles are all this one block,
 * told apart only by data (how many per view, the gap, captions).
 */
export function BannerCarousel({
  section,
}: {
  section: BannerCarouselSection;
}) {
  return (
    <SectionFrame label={section.label} title={section.title}>
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
