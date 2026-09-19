import { render, screen, within } from '@testing-library/react';

import type { ShortcutBarSection } from '@momo/home-data-access';

import { ShortcutBar } from './shortcut-bar';

const section: ShortcutBarSection = {
  id: 'official-deals-shortcuts',
  type: 'shortcut-bar',
  items: [
    { id: 'flash-store', iconUrl: 'flash.png', label: '秒殺' },
    { id: 'check-in', iconUrl: 'check-in.png', label: '簽到' },
  ],
  hotSearches: [
    { keyword: '中秋禮盒', heat: 1089 },
    { keyword: 'iphone 18 pro', heat: 908, rising: true },
    { keyword: '電競筆電', heat: 892, isNew: true },
  ],
};

describe('ShortcutBar', () => {
  it('shows the shortcuts as images named by their label', () => {
    render(<ShortcutBar section={section} />);

    expect(screen.getByRole('img', { name: '秒殺' })).toBeTruthy();
    expect(screen.getByRole('img', { name: '簽到' })).toBeTruthy();
  });

  // 規格 home-page：熱搜的內容與順序
  it('ranks the hot searches with their rank, keyword and heat', () => {
    render(<ShortcutBar section={section} />);

    const list = screen.getByRole('list', { name: '熱搜排行' });
    const items = within(list).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      '1中秋禮盒熱度1089萬',
      '2iphone 18 pro熱度908萬上升',
      '3新上榜電競筆電熱度892萬',
    ]);
  });

  // 規格 home-page：點擊熱搜關鍵字（搜尋頁不在範圍內）
  it('does not link the hot searches anywhere', () => {
    render(<ShortcutBar section={section} />);

    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(2);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('leaves the ranking out when the data has none', () => {
    render(<ShortcutBar section={{ ...section, hotSearches: undefined }} />);

    expect(screen.getByRole('img', { name: '秒殺' })).toBeTruthy();
    expect(screen.queryByRole('list', { name: '熱搜排行' })).toBeNull();
  });
});
