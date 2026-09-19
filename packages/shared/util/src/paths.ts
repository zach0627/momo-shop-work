/** 網址的唯一來源：router 註冊 ROUTE_PATTERNS，所有連結用 paths 組出來。改路由只改這個檔案。 */
export const ROUTE_PATTERNS = {
  home: '/',
  goods: '/goods/:goodsId',
} as const;

export const paths = {
  home: (): string => '/',
  goods: (goodsId: string): string => `/goods/${encodeURIComponent(goodsId)}`,
};
