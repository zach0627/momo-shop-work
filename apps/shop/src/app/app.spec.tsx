import { render, screen } from '@testing-library/react';

import { App } from './app';

// 用真的 browser router 做煙霧測試；路由行為見 router.spec.tsx
describe('App', () => {
  it('boots at / and renders the home page inside the layout', async () => {
    render(<App />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'momo 購物網首頁' }),
    ).toBeTruthy();
    expect(screen.getByRole('banner')).toBeTruthy();
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });
});
