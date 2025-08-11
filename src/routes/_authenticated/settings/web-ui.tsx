import { createFileRoute } from '@tanstack/react-router';

import SettingsWebUI from '@/features/settings/webui';

export const Route = createFileRoute('/_authenticated/settings/web-ui')({
  component: SettingsWebUI,
});
