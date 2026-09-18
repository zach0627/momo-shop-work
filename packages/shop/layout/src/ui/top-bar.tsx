import { AppLink } from '@momo/shared-ui';
import { paths } from '@momo/shared-util';

import {
  TOP_BAR_ACCOUNT,
  TOP_BAR_CAMPAIGN,
  TOP_BAR_SHORTCUTS,
} from '../model/layout-content';
import { SearchBox } from './search-box';

interface TopBarProps {
  /** True once the main header has scrolled out of view. */
  compact: boolean;
}

/**
 * The strip that stays on screen while the page scrolls. It is `fixed`, as on
 * the live site, so the layout reserves its height above the page. Once the
 * main header is out of view it trades its shortcut links for a search box.
 */
export function TopBar({ compact }: TopBarProps) {
  return (
    <nav
      aria-label="快速連結"
      className="fixed inset-x-0 top-0 z-200 box-border h-topbar border-b border-line-strong bg-surface-muted text-ec-sm text-ink"
    >
      <div className="mx-auto flex h-full w-full max-w-shop items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <AppLink href={paths.home()} className="flex items-center gap-1">
            <HomeIcon />
            回首頁
          </AppLink>

          {compact ? (
            <SearchBox variant="compact" />
          ) : (
            <TextList items={TOP_BAR_SHORTCUTS} />
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <TextList items={TOP_BAR_ACCOUNT} />
          <span className="rounded-tile border border-line-strong bg-surface px-2.5 py-0.5">
            {TOP_BAR_CAMPAIGN}
          </span>
        </div>
      </div>
    </nav>
  );
}

function TextList({ items }: { items: string[] }) {
  return (
    <ul className="flex items-center">
      {items.map((item) => (
        <li
          key={item}
          className="border-l border-line-strong px-2.5 leading-none first:border-l-0 first:pl-0"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M2 7.5 8 2l6 5.5V14H2z" />
    </svg>
  );
}
