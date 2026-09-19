import { paths, ROUTE_PATTERNS } from './paths.js';

/** 把 /goods/:goodsId 這類 pattern 轉成 RegExp。 */
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

  // router 註冊的是 ROUTE_PATTERNS，連結用的是 paths；兩者對不起來時，連結會靜靜地導到 not-found
  it.each([
    ['home', paths.home(), ROUTE_PATTERNS.home],
    ['goods', paths.goods('15687497'), ROUTE_PATTERNS.goods],
    ['goods with an encoded id', paths.goods('TP000/1'), ROUTE_PATTERNS.goods],
  ])('%s path matches its route pattern', (_name, path, pattern) => {
    // 防止兩邊都是空字串時的空洞通過
    expect(pattern.startsWith('/')).toBe(true);
    expect(path).toMatch(toMatcher(pattern));
  });
});
