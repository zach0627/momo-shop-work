import type { HotSearch, ShortcutBarSection } from '@momo/home-data-access';

import { SectionFrame } from '../ui/section-frame';

// 名次圓圈的底色：前三名各一色，其餘同色（class 寫完整字串，Tailwind 才掃得到）
const RANK_COLORS = ['bg-rank-1', 'bg-rank-2', 'bg-rank-3'];

/** 真站實測：兩欄各 610px。左邊 5 個捷徑（每欄 118px、圖 98px），右邊熱搜排行 3 × 3，中間一條直線。 */
export function ShortcutBar({ section }: { section: ShortcutBarSection }) {
  const { hotSearches } = section;

  return (
    <SectionFrame label="快捷入口" padded={false}>
      <div className="grid grid-cols-2">
        {/* 文字印在圖上，所以 alt 就是標籤；不可點 */}
        <ul className="grid grid-cols-5 px-2.5 py-4">
          {section.items.map((item) => (
            <li key={item.id} className="flex justify-center">
              <img
                src={item.iconUrl}
                alt={item.label}
                width={108}
                height={108}
                loading="lazy"
                className="size-24.5"
              />
            </li>
          ))}
        </ul>
        {hotSearches && (
          <div className="border-line-divider border-l">
            <ol
              aria-label="熱搜排行"
              className="grid grid-cols-3 gap-1.5 px-4 py-3.5"
            >
              {hotSearches.map((item, index) => (
                <HotSearchItem
                  key={item.keyword}
                  item={item}
                  rank={index + 1}
                />
              ))}
            </ol>
          </div>
        )}
      </div>
    </SectionFrame>
  );
}

/** 熱搜的一項。不是連結：搜尋頁不在範圍內。 */
function HotSearchItem({ item, rank }: { item: HotSearch; rank: number }) {
  return (
    <li className="bg-surface rounded-pill flex h-8 items-center justify-between gap-1 px-2.5">
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          className={`${RANK_COLORS[rank - 1] ?? 'bg-rank-rest'} text-ec-xs text-on-action relative flex size-5 shrink-0 items-center justify-center rounded-full font-bold`}
        >
          {rank}
          {item.isNew && (
            <>
              <span className="bg-rank-new absolute right-0 bottom-0 size-1.5 rounded-full" />
              <span className="sr-only">新上榜</span>
            </>
          )}
        </span>
        <span className="text-ec-sm text-rank-keyword truncate">
          {item.keyword}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        <span className="text-ec-sm text-ink-muted">熱度{item.heat}萬</span>
        {item.rising && (
          <>
            <svg
              viewBox="0 0 10 16"
              className="fill-sale h-4 w-2.5"
              aria-hidden="true"
            >
              <path d="M5 0l5 6H6.5v10h-3V6H0z" />
            </svg>
            <span className="sr-only">上升</span>
          </>
        )}
      </span>
    </li>
  );
}
