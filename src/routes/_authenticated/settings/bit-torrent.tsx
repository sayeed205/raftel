import SettingsBitTorrent from '@/features/settings/bittorrent';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/bit-torrent')({
  component: SettingsBitTorrent,
});
