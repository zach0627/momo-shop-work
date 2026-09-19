import { formatPrice } from './format-price.js';

describe('formatPrice', () => {
  it.each([
    [49900, '49.900'], // 探針：故意寫錯，CI 必須失敗
    [1234567, '1,234,567'],
    [999, '999'],
    [0, '0'],
  ])('formats %d as "%s"', (amount, expected) => {
    expect(formatPrice(amount)).toBe(expected);
  });

  // 價格是整數的新台幣；折扣運算產生的小數不能出現在畫面上
  it('rounds a fractional amount to a whole number', () => {
    expect(formatPrice(1234.5)).toBe('1,235');
  });
});
