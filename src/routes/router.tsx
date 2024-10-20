import { Navigate, Outlet, useRoutes } from "react-router-dom";
import StandardLayout from "../layouts/standard-layout";
import { lazy, Suspense } from "react";
import LoadingView from "../sections/loading";

export const HomePage = lazy(() => import("../pages/home"));
export const EditorPage = lazy(() => import("../pages/pricing2yaml-editor"));
export const Page404 = lazy(() => import("../pages/page-not-found"));

export default function Router() {
  const routes = useRoutes([
    {
      element: (
        <StandardLayout>
          <Suspense fallback={<LoadingView />}>
            <Outlet />
          </Suspense>
        </StandardLayout>
      ),
      children: [
        { element: <HomePage />, index: true },
        { path: "editor", element: <EditorPage /> },
      ],
    },
    {
      path: "error",
      element: <Page404 />,
    },
    // { path: 'contract', element: <ContractPage /> },
    {
      path: "*",
      element: <Navigate to="/error" replace />,
    },
  ]);

  return routes;
}
