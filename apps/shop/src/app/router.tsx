import { Outlet, type RouteObject } from 'react-router';

import { ROUTE_PATTERNS } from '@momo/shared-util';
import { ShellLayout } from '@momo/shell-feature';

function ShellRoute() {
  return (
    <ShellLayout>
      <Outlet />
    </ShellLayout>
  );
}

/**
 * The route table. Paths come from ROUTE_PATTERNS so they cannot drift from
 * the links libs build with `paths`. Each page is a lazy chunk.
 *
 * apps/shop is the only project allowed to import the router (enforced by
 * lint), which keeps a move to another router or to SSR a one-project change.
 */
export const routes: RouteObject[] = [
  {
    Component: ShellRoute,
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
