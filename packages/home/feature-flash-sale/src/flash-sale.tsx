import { SectionHeader } from '@momo/shared-ui';

export interface FlashSaleProps {
  title: string;
  /** The lighter first part of the title. */
  lead?: string;
}

/**
 * The flash sale: a countdown and pages of 10 products.
 *
 * PLACEHOLDER until step 11: it holds the section's place on the home
 * page, so the page's registry points at the real package from the start.
 */
export function FlashSale({ title, lead }: FlashSaleProps) {
  return (
    <section aria-label={`${lead ?? ''}${title}`} className="bg-surface">
      <SectionHeader lead={lead} title={title} />
      <p className="text-ec-base text-ink-muted px-4 pb-4">建置中</p>
    </section>
  );
}
