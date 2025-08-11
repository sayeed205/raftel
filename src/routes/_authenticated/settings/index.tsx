import SettingsRaftel from '@/features/settings/raftel';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsRaftel,
});
