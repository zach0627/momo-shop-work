import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { Providers } from './providers';
import { routes } from './router';

// BASE_URL 結尾有斜線，router 的 basename 不能有（"/" 除外）
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

const router = createBrowserRouter(routes, { basename });

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}

export default App;
