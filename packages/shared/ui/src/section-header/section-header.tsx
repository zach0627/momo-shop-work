import type { ReactNode } from 'react';

export interface SectionHeaderProps {
  title: string;
  /** 標題前半較淺的字：「降價」+「好貨」。 */
  lead?: string;
  /** 放在標題前面，例：logo。 */
  icon?: ReactNode;
}

/** 首頁區塊的標題。真站的標題是 1220×70 的圖，素材沒有提供，所以用文字；字級是估計值。 */
export function SectionHeader({ title, lead, icon }: SectionHeaderProps) {
  return (
    <h2 className="text-ec-title text-ink flex h-17.5 items-center gap-2 px-4 font-medium">
      {icon}
      <span>
        {lead && <span className="text-ink-muted">{lead}</span>}
        {title}
      </span>
    </h2>
  );
}
