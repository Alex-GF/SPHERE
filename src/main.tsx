import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import LoadingView from "./modules/core/pages/loading";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<LoadingView />}>
        <App />
      </Suspense>
    </BrowserRouter>
  </StrictMode>
);
