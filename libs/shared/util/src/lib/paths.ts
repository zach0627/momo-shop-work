/**
 * Single source of truth for URLs.
 *
 * The router registers `ROUTE_PATTERNS`; everything that links somewhere
 * builds the URL with `paths`. Nothing else in the workspace spells out a
 * path, so renaming a route is a change to this file only.
 */
export const ROUTE_PATTERNS = {
  home: '/',
  goods: '/goods/:goodsId',
} as const;

export const paths = {
  home: (): string => '/',
  goods: (goodsId: string): string => `/goods/${encodeURIComponent(goodsId)}`,
};
