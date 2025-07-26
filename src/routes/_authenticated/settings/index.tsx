import { SettingsLayout } from '@/features/settings';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsIndexPage,
});

function SettingsIndexPage() {
  return <SettingsLayout />;
}
