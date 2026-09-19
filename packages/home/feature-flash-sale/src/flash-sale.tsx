import { SectionHeader } from '@momo/shared-ui';

export interface FlashSaleProps {
  title: string;
  /** 標題前半較淺的字。 */
  lead?: string;
}

/** 限時搶購：倒數計時 + 每頁 10 件商品。目前是佔位，Step 11 實作。 */
export function FlashSale({ title, lead }: FlashSaleProps) {
  return (
    <section aria-label={`${lead ?? ''}${title}`} className="bg-surface">
      <SectionHeader lead={lead} title={title} />
      <p className="text-ec-base text-ink-muted px-4 pb-4">建置中</p>
    </section>
  );
}
