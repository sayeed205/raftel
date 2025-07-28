import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { ServerState, TorrentInfo, TorrentsInfoParams } from '@/types/api';
import qbit from '@/services/qbit';

interface TorrentState {
  torrents: Array<TorrentInfo>;
  selectedTorrents: Array<string>;
  serverState: ServerState | null;
  filter: string;
  categories: Array<string>;
  tags: Array<string>;
  sortBy: string;
  sortReverse: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
  syncId: number;
  // Enhanced features
  searchQuery: string;
  columnSettings: Record<
    string,
    { visible: boolean; width: number; order: number }
  >;
  savedFilters: Array<{
    id: string;
    name: string;
    conditions: Array<{
      id: string;
      field: string;
      operator: string;
      value: any;
    }>;
    operator: 'AND' | 'OR';
  }>;
}

interface TorrentActions {
  // Data fetching
  fetchTorrents: (params?: TorrentsInfoParams) => Promise<void>;
  fetchServerState: () => Promise<void>;
  syncMainData: () => Promise<void>;

  // Torrent selection
  selectTorrent: (hash: string) => void;
  selectTorrents: (hashes: Array<string>) => void;
  selectAllTorrents: () => void;
  clearSelection: () => void;
  toggleTorrentSelection: (hash: string) => void;

  // Filters and sorting
  setFilter: (filter: string) => void;
  setCategories: (categories: Array<string>) => void;
  setTags: (tags: Array<string>) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  clearCategoryFilter: () => void;
  clearTagFilter: () => void;
  setSorting: (sortBy: string, reverse?: boolean) => void;

  // Enhanced filtering
  getFilteredTorrents: () => Array<TorrentInfo>;
  setSearchQuery: (query: string) => void;

  // Column management
  updateColumnSettings: (
    columnId: string,
    settings: Partial<{ visible: boolean; width: number; order: number }>,
  ) => void;
  resetColumnSettings: () => void;

  // Saved filters
  saveFilter: (filter: {
    id: string;
    name: string;
    conditions: Array<{
      id: string;
      field: string;
      operator: string;
      value: any;
    }>;
    operator: 'AND' | 'OR';
  }) => void;
  deleteFilter: (filterId: string) => void;
  loadFilter: (filterId: string) => void;

  // Torrent actions
  pauseTorrents: (hashes?: Array<string>) => Promise<void>;
  resumeTorrents: (hashes?: Array<string>) => Promise<void>;
  deleteTorrents: (
    hashes: Array<string>,
    deleteFiles?: boolean,
  ) => Promise<void>;
  recheckTorrents: (hashes?: Array<string>) => Promise<void>;
  reannounceTorrents: (hashes?: Array<string>) => Promise<void>;
  setTorrentCategory: (
    category: string,
    hashes?: Array<string>,
  ) => Promise<void>;
  setTorrentTags: (tags: string, hashes?: Array<string>) => Promise<void>;
  setTorrentPriority: (
    priority: 'increasePrio' | 'decreasePrio' | 'topPrio' | 'bottomPrio',
    hashes?: Array<string>,
  ) => Promise<void>;

  // Utility
  clearError: () => void;
  getTorrentByHash: (hash: string) => TorrentInfo | undefined;
  getSelectedHashes: () => string;
}

type TorrentStore = TorrentState & TorrentActions;

