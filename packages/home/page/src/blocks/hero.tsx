import type { HeroSection } from '@momo/home-data-access';
import { Carousel } from '@momo/shared-ui';

import { BannerImage } from '../ui/banner-image';

// Measured on the live site: 327px banners 12px apart in a 859px viewport,
// beside a 316px panel.
const BANNERS_PER_VIEW = 2.57;
const BANNER_GAP = 12;
// Banners visible before anything scrolls; they are part of first paint.
const EAGER_BANNERS = 3;

/** The main events carousel with the 今日大牌 panel beside it. */
export function Hero({ section }: { section: HeroSection }) {
  const { aside } = section;

  return (
    <section aria-label="主要活動" className="bg-surface flex gap-3 p-4">
      <div className="min-w-0 flex-1">
        <Carousel
          label="主要活動"
          perView={BANNERS_PER_VIEW}
          gap={BANNER_GAP}
          loop
          dots
        >
          {section.banners.map((banner, index) => (
            <BannerImage
              key={banner.id}
              banner={banner}
              eager={index < EAGER_BANNERS}
              className="rounded-card"
            />
          ))}
        </Carousel>
      </div>

      <aside aria-label={aside.title} className="w-79 shrink-0">
        {/* The panel is two tiles wide. With a single tile - all that was
            supplied - the tile takes the panel's full width instead. */}
        <div
          className={`grid ${aside.items.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
        >
          {aside.items.map((banner) => (
            <BannerImage key={banner.id} banner={banner} eager />
          ))}
        </div>
      </aside>
    </section>
  );
}
