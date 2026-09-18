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

function expectShell() {
  expect(screen.getByRole('banner')).toBeTruthy();
  expect(screen.getByRole('main')).toBeTruthy();
  expect(screen.getByRole('contentinfo')).toBeTruthy();
}

// spec: app-shell / 每個頁面都有共用外框
describe('routes', () => {
  it('shows the home page inside the shell at /', async () => {
    renderAt('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: '首頁' }),
    ).toBeTruthy();
    expectShell();
  });

  it('passes the goods id from the URL to the goods detail page', async () => {
    renderAt('/goods/15687497');

    expect(
      await screen.findByRole('heading', { level: 1, name: '商品詳情' }),
    ).toBeTruthy();
    expect(within(screen.getByRole('main')).getByText('15687497')).toBeTruthy();
    expectShell();
  });

  it('shows a not-found page inside the shell for an unknown path', async () => {
    renderAt('/nope');

    expect(
      await screen.findByRole('heading', { level: 1, name: '找不到頁面' }),
    ).toBeTruthy();
    expectShell();
  });

  // spec: app-shell / Logo 連回首頁
  it('links the logo back to the home page', async () => {
    renderAt('/goods/15687497');
    await screen.findByRole('heading', { level: 1, name: '商品詳情' });

    const logo = within(screen.getByRole('banner')).getByRole('link', {
      name: /momo/,
    });
    expect(logo.getAttribute('href')).toBe('/');
  });
});
