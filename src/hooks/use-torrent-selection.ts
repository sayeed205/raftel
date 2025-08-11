import { useCallback, useMemo } from 'react';


import { createPlatformShortcut, useKeyboardShortcuts } from './use-keyboard-shortcuts';
import type { KeyboardShortcut } from './use-keyboard-shortcuts';
import { useTorrentStore } from '@/stores/torrent-store';

interface UseTorrentSelectionOptions {
  enabled?: boolean;
  onFocusSearch?: () => void;
}

/**
 * Hook for torrent selection and bulk action shortcuts
 * Handles select all, deselect all, bulk pause/resume, and search focus
 */
export function useTorrentSelection(options: UseTorrentSelectionOptions = {}) {
  const { enabled = true, onFocusSearch } = options;

  // Select all visible torrents
  const selectAll = useCallback(() => {
    const { selectedTorrents, selectAllTorrents, clearSelection, getFilteredTorrents } =
      useTorrentStore.getState();
    const filteredTorrents = getFilteredTorrents();

    if (filteredTorrents.length === 0) return;

    // If all visible torrents are already selected, deselect all
    const visibleHashes = filteredTorrents.map((t) => t.hash);
    const allVisibleSelected = visibleHashes.every((hash) => selectedTorrents.includes(hash));

    if (allVisibleSelected && selectedTorrents.length === visibleHashes.length) {
      clearSelection();
    } else {
      selectAllTorrents();
    }
  }, []);

  // Deselect all torrents
  const deselectAll = useCallback(() => {
    const { clearSelection } = useTorrentStore.getState();
    clearSelection();
  }, []);

  // Bulk pause selected torrents
  const bulkPause = useCallback(async () => {
    const { selectedTorrents, pauseTorrents } = useTorrentStore.getState();
    if (selectedTorrents.length === 0) return;

    try {
      await pauseTorrents(selectedTorrents);
    } catch (error) {
      console.error('Failed to pause torrents:', error);
    }
  }, []);

  // Bulk resume selected torrents
  const bulkResume = useCallback(async () => {
    const { selectedTorrents, resumeTorrents } = useTorrentStore.getState();
    if (selectedTorrents.length === 0) return;

    try {
      await resumeTorrents(selectedTorrents);
    } catch (error) {
      console.error('Failed to resume torrents:', error);
    }
  }, []);

  // Focus search input
  const focusSearch = useCallback(() => {
    if (onFocusSearch) {
      onFocusSearch();
    } else {
      // Try to find and focus search input
      const searchInput = document.querySelector(
        'input[placeholder*="Search"]',
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  }, [onFocusSearch]);

  // Invert selection
  const invertSelection = useCallback(() => {
    const { selectedTorrents, getFilteredTorrents, selectTorrents } = useTorrentStore.getState();
    const filteredTorrents = getFilteredTorrents();
    const visibleHashes = filteredTorrents.map((t) => t.hash);
    const newSelection = visibleHashes.filter((hash) => !selectedTorrents.includes(hash));

    selectTorrents(newSelection);
  }, []);

  // Select all finished torrents
  const selectAllFinished = useCallback(() => {
    const { getFilteredTorrents, selectTorrents } = useTorrentStore.getState();
    const filteredTorrents = getFilteredTorrents();
    const finishedTorrents = filteredTorrents.filter((t) => t.progress === 1);
    const hashes = finishedTorrents.map((t) => t.hash);

    selectTorrents(hashes);
  }, []);

  // Select all downloading torrents
  const selectAllDownloading = useCallback(() => {
    const { getFilteredTorrents, selectTorrents } = useTorrentStore.getState();
    const filteredTorrents = getFilteredTorrents();
    const downloadingTorrents = filteredTorrents.filter((t) =>
      ['downloading', 'metaDL', 'stalledDL', 'queuedDL', 'checkingDL', 'forcedDL'].includes(
        t.state,
      ),
    );
    const hashes = downloadingTorrents.map((t) => t.hash);

    selectTorrents(hashes);
  }, []);

  // Select all seeding torrents
  const selectAllSeeding = useCallback(() => {
    const { getFilteredTorrents, selectTorrents } = useTorrentStore.getState();
    const filteredTorrents = getFilteredTorrents();
    const seedingTorrents = filteredTorrents.filter((t) =>
      ['uploading', 'stalledUP', 'queuedUP', 'checkingUP', 'forcedUP'].includes(t.state),
    );
    const hashes = seedingTorrents.map((t) => t.hash);

    selectTorrents(hashes);
  }, []);

  // Define selection and bulk action shortcuts
  const selectionShortcuts: Array<KeyboardShortcut> = useMemo(
    () => [
      // Basic Actions
      createPlatformShortcut('a', 'Select All Torrents', 'Basic Actions', selectAll, {
        useCmd: true,
      }),
      createPlatformShortcut('r', 'Resume All Torrents', 'Basic Actions', bulkResume, {
        useCmd: true,
        shiftKey: true,
      }),
      createPlatformShortcut('p', 'Pause All Torrents', 'Basic Actions', bulkPause, {
        useCmd: true,
        shiftKey: true,
      }),

      // Selection & Filtering
      createPlatformShortcut('i', 'Invert Selection', 'Selection & Filtering', invertSelection, {
        useCmd: true,
      }),
      createPlatformShortcut(
        'a',
        'Select All Finished',
        'Selection & Filtering',
        selectAllFinished,
        { useCmd: true, shiftKey: true },
      ),
      createPlatformShortcut(
        'd',
        'Select All Downloading',
        'Selection & Filtering',
        selectAllDownloading,
        { useCmd: true },
      ),
      createPlatformShortcut('s', 'Select All Seeding', 'Selection & Filtering', selectAllSeeding, {
        useCmd: true,
      }),

      // Navigation & Interface
      createPlatformShortcut('f', 'Focus Search Box', 'Navigation & Interface', focusSearch, {
        useCmd: true,
      }),
      {
        key: '/',
        action: focusSearch,
        description: 'Focus Search Box',
        category: 'Navigation & Interface',
        preventDefault: true,
      },
    ],
    [
      selectAll,
      bulkResume,
      bulkPause,
      invertSelection,
      selectAllFinished,
      selectAllDownloading,
      selectAllSeeding,
      focusSearch,
    ],
  );

  // Register shortcuts
  useKeyboardShortcuts(selectionShortcuts, {
    enabled,
    ignoreInputFields: true,
  });

  return {
    selectAll,
    deselectAll,
    bulkPause,
    bulkResume,
    focusSearch,
    invertSelection,
    selectAllFinished,
    selectAllDownloading,
    selectAllSeeding,
    shortcuts: selectionShortcuts,
  };
}
