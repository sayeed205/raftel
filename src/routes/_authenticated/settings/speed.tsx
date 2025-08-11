import SettingsSpeed from '@/features/settings/speed';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/speed')({
  component: SettingsSpeed,
});
