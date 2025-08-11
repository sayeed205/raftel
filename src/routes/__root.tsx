import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import AuthGuard from '@/components/layout/auth-guard.tsx';
import { NavigationProgress } from '@/components/navigation-progress';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import GeneralError from '@/features/errors/general-error';
import NotFoundError from '@/features/errors/not-found-error';

export const Route = createRootRouteWithContext<{}>()({
  component: () => {
    return (
      <ThemeProvider storageKey='theme' defaultTheme='system'>
        <NavigationProgress />
        <AuthGuard>
          <Outlet />
        </AuthGuard>
        <Toaster duration={5000} />
        {import.meta.env.DEV && <TanStackRouterDevtools position='bottom-right' />}
      </ThemeProvider>
    );
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
});
