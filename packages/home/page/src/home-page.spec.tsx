import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';

import {
  CatalogTestProvider,
  createFakeCatalogRepository,
} from '@momo/catalog-data-access/testing';
import type { HomeRepository, HomeSection } from '@momo/home-data-access';
import {
  createFakeHomeRepository,
  HomeTestProvider,
} from '@momo/home-data-access/testing';
import { installCarouselTestEnvironment } from '@momo/shared-ui/testing';

import { HomePage } from './home-page';

const notice: HomeSection = {
  id: 'fraud-notice',
  type: 'notice',
  banner: {
    id: 'fraud-notice',
    imageUrl: 'fraud-notice.gif',
    alt: '當心「發票中獎」假信件',
    width: 960,
    height: 96,
  },
};
const priceDrop: HomeSection = {
  id: 'price-drop',
  type: 'product-rail',
  title: { lead: '降價', text: '好貨' },
  collection: 'price-drop',
  card: 'vertical',
  perView: 8,
};
const flagship: HomeSection = {
  id: 'flagship-stores',
  type: 'banner-grid',
  title: { text: '官方旗艦名店' },
  label: '官方旗艦名店',
  columns: 4,
  banners: [
    { id: 'b1', imageUrl: 'b1.jpg', alt: '3COINS', width: 305, height: 343 },
  ],
};

const catalog = createFakeCatalogRepository({
  getCollection: async (key) =>
    key === 'price-drop'
      ? [
          {
            id: '15687497',
            name: '【Apple】iPhone 18 Pro Max',
            imageUrl: 'iphone.webp',
            images: ['iphone.webp'],
            price: 49900,
            originalPrice: 49999,
            description: [],
          },
        ]
      : [],
});

function renderHomePage(home: HomeRepository) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <HomeTestProvider repository={home}>
      <CatalogTestProvider repository={catalog}>{children}</CatalogTestProvider>
    </HomeTestProvider>
  );
  return render(<HomePage />, { wrapper });
}

describe('HomePage', () => {
  let uninstall: () => void;

  beforeAll(() => {
    uninstall = installCarouselTestEnvironment();
  });

  afterAll(() => {
    uninstall();
  });

  // spec home-page: 版位資料載入中
  it('says it is loading until the layout arrives, never a blank page', async () => {
    let deliver: (sections: HomeSection[]) => void = () => undefined;
    const home = createFakeHomeRepository({
      getLayout: () =>
        new Promise((resolve) => {
          deliver = resolve;
        }),
    });

    renderHomePage(home);
    expect(screen.getByRole('status').textContent).toContain('載入中');

    deliver([notice]);
    expect(
      await screen.findByRole('img', { name: '當心「發票中獎」假信件' }),
    ).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
  });

  // spec home-page: 版位資料取得失敗. (Reporting the failure is the app's
  // query cache - see apps/shop query-client.spec.)
  it('shows an error message when the layout cannot be loaded', async () => {
    const home = createFakeHomeRepository({
      getLayout: async () => {
        throw new Error('cms is down');
      },
    });

    renderHomePage(home);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('首頁內容載入失敗');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('renders the sections of the layout, top to bottom', async () => {
    const home = createFakeHomeRepository({
      getLayout: async () => [flagship, notice, priceDrop],
    });

    renderHomePage(home);

    await screen.findByRole('region', { name: '官方旗艦名店' });
    await screen.findByRole('link');
    const names = screen
      .getAllByRole('region')
      .map((region) => region.getAttribute('aria-label'));
    expect(names).toEqual([
      '官方旗艦名店',
      '當心「發票中獎」假信件',
      '降價好貨',
    ]);
  });

  // spec home-page: 只有商品卡可點擊
  it('links product cards to their detail page, and nothing else', async () => {
    const home = createFakeHomeRepository({
      getLayout: async () => [flagship, notice, priceDrop],
    });

    renderHomePage(home);

    const link = await screen.findByRole('link');
    expect(link.getAttribute('href')).toBe('/goods/15687497');
    expect(within(link).getByText('【Apple】iPhone 18 Pro Max')).toBeTruthy();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});
