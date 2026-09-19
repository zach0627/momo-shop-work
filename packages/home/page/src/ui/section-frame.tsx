import type { ReactNode } from 'react';

import type { SectionTitle } from '@momo/home-data-access';
import { SectionHeader } from '@momo/shared-ui';

export interface SectionFrameProps {
  /** 給螢幕閱讀器念的區塊名稱。 */
  label: string;
  title?: SectionTitle;
  /** false：內容貼齊左右邊緣（素材自己帶留白）。 */
  padded?: boolean;
  children: ReactNode;
}

/** 首頁每個區塊的外框：1220px 的白色區帶、內容四周 16px（真站實測）。 */
export function SectionFrame({
  label,
  title,
  padded = true,
  children,
}: SectionFrameProps) {
  return (
    <section aria-label={label} className="bg-surface">
      {title && <SectionHeader lead={title.lead} title={title.text} />}
      <div className={padded ? (title ? 'px-4 pb-4' : 'p-4') : undefined}>
        {children}
      </div>
    </section>
  );
}
