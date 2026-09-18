import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { Providers } from './providers';
import { routes } from './router';

// Vite's BASE_URL ends with a slash; the router's basename must not (except "/").
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
