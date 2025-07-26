import { AdvancedSettings, SettingsLayout } from '@/features/settings';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/advanced')({
  component: AdvancedSettingsPage,
});

function AdvancedSettingsPage() {
  return (
    <SettingsLayout currentSection='advanced'>
      <AdvancedSettings />
    </SettingsLayout>
  );
}
