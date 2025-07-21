import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { NavigationProgress } from '@/components/navigation-progress';
import GeneralError from '@/features/errors/general-error';
import NotFoundError from '@/features/errors/not-found-error';
import AuthGuard from '@/components/layout/auth-guard.tsx';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => {
    return (
      <>
        <NavigationProgress />
        <AuthGuard>
          <Outlet />
        </AuthGuard>
        <Toaster duration={50000} />
        {import.meta.env.MODE === 'development' && (
          <>
            <ReactQueryDevtools buttonPosition='bottom-left' />
            <TanStackRouterDevtools position='bottom-right' />
          </>
        )}
      </>
    );
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
});
