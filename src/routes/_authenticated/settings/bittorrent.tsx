import { BitTorrentSettings, SettingsLayout } from '@/features/settings';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/bittorrent')({
  component: BitTorrentSettingsPage,
});

function BitTorrentSettingsPage() {
  return (
    <SettingsLayout currentSection='bittorrent'>
      <BitTorrentSettings />
    </SettingsLayout>
  );
}
