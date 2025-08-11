import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  AlertCircle,
  AlertTriangle,
  Download,
  Filter,
  Info,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { FixedSizeList as List } from 'react-window';

import type { Log } from '@/types/logs';
import type { LogType } from '@/types/qbit/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useLogActions, useLogFilter, useLogs } from '@/stores/log-store';
import { LogType as LogTypeEnum } from '@/types/qbit/constants';

interface LogViewerProps {
  height?: number;
  showControls?: boolean;
  autoRefresh?: boolean;
}

interface LogItemProps {
  index: number;
  style: React.CSSProperties;
  data: Array<Log>;
}

const LOG_TYPE_ICONS: Record<LogType, React.ReactNode> = {
  [LogTypeEnum.NORMAL]: <Info className='h-4 w-4 text-blue-500' />,
  [LogTypeEnum.INFO]: <Info className='h-4 w-4 text-blue-500' />,
  [LogTypeEnum.WARNING]: <AlertTriangle className='h-4 w-4 text-yellow-500' />,
  [LogTypeEnum.CRITICAL]: <XCircle className='h-4 w-4 text-red-500' />,
  [LogTypeEnum.ALL]: <Filter className='h-4 w-4 text-gray-500' />,
};

const LOG_TYPE_LABELS: Record<LogType, string> = {
  [LogTypeEnum.NORMAL]: 'Normal',
  [LogTypeEnum.INFO]: 'Info',
  [LogTypeEnum.WARNING]: 'Warning',
  [LogTypeEnum.CRITICAL]: 'Critical',
  [LogTypeEnum.ALL]: 'All',
};

