import { SectionHeader } from '@momo/shared-ui';

export interface RankingProps {
  title: string;
  /** 標題前半較淺的字。 */
  lead?: string;
}

/** 今日暢銷榜：橫式商品卡。目前是佔位，Step 12 實作。 */
export function Ranking({ title, lead }: RankingProps) {
  return (
    <section aria-label={`${lead ?? ''}${title}`} className="bg-surface">
      <SectionHeader lead={lead} title={title} />
      <p className="text-ec-base text-ink-muted px-4 pb-4">建置中</p>
    </section>
  );
}
