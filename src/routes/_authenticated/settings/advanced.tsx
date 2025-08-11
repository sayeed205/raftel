import SettingsAdvanced from '@/features/settings/advanced';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/advanced')({
  component: SettingsAdvanced,
});
