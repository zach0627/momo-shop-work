import type { ReactNode } from 'react';

import type { SectionTitle } from '@momo/home-data-access';
import { SectionHeader } from '@momo/shared-ui';

export interface SectionFrameProps {
  /** 給螢幕閱讀器念的區塊名稱。 */
  label: string;
  title?: SectionTitle;
  /** false：內容貼齊左右邊緣（素材自己帶留白）。 */
  padded?: boolean;
  /** 版位資料指定的底色；沒給就是白色。 */
  background?: string;
  /** 最後一列是輪播的圓點：底部只留 4px，圓點那一列本身有留白（真站：圖下方共 28px）。 */
  endsWithDots?: boolean;
  children: ReactNode;
}

/** 首頁每個區塊的外框：1220px 的白色區帶、內容四周 16px（真站實測）。 */
export function SectionFrame({
  label,
  title,
  padded = true,
  background,
  endsWithDots = false,
  children,
}: SectionFrameProps) {
  return (
    <section
      aria-label={label}
      className="bg-surface"
      style={background ? { backgroundColor: background } : undefined}
    >
      {title && (
        <SectionHeader
          lead={title.lead}
          title={title.text}
          badge={title.badge}
        />
      )}
      {/* 真站實測：內容上方 16px（有標題時在標題列下方）、左右 16px */}
      <div
        className={
          padded ? `px-4 pt-4 ${endsWithDots ? 'pb-1' : 'pb-4'}` : undefined
        }
      >
        {children}
      </div>
    </section>
  );
}