export const useTorrentStore = create<TorrentStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    torrents: [],
    selectedTorrents: [],
    serverState: null,
    filter: 'all',
    categories: [],
    tags: [],
    sortBy: 'name',
    sortReverse: false,
    isLoading: false,
    error: null,
    lastUpdate: 0,
    syncId: 0,
    // Enhanced features
    searchQuery: '',
    columnSettings: {},
    savedFilters: [],

    // Data fetching
    fetchTorrents: async (_params) => {
      // Use syncMainData instead of separate calls like VueTorrent
      await get().syncMainData();
    },

    fetchServerState: async () => {
      // Server state is fetched as part of syncMainData
      await get().syncMainData();
    },

    syncMainData: async () => {
      try {
        set({ isLoading: true, error: null });
        const state = get();
        const data = await qbit.getMainData(state.syncId);

        // Capture current syncId before updating
        const currentSyncId = state.syncId;

        // Update sync ID
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (data.rid !== undefined) {
          set({ syncId: data.rid });
        }

        // Handle torrents data
        if (data.torrents) {
          if (currentSyncId === 0 || 'full_update' in data) {
            // Full update - replace all torrents
            const torrents = Object.entries(data.torrents).map(
              ([hash, torrentData]) => ({
                hash,
                ...(torrentData as Record<string, any>),
              }),
            ) as Array<TorrentInfo>;

            console.log('Full update - setting torrents:', torrents);
            set({
              torrents,
              isLoading: false,
              lastUpdate: Date.now(),
            });
          } else {
            // Incremental update - merge changes
            const updatedTorrents = [...state.torrents];

            Object.entries(data.torrents).forEach(([hash, torrentData]) => {
              const existingIndex = updatedTorrents.findIndex(
                (t) => t.hash === hash,
              );
              if (existingIndex >= 0) {
                // Update existing torrent
                updatedTorrents[existingIndex] = {
                  ...updatedTorrents[existingIndex],
                  ...(torrentData as Record<string, any>),
                };
              } else {
                // Add new torrent
                updatedTorrents.push({
                  hash,
                  ...(torrentData as Record<string, any>),
                } as TorrentInfo);
              }
            });

            console.log(
              'Incremental update - updated torrents:',
              updatedTorrents,
            );
            set({
              torrents: updatedTorrents,
              isLoading: false,
              lastUpdate: Date.now(),
            });
          }
        } else if (state.syncId === 0) {
          // First sync but no torrents data - set empty array
          set({
            torrents: [],
            isLoading: false,
            lastUpdate: Date.now(),
          });
        } else {
          // No torrents update in incremental sync
          set({ isLoading: false });
        }

        // Handle removed torrents
        if ('torrents_removed' in data) {
          const currentTorrents = get().torrents;
          const filteredTorrents = currentTorrents.filter(
            (torrent) => !data.torrents_removed!.includes(torrent.hash),
          );
          set({ torrents: filteredTorrents });
        }

        // Update server state if provided
        if (data.server_state) {
          const currentServerState = get().serverState;
          set({
            serverState: {
              ...currentServerState,
              ...data.server_state,
            } as ServerState,
          });
        }
      } catch (error) {
        console.error('Sync failed:', error);
        const message =
          error instanceof Error ? error.message : 'Failed to sync data';
        set({
          error: message,
          isLoading: false,
        });
      }
    },

    // Torrent selection
    selectTorrent: (hash) => {
      set({ selectedTorrents: [hash] });
    },

    selectTorrents: (hashes) => {
      set({ selectedTorrents: hashes });
    },

    selectAllTorrents: () => {
      const { torrents } = get();
      set({ selectedTorrents: torrents.map((t) => t.hash) });
    },

    clearSelection: () => {
      set({ selectedTorrents: [] });
    },

    toggleTorrentSelection: (hash) => {
      const { selectedTorrents } = get();
      const isSelected = selectedTorrents.includes(hash);

      if (isSelected) {
        set({
          selectedTorrents: selectedTorrents.filter((h) => h !== hash),
        });
      } else {
        set({ selectedTorrents: [...selectedTorrents, hash] });
      }
    },

    // Filters and sorting
    setFilter: (filter) => {
      set({ filter });
    },

    setCategories: (categories) => {
      set({ categories });
    },

    setTags: (tags) => {
      set({ tags });
    },

    addCategory: (category) => {
      const { categories } = get();
      if (!categories.includes(category)) {
        set({ categories: [...categories, category] });
      }
    },

    removeCategory: (category) => {
      const { categories } = get();
      set({ categories: categories.filter((c) => c !== category) });
    },

    addTag: (tag) => {
      const { tags } = get();
      if (!tags.includes(tag)) {
        set({ tags: [...tags, tag] });
      }
    },

    removeTag: (tag) => {
      const { tags } = get();
      set({ tags: tags.filter((t) => t !== tag) });
    },

    clearCategoryFilter: () => {
      set({ categories: [] });
    },

    clearTagFilter: () => {
      set({ tags: [] });
    },

    setSorting: (sortBy, reverse) => {
      set({
        sortBy,
        sortReverse: reverse !== undefined ? reverse : get().sortReverse,
      });
    },

    // Enhanced filtering
    setSearchQuery: (query) => {
      set({ searchQuery: query });
    },

    // Column management
    updateColumnSettings: (columnId, settings) => {
      const { columnSettings } = get();
      set({
        columnSettings: {
          ...columnSettings,
          [columnId]: {
            ...columnSettings[columnId],
            ...settings,
          },
        },
      });
    },

    resetColumnSettings: () => {
      set({ columnSettings: {} });
    },

    // Saved filters
    saveFilter: (filter) => {
      const { savedFilters } = get();
      set({
        savedFilters: [...savedFilters, filter],
      });
    },

    deleteFilter: (filterId) => {
      const { savedFilters } = get();
      set({
        savedFilters: savedFilters.filter((f) => f.id !== filterId),
      });
    },

    loadFilter: (filterId) => {
      const { savedFilters } = get();
      const filter = savedFilters.find((f) => f.id === filterId);
      if (filter) {
        // Apply the filter conditions
        // This would need to be implemented based on your filter structure
        console.log('Loading filter:', filter);
      }
    },

    getFilteredTorrents: () => {
      const { torrents, filter, categories, tags, searchQuery } = get();

      return torrents.filter((torrent) => {
        // Apply state filter
        if (filter !== 'all') {
          switch (filter) {
            case 'downloading':
              if (
                ![
                  'downloading',
                  'metaDL',
                  'stalledDL',
                  'queuedDL',
                  'checkingDL',
                  'forcedDL',
                ].includes(torrent.state)
              ) {
                return false;
              }
              break;
            case 'seeding':
              if (
                ![
                  'uploading',
                  'stalledUP',
                  'queuedUP',
                  'checkingUP',
                  'forcedUP',
                ].includes(torrent.state)
              ) {
                return false;
              }
              break;
            case 'completed':
              if (torrent.progress < 1) {
                return false;
              }
              break;
            case 'paused':
              if (!['pausedDL', 'pausedUP'].includes(torrent.state)) {
                return false;
              }
              break;
            case 'active':
              if (torrent.dlspeed === 0 && torrent.upspeed === 0) {
                return false;
              }
              break;
            case 'inactive':
              if (torrent.dlspeed > 0 || torrent.upspeed > 0) {
                return false;
              }
              break;
            case 'stalled':
              if (!['stalledDL', 'stalledUP'].includes(torrent.state)) {
                return false;
              }
              break;
            case 'errored':
              if (torrent.state !== 'error') {
                return false;
              }
              break;
          }
        }

        // Apply category filter
        if (categories.length > 0) {
          if (!categories.includes(torrent.category || '')) {
            return false;
          }
        }

        // Apply tag filter
        if (tags.length > 0) {
          const torrentTags = torrent.tags
            ? torrent.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
            : [];
          const hasMatchingTag = tags.some((tag) => torrentTags.includes(tag));
          if (!hasMatchingTag) {
            return false;
          }
        }

        // Apply search query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = torrent.name.toLowerCase().includes(query);
          const matchesCategory = (torrent.category || '')
            .toLowerCase()
            .includes(query);
          const matchesTags = (torrent.tags || '')
            .toLowerCase()
            .includes(query);

          if (!matchesName && !matchesCategory && !matchesTags) {
            return false;
          }
        }

        return true;
      });
    },

    // Torrent actions
    pauseTorrents: async (hashes) => {
      const targetHashes = hashes || get().selectedTorrents;
      if (targetHashes.length === 0) return;

      try {
        await qbit.stopTorrents(targetHashes);
        await get().fetchTorrents();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to pause torrents';
        set({ error: message });
        throw error;
      }
    },

    resumeTorrents: async (hashes) => {
      const targetHashes = hashes || get().selectedTorrents;
      if (targetHashes.length === 0) return;

      try {
        await qbit.startTorrents(targetHashes);
        await get().fetchTorrents();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to resume torrents';
        set({ error: message });
        throw error;
      }
    },

    deleteTorrents: async (hashes, deleteFiles = false) => {
      if (hashes.length === 0) return;

      try {
        await qbit.deleteTorrents(hashes, deleteFiles);
        await get().fetchTorrents();
        get().clearSelection();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to delete torrents';
        set({ error: message });
        throw error;
      }
    },

    recheckTorrents: async (hashes) => {
      const targetHashes = hashes || get().selectedTorrents;
      if (targetHashes.length === 0) return;

      try {
        await qbit.recheckTorrents(targetHashes);
        await get().fetchTorrents();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to recheck torrents';
        set({ error: message });
        throw error;
      }
    },

    reannounceTorrents: async (hashes) => {
      const targetHashes = hashes || get().selectedTorrents;
      if (targetHashes.length === 0) return;

      try {
        await qbit.reannounceTorrents(targetHashes);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to reannounce torrents';
        set({ error: message });
        throw error;
      }
    },

    setTorrentCategory: async (category, hashes) => {
      const targetHashes = hashes || get().selectedTorrents;
      if (targetHashes.length === 0) return;

      try {
        await qbit.setCategory(targetHashes, category);
        await get().fetchTorrents();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to set category';
        set({ error: message });
        throw error;
      }
    },

    setTorrentTags: async (tags, hashes) => {
      const targetHashes = hashes || get().selectedTorrents;
      if (targetHashes.length === 0) return;

      try {
        await qbit.addTorrentTag(targetHashes, [tags]);
        await get().fetchTorrents();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to set tags';
        set({ error: message });
        throw error;
      }
    },

    setTorrentPriority: async (priority, hashes) => {
      const targetHashes = hashes || get().selectedTorrents;
      if (targetHashes.length === 0) return;

      try {
        await qbit.setTorrentPriority(targetHashes, priority);
        await get().fetchTorrents();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to set priority';
        set({ error: message });
        throw error;
      }
    },

    // Utility
    clearError: () => {
      set({ error: null });
    },

    getTorrentByHash: (hash) => {
      return get().torrents.find((t) => t.hash === hash);
    },

    getSelectedHashes: () => {
      return get().selectedTorrents.join('|');
    },
  })),
);

