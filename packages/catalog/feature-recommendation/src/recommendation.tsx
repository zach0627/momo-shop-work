import { SectionHeader } from '@momo/shared-ui';

export interface RecommendationProps {
  title: string;
  /** The lighter first part of the title. */
  lead?: string;
}

/**
 * "You may like": a product grid that loads three more rows at a time.
 *
 * PLACEHOLDER until step 9: it holds the section's place on the home
 * page, so the page's registry points at the real package from the start.
 */
export function Recommendation({ title, lead }: RecommendationProps) {
  return (
    <section aria-label={`${lead ?? ''}${title}`} className="bg-surface">
      <SectionHeader lead={lead} title={title} />
      <p className="text-ec-base text-ink-muted px-4 pb-4">建置中</p>
    </section>
  );
}
