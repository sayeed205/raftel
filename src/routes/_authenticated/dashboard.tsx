import { createFileRoute } from '@tanstack/react-router';

import DashboardPage from '@/features/dashboard';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
});
