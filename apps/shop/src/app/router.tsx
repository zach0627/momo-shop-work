import { Outlet, type RouteObject } from 'react-router';

import { ROUTE_PATTERNS } from '@momo/shared-util';
import { AppLayout } from '@momo/shop-layout';

function LayoutRoute() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

/** 路由表。path 來自 ROUTE_PATTERNS，和 packages 用 paths 組出的連結不會對不起來；每頁是 lazy chunk。 */
export const routes: RouteObject[] = [
  {
    Component: LayoutRoute,
    children: [
      { path: ROUTE_PATTERNS.home, lazy: () => import('./routes/home.route') },
      {
        path: ROUTE_PATTERNS.goods,
        lazy: () => import('./routes/goods.route'),
      },
      { path: '*', lazy: () => import('./routes/not-found.route') },
    ],
  },
];
