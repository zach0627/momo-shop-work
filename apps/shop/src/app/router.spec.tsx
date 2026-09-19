import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { createMockCatalogRepository } from '@momo/catalog-data-access';
import { formatPrice } from '@momo/shared-util';

import { Providers } from './providers';
import { routes } from './router';

// Same route table as production, mounted on a memory history.
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

/** A product that really is in the catalog the app injects. */
async function aRealProduct() {
  const [product] =
    await createMockCatalogRepository().getCollection('price-drop');
  return product;
}

// spec: app-layout / 每個頁面都有共用外框
describe('routes', () => {
  it('shows the home page inside the layout at /', async () => {
    renderAt('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'momo 購物網首頁' }),
    ).toBeTruthy();
    expectLayout();
  });

  // The whole chain with the real mock repositories: layout data -> section
  // renderer -> product rail -> catalog -> a card that links to its page.
  // spec: home-page / 點擊商品卡
  it('renders the home sections and links a product card to its detail page', async () => {
    renderAt('/');

    const rail = await screen.findByRole('region', { name: '降價好貨' });
    const [card] = await within(rail).findAllByRole('link');
    expect(card.getAttribute('href')).toMatch(/^\/goods\/\w+$/);

    // Banners are images, not links (spec: home-page / 點擊活動 banner).
    const hero = screen.getByRole('region', { name: '主要活動' });
    expect(within(hero).getAllByRole('img').length).toBeGreaterThan(0);
    expect(within(hero).queryAllByRole('link')).toHaveLength(0);
  });

  // spec: goods-detail / 與首頁卡片為同一件商品
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

  // spec: goods-detail / 開啟不存在的商品
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

  // spec: app-layout / Logo 連回首頁
  it('links the logo back to the home page', async () => {
    renderAt('/goods/no-such-goods');
    await screen.findByRole('heading', { level: 1 });

    const logo = within(screen.getByRole('banner')).getByRole('link', {
      name: /momo/,
    });
    expect(logo.getAttribute('href')).toBe('/');
  });
});
