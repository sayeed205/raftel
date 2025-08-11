import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type {
  SearchEngine,
  SearchHistoryItem,
  SearchJob,
  SearchPlugin,
  SearchQuery,
  SearchResult,
  SearchStatus,
} from '@/types/search';
import qbit from '@/services/qbit';

interface SearchState {
  // Search engines/plugins
  engines: Array<SearchEngine>;

  // Active search
  activeSearch: SearchJob | null;
  searchResults: Array<SearchResult>;
  searchStatus: SearchStatus | null;

  // Search history and caching
  searchHistory: Array<SearchHistoryItem>;
  savedSearches: Array<{ id: string; name: string; query: SearchQuery }>;
  resultCache: Map<number, Array<SearchResult>>;

  // UI state
  isSearching: boolean;
  isLoadingEngines: boolean;
  error: string | null;

  // Pagination and filtering
  currentPage: number;
  resultsPerPage: number;
  totalResults: number;
  sortBy: 'name' | 'size' | 'seeds' | 'peers' | 'engine';
  sortOrder: 'asc' | 'desc';
  filterEngine: string | null;
  filterCategory: string | null;
  minSeeds: number;
  maxSize: number | null;
}

interface SearchActions {
  // Engine management
  fetchEngines: () => Promise<void>;
  enableEngine: (engineName: string) => Promise<void>;
  disableEngine: (engineName: string) => Promise<void>;
  installEngine: (sources: Array<string>) => Promise<void>;
  uninstallEngine: (names: Array<string>) => Promise<void>;
  updateEngines: () => Promise<void>;

  // Search operations
  startSearch: (query: SearchQuery) => Promise<void>;
  stopSearch: () => Promise<void>;
  getSearchStatus: (id?: number) => Promise<void>;
  getSearchResults: (id: number, offset?: number, limit?: number) => Promise<void>;
  deleteSearch: (id: number) => Promise<void>;

  // Search history and saved searches
  addToHistory: (query: SearchQuery, resultsCount: number, duration?: number) => void;
  clearHistory: () => void;
  removeFromHistory: (index: number) => void;
  saveSearch: (name: string, query: SearchQuery) => void;
  deleteSavedSearch: (id: string) => void;
  loadSavedSearch: (id: string) => SearchQuery | null;

  // Result actions
  downloadFromResult: (result: SearchResult) => Promise<void>;
  copyMagnetLink: (result: SearchResult) => void;

  // Filtering and sorting
  setSortBy: (sortBy: SearchState['sortBy'], order?: SearchState['sortOrder']) => void;
  setFilterEngine: (engine: string | null) => void;
  setFilterCategory: (category: string | null) => void;
  setMinSeeds: (seeds: number) => void;
  setMaxSize: (size: number | null) => void;
  clearFilters: () => void;

  // Pagination
  setPage: (page: number) => void;
  setResultsPerPage: (perPage: number) => void;

  // Utility
  clearError: () => void;
  getFilteredResults: () => Array<SearchResult>;
}

type SearchStore = SearchState & SearchActions;

