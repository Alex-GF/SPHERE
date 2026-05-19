import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import LoadingView from '../modules/core/pages/loading';
import AppLayout from './app-layout';
import ProtectedRoute from '../modules/auth/components/protected-route';
import { useAuth } from '../modules/auth/hooks/useAuth';

export const HomePage = lazy(() => import('../modules/presentation/pages/home'));
export const DashboardPage = lazy(() => import('../modules/presentation/pages/dashboard'));
export const TeamPage = lazy(() => import('../modules/presentation/pages/team'));
export const Page404 = lazy(() => import('../modules/core/pages/page-not-found'));

import EditorPage from '../modules/pricing-editor/pages/pricing2yaml-editor';
import EditorLayout from '../modules/pricing-editor/layouts/editor-layout';
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
import SettingsPage from '../modules/settings/pages/SettingsPage';

function RootPage() {
  const { authUser } = useAuth();

  if (authUser.isLoading) {
    return <LoadingView />;
  }

  if (authUser.isAuthenticated) {
    return (
      <AppLayout>
        <Suspense fallback={<LoadingView />}>
          <DashboardPage />
        </Suspense>
      </AppLayout>
    );
  }

  return (
    <Suspense fallback={<LoadingView />}>
      <HomePage />
    </Suspense>
  );
}

export default function Router() {
  const routes = useRoutes([
    // ═══════════════════════════════════════════════════════════
    // ROOT PAGE (landing when not auth, dashboard when auth)
    // ═══════════════════════════════════════════════════════════
    {
      path: '/',
      element: <RootPage />,
    },

    // ═══════════════════════════════════════════════════════════
    // PUBLIC ROUTES (AppLayout: Public or Authenticated based on auth)
    // ═══════════════════════════════════════════════════════════
    {
      element: (
        <AppLayout>
          <Suspense fallback={<LoadingView />}>
            <Outlet />
          </Suspense>
        </AppLayout>
      ),
      children: [
        { element: <LoginPage />, path: '/login' },
        { element: <RegisterPage />, path: '/register' },
        { element: <PricingListPage />, path: '/pricings' },
        { element: <CardPage />, path: '/pricings/:owner/:name' },
        { element: <CollectionsListPage />, path: '/pricings/collections' },
        { element: <CollectionCardPage />, path: '/pricings/collections/:ownerId/:collectionSlug' },
        { element: <TeamPage />, path: '/team' },
        { element: <ResearchPage />, path: '/research' },
        { element: <ContributionsPage />, path: '/contributions' },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PROTECTED ROUTES (require auth + AuthenticatedLayout)
    // ═══════════════════════════════════════════════════════════
    {
      element: (
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingView />}>
              <Outlet />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      ),
      children: [
        { element: <CreatePricingPage />, path: '/pricings/new' },
        { element: <CreateCollectionPage />, path: '/pricings/collections/new' },
        { element: <MyPricingsPage />, path: '/me/pricings' },
        { element: <OrganizationsListPage />, path: '/me/orgs' },
        { element: <SettingsPage />, path: '/me/settings' },
        { element: <CreateOrganizationPage />, path: '/orgs/new' },
        { element: <OrganizationJoinPage />, path: '/orgs/join/:code' },
        { element: <OrganizationDetailPage />, path: '/orgs/:organizationId' },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // EDITOR (standalone layout)
    // ═══════════════════════════════════════════════════════════
    {
      path: '/editor',
      element: (
        <EditorLayout>
          <Suspense fallback={<LoadingView />}>
            <EditorPage />
          </Suspense>
        </EditorLayout>
      ),
    },

    // ═══════════════════════════════════════════════════════════
    // HARVEY (standalone layout)
    // ═══════════════════════════════════════════════════════════
    {
      path: '/harvey',
      element: (
        <Suspense fallback={<LoadingView />}>
          <PricingAssistantPage />
        </Suspense>
      ),
    },
    {
      path: '/harvey-play',
      element: (
        <Suspense fallback={<LoadingView />}>
          <PricingAssistantPage playground />
        </Suspense>
      ),
    },

    // ═══════════════════════════════════════════════════════════
    // ERROR / CATCH-ALL
    // ═══════════════════════════════════════════════════════════
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
