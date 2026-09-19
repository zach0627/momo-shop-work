import type { NoticeSection } from '@momo/home-data-access';

import { BannerImage } from '../ui/banner-image';
import { SectionFrame } from '../ui/section-frame';

/** One full-width announcement, e.g. the invoice fraud warning. */
export function Notice({ section }: { section: NoticeSection }) {
  return (
    <SectionFrame label={section.banner.alt}>
      <BannerImage banner={section.banner} className="rounded-card" />
    </SectionFrame>
  );
}
