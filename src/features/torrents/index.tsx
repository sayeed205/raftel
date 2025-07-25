import { Plus, RefreshCw, Search as SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Header } from '@/components/layout/header.tsx';
import { Main } from '@/components/layout/main.tsx';
import { ProfileDropdown } from '@/components/profile-dropdown.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BulkActionConfirmationDialog,
  ConfirmationDialog,
  DeleteConfirmationDialog,
} from '@/components/ui/confirmation-dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { AddTorrentModal } from '@/features/torrents/components/add-torrent-modal.tsx';
import { TableExport } from '@/features/torrents/components/table-export.tsx';
import { EnhancedTorrentTable } from '@/features/torrents/components/torrent-table.tsx';
import {
  useBulkActionConfirmation,
  useConfirmationDialog,
  useDeleteConfirmation,
} from '@/hooks/use-confirmation-dialog';
import { useAdaptiveLayout } from '@/hooks/use-responsive';
import qbApi from '@/lib/api';
import { showToast, torrentToast } from '@/lib/utils/toast';
import { useTorrentStore } from '@/stores/torrent-store';

export default function TorrentsPage() {
  const layout = useAdaptiveLayout();

  const {
    torrents,
    selectedTorrents,
    isLoading,
    sortBy,
    sortReverse,
    searchQuery,
    fetchTorrents,
    toggleTorrentSelection,
    selectAllTorrents,
    filter,
    categories,
    tags,
    clearSelection,
    pauseTorrents,
    resumeTorrents,
    deleteTorrents,
    recheckTorrents,
    reannounceTorrents,
    setSorting,
    setSearchQuery,
    getFilteredTorrents,
  } = useTorrentStore();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filteredTorrents, setFilteredTorrents] = useState(torrents);

  // Confirmation dialog hooks
  const { confirmationState, showConfirmation, hideConfirmation } =
    useConfirmationDialog();
  const {
    deleteState,
    showDeleteConfirmation,
    hideDeleteConfirmation,
    setDeleteFiles,
  } = useDeleteConfirmation();
  const { bulkState, showBulkConfirmation, hideBulkConfirmation } =
    useBulkActionConfirmation();

  // Stable callback functions for shortcuts
  // const handleRefresh = useCallback(() => {
  //     fetchTorrents();
  // }, [fetchTorrents]);

  // const handleAddTorrent = useCallback(() => {
  //     setAddModalOpen(true);
  // }, []);

  // Keyboard shortcuts temporarily disabled due to infinite loop issue
  // const shortcuts = {
  //     shortcuts: [],
  //     searchInputRef: { current: null },
  // };

  // Get filtered torrents from store - memoized to prevent infinite loops
  const storeFilteredTorrents = useMemo(() => {
    return getFilteredTorrents();
  }, [getFilteredTorrents, torrents, filter, categories, tags, searchQuery]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let isWindowFocused = true;

    const handleVisibilityChange = () => {
      isWindowFocused = !document.hidden;
      if (isWindowFocused && !interval) {
        startPolling();
      } else if (!isWindowFocused && interval) {
        stopPolling();
      }
    };

    const startPolling = () => {
      if (!interval) {
        fetchTorrents();
        interval = setInterval(() => {
          fetchTorrents();
        }, 4000); // Poll every 4s when focused
      }
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Remove fetchTorrents from dependencies to prevent infinite loop

  // Apply additional filtering based on selected filter
  useEffect(() => {
    const filtered = storeFilteredTorrents.filter((torrent) => {
      switch (selectedFilter) {
        case 'downloading':
          return ['downloading', 'metaDL', 'stalledDL', 'queuedDL'].includes(
            torrent.state,
          );
        case 'seeding':
          return ['uploading', 'stalledUP', 'queuedUP'].includes(torrent.state);
        case 'completed':
          return torrent.progress === 1;
        case 'paused':
          return ['pausedDL', 'pausedUP'].includes(torrent.state);
        case 'active':
          return torrent.dlspeed > 0 || torrent.upspeed > 0;
        case 'inactive':
          return torrent.dlspeed === 0 && torrent.upspeed === 0;
        case 'errored':
          return torrent.state === 'error';
        default:
          return true;
      }
    });
    setFilteredTorrents(filtered);
  }, [storeFilteredTorrents, selectedFilter]);

  const handleSelectAll = () => {
    if (
      selectedTorrents.length === filteredTorrents.length &&
      filteredTorrents.length > 0
    ) {
      clearSelection();
    } else {
      selectAllTorrents();
    }
  };

  const handleTorrentAction = async (action: string, hash?: string) => {
    if (selectedTorrents.length === 0 && !hash) return;
    const torrentsToActOn = hash ? [hash] : selectedTorrents;
    const isMultiple = torrentsToActOn.length > 1;
    const torrentName = hash
      ? torrents.find((t) => t.hash === hash)?.name
      : undefined;

    // Handle delete action with confirmation
    if (action === 'delete') {
      showDeleteConfirmation({
        itemName: torrentName,
        itemCount: torrentsToActOn.length,
        onConfirm: async (deleteFiles: boolean) => {
          try {
            await deleteTorrents(torrentsToActOn, deleteFiles);
            torrentToast.deleteSuccess(torrentsToActOn.length, deleteFiles);
          } catch (error) {
            torrentToast.actionError(
              'delete',
              error instanceof Error ? error.message : 'Unknown error',
            );
          }
        },
      });
      return;
    }

    // Handle bulk actions that need confirmation
    const bulkActions = ['pause', 'resume', 'recheck', 'reannounce'];
    if (isMultiple && bulkActions.includes(action)) {
      showBulkConfirmation({
        action: action.charAt(0).toUpperCase() + action.slice(1),
        itemCount: torrentsToActOn.length,
        onConfirm: async () => {
          await performTorrentAction(action, torrentsToActOn);
        },
      });
      return;
    }

    // Handle single torrent actions or non-bulk actions directly
    await performTorrentAction(action, torrentsToActOn, torrentName);
  };

  const performTorrentAction = async (
    action: string,
    torrentsToActOn: string[],
    _torrentName?: string,
  ) => {
    try {
      switch (action) {
        case 'pause':
          await pauseTorrents(torrentsToActOn);
          torrentToast.actionSuccess('pause', torrentsToActOn.length);
          break;
        case 'resume':
          await resumeTorrents(torrentsToActOn);
          torrentToast.actionSuccess('resume', torrentsToActOn.length);
          break;
        case 'recheck':
          await recheckTorrents(torrentsToActOn);
          torrentToast.actionSuccess('recheck', torrentsToActOn.length);
          break;
        case 'reannounce':
          await reannounceTorrents(torrentsToActOn);
          torrentToast.actionSuccess('reannounce', torrentsToActOn.length);
          break;
        case 'forceStart':
          await qbApi.setForceStart(torrentsToActOn.join('|'), true);
          fetchTorrents();
          showToast.success('Force start enabled');
          break;
        case 'setLocation': {
          showConfirmation({
            title: 'Set Location',
            description:
              'Enter the new location path for the selected torrent(s):',
            confirmText: 'Set Location',
            onConfirm: async () => {
              const newPath = prompt('Enter new location path:');
              if (newPath) {
                await qbApi.setTorrentLocation({
                  hashes: torrentsToActOn.join('|'),
                  location: newPath,
                });
                fetchTorrents();
                showToast.success('Location updated successfully');
              }
            },
          });
          break;
        }
        case 'setCategory': {
          showConfirmation({
            title: 'Set Category',
            description: 'Enter the category for the selected torrent(s):',
            confirmText: 'Set Category',
            onConfirm: async () => {
              const newCategory = prompt('Enter category:');
              if (newCategory) {
                await qbApi.setTorrentCategory({
                  hashes: torrentsToActOn.join('|'),
                  category: newCategory,
                });
                fetchTorrents();
                showToast.success('Category updated successfully');
              }
            },
          });
          break;
        }
        case 'setTags': {
          showConfirmation({
            title: 'Set Tags',
            description:
              'Enter tags (comma separated) for the selected torrent(s):',
            confirmText: 'Set Tags',
            onConfirm: async () => {
              const newTags = prompt('Enter tags (comma separated):');
              if (newTags) {
                await qbApi.setTorrentTags({
                  hashes: torrentsToActOn.join('|'),
                  tags: newTags,
                });
                fetchTorrents();
                showToast.success('Tags updated successfully');
              }
            },
          });
          break;
        }
        case 'autoTMM':
          await qbApi.setAutoTMM(torrentsToActOn.join('|'), true);
          fetchTorrents();
          showToast.success('Automatic torrent management enabled');
          break;
        case 'limitDownload': {
          showConfirmation({
            title: 'Set Download Limit',
            description: 'Set download limit (bytes/sec, 0 = unlimited):',
            confirmText: 'Set Limit',
            onConfirm: async () => {
              const limit = prompt(
                'Set download limit (bytes/sec, 0 = unlimited):',
              );
              if (limit !== null) {
                await qbApi.setTorrentDownloadLimit({
                  hashes: torrentsToActOn.join('|'),
                  limit: Number(limit),
                });
                fetchTorrents();
                showToast.success('Download limit updated');
              }
            },
          });
          break;
        }
        case 'limitUpload': {
          showConfirmation({
            title: 'Set Upload Limit',
            description: 'Set upload limit (bytes/sec, 0 = unlimited):',
            confirmText: 'Set Limit',
            onConfirm: async () => {
              const limit = prompt(
                'Set upload limit (bytes/sec, 0 = unlimited):',
              );
              if (limit !== null) {
                await qbApi.setTorrentUploadLimit({
                  hashes: torrentsToActOn.join('|'),
                  limit: Number(limit),
                });
                fetchTorrents();
                showToast.success('Upload limit updated');
              }
            },
          });
          break;
        }
        case 'sequential':
          await qbApi.setSequentialDownload(torrentsToActOn.join('|'));
          fetchTorrents();
          showToast.success('Sequential download enabled');
          break;
        case 'firstLastPiece':
          await qbApi.setFirstLastPiecePriority(torrentsToActOn.join('|'));
          fetchTorrents();
          showToast.success('First/last piece priority enabled');
          break;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      torrentToast.actionError(action, errorMessage);
    }
  };

  const handleSort = (column: string, reverse: boolean) => {
    setSorting(column, reverse);
  };

  return (
    <>
      <Header>
        {/* Search Bar */}
        <section className='flex items-center gap-4'>
          <div className='relative max-w-md flex-1'>
            <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
            <Input
              placeholder='Search torrents...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
        </section>
        <div className='ml-auto flex items-center gap-2'>
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className={layout.spacing.section}>
          {/* Page Header */}
          <section
            className={`flex ${
              layout.isMobile
                ? 'flex-col gap-3'
                : 'flex-wrap items-center justify-between gap-4'
            }`}
          >
            <div>
              <h1 className={`${layout.textSize.title} font-bold capitalize`}>
                {selectedFilter} Torrents
              </h1>
              <p
                className={`${layout.textSize.subtitle} text-muted-foreground`}
              >
                {layout.isMobile
                  ? 'Manage torrents'
                  : 'Manage your torrents with advanced features'}
              </p>
            </div>

            <div className={`flex ${layout.spacing.button}`}>
              <Button
                size={layout.buttonSize}
                variant='outline'
                onClick={() => fetchTorrents()}
              >
                <RefreshCw className={layout.iconSize} />
                {layout.isMobile && <span className='ml-1'>Refresh</span>}
              </Button>
              <Button
                size={layout.buttonSize}
                onClick={() => setAddModalOpen(true)}
              >
                <Plus
                  className={`${layout.iconSize} ${
                    layout.isMobile ? '' : 'md:mr-2'
                  }`}
                />
                <span className={layout.isMobile ? 'ml-1' : 'hidden md:inline'}>
                  Add Torrent
                </span>
              </Button>
            </div>
          </section>

          {/* Filter Pills */}
          <section>
            <div
              className={`flex ${
                layout.isMobile
                  ? 'scrollbar-hide gap-2 overflow-x-auto pb-2'
                  : 'flex-wrap gap-2'
              }`}
            >
              {[
                { key: 'all', label: 'All' },
                {
                  key: 'downloading',
                  label: layout.isMobile ? 'Down' : 'Downloading',
                },
                {
                  key: 'seeding',
                  label: layout.isMobile ? 'Seed' : 'Seeding',
                },
                {
                  key: 'completed',
                  label: layout.isMobile ? 'Done' : 'Completed',
                },
                { key: 'paused', label: 'Paused' },
                { key: 'active', label: 'Active' },
                {
                  key: 'inactive',
                  label: layout.isMobile ? 'Idle' : 'Inactive',
                },
                { key: 'errored', label: 'Error' },
              ].map(({ key, label }) => {
                const count = torrents.filter((t) => {
                  switch (key) {
                    case 'all':
                      return true;
                    case 'downloading':
                      return [
                        'downloading',
                        'metaDL',
                        'stalledDL',
                        'queuedDL',
                      ].includes(t.state);
                    case 'seeding':
                      return ['uploading', 'stalledUP', 'queuedUP'].includes(
                        t.state,
                      );
                    case 'completed':
                      return t.progress === 1;
                    case 'paused':
                      return ['pausedDL', 'pausedUP'].includes(t.state);
                    case 'active':
                      return t.dlspeed > 0 || t.upspeed > 0;
                    case 'inactive':
                      return t.dlspeed === 0 && t.upspeed === 0;
                    case 'errored':
                      return t.state === 'error';
                    default:
                      return false;
                  }
                }).length;

                return (
                  <Button
                    key={key}
                    size={layout.isMobile ? 'sm' : 'sm'}
                    variant={selectedFilter === key ? 'default' : 'ghost'}
                    className={`touch-manipulation rounded-full whitespace-nowrap transition-all ${
                      layout.isMobile
                        ? 'min-h-[44px] min-w-[60px] px-4 py-2 text-sm'
                        : 'px-3 py-1 text-xs'
                    } ${
                      selectedFilter === key ? 'shadow-sm' : 'hover:bg-muted/80'
                    } `}
                    onClick={() => setSelectedFilter(key)}
                  >
                    {label}
                    <Badge
                      className={` ${
                        layout.isMobile ? 'ml-2 px-2 py-0.5 text-xs' : 'ml-1.5'
                      } ${
                        selectedFilter === key
                          ? 'bg-primary-foreground text-primary'
                          : ''
                      } `}
                    >
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </section>

          {/* Advanced Tools */}
          <section className='flex flex-wrap items-center gap-2'>
            {/* <AdvancedFilters*/}
            {/*  torrents={filteredTorrents}*/}
            {/*  onFilterChange={handleAdvancedFilterChange}*/}
            {/*  savedFilters={savedFilters}*/}
            {/*  onSaveFilter={saveFilter}*/}
            {/*  onDeleteFilter={deleteFilter}*/}
            {/* />*/}
            <TableExport
              torrents={filteredTorrents}
              selectedTorrents={selectedTorrents}
            />
            {/* <DuplicateDetection*/}
            {/*  torrents={filteredTorrents}*/}
            {/*  onDeleteTorrents={(hashes) => deleteTorrents(hashes)}*/}
            {/* />*/}
          </section>

          {/* Selection Toolbar */}
          {selectedTorrents.length > 0 && (
            <section className='bg-muted/50 flex items-center gap-2 rounded-lg border p-3'>
              <span className='text-sm font-medium'>
                {selectedTorrents.length} selected
              </span>
              <Separator orientation='vertical' className='h-5' />
              <div className='flex gap-1'>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => handleTorrentAction('resume')}
                >
                  Resume
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => handleTorrentAction('pause')}
                >
                  Pause
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => handleTorrentAction('recheck')}
                >
                  Recheck
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  className='text-destructive'
                  onClick={() => handleTorrentAction('delete')}
                >
                  Delete
                </Button>
                <Separator orientation='vertical' className='h-5' />
                <Button size='sm' variant='ghost' onClick={clearSelection}>
                  Clear Selection
                </Button>
              </div>
            </section>
          )}

          {/* Enhanced Torrent Table */}
          <section>
            <EnhancedTorrentTable
              torrents={filteredTorrents}
              selectedTorrents={selectedTorrents}
              onTorrentSelect={toggleTorrentSelection}
              onSelectAll={handleSelectAll}
              onTorrentAction={handleTorrentAction}
              isLoading={isLoading}
              sortBy={sortBy}
              sortReverse={sortReverse}
              onSort={handleSort}
            />
          </section>

          <AddTorrentModal
            open={addModalOpen}
            onOpenChange={setAddModalOpen}
            onAdded={() => {
              setAddModalOpen(false);
              fetchTorrents();
            }}
          />

          {/* Confirmation Dialogs */}
          <ConfirmationDialog
            open={confirmationState.isOpen}
            onOpenChange={hideConfirmation}
            title={confirmationState.title}
            description={confirmationState.description}
            confirmText={confirmationState.confirmText}
            cancelText={confirmationState.cancelText}
            variant={confirmationState.variant}
            onConfirm={confirmationState.onConfirm}
            isLoading={confirmationState.isLoading}
          />

          <DeleteConfirmationDialog
            open={deleteState.isOpen}
            onOpenChange={hideDeleteConfirmation}
            itemName={deleteState.itemName}
            itemCount={deleteState.itemCount}
            deleteFiles={deleteState.deleteFiles}
            onDeleteFilesChange={setDeleteFiles}
            onConfirm={() => deleteState.onConfirm(deleteState.deleteFiles)}
            isLoading={deleteState.isLoading}
          />

          <BulkActionConfirmationDialog
            open={bulkState.isOpen}
            onOpenChange={hideBulkConfirmation}
            action={bulkState.action}
            itemCount={bulkState.itemCount}
            onConfirm={bulkState.onConfirm}
            isLoading={bulkState.isLoading}
          />
        </div>
      </Main>
    </>
  );
}
