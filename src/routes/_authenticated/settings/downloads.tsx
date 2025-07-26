import { DownloadSettings, SettingsLayout } from '@/features/settings';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/downloads')({
  component: DownloadSettingsPage,
});

function DownloadSettingsPage() {
  return (
    <SettingsLayout currentSection='downloads'>
      <DownloadSettings />
    </SettingsLayout>
  );
}
