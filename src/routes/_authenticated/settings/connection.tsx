import { createFileRoute } from '@tanstack/react-router';

import SettingsConnection from '@/features/settings/connection';

export const Route = createFileRoute('/_authenticated/settings/connection')({
  component: SettingsConnection,
});
