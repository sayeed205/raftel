import {
  AlertTriangle,
  Download,
  Filter,
  Info,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useCallback, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  useLogActions,
  useLogs,
  useLogSettings,
  usePeerLogs,
} from '@/stores/log-store';
import type { LogType } from '@/types/qbit/constants';
import { LogType as LogTypeEnum } from '@/types/qbit/constants';

interface LogControlsProps {
  showPeerControls?: boolean;
}

const LOG_LEVELS = [
  {
    value: LogTypeEnum.NORMAL,
    label: 'Normal',
    icon: <Info className='h-4 w-4' />,
  },
  {
    value: LogTypeEnum.INFO,
    label: 'Info',
    icon: <Info className='h-4 w-4' />,
  },
  {
    value: LogTypeEnum.WARNING,
    label: 'Warning',
    icon: <AlertTriangle className='h-4 w-4' />,
  },
  {
    value: LogTypeEnum.CRITICAL,
    label: 'Critical',
    icon: <XCircle className='h-4 w-4' />,
  },
  {
    value: LogTypeEnum.ALL,
    label: 'All Levels',
    icon: <Filter className='h-4 w-4' />,
  },
];

const REFRESH_INTERVALS = [
  { value: 1000, label: '1 second' },
  { value: 2000, label: '2 seconds' },
  { value: 5000, label: '5 seconds' },
  { value: 10000, label: '10 seconds' },
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '1 minute' },
];

const MEMORY_LIMITS = [
  { value: 100, label: '100 logs' },
  { value: 500, label: '500 logs' },
  { value: 1000, label: '1,000 logs' },
  { value: 2000, label: '2,000 logs' },
  { value: 5000, label: '5,000 logs' },
  { value: 10000, label: '10,000 logs' },
];

