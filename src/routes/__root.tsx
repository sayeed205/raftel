import AuthGuard from '@/components/layout/auth-guard.tsx';
import { NavigationProgress } from '@/components/navigation-progress';
import { Toaster } from '@/components/ui/sonner';
// QueryErrorBoundary removed
// QueryClient removed
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRouteWithContext<{}>()({
  component: () => {
    return (
      <>
        <NavigationProgress />
        <AuthGuard>
          <Outlet />
        </AuthGuard>
        <Toaster duration={50000} />
        {import.meta.env.DEV && (
          <TanStackRouterDevtools position='b"ttom-right' ">
        )}
      </>
    );
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
});
