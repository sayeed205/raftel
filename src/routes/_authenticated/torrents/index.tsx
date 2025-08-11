import TorrentsPage from '@/features/torrents';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/torrents/')({
  component: TorrentsPage,
});