export const useSearchStore = create<SearchStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    engines: [],
    activeSearch: null,
    searchResults: [],
    searchStatus: null,
    searchHistory: [],
    savedSearches: [],
    resultCache: new Map(),
    isSearching: false,
    isLoadingEngines: false,
    error: null,
    currentPage: 1,
    resultsPerPage: 50,
    totalResults: 0,
    sortBy: 'seeds',
    sortOrder: 'desc',
    filterEngine: null,
    filterCategory: null,
    minSeeds: 0,
    maxSize: null,

    // Engine management
    fetchEngines: async () => {
      try {
        set({ isLoadingEngines: true, error: null });
        const plugins = await qbit.getSearchPlugins();

        // Convert SearchPlugin to SearchEngine format
        const engines: Array<SearchEngine> = plugins.map((plugin: SearchPlugin) => ({
          id: plugin.name,
          name: plugin.name,
          url: plugin.url,
          enabled: plugin.enabled,
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          categories: (plugin.supportedCategories || []).map((cat) =>
            typeof cat === 'string' ? cat : cat.id,
          ),
          version: plugin.version,
          fullName: plugin.fullName,
        }));

        set({ engines, isLoadingEngines: false });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch search engines';
        set({ error: message, isLoadingEngines: false });
        throw error;
      }
    },

    enableEngine: async (engineName: string) => {
      try {
        await qbit.enableSearchPlugin([engineName], true);
        await get().fetchEngines();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to enable search engine';
        set({ error: message });
        throw error;
      }
    },

    disableEngine: async (engineName: string) => {
      try {
        await qbit.enableSearchPlugin([engineName], false);
        await get().fetchEngines();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to disable search engine';
        set({ error: message });
        throw error;
      }
    },

    installEngine: async (sources: Array<string>) => {
      try {
        await qbit.installSearchPlugin(sources);
        await get().fetchEngines();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to install search engine';
        set({ error: message });
        throw error;
      }
    },

    uninstallEngine: async (names: Array<string>) => {
      try {
        await qbit.uninstallSearchPlugin(names);
        await get().fetchEngines();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to uninstall search engine';
        set({ error: message });
        throw error;
      }
    },

    updateEngines: async () => {
      try {
        await qbit.updateSearchPlugins();
        await get().fetchEngines();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update search engines';
        set({ error: message });
        throw error;
      }
    },

    // Search operations
    startSearch: async (query: SearchQuery) => {
      try {
        set({
          isSearching: true,
          error: null,
          searchResults: [],
          currentPage: 1,
        });

        const startTime = Date.now();
        const plugins =
          query.plugins ||
          get()
            .engines.filter((e) => e.enabled)
            .map((e) => e.name);
        const category = query.category || 'all';

        const searchJob = await qbit.startSearch(query.pattern, category, plugins);

        set({
          activeSearch: searchJob,
          searchStatus: { id: searchJob.id, status: 'Running', total: 0 },
        });

        // Start polling for results
        const pollResults = async () => {
          try {
            const status = await qbit.getSearchStatus(searchJob.id);
            if (status.length > 0) {
              const currentStatus = status[0];
              set({ searchStatus: currentStatus });

              if (currentStatus.status === 'Stopped' || currentStatus.total > 0) {
                await get().getSearchResults(searchJob.id);

                if (currentStatus.status === 'Stopped') {
                  const duration = Date.now() - startTime;
                  get().addToHistory(query, currentStatus.total, duration);
                  set({ isSearching: false });
                  return;
                }
              }

              // Continue polling if still running
              setTimeout(pollResults, 2000);
            }
          } catch (error) {
            console.error('Error polling search results:', error);
            set({ isSearching: false });
          }
        };

        // Start polling after a short delay
        setTimeout(pollResults, 1000);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to start search';
        set({ error: message, isSearching: false });
        throw error;
      }
    },

    stopSearch: async () => {
      const { activeSearch } = get();
      if (!activeSearch) return;

      try {
        await qbit.stopSearch(activeSearch.id);
        set({
          isSearching: false,
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          searchStatus: activeSearch ? { ...get().searchStatus!, status: 'Stopped' } : null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to stop search';
        set({ error: message });
        throw error;
      }
    },

    getSearchStatus: async (id?: number) => {
      try {
        const statuses = await qbit.getSearchStatus(id);
        if (statuses.length > 0) {
          set({ searchStatus: statuses[0] });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get search status';
        set({ error: message });
        throw error;
      }
    },

    getSearchResults: async (id: number, offset?: number, limit?: number) => {
      try {
        const { resultCache } = get();

        // Check cache first
        if (resultCache.has(id) && !offset && !limit) {
          set({ searchResults: resultCache.get(id)! });
          return;
        }

        const response = await qbit.getSearchResults(id, offset, limit);

        // Convert API response to SearchResult format
        const results: Array<SearchResult> = response.results.map((result: SearchResult) => ({
          ...result,
          name: result.fileName,
          size: result.fileSize,
          seeds: result.nbSeeders,
          peers: result.nbLeechers,
          engine: result.siteUrl || 'unknown',
          magnetLink: result.fileUrl.startsWith('magnet:') ? result.fileUrl : undefined,
          downloadUrl: !result.fileUrl.startsWith('magnet:') ? result.fileUrl : undefined,
          descrLink: result.descrLink,
        }));

        // Cache results
        resultCache.set(id, results);

        set({
          searchResults: results,
          totalResults: response.total,
          resultCache,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get search results';
        set({ error: message });
        throw error;
      }
    },

    deleteSearch: async (id: number) => {
      try {
        await qbit.deleteSearchPlugin(id);
        const { resultCache } = get();
        resultCache.delete(id);
        set({ resultCache });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete search';
        set({ error: message });
        throw error;
      }
    },

    // Search history and saved searches
    addToHistory: (query: SearchQuery, resultsCount: number, duration?: number) => {
      const { searchHistory } = get();
      const historyItem: SearchHistoryItem = {
        query,
        timestamp: new Date(),
        resultsCount,
        duration,
      };

      // Add to beginning and limit to 50 items
      const newHistory = [historyItem, ...searchHistory].slice(0, 50);
      set({ searchHistory: newHistory });
    },

    clearHistory: () => {
      set({ searchHistory: [] });
    },

    removeFromHistory: (index: number) => {
      const { searchHistory } = get();
      const newHistory = searchHistory.filter((_, i) => i !== index);
      set({ searchHistory: newHistory });
    },

    saveSearch: (name: string, query: SearchQuery) => {
      const { savedSearches } = get();
      const savedSearch = {
        id: Date.now().toString(),
        name,
        query,
      };
      set({ savedSearches: [...savedSearches, savedSearch] });
    },

    deleteSavedSearch: (id: string) => {
      const { savedSearches } = get();
      set({ savedSearches: savedSearches.filter((s) => s.id !== id) });
    },

    loadSavedSearch: (id: string) => {
      const { savedSearches } = get();
      const saved = savedSearches.find((s) => s.id === id);
      return saved ? saved.query : null;
    },

    // Result actions
    downloadFromResult: async (result: SearchResult) => {
      try {
        const url = result.fileUrl;
        if (!url) {
          throw new Error('No download URL available');
        }

        await qbit.addTorrents([], url);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to download torrent';
        set({ error: message });
        throw error;
      }
    },

    copyMagnetLink: async (result: SearchResult) => {
      const magnetLink = result.fileUrl;
      if (magnetLink && magnetLink.startsWith('magnet:')) {
        await navigator.clipboard.writeText(magnetLink);
      }
    },

    // Filtering and sorting
    setSortBy: (sortBy: SearchState['sortBy'], order?: SearchState['sortOrder']) => {
      set({
        sortBy,
        sortOrder:
          order || (get().sortBy === sortBy && get().sortOrder === 'desc' ? 'asc' : 'desc'),
      });
    },

    setFilterEngine: (engine: string | null) => {
      set({ filterEngine: engine, currentPage: 1 });
    },

    setFilterCategory: (category: string | null) => {
      set({ filterCategory: category, currentPage: 1 });
    },

    setMinSeeds: (seeds: number) => {
      set({ minSeeds: seeds, currentPage: 1 });
    },

    setMaxSize: (size: number | null) => {
      set({ maxSize: size, currentPage: 1 });
    },

    clearFilters: () => {
      set({
        filterEngine: null,
        filterCategory: null,
        minSeeds: 0,
        maxSize: null,
        currentPage: 1,
      });
    },

    // Pagination
    setPage: (page: number) => {
      set({ currentPage: page });
    },

    setResultsPerPage: (perPage: number) => {
      set({ resultsPerPage: perPage, currentPage: 1 });
    },

    // Utility
    clearError: () => {
      set({ error: null });
    },

    getFilteredResults: () => {
      const { searchResults, filterEngine } = get();

      return searchResults.filter(
        (result) => !(filterEngine && result.engineName !== filterEngine),
      );
    },
  })),
);

// Selector hooks for convenience
export const useSearchEngines = () => {
  const { engines, isLoadingEngines, fetchEngines, enableEngine, disableEngine } = useSearchStore();
  return {
    engines,
    isLoadingEngines,
    fetchEngines,
    enableEngine,
    disableEngine,
  };
};

export const useSearchOperations = () => {
  const {
    activeSearch,
    searchResults,
    searchStatus,
    isSearching,
    startSearch,
    stopSearch,
    getSearchResults,
  } = useSearchStore();
  return {
    activeSearch,
    searchResults,
    searchStatus,
    isSearching,
    startSearch,
    stopSearch,
    getSearchResults,
  };
};

export const useSearchHistory = () => {
  const {
    searchHistory,
    savedSearches,
    addToHistory,
    clearHistory,
    removeFromHistory,
    saveSearch,
    deleteSavedSearch,
    loadSavedSearch,
  } = useSearchStore();
  return {
    searchHistory,
    savedSearches,
    addToHistory,
    clearHistory,
    removeFromHistory,
    saveSearch,
    deleteSavedSearch,
    loadSavedSearch,
  };
};

export const useSearchFilters = () => {
  const {
    sortBy,
    sortOrder,
    filterEngine,
    filterCategory,
    minSeeds,
    maxSize,
    currentPage,
    resultsPerPage,
    setSortBy,
    setFilterEngine,
    setFilterCategory,
    setMinSeeds,
    setMaxSize,
    clearFilters,
    setPage,
    setResultsPerPage,
    getFilteredResults,
  } = useSearchStore();

  return {
    sortBy,
    sortOrder,
    filterEngine,
    filterCategory,
    minSeeds,
    maxSize,
    currentPage,
    resultsPerPage,
    setSortBy,
    setFilterEngine,
    setFilterCategory,
    setMinSeeds,
    setMaxSize,
    clearFilters,
    setPage,
    setResultsPerPage,
    getFilteredResults,
  };
};
