import { AppLink } from '@momo/shared-ui';
import { paths } from '@momo/shared-util';

/** 查無此商品：這是 catalog 的答案（null），不是錯誤；外框照常，並提供回首頁的連結。 */
export function GoodsNotFound({ goodsId }: { goodsId: string }) {
  return (
    <section className="py-16 text-center">
      <h1 className="text-ec-title text-ink font-bold">找不到商品</h1>
      <p className="text-ec-base text-ink-muted mt-2">
        品號 <span className="text-ink">{goodsId}</span>{' '}
        沒有對應的商品，可能已下架或網址有誤。
      </p>
      <AppLink
        href={paths.home()}
        className="text-ec-base text-brand mt-4 inline-block underline"
      >
        回首頁
      </AppLink>
    </section>
  );
}
