export interface LoadMoreButtonProps {
  /** 正在載入下一批。 */
  busy: boolean;
  onClick: () => void;
}

/** 載入中用 aria-disabled 而不是 disabled：disabled 會讓鍵盤焦點消失。重複點擊由 loadMore 擋掉。 */
export function LoadMoreButton({ busy, onClick }: LoadMoreButtonProps) {
  return (
    <button
      type="button"
      aria-disabled={busy}
      onClick={onClick}
      className="border-line bg-surface text-ec-base text-ink-label hover:border-line-strong focus-visible:outline-brand rounded-pill mx-auto flex h-9.5 w-46 items-center justify-center gap-1 border focus-visible:outline-2 aria-disabled:cursor-progress"
    >
      {busy ? '載入中…' : '看更多'}
      {!busy && (
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      )}
    </button>
  );
}
