import type { ReactNode } from 'react';

import type { SectionTitle } from '@momo/home-data-access';
import { SectionHeader } from '@momo/shared-ui';

export interface SectionFrameProps {
  /** Names the section for assistive technology. */
  label: string;
  title?: SectionTitle;
  /** false: the content runs edge to edge (it brings its own margins). */
  padded?: boolean;
  children: ReactNode;
}

/**
 * What every block of the home page sits in: a white band, 1220px wide, on
 * the grey page, with 16px of padding around its content - measured on the
 * live site.
 */
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
