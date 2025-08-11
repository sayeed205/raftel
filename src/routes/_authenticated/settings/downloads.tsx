import SettingsDownloads from '@/features/settings/downloads';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/downloads')({
  component: SettingsDownloads,
});
