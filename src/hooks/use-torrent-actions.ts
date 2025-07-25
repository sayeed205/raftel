import { torrentToast } from '@/lib/utils/toast';
import { useTorrentStore } from '@/stores/torrent-store';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import {
  createPlatformShortcut,
  type KeyboardShortcut,
  useKeyboardShortcuts,
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
        torrentToast.actionSuccess('resume', selectedTorrents.length);
      } else {
        await pauseTorrents(selectedTorrents);
        torrentToast.actionSuccess('pause', selectedTorrents.length);
      }
    } catch (error) {
      const action = ['pausedDL', 'pausedUP'].includes(
        getTorrentByHash(selectedTorrents[0])?.state || '',
      )
        ? 'resume'
        : 'pause';
      torrentToast.actionError(
        action,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }, []);

  // Delete selected torrents with confirmation
  // Note: This function now just triggers the delete action
  // The actual confirmation dialog should be handled by the UI component
  const deleteSelectedTorrents = useCallback(async () => {
    const { selectedTorrents } = useTorrentStore.getState();
    if (selectedTorrents.length === 0) return;

    // This will be handled by the UI component with proper confirmation dialogs
    // The actual deletion logic is in the main torrents component
    console.log('Delete action triggered for:', selectedTorrents);
  }, []);

  // Refresh torrents data
  const refreshTorrents = useCallback(async () => {
    try {
      if (onRefresh) {
        onRefresh();
      } else {
        await fetchTorrents();
      }
      torrentToast.syncSuccess();
    } catch (error) {
      torrentToast.syncError(
        error instanceof Error ? error.message : 'Unknown error',
        () => refreshTorrents(),
      );
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
      torrentToast.actionSuccess('recheck', selectedTorrents.length);
    } catch (error) {
      torrentToast.actionError(
        'recheck',
        error instanceof Error ? error.message : 'Unknown error',
      );
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
