import { AppLink } from '@momo/shared-ui';
import { paths } from '@momo/shared-util';

import { HOT_KEYWORDS, LOGO_SRC } from '../model/layout-content';
import { SearchBox } from './search-box';

/** logo、搜尋框與熱搜關鍵字；會隨頁面捲走。 */
export function MainHeader() {
  return (
    <div className="mx-auto flex w-full max-w-shop items-center gap-16 px-4 py-5">
      <AppLink
        href={paths.home()}
        aria-label="momo 回首頁"
        className="shrink-0"
      >
        <img src={LOGO_SRC} alt="" className="h-20 w-auto" />
      </AppLink>

      <div>
        <SearchBox />
        <p className="mt-2 flex items-center text-ec-sm text-brand">
          <span>猜你想搜 &gt;</span>
          {HOT_KEYWORDS.map((keyword) => (
            <span
              key={keyword}
              className="border-l border-brand px-2 leading-none first-of-type:border-l-0"
            >
              {keyword}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
