import { LogsPage } from '@/features/logs';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/logs')({
  component: LogsPage,
});
