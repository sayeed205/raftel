
import { LogControls } from './components/log-controls';
import { LogViewer } from './components/log-viewer';
import { PeerLogViewer } from './components/peer-log-viewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function LogsPage() {
  return (
    <div className='container mx-auto space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Logs</h1>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
        {/* Controls Sidebar */}
        <div className='lg:col-span-1'>
          <LogControls />
        </div>

        {/* Main Content */}
        <div className='lg:col-span-3'>
          <Tabs defaultValue='system-logs' className='space-y-4'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='system-logs'>System Logs</TabsTrigger>
              <TabsTrigger value='peer-logs'>Peer Logs</TabsTrigger>
            </TabsList>

            <TabsContent value='system-logs' className='space-y-4'>
              <LogViewer height={600} showControls={false} autoRefresh={true} />
            </TabsContent>

            <TabsContent value='peer-logs' className='space-y-4'>
              <PeerLogViewer height={600} showControls={false} autoRefresh={true} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