// Selector hooks for convenience
export const useTorrents = () => {
  const { torrents, isLoading, error, lastUpdate } = useTorrentStore();
  return { torrents, isLoading, error, lastUpdate };
};

export const useTorrentSelection = () => {
  const {
    selectedTorrents,
    selectTorrent,
    selectTorrents,
    selectAllTorrents,
    clearSelection,
    toggleTorrentSelection,
  } = useTorrentStore();
  return {
    selectedTorrents,
    selectTorrent,
    selectTorrents,
    selectAllTorrents,
    clearSelection,
    toggleTorrentSelection,
  };
};

export const useTorrentFilters = () => {
  const {
    filter,
    categories,
    tags,
    sortBy,
    sortReverse,
    setFilter,
    setCategories,
    setTags,
    addCategory,
    removeCategory,
    addTag,
    removeTag,
    clearCategoryFilter,
    clearTagFilter,
    setSorting,
    getFilteredTorrents,
  } = useTorrentStore();
  return {
    filter,
    categories,
    tags,
    sortBy,
    sortReverse,
    setFilter,
    setCategories,
    setTags,
    addCategory,
    removeCategory,
    addTag,
    removeTag,
    clearCategoryFilter,
    clearTagFilter,
    setSorting,
    getFilteredTorrents,
  };
};

export const useTorrentActions = () => {
  const {
    pauseTorrents,
    resumeTorrents,
    deleteTorrents,
    recheckTorrents,
    reannounceTorrents,
    setTorrentCategory,
    setTorrentTags,
    setTorrentPriority,
  } = useTorrentStore();

  return {
    pauseTorrents,
    resumeTorrents,
    deleteTorrents,
    recheckTorrents,
    reannounceTorrents,
    setTorrentCategory,
    setTorrentTags,
    setTorrentPriority,
  };
};

export const useServerState = () => {
  const { serverState, fetchServerState } = useTorrentStore();
  return { serverState, fetchServerState };
};
