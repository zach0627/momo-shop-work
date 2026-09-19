import type { NoticeSection } from '@momo/home-data-access';

import { BannerImage } from '../ui/banner-image';
import { SectionFrame } from '../ui/section-frame';

/** 一條滿版公告，例：詐騙發票提醒。 */
export function Notice({ section }: { section: NoticeSection }) {
  return (
    <SectionFrame label={section.banner.alt}>
      <BannerImage banner={section.banner} className="rounded-card" />
    </SectionFrame>
  );
}
