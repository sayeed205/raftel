import { SettingsLayout, SpeedSettings } from '@/features/settings';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/speed')({
  component: SpeedSettingsPage,
});

function SpeedSettingsPage() {
  return (
    <SettingsLayout currentSection='speed'>
      <SpeedSettings />
    </SettingsLayout>
  );
}
