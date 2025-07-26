import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function BitTorrentSettings() {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>BitTorrent Settings</CardTitle>
          <CardDescription>
            Configure BitTorrent protocol settings and peer management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground py-8 text-center'>
            <p>BitTorrent settings component will be implemented in task 4.4</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
