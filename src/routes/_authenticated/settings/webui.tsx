import { SettingsLayout, WebUISettings } from '@/features/settings';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/webui')({
  component: WebUISettingsPage,
});

function WebUISettingsPage() {
  return (
    <SettingsLayout currentSection='webui'>
      <WebUISettings />
    </SettingsLayout>
  );
}
