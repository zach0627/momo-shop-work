import type { ReactNode } from 'react';

export interface SectionHeaderProps {
  title: string;
  /** The first words of the title, painted lighter: "降價" + "好貨". */
  lead?: string;
  /** Sits before the title, e.g. a logo. */
  icon?: ReactNode;
}

/**
 * The title of a home page section. On the live site each title is a
 * 1220x70 image; that artwork was not supplied, so it is text here, in the
 * same 70px band. The size is an estimate (`text-ec-title`).
 */
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
