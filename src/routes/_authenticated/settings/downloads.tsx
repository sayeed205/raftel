import { createFileRoute } from '@tanstack/react-router';

import SettingsDownloads from '@/features/settings/downloads';

export const Route = createFileRoute('/_authenticated/settings/downloads')({
  component: SettingsDownloads,
});
