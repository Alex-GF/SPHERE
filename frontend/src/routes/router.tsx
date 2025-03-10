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
import PricingListPage from '../modules/pricing/pages/list';
import LoginPage from '../modules/auth/pages/login-page';
import RegisterPage from '../modules/auth/pages/register-page';
import CardPage from '../modules/pricing/pages/card';
import LegacyPricingCard from '../modules/pricing/pages/legacy-pricing-card';
import CreatePricingPage from '../modules/pricing/pages/create';
import CollectionCardPage from '../modules/pricing/pages/collection-card';
import MyPricingsPage from '../modules/profile/pages/pricings';
import CreateCollectionPage from '../modules/profile/pages/create-collection';
import CollectionsListPage from '../modules/pricing/pages/collections-list';

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
        { element: <LoginPage />, path: "/login" },
        { element: <RegisterPage />, path: "/register" },
        { element: <PricingListPage />, path: "/pricings" },
        { element: <CreatePricingPage />, path: "/pricings/new" },
        { element: <CardPage />, path: "/pricings/:owner/:name" },
        // { element: <LegacyPricingCard />, path: "/pricings/card" },
        { element: <TeamPage />, path: "/team" },
        { element: <ResearchPage />, path: "/research" },
        { element: <ContributionsPage />, path: "/contributions" },
        { element: <CollectionsListPage />, path: "/pricings/collections" },
        { element: <CreateCollectionPage />, path: "/pricings/collections/new" },
        { element: <CollectionCardPage />, path: "/pricings/collections/:ownerId/:collectionName" },
        { element: <MyPricingsPage />, path: "/me/pricings" },
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
