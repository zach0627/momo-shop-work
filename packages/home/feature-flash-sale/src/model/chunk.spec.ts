import { chunk } from './chunk';

describe('chunk', () => {
  it('cuts a list into pages, the last one shorter', () => {
    const items = Array.from({ length: 29 }, (_, index) => index);

    const pages = chunk(items, 10);

    expect(pages.map((page) => page.length)).toEqual([10, 10, 9]);
    expect(pages.flat()).toEqual(items);
  });

  it('has no empty last page when the list divides evenly', () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('gives no pages for an empty list', () => {
    expect(chunk([], 10)).toEqual([]);
  });

  it('refuses a page size below 1 instead of looping forever', () => {
    expect(() => chunk([1, 2], 0)).toThrow(/size/);
  });
});
