import AuthGuard from '@/components/layout/auth-guard.tsx';
import { NavigationProgress } from '@/components/navigation-progress';
import { Toaster } from '@/components/ui/sonner';
import GeneralError from '@/features/errors/general-error';
import NotFoundError from '@/features/errors/not-found-error';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
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
                    <TanStackRouterDevtools position='bottom-left' />
                )}
            </>
        );
    },
    notFoundComponent: NotFoundError,
    errorComponent: GeneralError,
});
