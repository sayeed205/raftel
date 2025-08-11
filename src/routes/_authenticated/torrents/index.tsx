import { createFileRoute } from '@tanstack/react-router';

import TorrentsPage from '@/features/torrents';

export const Route = createFileRoute('/_authenticated/torrents/')({
  component: TorrentsPage,
});
