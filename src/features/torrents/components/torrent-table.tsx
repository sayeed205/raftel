import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Columns,
  Eye,
  EyeOff,
  GripVertical,
  MoreVertical,
  Pause,
  Play,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { TorrentInfo } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  cn,
  formatBytes,
  formatProgress,
  formatRatio,
  formatSpeed,
  formatTime,
  getStateColor,
  getStateText,
} from '@/lib/utils';

export interface TableColumn {
  id: string;
  label: string;
  width: number;
  visible: boolean;
  sortable: boolean;
  render: (torrent: TorrentInfo) => React.ReactNode;
}

interface EnhancedTorrentTableProps {
  torrents: Array<TorrentInfo>;
  selectedTorrents: Array<string>;
  onTorrentSelect: (hash: string) => void;
  onSelectAll: () => void;
  onTorrentAction: (action: string, hash?: string) => void;
  isLoading?: boolean;
  sortBy?: string;
  sortReverse?: boolean;
  onSort?: (column: string, reverse: boolean) => void;
}

const DEFAULT_COLUMNS: Array<TableColumn> = [
  {
    id: 'select',
    label: '',
    width: 50,
    visible: true,
    sortable: false,
    render: () => null, // Special handling
  },
  {
    id: 'name',
    label: 'Name',
    width: 300,
    visible: true,
    sortable: true,
    render: (torrent) => (
      <div>
        <div className='text-sm leading-tight font-medium'>{torrent.name}</div>
        {torrent.category && (
          <Badge variant='outline' className='mt-1 text-xs'>
            {torrent.category}
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: 'size',
    label: 'Size',
    width: 100,
    visible: true,
    sortable: true,
    render: (torrent) => (
      <span className='text-xs tabular-nums'>{formatBytes(torrent.size)}</span>
    ),
  },
  {
    id: 'progress',
    label: 'Progress',
    width: 120,
    visible: true,
    sortable: true,
    render: (torrent) => (
      <div>
        <Progress value={torrent.progress * 100} className='h-1.5' />
        <div className='text-muted-foreground mt-0.5 text-xs'>
          {formatProgress(torrent.progress)}
        </div>
      </div>
    ),
  },
  {
    id: 'status',
    label: 'Status',
    width: 100,
    visible: true,
    sortable: true,
    render: (torrent) => (
      <Badge className={`text-xs ${getStateColor(torrent.state)} text-white`}>
        {getStateText(torrent.state)}
      </Badge>
    ),
  },
  {
    id: 'seeds',
    label: 'Seeds',
    width: 80,
    visible: true,
    sortable: true,
    render: (torrent) => (
      <span className='text-center text-xs'>{torrent.num_seeds}</span>
    ),
  },
  {
    id: 'peers',
    label: 'Peers',
    width: 80,
    visible: true,
    sortable: true,
    render: (torrent) => (
      <span className='text-center text-xs'>{torrent.num_leechs}</span>
    ),
  },
  {
    id: 'dlspeed',
    label: 'Down',
    width: 100,
    visible: true,
    sortable: true,
    render: (torrent) => (
      <span className='text-xs tabular-nums'>
        {formatSpeed(torrent.dlspeed)}
      </span>
    ),
  },
  {
    id: 'upspeed',
    label: 'Up',
    width: 100,
    visible: true,
    sortable: true,
    render: (torrent) => (
      <span className='text-xs tabular-nums'>
        {formatSpeed(torrent.upspeed)}
      </span>
    ),
  },
  {
    id: 'eta',
    label: 'ETA',
    width: 100,
    visible: true,
    sortable: true,
    render: (torrent) => (
      <span className='text-xs tabular-nums'>{formatTime(torrent.eta)}</span>
    ),
  },
  {
    id: 'ratio',
    label: 'Ratio',
    width: 80,
    visible: true,
    sortable: true,
    render: (torrent) => (
      <span className='text-xs tabular-nums'>{formatRatio(torrent.ratio)}</span>
    ),
  },
  {
    id: 'priority',
    label: 'Priority',
    width: 80,
    visible: false,
    sortable: true,
    render: (torrent) => <span className='text-xs'>{torrent.priority}</span>,
  },
  {
    id: 'added_on',
    label: 'Added',
    width: 120,
    visible: false,
    sortable: true,
    render: (torrent) => (
      <span className='text-xs'>
        {torrent.added_on
          ? new Date(torrent.added_on * 1000).toLocaleDateString()
          : '-'}
      </span>
    ),
  },
  {
    id: 'completed_on',
    label: 'Completed',
    width: 120,
    visible: false,
    sortable: true,
    render: (torrent) => (
      <span className='text-xs'>
        {torrent.completed
          ? new Date(torrent.completed * 1000).toLocaleDateString()
          : '-'}
      </span>
    ),
  },
  {
    id: 'actions',
    label: '',
    width: 50,
    visible: true,
    sortable: false,
    render: () => null, // Special handling
  },
];

export function EnhancedTorrentTable({
  torrents,
  selectedTorrents,
  onTorrentSelect,
  onSelectAll,
  onTorrentAction,
  isLoading = false,
  sortBy = 'name',
  sortReverse = false,
  onSort,
}: EnhancedTorrentTableProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [columns, setColumns] = useState<Array<TableColumn>>(DEFAULT_COLUMNS);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // Mobile-specific columns (show only essential info)
  const mobileColumns = useMemo(() => {
    return columns.filter((col) =>
      ['select', 'name', 'progress', 'status', 'actions'].includes(col.id),
    );
  }, [columns]);

  // Memoized sorted torrents
  const sortedTorrents = useMemo(() => {
    if (!onSort) return torrents;

    return [...torrents].sort((a, b) => {
      let aValue: any = a[sortBy as keyof TorrentInfo];
      let bValue: any = b[sortBy as keyof TorrentInfo];

      // Handle special cases
      if (sortBy === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortBy === 'status') {
        aValue = a.state;
        bValue = b.state;
      }

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortReverse ? -1 : 1;
      if (bValue == null) return sortReverse ? 1 : -1;

      // Compare values
      let result = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        result = aValue.localeCompare(bValue);
      } else {
        result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }

      return sortReverse ? -result : result;
    });
  }, [torrents, sortBy, sortReverse, onSort]);

  // Visible columns - use mobile columns on mobile devices
  const visibleColumns = useMemo(() => {
    const columnsToUse = isMobile ? mobileColumns : columns;
    return columnsToUse.filter((col) => col.visible);
  }, [columns, mobileColumns, isMobile]);

  // Handle column visibility toggle
  const toggleColumnVisibility = useCallback((columnId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col,
      ),
    );
  }, []);

  // Handle sorting
  const handleSort = useCallback(
    (columnId: string) => {
      if (!onSort) return;

      const column = columns.find((col) => col.id === columnId);
      if (!column?.sortable) return;

      const newReverse = sortBy === columnId ? !sortReverse : false;
      onSort(columnId, newReverse);
    },
    [columns, sortBy, sortReverse, onSort],
  );

  if (isLoading && torrents.length === 0) {
    return (
      <div className='flex h-64 items-center justify-center rounded-md border'>
        <RefreshCw className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Column Settings */}
      <div className='flex items-center justify-between'>
        <div className='text-muted-foreground text-sm'>
          Showing {sortedTorrents.length} torrents
        </div>
        <DropdownMenu
          open={showColumnSettings}
          onOpenChange={setShowColumnSettings}
        >
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm'>
              <Columns className='mr-2 h-4 w-4' />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <div className='p-2'>
              <div className='mb-2 text-sm font-medium'>Column Visibility</div>
              {columns
                .filter((col) => col.id !== 'select' && col.id !== 'actions')
                .map((column) => (
                  <div
                    key={column.id}
                    className='flex items-center space-x-2 py-1'
                  >
                    <Checkbox
                      checked={column.visible}
                      onCheckedChange={() => toggleColumnVisibility(column.id)}
                    />
                    <span className='text-sm'>{column.label}</span>
                    {column.visible ? (
                      <Eye className='ml-auto h-3 w-3' />
                    ) : (
                      <EyeOff className='ml-auto h-3 w-3' />
                    )}
                  </div>
                ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-md border'>
        <div className='max-h-[600px] overflow-y-auto'>
          <Table>
            <TableHeader className='bg-background sticky top-0 z-10'>
              <TableRow className='bg-muted/30'>
                {visibleColumns.map((column) => (
                  <TableHead
                    key={column.id}
                    style={{ width: column.width }}
                    className='px-2'
                  >
                    <div className='flex items-center space-x-1'>
                      {column.id === 'select' ? (
                        <Checkbox
                          checked={
                            selectedTorrents.length === sortedTorrents.length &&
                            sortedTorrents.length > 0
                          }
                          onCheckedChange={onSelectAll}
                        />
                      ) : (
                        <>
                          {column.id !== 'actions' && (
                            <GripVertical className='text-muted-foreground h-3 w-3' />
                          )}
                          <span
                            className={`${
                              column.sortable
                                ? 'hover:text-foreground cursor-pointer'
                                : ''
                            }`}
                            onClick={() => handleSort(column.id)}
                          >
                            {column.label}
                          </span>
                          {column.sortable && sortBy === column.id && (
                            <div className='ml-1'>
                              {sortReverse ? (
                                <ChevronUp className='h-3 w-3' />
                              ) : (
                                <ChevronDown className='h-3 w-3' />
                              )}
                            </div>
                          )}
                          {column.sortable && sortBy !== column.id && (
                            <ArrowUpDown className='h-3 w-3 opacity-50' />
                          )}
                        </>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTorrents.map((torrent, index) => {
                // Mobile row component with gesture support
                const MobileRow = () => {
                  return (
                    <TableRow
                      key={torrent.hash}
                      className={cn(
                        'group relative cursor-pointer border-b transition-colors',
                        index % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                        'hover:bg-muted/50 active:bg-muted/70',
                        selectedTorrents.includes(torrent.hash) &&
                          'bg-primary/10',
                        isMobile && 'touch-manipulation',
                      )}
                      onClick={() =>
                        navigate({ to: `/torrents/${torrent.hash}` })
                      }
                    >
                      {visibleColumns.map((column) => (
                        <TableCell
                          key={column.id}
                          style={{
                            width: isMobile ? 'auto' : column.width,
                          }}
                          className={cn(
                            'py-3',
                            isMobile ? 'px-1 first:pl-2 last:pr-2' : 'px-2',
                          )}
                        >
                          {column.id === 'select' ? (
                            <Checkbox
                              checked={selectedTorrents.includes(torrent.hash)}
                              onCheckedChange={() =>
                                onTorrentSelect(torrent.hash)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className={cn(isMobile && 'scale-110')}
                            />
                          ) : column.id === 'actions' ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className={cn(
                                    'h-7 w-7',
                                    isMobile && 'h-8 w-8 touch-manipulation',
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align='end'
                                className={cn(isMobile && 'w-48')}
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    onTorrentAction('resume', torrent.hash)
                                  }
                                  className={cn(isMobile && 'py-3')}
                                >
                                  <Play className='mr-2 h-4 w-4' />
                                  Resume
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    onTorrentAction('pause', torrent.hash)
                                  }
                                  className={cn(isMobile && 'py-3')}
                                >
                                  <Pause className='mr-2 h-4 w-4' />
                                  Pause
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    onTorrentAction('recheck', torrent.hash)
                                  }
                                  className={cn(isMobile && 'py-3')}
                                >
                                  <RefreshCw className='mr-2 h-4 w-4' />
                                  Recheck
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    onTorrentAction('reannounce', torrent.hash)
                                  }
                                  className={cn(isMobile && 'py-3')}
                                >
                                  Reannounce
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className={cn(
                                    'text-destructive',
                                    isMobile && 'py-3',
                                  )}
                                  onClick={() =>
                                    onTorrentAction('delete', torrent.hash)
                                  }
                                >
                                  <Trash2 className='mr-2 h-4 w-4' />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : column.id === 'name' && isMobile ? (
                            // Enhanced mobile name cell with additional info
                            <div className='min-w-0 flex-1'>
                              <div className='truncate text-sm leading-tight font-medium'>
                                {torrent.name}
                              </div>
                              <div className='text-muted-foreground mt-1 flex items-center gap-2 text-xs'>
                                <span>{formatBytes(torrent.size)}</span>
                                {torrent.dlspeed > 0 && (
                                  <span className='text-blue-600'>
                                    ↓ {formatSpeed(torrent.dlspeed)}
                                  </span>
                                )}
                                {torrent.upspeed > 0 && (
                                  <span className='text-green-600'>
                                    ↑ {formatSpeed(torrent.upspeed)}
                                  </span>
                                )}
                              </div>
                              {torrent.category && (
                                <Badge
                                  variant='outline'
                                  className='mt-1 text-xs'
                                >
                                  {torrent.category}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            column.render(torrent)
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                };

                return <MobileRow key={torrent.hash} />;
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
