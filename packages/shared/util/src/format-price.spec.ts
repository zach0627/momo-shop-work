import { formatPrice } from './format-price.js';

describe('formatPrice', () => {
  it.each([
    [49900, '49,900'],
    [1234567, '1,234,567'],
    [999, '999'],
    [0, '0'],
  ])('formats %d as "%s"', (amount, expected) => {
    expect(formatPrice(amount)).toBe(expected);
  });

  // Prices are whole TWD. A fraction can only come from arithmetic (a
  // discount rate), and must not leak into the page as "1,234.5".
  it('rounds a fractional amount to a whole number', () => {
    expect(formatPrice(1234.5)).toBe('1,235');
  });
});
