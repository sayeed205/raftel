'use client';

import * as React from 'react';

import { useNavigate } from '@tanstack/react-router';
import { Copy, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import DeleteDialog from './delete-modal';
import type { Row } from '@tanstack/react-table';

import type { TorrentInfo } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  React.useState<React.ReactNode | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState<boolean>(false);
  const torrent = row.original as unknown as TorrentInfo;

  const navigate = useNavigate();

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='data-[state=open]:bg-muted flex h-8 w-8 p-0'>
            <MoreHorizontal className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[200px]'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(torrent.magnet_uri)}>
            <Copy className='mr-2 h-4 w-4' />
            Copy Magnet
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DialogTrigger
            asChild
            onClick={() =>
              navigate({
                to: '/torrents/$hash',
                params: { hash: torrent.hash },
                search: { tab: '' },
              })
            }
          >
            <DropdownMenuItem>
              {' '}
              <Eye className='mr-2 h-4 w-4' />
              View Details
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)} className='text-red-600'>
            <Trash2 className='mr-2 h-4 w-4' />
            Delete torrent
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteDialog
        torrent={torrent}
        isOpen={showDeleteDialog}
        showActionToggle={setShowDeleteDialog}
      />
    </Dialog>
  );
}
