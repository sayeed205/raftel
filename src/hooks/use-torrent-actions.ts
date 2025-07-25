import { useTorrentStore } from '@/stores/torrent-store';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import {
  createPlatformShortcut,
  useKeyboardShortcuts,
  type KeyboardShortcut,
} from './use-keyboard-shortcuts';

interface UseTorrentActionsOptions {
  enabled?: boolean;
  onRefresh?: () => void;
  onAddTorrent?: () => void;
}

/**
 * Hook for torrent action shortcuts (Space, Delete, F5, Ctrl+R)
 * Handles pause/resume, delete, and refresh actions
 */
export function useTorrentActions(options: UseTorrentActionsOptions = {}) {
  const { enabled = true, onRefresh, onAddTorrent } = options;
  const navigate = useNavigate();

  const { fetchTorrents } = useTorrentStore();

  // Toggle pause/resume for selected torrent
  const togglePauseResume = useCallback(async () => {
    const {
      selectedTorrents,
      pauseTorrents,
      resumeTorrents,
      getTorrentByHash,
    } = useTorrentStore.getState();
    if (selectedTorrents.length === 0) return;

    try {
      // Get the first selected torrent to determine action
      const firstTorrent = getTorrentByHash(selectedTorrents[0]);
      if (!firstTorrent) return;

      // Determine if torrent is paused
      const isPaused = ['pausedDL', 'pausedUP'].includes(firstTorrent.state);

      if (isPaused) {
        await resumeTorrents(selectedTorrents);
      } else {
        await pauseTorrents(selectedTorrents);
      }
    } catch (error) {
      console.error('Failed to toggle pause/resume:', error);
    }
  }, []);

  // Delete selected torrents with confirmation
  const deleteSelectedTorrents = useCallback(async () => {
    const { selectedTorrents, deleteTorrents, getTorrentByHash } =
      useTorrentStore.getState();
    if (selectedTorrents.length === 0) return;

    const torrentNames = selectedTorrents
      .map((hash) => getTorrentByHash(hash)?.name)
      .filter(Boolean)
      .slice(0, 3); // Show max 3 names

    const displayNames =
      torrentNames.length > 3
        ? `${torrentNames.join(', ')} and ${selectedTorrents.length - 3} more`
        : torrentNames.join(', ');

    const confirmMessage =
      selectedTorrents.length === 1
        ? `Are you sure you want to delete "${displayNames}"?`
        : `Are you sure you want to delete ${selectedTorrents.length} torrents?\n\n${displayNames}`;

    if (window.confirm(confirmMessage)) {
      const deleteFiles = window.confirm(
        'Do you also want to delete the downloaded files?',
      );

      try {
        await deleteTorrents(selectedTorrents, deleteFiles);
      } catch (error) {
        console.error('Failed to delete torrents:', error);
        alert('Failed to delete torrents. Please try again.');
      }
    }
  }, []);

  // Refresh torrents data
  const refreshTorrents = useCallback(async () => {
    try {
      if (onRefresh) {
        onRefresh();
      } else {
        await fetchTorrents();
      }
    } catch (error) {
      console.error('Failed to refresh torrents:', error);
    }
  }, [fetchTorrents, onRefresh]);

  // Add new torrent
  const addNewTorrent = useCallback(() => {
    if (onAddTorrent) {
      onAddTorrent();
    }
  }, [onAddTorrent]);

  // Force recheck selected torrents
  const forceRecheck = useCallback(async () => {
    const { selectedTorrents, recheckTorrents } = useTorrentStore.getState();
    if (selectedTorrents.length === 0) return;

    try {
      await recheckTorrents(selectedTorrents);
    } catch (error) {
      console.error('Failed to recheck torrents:', error);
    }
  }, []);

  // Force start selected torrents
  const forceStart = useCallback(async () => {
    const { selectedTorrents } = useTorrentStore.getState();
    if (selectedTorrents.length === 0) return;

    try {
      // This would need to be implemented in the API
      console.log('Force start not yet implemented');
    } catch (error) {
      console.error('Failed to force start torrents:', error);
    }
  }, []);

  // Open settings/preferences
  const openSettings = useCallback(() => {
    navigate({ to: '/settings' });
  }, [navigate]);

  // Define action shortcuts
  const actionShortcuts: KeyboardShortcut[] = useMemo(
    () => [
      // Basic Actions
      createPlatformShortcut(
        ' ',
        'Pause/Resume Selected',
        'Torrent Management',
        togglePauseResume,
        { useCmd: true },
      ),
      createPlatformShortcut(
        'n',
        'Add New Torrent',
        'Torrent Management',
        addNewTorrent,
        { useCmd: true },
      ),
      {
        key: 'Delete',
        action: deleteSelectedTorrents,
        description: 'Delete Selected Torrent(s)',
        category: 'Torrent Management',
        preventDefault: true,
      },
      createPlatformShortcut(
        'k',
        'Force Recheck',
        'Torrent Management',
        forceRecheck,
        { useCmd: true, shiftKey: true },
      ),
      createPlatformShortcut(
        'f',
        'Force Start',
        'Torrent Management',
        forceStart,
        { useCmd: true, shiftKey: true },
      ),

      // Navigation & Interface
      createPlatformShortcut(
        'r',
        'Refresh/Reload',
        'Navigation & Interface',
        refreshTorrents,
        { useCmd: true },
      ),
      {
        key: 'F5',
        action: refreshTorrents,
        description: 'Refresh/Reload',
        category: 'Navigation & Interface',
        preventDefault: true,
      },
      createPlatformShortcut(
        ',',
        'Preferences/Settings',
        'Navigation & Interface',
        openSettings,
        { useCmd: true },
      ),
    ],
    [
      togglePauseResume,
      addNewTorrent,
      deleteSelectedTorrents,
      forceRecheck,
      forceStart,
      refreshTorrents,
      openSettings,
    ],
  );

  // Register shortcuts
  useKeyboardShortcuts(actionShortcuts, {
    enabled,
    ignoreInputFields: true,
  });

  return {
    togglePauseResume,
    deleteSelectedTorrents,
    refreshTorrents,
    addNewTorrent,
    forceRecheck,
    forceStart,
    openSettings,
    shortcuts: actionShortcuts,
  };
}
