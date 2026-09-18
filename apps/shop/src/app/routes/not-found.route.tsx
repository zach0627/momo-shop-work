import { AppLink } from '@momo/shared-ui';
import { paths } from '@momo/shared-util';

export function Component() {
  return (
    <section>
      <h1 className="text-ec-title font-bold text-ink">找不到頁面</h1>
      <p className="mt-2 text-ec-base text-ink-muted">
        這個網址沒有對應的頁面。
      </p>
      <AppLink
        href={paths.home()}
        className="mt-4 inline-block text-ec-base text-brand underline"
      >
        回首頁
      </AppLink>
    </section>
  );
}
