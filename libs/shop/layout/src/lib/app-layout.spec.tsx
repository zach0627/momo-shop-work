import { act, render, screen, within } from '@testing-library/react';

import { AppLayout } from './app-layout';

// jsdom has no IntersectionObserver. The stub keeps the callback so a test can
// say "the main header left the viewport" without a real scroll.
let notify: (isIntersecting: boolean) => void;

beforeEach(() => {
  class FakeIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      notify = (isIntersecting) =>
        act(() =>
          callback(
            [{ isIntersecting } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          ),
        );
    }
    observe() {
      return undefined;
    }
    unobserve() {
      return undefined;
    }
    disconnect() {
      return undefined;
    }
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function topBar() {
  return screen.getByRole('navigation', { name: '快速連結' });
}

describe('AppLayout', () => {
  // spec: app-layout / 每個頁面都有共用外框
  it('wraps the page in a banner, a main region and a footer', () => {
    render(
      <AppLayout>
        <p>page content</p>
      </AppLayout>,
    );

    expect(screen.getByRole('banner')).toBeTruthy();
    expect(
      within(screen.getByRole('main')).getByText('page content'),
    ).toBeTruthy();
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });

  // spec: app-layout / Logo 連回首頁
  it('links the logo to the home page', () => {
    render(<AppLayout>x</AppLayout>);

    const logo = within(screen.getByRole('banner')).getByRole('link', {
      name: /momo/,
    });

    expect(logo.getAttribute('href')).toBe('/');
  });

  // spec: app-layout / 頂部列在捲動時保留並轉為 compact
  it('shows a search box in the top bar only while the main header is out of view', () => {
    render(<AppLayout>x</AppLayout>);
    expect(within(topBar()).queryByRole('search')).toBeNull();

    notify(false);
    expect(within(topBar()).getByRole('search')).toBeTruthy();

    notify(true);
    expect(within(topBar()).queryByRole('search')).toBeNull();
  });

  it('offers every category in the navigation panel', () => {
    render(<AppLayout>x</AppLayout>);
    const nav = screen.getByRole('navigation', { name: '商品分類' });

    act(() => within(nav).getByRole('button', { name: /分類/ }).click());

    expect(within(nav).getAllByRole('listitem')).toHaveLength(40);
  });
});
