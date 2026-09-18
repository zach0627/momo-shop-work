import { render, screen } from '@testing-library/react';

import { App } from './app';

// Smoke test of the real browser router; route behaviour is covered in router.spec.tsx.
describe('App', () => {
  it('boots at / and renders the home page inside the layout', async () => {
    render(<App />);

    expect(
      await screen.findByRole('heading', { level: 1, name: '首頁' }),
    ).toBeTruthy();
    expect(screen.getByRole('banner')).toBeTruthy();
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });
});
