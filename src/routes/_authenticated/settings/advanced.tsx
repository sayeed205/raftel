import { createFileRoute } from '@tanstack/react-router';

import SettingsAdvanced from '@/features/settings/advanced';

export const Route = createFileRoute('/_authenticated/settings/advanced')({
  component: SettingsAdvanced,
});
