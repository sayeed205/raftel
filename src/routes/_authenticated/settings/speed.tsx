import { createFileRoute } from '@tanstack/react-router';

import SettingsSpeed from '@/features/settings/speed';

export const Route = createFileRoute('/_authenticated/settings/speed')({
  component: SettingsSpeed,
});
