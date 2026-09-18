import { render, screen } from '@testing-library/react';

import { App } from './app';

describe('App', () => {
  it('renders the shop name as the top-level heading', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'momo shop' }),
    ).toBeTruthy();
  });
});
