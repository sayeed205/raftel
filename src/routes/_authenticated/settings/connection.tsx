import SettingsConnection from '@/features/settings/connection';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/connection')({
  component: SettingsConnection,
});
