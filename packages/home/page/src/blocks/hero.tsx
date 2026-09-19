import type { HeroSection } from '@momo/home-data-access';
import { Carousel } from '@momo/shared-ui';

import { BannerImage } from '../ui/banner-image';

// 真站實測：banner 327px、間距 12px，右側面板 316px
const BANNERS_PER_VIEW = 2.57;
const BANNER_GAP = 12;
// 一開始就看得到的 banner 不延遲載入
const EAGER_BANNERS = 3;

/** 主要活動輪播 + 右側「今日大牌」面板。 */
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
        {/* 面板是兩欄；素材只有一格時讓它佔滿整個面板 */}
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
