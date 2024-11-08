import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import LoadingView from '../modules/core/pages/loading';
import PresentationLayout from '../modules/presentation/layouts/presentation-layout';

export const HomePage = lazy(() => import('../modules/presentation/pages/home'));
export const Page404 = lazy(() => import('../modules/core/pages/page-not-found'));

import EditorPage from '../modules/pricing-editor/pages/pricing2yaml-editor';
import EditorLayout from '../modules/pricing-editor/layouts/editor-layout';

export default function Router() {
  const routes = useRoutes([
    {
      element: (
        <EditorLayout>
          <Suspense fallback={<LoadingView />}>
            <Outlet />
          </Suspense>
        </EditorLayout>
      ),
      children: [
        // { element: <HomePage />, index: true },
        // {element: <Navigate to="/editor" replace />, index: true},
        { element: <EditorPage />, index: true },
      ],
    },
    // {
    //   path: "/editor",
    //   element: (
    //     <EditorLayout>
    //       <Suspense fallback={<LoadingView />}>
    //         <EditorPage />
    //       </Suspense>
    //     </EditorLayout>
    //   )
    // },
    {
      path: 'error',
      element: <Page404 />,
    },
    // { path: 'contract', element: <ContractPage /> },
    {
      path: '*',
      element: <Navigate to="/error" replace />,
    },
  ]);

  return routes;
}
