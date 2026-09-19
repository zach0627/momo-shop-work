import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

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
}

function expectLayout() {
  expect(screen.getByRole('banner')).toBeTruthy();
  expect(screen.getByRole('main')).toBeTruthy();
  expect(screen.getByRole('contentinfo')).toBeTruthy();
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

  it('passes the goods id from the URL to the goods detail page', async () => {
    renderAt('/goods/15687497');

    expect(
      await screen.findByRole('heading', { level: 1, name: '商品詳情' }),
    ).toBeTruthy();
    expect(within(screen.getByRole('main')).getByText('15687497')).toBeTruthy();
    expectLayout();
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
    renderAt('/goods/15687497');
    await screen.findByRole('heading', { level: 1, name: '商品詳情' });

    const logo = within(screen.getByRole('banner')).getByRole('link', {
      name: /momo/,
    });
    expect(logo.getAttribute('href')).toBe('/');
  });
});
