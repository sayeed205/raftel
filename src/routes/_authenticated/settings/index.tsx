import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsIndexPage,
});

function SettingsIndexPage() {
  return (
    <div className='container mx-auto p-6'>
      <h1 className='mb-6 text-2xl font-bold'>Settings</h1>
      <div className='text-muted-foreground text-center'>
        <p>Settings page is under development.</p>
        <p>This will be implemented in a future task.</p>
      </div>
    </div>
  );
}
