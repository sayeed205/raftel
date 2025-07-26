import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function WebUISettings() {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Web UI Settings</CardTitle>
          <CardDescription>
            Configure web interface settings and customization options.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground py-8 text-center'>
            <p>Web UI settings component will be implemented in task 4.4</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
