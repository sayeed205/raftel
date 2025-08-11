import SettingsWebUI from '@/features/settings/webui';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/web-ui')({
  component: SettingsWebUI,
});
