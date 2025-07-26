import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function AdvancedSettings() {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
          <CardDescription>
            Advanced qBittorrent configuration for expert users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground py-8 text-center'>
            <p>Advanced settings component will be implemented in task 4.4</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
