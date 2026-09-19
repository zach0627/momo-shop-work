import { SectionHeader } from '@momo/shared-ui';

export interface RankingProps {
  title: string;
  /** The lighter first part of the title. */
  lead?: string;
}

/**
 * Today's best sellers, as horizontal product cards.
 *
 * PLACEHOLDER until step 12: it holds the section's place on the home
 * page, so the page's registry points at the real package from the start.
 */
export function Ranking({ title, lead }: RankingProps) {
  return (
    <section aria-label={`${lead ?? ''}${title}`} className="bg-surface">
      <SectionHeader lead={lead} title={title} />
      <p className="text-ec-base text-ink-muted px-4 pb-4">建置中</p>
    </section>
  );
}
