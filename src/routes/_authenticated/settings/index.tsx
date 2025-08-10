import { createFileRoute } from '@tanstack/react-router';

import SettingsRaftel from '@/features/settings/raftel';

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsRaftel,
});
