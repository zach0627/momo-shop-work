import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { createMockCatalogRepository } from '@momo/catalog-data-access';
import { formatPrice } from '@momo/shared-util';

import { Providers } from './providers';
import { routes } from './router';

// 和正式環境同一份路由表，掛在 memory history 上
function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return router;
}

function expectLayout() {
  expect(screen.getByRole('banner')).toBeTruthy();
  expect(screen.getByRole('main')).toBeTruthy();
  expect(screen.getByRole('contentinfo')).toBeTruthy();
}

/** 取一件真的存在於 mock catalog 的商品。 */
async function aRealProduct() {
  const [product] =
    await createMockCatalogRepository().getCollection('price-drop');
  return product;
}

// 規格 app-layout：每個頁面都有共用外框
describe('routes', () => {
  it('shows the home page inside the layout at /', async () => {
    renderAt('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'momo 購物網首頁' }),
    ).toBeTruthy();
    expectLayout();
  });

  // 整條鏈路：版位資料 → renderer → 商品列 → catalog → 可點的商品卡（規格 home-page：點擊商品卡）
  it('renders the home sections and links a product card to its detail page', async () => {
    renderAt('/');

    const rail = await screen.findByRole('region', { name: '降價好貨' });
    const [card] = await within(rail).findAllByRole('link');
    expect(card.getAttribute('href')).toMatch(/^\/goods\/\w+$/);

    // banner 是圖不是連結（規格 home-page：點擊活動 banner）
    const hero = screen.getByRole('region', { name: '主要活動' });
    expect(within(hero).getAllByRole('img').length).toBeGreaterThan(0);
    expect(within(hero).queryAllByRole('link')).toHaveLength(0);
  });

  // 規格 home-page：今日暢銷榜的順序與商品目錄回傳的相同
  it('lists the best sellers of the catalog, in its order, on the home page', async () => {
    const expected =
      await createMockCatalogRepository().getCollection('best-sellers');
    expect(expected.length).toBeGreaterThan(3);

    renderAt('/');

    const section = await screen.findByRole('region', { name: '今日暢銷榜' });
    const cards = await within(section).findAllByRole('link');
    expect(cards.map((card) => card.getAttribute('href'))).toEqual(
      expected.map((product) => `/goods/${product.id}`),
    );
  });

  // 規格 goods-detail：與首頁卡片為同一件商品
  it('leads from a home page card to a detail page with the same name and price', async () => {
    const router = renderAt('/');
    const rail = await screen.findByRole('region', { name: '降價好貨' });
    const [card] = await within(rail).findAllByRole('link');
    const name = within(card).getByRole('heading', { level: 3 }).textContent;
    const href = card.getAttribute('href');
    const product = await aRealProduct();
    expect(name).toBe(product.name);

    fireEvent.click(card);

    expect(
      await screen.findByRole('heading', { level: 1, name: product.name }),
    ).toBeTruthy();
    expect(router.state.location.pathname).toBe(href);
    expect(
      within(screen.getByRole('main')).getByText(formatPrice(product.price)),
    ).toBeTruthy();
    expectLayout();
  });

  it('passes the goods id from the URL to the goods detail page', async () => {
    const product = await aRealProduct();

    renderAt(`/goods/${product.id}`);

    expect(
      await screen.findByRole('heading', { level: 1, name: product.name }),
    ).toBeTruthy();
    expect(within(screen.getByRole('main')).getByText(product.id)).toBeTruthy();
    expect(
      screen.getAllByRole('button', { name: /購買|購物車|追蹤/ }),
    ).toHaveLength(3);
    expectLayout();
  });

  // 規格 goods-detail：開啟不存在的商品
  it('keeps the layout and the way home when the goods id has no product', async () => {
    renderAt('/goods/no-such-goods');

    expect(
      await screen.findByRole('heading', { level: 1, name: '找不到商品' }),
    ).toBeTruthy();
    expectLayout();
    const logo = within(screen.getByRole('banner')).getByRole('link', {
      name: /momo/,
    });
    expect(logo.getAttribute('href')).toBe('/');
  });

  it('shows a not-found page inside the layout for an unknown path', async () => {
    renderAt('/nope');

    expect(
      await screen.findByRole('heading', { level: 1, name: '找不到頁面' }),
    ).toBeTruthy();
    expectLayout();
  });

  // 規格 app-layout：Logo 連回首頁
  it('links the logo back to the home page', async () => {
    renderAt('/goods/no-such-goods');
    await screen.findByRole('heading', { level: 1 });

    const logo = within(screen.getByRole('banner')).getByRole('link', {
      name: /momo/,
    });
    expect(logo.getAttribute('href')).toBe('/');
  });
});
