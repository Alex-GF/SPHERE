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
import CreatePricingPage from '../modules/pricing/pages/create';
import CollectionCardPage from '../modules/pricing/pages/collection-card';
import MyPricingsPage from '../modules/profile/pages/pricings';
import CreateCollectionPage from '../modules/profile/pages/create-collection';
import CollectionsListPage from '../modules/pricing/pages/collections-list';
import PricingAssistantPage from '../modules/harvey/pages/pricing-assistant';
import OrganizationsListPage from '../modules/organization/pages/organizations-list';
import CreateOrganizationPage from '../modules/organization/pages/create-organization';
import OrganizationDetailPage from '../modules/organization/pages/organization-detail';
import OrganizationJoinPage from '../modules/organization/pages/organization-join';


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
        { element: <TeamPage />, path: "/team" },
        { element: <ResearchPage />, path: "/research" },
        { element: <ContributionsPage />, path: "/contributions" },
        { element: <CollectionsListPage />, path: "/pricings/collections" },
        { element: <CreateCollectionPage />, path: "/pricings/collections/new" },
        { element: <CollectionCardPage />, path: "/pricings/collections/:ownerId/:collectionName" },
        { element: <MyPricingsPage />, path: "/me/pricings" },
        { element: <OrganizationsListPage />, path: "/me/orgs" },
        { element: <CreateOrganizationPage />, path: "/orgs/new" },
        { element: <OrganizationJoinPage />, path: "/orgs/join/:code" },
        {
          path: "/orgs/:organizationId",
          element: <OrganizationDetailPage />
        },
        { element: <PricingAssistantPage />, path: "/harvey"},
        { element: <PricingAssistantPage playground />, path: "/harvey-play"}
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
    {
      path: '*',
      element: <Navigate to="/error" replace />,
    },
  ]);

  return routes;
}
