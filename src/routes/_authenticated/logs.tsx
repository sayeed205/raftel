import { createFileRoute } from '@tanstack/react-router';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LogControls,
  LogViewer,
  PeerLogViewer,
  SystemInfoPanel,
} from '@/features/logs';

export const Route = createFileRoute('/_authenticated/logs')({
  component: LogsPage,
});

function LogsPage() {
  return (
    <div className='container mx-auto space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Logs & System Information</h1>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
        {/* Controls Sidebar */}
        <div className='lg:col-span-1'>
          <LogControls />
        </div>

        {/* Main Content */}
        <div className='lg:col-span-3'>
          <Tabs defaultValue='system-info' className='space-y-4'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='system-info'>System Info</TabsTrigger>
              <TabsTrigger value='system-logs'>System Logs</TabsTrigger>
              <TabsTrigger value='peer-logs'>Peer Logs</TabsTrigger>
            </TabsList>

            <TabsContent value='system-info' className='space-y-4'>
              <SystemInfoPanel autoRefresh={true} />
            </TabsContent>

            <TabsContent value='system-logs' className='space-y-4'>
              <LogViewer height={600} showControls={false} autoRefresh={true} />
            </TabsContent>

            <TabsContent value='peer-logs' className='space-y-4'>
              <PeerLogViewer
                height={600}
                showControls={false}
                autoRefresh={true}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
