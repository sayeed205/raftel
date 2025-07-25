import { useMemo } from 'react';
import { useInterfaceShortcuts } from './use-interface-shortcuts';
import type { KeyboardShortcut } from './use-keyboard-shortcuts';
import { useTorrentActions } from './use-torrent-actions';
import { useTorrentNavigation } from './use-torrent-navigation';
import { useTorrentSelection } from './use-torrent-selection';

interface UseTorrentKeyboardShortcutsOptions {
  enabled?: boolean;
  onRefresh?: () => void;
  onFocusSearch?: () => void;
  onAddTorrent?: () => void;
}

/**
 * Comprehensive hook that combines all torrent-related keyboard shortcuts
 * Provides navigation, actions, selection, and bulk operations
 */
export function useTorrentKeyboardShortcuts(
  options: UseTorrentKeyboardShortcutsOptions = {},
) {
  const { enabled = true, onRefresh, onFocusSearch, onAddTorrent } = options;

  // Initialize all shortcut hooks
  const navigation = useTorrentNavigation({ enabled });
  const actions = useTorrentActions({ enabled, onRefresh, onAddTorrent });
  const selection = useTorrentSelection({ enabled, onFocusSearch });
  const interfaceShortcuts = useInterfaceShortcuts({ enabled, onFocusSearch });

  // Combine all shortcuts for help dialog
  const allShortcuts: KeyboardShortcut[] = useMemo(() => {
    return [
      ...navigation.shortcuts,
      ...actions.shortcuts,
      ...selection.shortcuts,
      ...interfaceShortcuts.shortcuts,
    ];
  }, [
    navigation.shortcuts,
    actions.shortcuts,
    selection.shortcuts,
    interfaceShortcuts.shortcuts,
  ]);

  return {
    // Navigation functions
    navigation: {
      selectNext: navigation.selectNext,
      selectPrevious: navigation.selectPrevious,
      openDetails: navigation.openDetails,
      closeDetails: navigation.closeDetails,
      focusedTorrentIndex: navigation.focusedTorrentIndex,
    },

    // Action functions
    actions: {
      togglePauseResume: actions.togglePauseResume,
      deleteSelectedTorrents: actions.deleteSelectedTorrents,
      refreshTorrents: actions.refreshTorrents,
      addNewTorrent: actions.addNewTorrent,
      forceRecheck: actions.forceRecheck,
      forceStart: actions.forceStart,
      openSettings: actions.openSettings,
    },

    // Selection functions
    selection: {
      selectAll: selection.selectAll,
      deselectAll: selection.deselectAll,
      bulkPause: selection.bulkPause,
      bulkResume: selection.bulkResume,
      focusSearch: selection.focusSearch,
      invertSelection: selection.invertSelection,
      selectAllFinished: selection.selectAllFinished,
      selectAllDownloading: selection.selectAllDownloading,
      selectAllSeeding: selection.selectAllSeeding,
    },

    // Interface functions
    interface: {
      handleToggleSidebar: interfaceShortcuts.handleToggleSidebar,
      openSettings: interfaceShortcuts.openSettings,
      focusSearch: interfaceShortcuts.focusSearch,
    },

    // All shortcuts for help dialog
    shortcuts: allShortcuts,

    // Utility
    enabled,
  };
}
