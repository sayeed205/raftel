import { createFileRoute, redirect } from '@tanstack/react-router';

import { AuthenticatedLayout } from '@/components/layout/authenticated-layout.tsx';
import { useAuthStore } from '@/stores/auth-store.ts';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({
        to: '/login?redirect=' + window.location.href,
      });
    }
  },
});
