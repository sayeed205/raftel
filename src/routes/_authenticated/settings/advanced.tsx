import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/advanced')({
  component: AdvancedSettingsPage,
});

function AdvancedSettingsPage() {
  return <h2>AdvancedSettings</h2>;
}
