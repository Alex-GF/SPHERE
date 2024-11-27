import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import LoadingView from '../modules/core/pages/loading';
import PresentationLayout from '../modules/presentation/layouts';

export const HomePage = lazy(() => import('../modules/presentation/pages/home'));
export const TeamPage = lazy(() => import('../modules/presentation/pages/team'));
export const Page404 = lazy(() => import('../modules/core/pages/page-not-found'));

import EditorPage from '../modules/pricing-editor/pages/pricing2yaml-editor';
import EditorLayout from '../modules/pricing-editor/layouts';
import ResearchPage from '../modules/presentation/pages/research';
import ContributionsPage from '../modules/presentation/pages/contributions';

export const CardPage =  lazy(() => import('../modules/pricing/pages/card'));

export default function Router() {
  const routes = useRoutes([
    {
      element: (
        <PresentationLayout>
          <Suspense fallback={<LoadingView />}>
            <Outlet />
          </Suspense>
        </PresentationLayout>
      ),
      children: [
        { element: <HomePage />, index: true },
        {element: <TeamPage/>, path: "/team"},
        {element: <ResearchPage/>, path: "/research"},
        {element: <ContributionsPage/>, path: "/contributions"},
      ],
    },
    {
      element: (
        <PresentationLayout>
          <Suspense fallback={<LoadingView />}>
            <Outlet />
          </Suspense>
        </PresentationLayout>
      ),
      children: [
        {element: <CardPage/>, path: "/card"},
      ],
    },
    {
      path: "/editor",
      element: (
        <EditorLayout>
          <Suspense fallback={<LoadingView />}>
            <EditorPage />
          </Suspense>
        </EditorLayout>
      )
    },
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
