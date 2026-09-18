import { fireEvent, render, screen, within } from '@testing-library/react';

import type { Category } from '../model/categories';
import { CategoryNav } from './category-nav';

const categories: Category[] = [
  { id: 'home', name: '首頁', tone: 'sky' },
  { id: 'flash-sale', name: '限時搶購', tone: 'sky' },
  { id: '3c', name: '3C週邊', tone: 'lavender' },
  { id: 'daily', name: '日用/紙品', tone: 'rose' },
];

function renderNav() {
  render(<CategoryNav categories={categories} activeId="home" />);
  return screen.getByRole('button', { name: /分類/ });
}

// spec: app-layout / 分類導覽可展開與收合
describe('CategoryNav', () => {
  it('starts collapsed: the row of categories is shown, the panel is not', () => {
    const toggle = renderNav();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('選擇分類')).toBeNull();
    expect(screen.getByText('3C週邊')).toBeTruthy();
  });

  it('expands into a panel that lists every category', () => {
    const toggle = renderNav();

    fireEvent.click(toggle);

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('選擇分類')).toBeTruthy();
    const panel = document.getElementById(
      toggle.getAttribute('aria-controls') ?? '',
    );
    expect(panel).not.toBeNull();
    const items = within(panel as HTMLElement).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual(
      categories.map((category) => category.name),
    );
  });

  it('collapses again on a second click', () => {
    const toggle = renderNav();

    fireEvent.click(toggle);
    fireEvent.click(toggle);

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('選擇分類')).toBeNull();
  });

  it('marks the active category, in the row and in the panel', () => {
    const toggle = renderNav();

    expect(
      screen.getByText('首頁').closest('[aria-current="page"]'),
    ).not.toBeNull();

    fireEvent.click(toggle);

    expect(
      screen.getByText('首頁').closest('[aria-current="page"]'),
    ).not.toBeNull();
    expect(
      screen.getByText('3C週邊').closest('[aria-current="page"]'),
    ).toBeNull();
  });
});
