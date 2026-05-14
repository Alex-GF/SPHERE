import { useRouter } from '../../../core/hooks/useRouter';
import { headerRoutes } from '../router/header-routes';

export default function AppFooter() {
  const router = useRouter();

  return (
    <footer className="border-t border-tp-hairline-soft bg-tp-canvas">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-6 py-6 md:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.22em] text-tp-steel">SPHERE</span>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {headerRoutes.map(
              (route, index) =>
                !route.children && (
                  <button
                    key={index}
                    type="button"
                    onClick={() => route.to && router.push(route.to)}
                    className="text-xs text-tp-steel transition-colors hover:text-tp-ink"
                  >
                    {route.name}
                  </button>
                )
            )}
          </nav>
        </div>

        <div className="flex items-center justify-center border-t border-tp-hairline-soft pt-4">
          <p className="text-xs text-tp-muted">
            © {new Date().getFullYear()} SPHERE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
