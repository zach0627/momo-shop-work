import { useId, useState, type FormEvent } from 'react';

import { SEARCH_PLACEHOLDER } from '../model/layout-content';

interface SearchBoxProps {
  /** compact：捲動後顯示在頂部列裡的小搜尋框。 */
  variant?: 'header' | 'compact';
}

/** 展示用：送出會被取消，頁面與網址都不變。 */
export function SearchBox({ variant = 'header' }: SearchBoxProps) {
  const [keyword, setKeyword] = useState('');
  const inputId = useId();
  const compact = variant === 'compact';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form
      role="search"
      aria-label="站內搜尋"
      onSubmit={handleSubmit}
      className={`flex items-stretch ${compact ? 'h-7 w-100' : 'h-9 w-110'}`}
    >
      <label htmlFor={inputId} className="sr-only">
        搜尋商品
      </label>
      <input
        id={inputId}
        type="search"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder={SEARCH_PLACEHOLDER}
        className={`min-w-0 flex-1 rounded-l-full border-2 border-r-0 border-control bg-surface px-4 text-ink outline-none placeholder:text-ink-muted ${
          compact ? 'text-ec-sm' : 'text-ec-md'
        }`}
      />
      <button
        type="submit"
        className={`shrink-0 rounded-r-full bg-control font-semibold text-on-action ${
          compact ? 'px-4 text-ec-sm' : 'px-6 text-ec-base'
        }`}
      >
        搜尋
      </button>
    </form>
  );
}
