import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/webui')({
  component: WebUISettingsPage,
});

function WebUISettingsPage() {
  return <h2>Web UI settings</h2>;
}
