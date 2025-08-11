import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTorrentStore } from '@/stores/torrent-store';
import { useLocation, useNavigate } from '@tanstack/react-router';

import { useKeyboardShortcuts } from './use-keyboard-shortcuts';
import type { KeyboardShortcut } from './use-keyboard-shortcuts';

interface UseTorrentNavigationOptions {
  enabled?: boolean;
}

/**
 * Hook for torrent navigation shortcuts (J/K, Arrow keys, Enter, Escape)
 * Handles navigation between torrents and opening/closing details
 */
export function useTorrentNavigation(
  options: UseTorrentNavigationOptions = {}
) {
  const { enabled = true } = options;
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedTorrents, getFilteredTorrents } = useTorrentStore();

  const [focusedTorrentIndex, setFocusedTorrentIndex] = useState<number>(-1);

  // Get filtered torrents for navigation
  const filteredTorrents = getFilteredTorrents();

  // Update focused index when selection changes
  useEffect(() => {
    if (selectedTorrents.length === 1) {
      const selectedHash = selectedTorrents[0];
      const index = filteredTorrents.findIndex((t) => t.hash === selectedHash);
      setFocusedTorrentIndex(index);
    } else if (selectedTorrents.length === 0) {
      setFocusedTorrentIndex(-1);
    }
  }, [selectedTorrents, filteredTorrents]);

  // Navigation functions
  const selectNext = useCallback(() => {
    const { getFilteredTorrents, selectTorrent } = useTorrentStore.getState();
    const currentFilteredTorrents = getFilteredTorrents();
    if (currentFilteredTorrents.length === 0) return;

    setFocusedTorrentIndex((prevIndex) => {
      const nextIndex =
        prevIndex < currentFilteredTorrents.length - 1 ? prevIndex + 1 : 0; // Wrap to first

      selectTorrent(currentFilteredTorrents[nextIndex].hash);
      return nextIndex;
    });
  }, []);

  const selectPrevious = useCallback(() => {
    const { getFilteredTorrents, selectTorrent } = useTorrentStore.getState();
    const currentFilteredTorrents = getFilteredTorrents();
    if (currentFilteredTorrents.length === 0) return;

    setFocusedTorrentIndex((prevIndex) => {
      const newIndex =
        prevIndex > 0 ? prevIndex - 1 : currentFilteredTorrents.length - 1; // Wrap to last

      selectTorrent(currentFilteredTorrents[newIndex].hash);
      return newIndex;
    });
  }, []);

  const openDetails = useCallback(() => {
    const { selectedTorrents, selectTorrent, getFilteredTorrents } =
      useTorrentStore.getState();

    if (selectedTorrents.length === 1) {
      const selectedHash = selectedTorrents[0];
      navigate({
        to: '/torrents/$hash',
        params: { hash: selectedHash },
        search: { tab: undefined },
      });
    } else {
      const currentFilteredTorrents = getFilteredTorrents();
      if (
        focusedTorrentIndex >= 0 &&
        currentFilteredTorrents[focusedTorrentIndex]
      ) {
        const torrent = currentFilteredTorrents[focusedTorrentIndex];
        selectTorrent(torrent.hash);
        navigate({
          to: '/torrents/$hash',
          params: { hash: torrent.hash },
          search: { tab: undefined },
        });
      }
    }
  }, [navigate, focusedTorrentIndex]);

  const closeDetails = useCallback(() => {
    // Check if we're currently on a torrent detail page
    const isOnDetailPage =
      location.pathname.includes('/torrents/') &&
      location.pathname !== '/torrents/';

    if (isOnDetailPage) {
      navigate({ to: '/torrents' });
    }
  }, [location.pathname, navigate]);

  // Initialize focused index if no selection but torrents exist
  useEffect(() => {
    const currentFilteredTorrents = getFilteredTorrents();
    if (
      currentFilteredTorrents.length > 0 &&
      focusedTorrentIndex === -1 &&
      selectedTorrents.length === 0
    ) {
      setFocusedTorrentIndex(0);
    }
  }, [getFilteredTorrents, focusedTorrentIndex, selectedTorrents.length]);

  // Define navigation shortcuts
  const navigationShortcuts: Array<KeyboardShortcut> = useMemo(
    () => [
      {
        key: 'ArrowDown',
        action: selectNext,
        description: 'Move selection down',
        category: 'Navigation',
      },
      {
        key: 'ArrowUp',
        action: selectPrevious,
        description: 'Move selection up',
        category: 'Navigation',
      },
      {
        key: 'Home',
        action: () => {
          const { getFilteredTorrents, selectTorrent } =
            useTorrentStore.getState();
          const currentFilteredTorrents = getFilteredTorrents();
          if (currentFilteredTorrents.length > 0) {
            setFocusedTorrentIndex(0);
            selectTorrent(currentFilteredTorrents[0].hash);
          }
        },
        description: 'Go to top of list',
        category: 'Navigation',
      },
      {
        key: 'End',
        action: () => {
          const { getFilteredTorrents, selectTorrent } =
            useTorrentStore.getState();
          const currentFilteredTorrents = getFilteredTorrents();
          if (currentFilteredTorrents.length > 0) {
            const lastIndex = currentFilteredTorrents.length - 1;
            setFocusedTorrentIndex(lastIndex);
            selectTorrent(currentFilteredTorrents[lastIndex].hash);
          }
        },
        description: 'Go to bottom of list',
        category: 'Navigation',
      },
      {
        key: 'Enter',
        action: openDetails,
        description: 'Open torrent details',
        category: 'Navigation',
      },
      {
        key: 'Escape',
        action: closeDetails,
        description: 'Close torrent details',
        category: 'Navigation',
      },
    ],
    [selectNext, selectPrevious, openDetails, closeDetails]
  );

  // Register shortcuts
  useKeyboardShortcuts(navigationShortcuts, {
    enabled,
    ignoreInputFields: true,
  });

  return {
    focusedTorrentIndex,
    selectNext,
    selectPrevious,
    openDetails,
    closeDetails,
    shortcuts: navigationShortcuts,
  };
}
