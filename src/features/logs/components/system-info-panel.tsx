import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  HardDrive,
  Network,
  RefreshCw,
  Server,
  Upload,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSystemInfo } from '@/stores/log-store';
import { formatBytes, formatSpeed } from '@/utils/format';

interface SystemInfoPanelProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface InfoCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function InfoCard({ title, icon, children }: InfoCardProps) {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-sm'>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>{children}</CardContent>
    </Card>
  );
}

interface MetricRowProps {
  label: string;
  value: string | React.ReactNode;
  subValue?: string;
}

function MetricRow({ label, value, subValue }: MetricRowProps) {
  return (
    <div className='flex items-center justify-between py-1'>
      <span className='text-muted-foreground text-sm'>{label}</span>
      <div className='text-right'>
        <div className='text-sm font-medium'>{value}</div>
        {subValue && (
          <div className='text-muted-foreground text-xs'>{subValue}</div>
        )}
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

function getConnectionStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case 'connected':
      return <CheckCircle className='h-4 w-4 text-green-500' />;
    case 'firewalled':
      return <AlertTriangle className='h-4 w-4 text-yellow-500' />;
    case 'disconnected':
      return <XCircle className='h-4 w-4 text-red-500' />;
    default:
      return <WifiOff className='text-muted-foreground h-4 w-4' />;
  }
}

function getConnectionStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'connected':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'firewalled':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'disconnected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

export function SystemInfoPanel({
  autoRefresh = true,
  refreshInterval = 10000,
}: SystemInfoPanelProps) {
  const { systemInfo, isLoading, error, fetchSystemInfo } = useSystemInfo();

  const handleRefresh = useCallback(() => {
    fetchSystemInfo();
  }, [fetchSystemInfo]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchSystemInfo();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchSystemInfo]);

  // Initial load
  useEffect(() => {
    fetchSystemInfo();
  }, [fetchSystemInfo]);

  if (error) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-destructive flex items-center justify-center'>
            <XCircle className='mr-2 h-5 w-5' />
            <span>Failed to load system information: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && !systemInfo) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-muted-foreground flex items-center justify-center'>
            <RefreshCw className='mr-2 h-5 w-5 animate-spin' />
            <span>Loading system information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!systemInfo) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-muted-foreground text-center'>
            <Server className='mx-auto mb-2 h-8 w-8' />
            <p>No system information available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const diskUsagePercent =
    systemInfo.totalSize > 0
      ? ((systemInfo.totalSize - systemInfo.freeSpace) / systemInfo.totalSize) *
        100
      : 0;

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-lg font-semibold'>
          <Activity className='h-5 w-5' />
          System Information
        </h2>

        <Button
          variant='outline'
          size='sm'
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {/* Application Info */}
        <InfoCard title='Application' icon={<Server className='h-4 w-4' />}>
          <div className='space-y-2'>
            <MetricRow label='Version' value={systemInfo.version} />
            <MetricRow label='Uptime' value={formatUptime(systemInfo.uptime)} />
            <MetricRow
              label='Build Info'
              value={
                <Badge variant='secondary' className='text-xs'>
                  {systemInfo.buildInfo.length > 20
                    ? `${systemInfo.buildInfo.substring(0, 20)}...`
                    : systemInfo.buildInfo}
                </Badge>
              }
            />
          </div>
        </InfoCard>

        {/* Storage Info */}
        <InfoCard title='Storage' icon={<HardDrive className='h-4 w-4' />}>
          <div className='space-y-3'>
            <MetricRow
              label='Total Space'
              value={formatBytes(systemInfo.totalSize)}
            />
            <MetricRow
              label='Free Space'
              value={formatBytes(systemInfo.freeSpace)}
            />

            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Usage</span>
                <span className='font-medium'>
                  {diskUsagePercent.toFixed(1)}%
                </span>
              </div>
              <Progress value={diskUsagePercent} className='h-2' />
            </div>
          </div>
        </InfoCard>

        {/* Network Status */}
        <InfoCard title='Network' icon={<Network className='h-4 w-4' />}>
          <div className='space-y-2'>
            <MetricRow
              label='Status'
              value={
                <div className='flex items-center gap-2'>
                  {getConnectionStatusIcon(systemInfo.connectionStatus)}
                  <Badge
                    variant='secondary'
                    className={getConnectionStatusColor(
                      systemInfo.connectionStatus,
                    )}
                  >
                    {systemInfo.connectionStatus.toUpperCase()}
                  </Badge>
                </div>
              }
            />
            <MetricRow
              label='DHT Nodes'
              value={systemInfo.dhtNodes.toLocaleString()}
            />
          </div>
        </InfoCard>

        {/* Download Stats */}
        <InfoCard title='Download' icon={<Download className='h-4 w-4' />}>
          <div className='space-y-2'>
            <MetricRow
              label='Current Speed'
              value={formatSpeed(systemInfo.dlInfoSpeed)}
            />
            <MetricRow
              label='Total Downloaded'
              value={formatBytes(systemInfo.dlInfoData)}
            />
            <MetricRow
              label='Speed Limit'
              value={
                systemInfo.dlRateLimit > 0
                  ? formatSpeed(systemInfo.dlRateLimit)
                  : 'Unlimited'
              }
            />
          </div>
        </InfoCard>

        {/* Upload Stats */}
        <InfoCard title='Upload' icon={<Upload className='h-4 w-4' />}>
          <div className='space-y-2'>
            <MetricRow
              label='Current Speed'
              value={formatSpeed(systemInfo.upInfoSpeed)}
            />
            <MetricRow
              label='Total Uploaded'
              value={formatBytes(systemInfo.upInfoData)}
            />
            <MetricRow
              label='Speed Limit'
              value={
                systemInfo.upRateLimit > 0
                  ? formatSpeed(systemInfo.upRateLimit)
                  : 'Unlimited'
              }
            />
          </div>
        </InfoCard>

        {/* Performance Metrics */}
        <InfoCard title='Performance' icon={<Activity className='h-4 w-4' />}>
          <div className='space-y-2'>
            <MetricRow
              label='Download Ratio'
              value={
                systemInfo.upInfoData > 0
                  ? (systemInfo.dlInfoData / systemInfo.upInfoData).toFixed(2)
                  : '∞'
              }
            />
            <MetricRow
              label='Upload Ratio'
              value={
                systemInfo.dlInfoData > 0
                  ? (systemInfo.upInfoData / systemInfo.dlInfoData).toFixed(2)
                  : '0.00'
              }
            />
            <MetricRow
              label='Last Updated'
              value={
                <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                  <Clock className='h-3 w-3' />
                  {new Date().toLocaleTimeString()}
                </div>
              }
            />
          </div>
        </InfoCard>
      </div>
    </div>
  );
}
