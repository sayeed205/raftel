import { createFileRoute } from '@tanstack/react-router';

import SettingsRss from '@/features/settings/rss';

export const Route = createFileRoute('/_authenticated/settings/rss')({
  component: SettingsRss,
});
