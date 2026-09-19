import { act, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';

import {
  CatalogTestProvider,
  createFakeCatalogRepository,
} from '@momo/catalog-data-access/testing';

import { AppLayout } from './app-layout';

const repository = createFakeCatalogRepository({
  getCategories: async () => [
    { id: 'home', name: '首頁' },
    { id: 'appliances', name: '家電' },
    { id: 'pets', name: '寵物' },
  ],
});

function renderLayout(children: ReactNode = 'x') {
  return render(
    <CatalogTestProvider repository={repository}>
      <AppLayout>{children}</AppLayout>
    </CatalogTestProvider>,
  );
}

// jsdom 沒有 IntersectionObserver。這個 stub 留住 callback，測試才能模擬「主 header 捲出視窗」
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
  // 規格 app-layout：每個頁面都有共用外框
  it('wraps the page in a banner, a main region and a footer', () => {
    renderLayout(<p>page content</p>);

    expect(screen.getByRole('banner')).toBeTruthy();
    expect(
      within(screen.getByRole('main')).getByText('page content'),
    ).toBeTruthy();
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });

  // 規格 app-layout：Logo 連回首頁
  it('links the logo to the home page', () => {
    renderLayout();

    const logo = within(screen.getByRole('banner')).getByRole('link', {
      name: /momo/,
    });

    expect(logo.getAttribute('href')).toBe('/');
  });

  // 規格 app-layout：頂部列在捲動時保留並轉為 compact
  it('shows a search box in the top bar only while the main header is out of view', () => {
    renderLayout();
    expect(within(topBar()).queryByRole('search')).toBeNull();

    notify(false);
    expect(within(topBar()).getByRole('search')).toBeTruthy();

    notify(true);
    expect(within(topBar()).queryByRole('search')).toBeNull();
  });

  // 規格 product-catalog：查詢分類清單（layout 自己不存清單）
  it('lists the categories it gets from the catalog', async () => {
    renderLayout();
    const nav = screen.getByRole('navigation', { name: '商品分類' });
    await within(nav).findByText('寵物');

    act(() => within(nav).getByRole('button', { name: /分類/ }).click());

    expect(
      within(nav)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['首頁', '家電', '寵物']);
  });

  it('still renders the frame while the categories are loading', () => {
    renderLayout();

    expect(screen.getByRole('navigation', { name: '商品分類' })).toBeTruthy();
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });
});
