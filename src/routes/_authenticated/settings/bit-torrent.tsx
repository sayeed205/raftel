import { createFileRoute } from '@tanstack/react-router';

import SettingsBitTorrent from '@/features/settings/bittorrent';

export const Route = createFileRoute('/_authenticated/settings/bit-torrent')({
  component: SettingsBitTorrent,
});
