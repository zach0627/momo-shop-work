import { useId, useState } from 'react';

import { AppLink } from '@momo/shared-ui';
import { paths } from '@momo/shared-util';

/** 分類列需要的欄位。 */
interface NavCategory {
  id: string;
  name: string;
}

interface CategoryNavProps {
  categories: NavCategory[];
  activeId: string;
}

// 面板每一列一種底色，由位置決定（資料不帶顏色）。class 要寫完整字串；下面的 grid-cols-9 是同一個 9
const PILLS_PER_ROW = 9;
const ROW_TINTS = [
  'bg-category-sky',
  'bg-category-lavender',
  'bg-category-rose',
  'bg-category-mint',
  'bg-category-peach',
];
// 第 index 個膠囊在第幾列 → 那一列的底色（超過五列就從頭輪）
const tintOfRow = (index: number) =>
  ROW_TINTS[Math.floor(index / PILLS_PER_ROW) % ROW_TINTS.length];

/** 分類列，以及展開後的「選擇分類」面板。分類沒有自己的頁面，所以只有「首頁」是連結。 */
export function CategoryNav({ categories, activeId }: CategoryNavProps) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  return (
    <nav aria-label="商品分類" className="relative mx-auto w-full max-w-shop">
      <div className="flex h-10 items-stretch bg-surface">
        {expanded ? (
          <p className="flex flex-1 items-center px-4 text-panel-title font-bold text-ink-title">
            選擇分類
          </p>
        ) : (
          <ul className="flex flex-1 items-stretch gap-4 overflow-hidden px-4">
            {categories.map((category) => (
              <li key={category.id} className="flex shrink-0">
                <RowItem
                  category={category}
                  active={category.id === activeId}
                />
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-label={expanded ? '收合分類' : '展開全部分類'}
          onClick={() => setExpanded((value) => !value)}
          className="flex w-9 shrink-0 items-center justify-center bg-surface-control text-ink-icon"
        >
          <Chevron up={expanded} />
        </button>
      </div>

      {expanded && (
        <div
          id={panelId}
          className="absolute top-full left-0 z-10 w-full rounded-b-panel bg-surface shadow-panel"
        >
          <ul className="grid grid-cols-9 gap-2.5 p-3">
            {categories.map((category, index) => (
              <li key={category.id}>
                <Pill
                  category={category}
                  active={category.id === activeId}
                  tint={tintOfRow(index)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

function RowItem({
  category,
  active,
}: {
  category: NavCategory;
  active: boolean;
}) {
  const className = `inline-flex items-center border-b-3 px-1 text-ec-lg font-semibold whitespace-nowrap ${
    active ? 'border-brand text-brand' : 'border-transparent text-ink'
  }`;

  return category.id === 'home' ? (
    <AppLink
      href={paths.home()}
      aria-current={active ? 'page' : undefined}
      className={className}
    >
      {category.name}
    </AppLink>
  ) : (
    <span aria-current={active ? 'page' : undefined} className={className}>
      {category.name}
    </span>
  );
}

function Pill({
  category,
  active,
  tint,
}: {
  category: NavCategory;
  active: boolean;
  tint: string;
}) {
  return (
    <span
      aria-current={active ? 'page' : undefined}
      className={`block h-11 truncate rounded-pill px-4 py-3 text-center text-ec-base ${
        active
          ? 'border border-brand bg-surface text-brand'
          : `${tint} text-ink-strong`
      }`}
    >
      {category.name}
    </span>
  );
}

function Chevron({ up }: { up: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`size-3 ${up ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6l5 5 5-5" />
    </svg>
  );
}
