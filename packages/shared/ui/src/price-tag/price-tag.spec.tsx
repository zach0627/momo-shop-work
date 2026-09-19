import { render, screen } from '@testing-library/react';

import { PriceTag } from './price-tag';

describe('PriceTag', () => {
  it('shows the price with thousands separators', () => {
    render(<PriceTag price={49900} />);

    expect(screen.getByText('49,900')).toBeTruthy();
  });

  it('strikes the original price through when there is one', () => {
    const { container } = render(
      <PriceTag price={49900} originalPrice={49999} />,
    );

    // 用 <del> 判斷劃線價：class 名稱沒辦法斷言它的意義
    const struck = container.querySelector('del');
    expect(struck?.textContent).toBe('$49,999');
  });

  it('shows no struck price when the product has no original price', () => {
    const { container } = render(<PriceTag price={590} />);

    expect(screen.getByText('590')).toBeTruthy();
    expect(container.querySelector('del')).toBeNull();
  });

  // 這個元件不認識 domain：不高於售價的「原價」不能顯示，否則會被讀成漲價
  it.each([
    ['equal to', 590],
    ['below', 500],
  ])(
    'shows no struck price when the original is %s the price',
    (_, original) => {
      const { container } = render(
        <PriceTag price={590} originalPrice={original} />,
      );

      expect(screen.getByText('590')).toBeTruthy();
      expect(container.querySelector('del')).toBeNull();
    },
  );
});