export function LogControls({ showPeerControls = true }: LogControlsProps) {
  const {
    logLevel,
    autoRefresh,
    refreshInterval,
    maxLogsInMemory,
    setLogLevel,
    setAutoRefresh,
    setRefreshInterval,
    setMaxLogsInMemory,
  } = useLogSettings();

  const {
    fetchLogs,
    fetchPeerLogs,
    clearLogs,
    clearPeerLogs,
    exportLogs,
    exportPeerLogs,
  } = useLogActions();

  const { logs } = useLogs();
  const { peerLogs } = usePeerLogs();

  const [customRefreshInterval, setCustomRefreshInterval] =
    useState(refreshInterval);
  const [customMemoryLimit, setCustomMemoryLimit] = useState(maxLogsInMemory);

  const handleRefreshIntervalChange = useCallback(
    (value: number) => {
      setRefreshInterval(value);
      setCustomRefreshInterval(value);
    },
    [setRefreshInterval],
  );

  const handleMemoryLimitChange = useCallback(
    (value: number) => {
      setMaxLogsInMemory(value);
      setCustomMemoryLimit(value);
    },
    [setMaxLogsInMemory],
  );

  const handleExportLogs = useCallback(
    (format: 'json' | 'csv' | 'txt') => {
      const content = exportLogs(format);
      const blob = new Blob([content], {
        type: format === 'json' ? 'application/json' : 'text/plain',
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `system-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [exportLogs],
  );

  const handleExportPeerLogs = useCallback(
    (format: 'json' | 'csv' | 'txt') => {
      const content = exportPeerLogs(format);
      const blob = new Blob([content], {
        type: format === 'json' ? 'application/json' : 'text/plain',
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `peer-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [exportPeerLogs],
  );

  const currentLogLevel =
    LOG_LEVELS.find((level) => level.value === logLevel) || LOG_LEVELS[4];
  const currentRefreshInterval = REFRESH_INTERVALS.find(
    (interval) => interval.value === refreshInterval,
  );
  const currentMemoryLimit = MEMORY_LIMITS.find(
    (limit) => limit.value === maxLogsInMemory,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Settings className='h-5 w-5' />
          Log Controls
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Auto-refresh Controls */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='auto-refresh' className='text-sm font-medium'>
              Auto-refresh
            </Label>
            <div className='flex items-center gap-2'>
              {autoRefresh ? (
                <Play className='h-4 w-4 text-green-500' />
              ) : (
                <Pause className='text-muted-foreground h-4 w-4' />
              )}
              <Switch
                id='auto-refresh'
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <Label className='text-muted-foreground text-sm'>
              Refresh Interval
            </Label>
            <Select
              value={refreshInterval.toString()}
              onValueChange={(value) =>
                handleRefreshIntervalChange(parseInt(value))
              }
              disabled={!autoRefresh}
            >
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_INTERVALS.map((interval) => (
                  <SelectItem
                    key={interval.value}
                    value={interval.value.toString()}
                  >
                    {interval.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!currentRefreshInterval && (
            <div className='flex items-center gap-2'>
              <Label className='text-muted-foreground text-sm'>Custom:</Label>
              <Input
                type='number'
                value={customRefreshInterval}
                onChange={(e) =>
                  setCustomRefreshInterval(parseInt(e.target.value) || 1000)
                }
                onBlur={() =>
                  handleRefreshIntervalChange(customRefreshInterval)
                }
                className='w-20'
                min='1000'
                step='1000'
              />
              <span className='text-muted-foreground text-sm'>ms</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Log Level Filter */}
        <div className='space-y-3'>
          <Label className='text-sm font-medium'>Log Level Filter</Label>
          <Select
            value={logLevel.toString()}
            onValueChange={(value) => setLogLevel(parseInt(value) as LogType)}
          >
            <SelectTrigger>
              <SelectValue>
                <div className='flex items-center gap-2'>
                  {currentLogLevel.icon}
                  {currentLogLevel.label}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LOG_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value.toString()}>
                  <div className='flex items-center gap-2'>
                    {level.icon}
                    {level.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Memory Management */}
        <div className='space-y-3'>
          <Label className='text-sm font-medium'>Memory Management</Label>

          <div className='flex items-center justify-between'>
            <Label className='text-muted-foreground text-sm'>
              Max logs in memory
            </Label>
            <Select
              value={maxLogsInMemory.toString()}
              onValueChange={(value) =>
                handleMemoryLimitChange(parseInt(value))
              }
            >
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEMORY_LIMITS.map((limit) => (
                  <SelectItem key={limit.value} value={limit.value.toString()}>
                    {limit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!currentMemoryLimit && (
            <div className='flex items-center gap-2'>
              <Label className='text-muted-foreground text-sm'>Custom:</Label>
              <Input
                type='number'
                value={customMemoryLimit}
                onChange={(e) =>
                  setCustomMemoryLimit(parseInt(e.target.value) || 1000)
                }
                onBlur={() => handleMemoryLimitChange(customMemoryLimit)}
                className='w-20'
                min='100'
                step='100'
              />
              <span className='text-muted-foreground text-sm'>logs</span>
            </div>
          )}

          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>Current usage:</span>
            <div className='flex items-center gap-4'>
              <Badge variant='secondary'>System: {logs.length}</Badge>
              {showPeerControls && (
                <Badge variant='secondary'>Peer: {peerLogs.length}</Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Manual Actions */}
        <div className='space-y-3'>
          <Label className='text-sm font-medium'>Manual Actions</Label>

          <div className='flex flex-wrap gap-2'>
            <Button variant='outline' size='sm' onClick={() => fetchLogs()}>
              <RotateCcw className='mr-2 h-4 w-4' />
              Refresh Logs
            </Button>

            {showPeerControls && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => fetchPeerLogs()}
              >
                <RotateCcw className='mr-2 h-4 w-4' />
                Refresh Peers
              </Button>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button variant='outline' size='sm'>
                  <Download className='mr-2 h-4 w-4' />
                  Export Logs
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-48'>
                <div className='space-y-2'>
                  <div className='mb-2 text-sm font-medium'>System Logs</div>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start'
                    onClick={() => handleExportLogs('json')}
                  >
                    Export as JSON
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start'
                    onClick={() => handleExportLogs('csv')}
                  >
                    Export as CSV
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start'
                    onClick={() => handleExportLogs('txt')}
                  >
                    Export as Text
                  </Button>

                  {showPeerControls && (
                    <>
                      <Separator className='my-2' />
                      <div className='mb-2 text-sm font-medium'>Peer Logs</div>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full justify-start'
                        onClick={() => handleExportPeerLogs('json')}
                      >
                        Export as JSON
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full justify-start'
                        onClick={() => handleExportPeerLogs('csv')}
                      >
                        Export as CSV
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full justify-start'
                        onClick={() => handleExportPeerLogs('txt')}
                      >
                        Export as Text
                      </Button>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Separator />

        {/* Clear Actions */}
        <div className='space-y-3'>
          <Label className='text-destructive text-sm font-medium'>
            Danger Zone
          </Label>

          <div className='flex flex-wrap gap-2'>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='text-destructive hover:text-destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Clear System Logs
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear System Logs</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all system logs from memory.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearLogs}
                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  >
                    Clear Logs
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {showPeerControls && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-destructive hover:text-destructive'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Clear Peer Logs
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Peer Logs</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all peer logs from memory.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={clearPeerLogs}
                      className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                      Clear Peer Logs
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
