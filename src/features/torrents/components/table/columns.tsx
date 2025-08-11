import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import type { ColumnDef } from '@tanstack/react-table';

import type { TorrentInfo } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import {
  formatBytes,
  formatEta,
  formatProgress,
  formatRatio,
  getStateColor,
  getStateText,
} from '@/lib/utils';


export const columns: Array<ColumnDef<TorrentInfo>> = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='m-2 translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: any) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='m-2 translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
    cell: ({ row }) => {
      const category = row.original.category;
      return (
        <div className='flex space-x-2'>
          {category && <Badge variant='outline'>{category}</Badge>}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='max-w-96 truncate font-medium'>{row.getValue('name')}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.getValue('name')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
  {
    accessorKey: 'size',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Size' />,
    cell: ({ row }) => {
      const field = row.original.size;
      return <div>{formatBytes(field)}</div>;
    },
  },
  {
    accessorKey: 'progress',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Progress' />,
    cell: ({ row }) => {
      const progress = row.original.progress;
      return (
        <div>
          <Progress value={progress * 100} className='h-1.5' />
          <div className='text-muted-foreground mt-0.5 text-xs'>{formatProgress(progress)}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'state',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => {
      const status = row.original.state;

      return (
        <Badge className={`text-xs ${getStateColor(status)} text-white`}>
          {getStateText(status)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'num_seeds',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Seeds' />,
    cell: ({ row }) => {
      const og = row.original;
      return (
        <span className='text-center text-xs'>
          {og.num_seeds}/{og.num_complete}
        </span>
      );
    },
  },
  {
    accessorKey: 'num_leechs',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Peers' />,
    cell: ({ row }) => {
      const og = row.original;
      return (
        <span className='text-center text-xs'>
          {og.num_leechs}/{og.num_incomplete}
        </span>
      );
    },
  },
  {
    accessorKey: 'dlspeed',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Download Speed' />,
    cell: ({ row }) => {
      const field = row.original.dlspeed;
      return <div>{formatBytes(field)}</div>;
    },
  },
  {
    accessorKey: 'upspeed',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Upload Speed' />,
    cell: ({ row }) => {
      const field = row.original.upspeed;
      return <div>{formatBytes(field)}</div>;
    },
  },
  {
    accessorKey: 'eta',
    header: ({ column }) => <DataTableColumnHeader column={column} title='ETA' />,
    cell: ({ row }) => {
      const eta = row.original.eta;
      return <span className='text-xs tabular-nums'>{formatEta(eta)}</span>;
    },
  },
  {
    accessorKey: 'ratio',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Ratio' />,
    cell: ({ row }) => {
      const ratio = row.original.ratio;
      return <span className='text-xs tabular-nums'>{formatRatio(ratio)}</span>;
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Priority' />,
    cell: ({ row }) => {
      return <span className='text-xs'>{row.getValue('priority')}</span>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'added_on',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Added' />,
    cell: ({ row }) => {
      const addedOn = row.original.added_on;
      return (
        <span className='text-xs'>
          {addedOn ? new Date(addedOn * 1000).toLocaleDateString() : '-'}
        </span>
      );
    },
  },
  {
    accessorKey: 'completion_on',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Completed' />,
    cell: ({ row }) => {
      const completionOn = row.original.completion_on;
      return (
        <span className='text-xs'>
          {completionOn ? new Date(completionOn * 1000).toLocaleDateString() : '-'}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
