import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/notifications')({
  component: NotificationSettingsPage,
});

function NotificationSettingsPage() {
  return (
    <div className='container mx-auto p-6'>
      <h1 className='mb-6 text-2xl font-bold'>Notification Settings</h1>
      <div className='text-muted-foreground text-center'>
        <p>Notification settings page is under development.</p>
        <p>This will be implemented in a future task.</p>
      </div>
    </div>
  );
}
