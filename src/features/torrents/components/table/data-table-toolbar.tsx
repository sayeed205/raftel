'use client';

import type { Table } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getStateText } from '@/lib/utils';
import { useTorrentStore } from '@/stores/torrent-store';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { AddTorrentModal } from '../add-torrent-modal';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  data: TData[];
}

export function DataTableToolbar<TData>({
  table,
  data,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { categories, tags, fetchTorrents } = useTorrentStore();
  const statuses = data.reduce((acc, torrent) => {
    const state = (torrent as any).state;
    if (!acc.includes(state)) {
      acc.push(state);
    }
    return acc;
  }, [] as string[]);

  const formattedStatuses = statuses.map((status) => ({
    id: status,
    label: getStateText(status as any),
  }));

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 items-center space-x-2'>
        <Input
          placeholder='Filter torrents...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        {table.getColumn('state') && (
          <DataTableFacetedFilter
            column={table.getColumn('state')}
            title='Status'
            filters={formattedStatuses}
          />
        )}
        {categories.length > 0 && (
          <DataTableFacetedFilter
            column={table.getColumn('category')}
            title='Category'
            filters={categories.map((cat) => ({ id: cat, label: cat }))}
          />
        )}
        {tags.length > 0 && (
          <DataTableFacetedFilter
            column={table.getColumn('tags')}
            title='Tags'
            filters={tags.map((tag) => ({ id: tag, label: tag }))}
          />
        )}
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <div className='flex gap-2'>
        <Button onClick={() => setAddModalOpen(true)} className='h-8'>
          <Plus className='mx-auto mb-1 h-6 w-6' />
          <span>Add Torrent</span>
        </Button>
        <DataTableViewOptions table={table} />
      </div>
      <AddTorrentModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAdded={() => {
          setAddModalOpen(false);
          fetchTorrents();
        }}
      />
    </div>
  );
}
