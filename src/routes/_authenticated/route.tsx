import { createFileRoute } from '@tanstack/react-router';

import { AuthenticatedLayout } from '@/components/layout/authenticated-layout.tsx';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});
