import { fireEvent, render, screen, within } from '@testing-library/react';

import { CategoryNav } from './category-nav';

const categories = [
  { id: 'home', name: '首頁' },
  { id: 'flash-sale', name: '限時搶購' },
  { id: '3c', name: '3C週邊' },
  { id: 'daily', name: '日用/紙品' },
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

  // The live panel tints each row of nine. The data does not carry a colour,
  // so it has to come from the position.
  it('tints the pills by the row they land on, nine to a row', () => {
    const many = Array.from({ length: 20 }, (_, index) => ({
      id: `c${index}`,
      name: `分類${index}`,
    }));
    render(<CategoryNav categories={many} activeId="none" />);
    fireEvent.click(screen.getByRole('button', { name: /分類/ }));

    const tintOf = (name: string) =>
      [...screen.getByText(name).classList].find((c) =>
        c.startsWith('bg-category-'),
      );

    expect(tintOf('分類0')).toBe('bg-category-sky');
    expect(tintOf('分類8')).toBe('bg-category-sky');
    expect(tintOf('分類9')).toBe('bg-category-lavender');
    expect(tintOf('分類17')).toBe('bg-category-lavender');
    expect(tintOf('分類18')).toBe('bg-category-rose');
  });
});
