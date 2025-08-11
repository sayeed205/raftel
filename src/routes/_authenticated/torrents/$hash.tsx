import TorrentDetailsPage from '@/features/torrents/torrent-details.tsx';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/torrents/$hash')({
  component: TorrentDetailsPage,
  validateSearch: (
    search: Record<string, string | undefined>
  ): { tab: string | undefined } => ({
    tab: search.tab,
  }),
});