const LOG_TYPE_COLORS: Record<LogType, string> = {
  [LogTypeEnum.NORMAL]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [LogTypeEnum.INFO]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [LogTypeEnum.WARNING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [LogTypeEnum.CRITICAL]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  [LogTypeEnum.ALL]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

function LogItem({ index, style, data }: LogItemProps) {
  const log = data[index];
  const timestamp = new Date(log.timestamp * 1000);

  return (
    <div style={style} className='border-border/50 hover:bg-muted/50 border-b px-4 py-2'>
      <div className='flex items-start gap-3'>
        <div className='mt-0.5 flex-shrink-0'>
          {LOG_TYPE_ICONS[log.type] || LOG_TYPE_ICONS[LogTypeEnum.NORMAL]}
        </div>

        <div className='min-w-0 flex-1'>
          <div className='mb-1 flex items-center gap-2'>
            <Badge
              variant='secondary'
              className={`text-xs ${LOG_TYPE_COLORS[log.type] || LOG_TYPE_COLORS[LogTypeEnum.NORMAL]}`}
            >
              {LOG_TYPE_LABELS[log.type] || 'Unknown'}
            </Badge>

            <span className='text-muted-foreground text-xs'>{timestamp.toLocaleString()}</span>

            <span className='text-muted-foreground text-xs'>ID: {log.id}</span>
          </div>

          <div className='text-sm break-words'>{log.message}</div>
        </div>
      </div>
    </div>
  );
}

export function LogViewer({
  height = 600,
  showControls = true,
  autoRefresh = false,
}: LogViewerProps) {
  const { logs, isLoading, error, getFilteredLogs } = useLogs();
  const { clearFilter } = useLogFilter();
  const { fetchLogs, clearLogs, exportLogs } = useLogActions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<Array<LogType>>([]);
  const [highlightText, setHighlightText] = useState('');

  // Apply local filtering on top of store filtering
  const filteredLogs = useMemo(() => {
    let result = getFilteredLogs();

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((log) => log.message.toLowerCase().includes(query));
    }

    // Apply level filtering
    if (selectedLevels.length > 0) {
      result = result.filter((log) => selectedLevels.includes(log.type));
    }

    // Sort by timestamp (newest first)
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [getFilteredLogs, searchQuery, selectedLevels]);

  const handleRefresh = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleClearLogs = useCallback(() => {
    clearLogs();
  }, [clearLogs]);

  const handleExport = useCallback(
    (format: 'json' | 'csv' | 'txt') => {
      const content = exportLogs(format);
      const blob = new Blob([content], {
        type: format === 'json' ? 'application/json' : 'text/plain',
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [exportLogs],
  );

  const toggleLevel = useCallback((level: LogType) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedLevels([]);
    setHighlightText('');
    clearFilter();
  }, [clearFilter]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLogs();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchLogs]);

  // Initial load
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const logLevels = [
    {
      value: LogTypeEnum.NORMAL,
      label: 'Normal',
      count: logs.filter((l) => l.type === LogTypeEnum.NORMAL).length,
    },
    {
      value: LogTypeEnum.INFO,
      label: 'Info',
      count: logs.filter((l) => l.type === LogTypeEnum.INFO).length,
    },
    {
      value: LogTypeEnum.WARNING,
      label: 'Warning',
      count: logs.filter((l) => l.type === LogTypeEnum.WARNING).length,
    },
    {
      value: LogTypeEnum.CRITICAL,
      label: 'Critical',
      count: logs.filter((l) => l.type === LogTypeEnum.CRITICAL).length,
    },
  ];

  return (
    <Card className='w-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5' />
            System Logs
            <Badge variant='secondary' className='ml-2'>
              {filteredLogs.length} / {logs.length}
            </Badge>
          </CardTitle>

          {showControls && (
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <Download className='mr-2 h-4 w-4' />
                    Export
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-48'>
                  <div className='space-y-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start'
                      onClick={() => handleExport('json')}
                    >
                      Export as JSON
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start'
                      onClick={() => handleExport('csv')}
                    >
                      Export as CSV
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start'
                      onClick={() => handleExport('txt')}
                    >
                      Export as Text
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant='outline'
                size='sm'
                onClick={handleClearLogs}
                className='text-destructive hover:text-destructive'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Clear
              </Button>
            </div>
          )}
        </div>

        {showControls && (
          <>
            <Separator className='my-3' />

            <div className='space-y-3'>
              {/* Search and Highlight */}
              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
                  <Input
                    placeholder='Search logs...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10'
                  />
                </div>

                <Input
                  placeholder='Highlight text...'
                  value={highlightText}
                  onChange={(e) => setHighlightText(e.target.value)}
                  className='w-48'
                />
              </div>

              {/* Level Filters */}
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <Filter className='text-muted-foreground h-4 w-4' />
                  <span className='text-sm font-medium'>Levels:</span>
                </div>

                <div className='flex items-center gap-4'>
                  {logLevels.map((level) => (
                    <div key={level.value} className='flex items-center space-x-2'>
                      <Checkbox
                        id={`level-${level.value}`}
                        checked={selectedLevels.includes(level.value)}
                        onCheckedChange={() => toggleLevel(level.value)}
                      />
                      <Label htmlFor={`level-${level.value}`} className='cursor-pointer text-sm'>
                        {level.label} ({level.count})
                      </Label>
                    </div>
                  ))}
                </div>

                <Button variant='ghost' size='sm' onClick={clearAllFilters} className='ml-auto'>
                  Clear Filters
                </Button>
              </div>
            </div>
          </>
        )}
      </CardHeader>

      <CardContent className='p-0'>
        {error && (
          <div className='bg-destructive/10 border-destructive/20 border-b p-4'>
            <div className='text-destructive flex items-center gap-2'>
              <XCircle className='h-4 w-4' />
              <span className='text-sm'>{error}</span>
            </div>
          </div>
        )}

        {isLoading && logs.length === 0 ? (
          <div className='flex h-32 items-center justify-center'>
            <div className='text-muted-foreground flex items-center gap-2'>
              <RefreshCw className='h-4 w-4 animate-spin' />
              <span>Loading logs...</span>
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className='flex h-32 items-center justify-center'>
            <div className='text-muted-foreground text-center'>
              <AlertCircle className='mx-auto mb-2 h-8 w-8' />
              <p>No logs found</p>
              {(searchQuery || selectedLevels.length > 0) && (
                <p className='mt-1 text-sm'>Try adjusting your filters</p>
              )}
            </div>
          </div>
        ) : (
          <div className='border-t'>
            <List
              height={height}
              width='100%'
              itemCount={filteredLogs.length}
              itemSize={80}
              itemData={filteredLogs}
              overscanCount={5}
            >
              {LogItem}
            </List>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
