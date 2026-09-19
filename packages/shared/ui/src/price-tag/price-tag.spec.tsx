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

    // <del> is what makes it a struck price, to a browser and to a screen
    // reader alike; a class name could not be asserted as meaning anything.
    const struck = container.querySelector('del');
    expect(struck?.textContent).toBe('$49,999');
  });

  it('shows no struck price when the product has no original price', () => {
    const { container } = render(<PriceTag price={590} />);

    expect(screen.getByText('590')).toBeTruthy();
    expect(container.querySelector('del')).toBeNull();
  });

  // The domain promises originalPrice > price, but this component does not
  // know the domain. A struck price that is not higher would read as a
  // price increase.
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
