// Simple test file to verify logs components work
import {
  LogControls,
  LogViewer,
  PeerLogViewer,
  SystemInfoPanel,
} from './index';

export function TestLogsComponents() {
  return (
    <div className='space-y-4 p-4'>
      <h2>Logs Components Test</h2>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
        <div className='lg:col-span-1'>
          <LogControls />
        </div>

        <div className='space-y-4 lg:col-span-3'>
          <SystemInfoPanel />
          <LogViewer height={400} />
          <PeerLogViewer height={400} />
        </div>
      </div>
    </div>
  );
}
