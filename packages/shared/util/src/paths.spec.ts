import { paths, ROUTE_PATTERNS } from './paths.js';

/** Turns a route pattern such as `/goods/:goodsId` into a matcher. */
function toMatcher(pattern: string): RegExp {
  const source = pattern
    .split('/')
    .map((segment) => (segment.startsWith(':') ? '[^/]+' : segment))
    .join('/');
  return new RegExp(`^${source}$`);
}

describe('paths', () => {
  it('builds the home path', () => {
    expect(paths.home()).toBe('/');
  });

  it('builds a goods detail path from a goods id', () => {
    expect(paths.goods('15687497')).toBe('/goods/15687497');
  });

  it('encodes characters that would otherwise change the path', () => {
    expect(paths.goods('TP000/1 x')).toBe('/goods/TP000%2F1%20x');
  });

  // The router registers ROUTE_PATTERNS while every link is built with `paths`.
  // If the two drift apart, links silently lead to the not-found page.
  it.each([
    ['home', paths.home(), ROUTE_PATTERNS.home],
    ['goods', paths.goods('15687497'), ROUTE_PATTERNS.goods],
    ['goods with an encoded id', paths.goods('TP000/1'), ROUTE_PATTERNS.goods],
  ])('%s path matches its route pattern', (_name, path, pattern) => {
    // Guards against the vacuous case where both sides are empty.
    expect(pattern.startsWith('/')).toBe(true);
    expect(path).toMatch(toMatcher(pattern));
  });
});
