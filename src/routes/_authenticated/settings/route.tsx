import Settings from '@/features/settings';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings')({
  component: Settings,
});
