import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import LoadingView from "./modules/core/pages/loading";
import "./styles/tailwind.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingView />}>
          <App />
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
