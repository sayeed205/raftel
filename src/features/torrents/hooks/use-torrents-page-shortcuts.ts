import { useTorrentKeyboardShortcuts } from '@/hooks/use-torrent-keyboard-shortcuts';
import { useCallback, useRef } from 'react';

interface UseTorrentsPageShortcutsOptions {
  onRefresh?: () => void;
  onAddTorrent?: () => void;
  enabled?: boolean;
}

/**
 * Hook specifically for the torrents page that integrates keyboard shortcuts
 * with the page's specific functionality
 */
export function useTorrentsPageShortcuts(
  options: UseTorrentsPageShortcutsOptions = {},
) {
  const { onRefresh, onAddTorrent, enabled = true } = options;
  // Note: We could use setSearchQuery from useTorrentStore if needed for search functionality
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Custom refresh handler
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // Custom add torrent handler
  const handleAddTorrent = useCallback(() => {
    if (onAddTorrent) {
      onAddTorrent();
    }
  }, [onAddTorrent]);

  // Custom search focus handler
  const handleFocusSearch = useCallback(() => {
    // Try to focus the search input using ref first
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
      return;
    }

    // Fallback to querySelector
    const searchInput = document.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  // Initialize keyboard shortcuts
  const shortcuts = useTorrentKeyboardShortcuts({
    enabled,
    onRefresh: handleRefresh,
    onFocusSearch: handleFocusSearch,
    onAddTorrent: handleAddTorrent,
  });

  return {
    ...shortcuts,
    searchInputRef,
    handleFocusSearch,
  };
}
