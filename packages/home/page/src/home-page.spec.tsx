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

const bestSellers: HomeSection = {
  id: 'best-sellers',
  type: 'product-rail',
  title: { text: '今日暢銷榜', badge: '即時更新' },
  collection: 'best-sellers',
  card: 'horizontal',
  perView: 3.47,
  background: '#f6e8eb',
};

const BEST_SELLERS = [
  { id: 'b3', name: '【紅布朗】堅果禮盒', price: 599, originalPrice: 1040 },
  { id: 'b1', name: '【Columbia】越野鞋', price: 2988, originalPrice: 5980 },
  { id: 'b2', name: '【SHARP】除濕機', price: 20900, originalPrice: 25900 },
].map((item) => ({
  ...item,
  imageUrl: `${item.id}.jpg`,
  images: [`${item.id}.jpg`],
  promoText: '滿1件折100',
  description: [],
}));

const catalog = createFakeCatalogRepository({
  getCollection: async (key) =>
    key === 'best-sellers'
      ? BEST_SELLERS
      : key === 'price-drop'
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

  // 規格 home-page：版位資料載入中
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

  // 規格 home-page：版位資料取得失敗（回報由 app 的 QueryCache 負責）
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

  // 規格 home-page：只有商品卡可點擊
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

  // 規格 home-page：今日暢銷榜以橫式商品卡呈現（卡片內容與順序、點擊暢銷商品）
  it('lists the best sellers in the order of the catalog, as cards with no rank on them', async () => {
    const home = createFakeHomeRepository({
      getLayout: async () => [bestSellers],
    });

    renderHomePage(home);

    const section = await screen.findByRole('region', { name: '今日暢銷榜' });
    const cards = await within(section).findAllByRole('article');
    expect(
      cards.map((card) => within(card).getByRole('heading').textContent),
    ).toEqual(BEST_SELLERS.map((item) => item.name));
    // 卡片上只有促銷文字、名稱與價格：沒有名次，也沒有別的東西
    expect(cards[0].textContent).toBe(
      '滿1件折100【紅布朗】堅果禮盒$599原價$1,040',
    );
    expect(within(cards[0]).getByRole('link').getAttribute('href')).toBe(
      '/goods/b3',
    );
  });

  // 真站：底色與標題旁的標籤都是這個區塊的資料，不是另一種元件
  it('gives the best sellers their tinted band and their badge from the data', async () => {
    const home = createFakeHomeRepository({
      getLayout: async () => [bestSellers, priceDrop],
    });

    renderHomePage(home);

    const tinted = await screen.findByRole('region', { name: '今日暢銷榜' });
    const plain = await screen.findByRole('region', { name: '降價好貨' });
    expect(tinted.style.backgroundColor).toBe('rgb(246, 232, 235)');
    expect(within(tinted).getByText('即時更新')).toBeTruthy();
    expect(plain.style.backgroundColor).toBe('');
    expect(within(plain).queryByText('即時更新')).toBeNull();
  });
});
