import SettingsRss from '@/features/settings/rss';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/rss')({
  component: SettingsRss,
});
