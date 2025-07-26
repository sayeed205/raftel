import { ConnectionSettings, SettingsLayout } from '@/features/settings';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/connection')({
  component: ConnectionSettingsPage,
});

function ConnectionSettingsPage() {
  return (
    <SettingsLayout currentSection='connection'>
      <ConnectionSettings />
    </SettingsLayout>
  );
}
