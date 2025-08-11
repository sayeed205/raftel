import { useNavigate } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import {
  
  createPlatformShortcut,
  useKeyboardShortcuts
} from './use-keyboard-shortcuts';
import type {KeyboardShortcut} from './use-keyboard-shortcuts';
import { useSidebar } from '@/components/ui/sidebar';

interface UseInterfaceShortcutsOptions {
  enabled?: boolean;
  onFocusSearch?: () => void;
}

/**
 * Hook for interface-related keyboard shortcuts
 * Handles sidebar toggle, settings navigation, and search focus
 */
export function useInterfaceShortcuts(
  options: UseInterfaceShortcutsOptions = {},
) {
  const { enabled = true, onFocusSearch } = options;
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();

  // Toggle sidebar
  const handleToggleSidebar = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  // Open settings/preferences
  const openSettings = useCallback(() => {
    navigate({ to: '/settings' });
  }, [navigate]);

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

  // Define interface shortcuts
  const interfaceShortcuts: Array<KeyboardShortcut> = useMemo(
    () => [
      createPlatformShortcut(
        'b',
        'Toggle Sidebar',
        'Navigation & Interface',
        handleToggleSidebar,
        { useCmd: true },
      ),
      createPlatformShortcut(
        ',',
        'Preferences/Settings',
        'Navigation & Interface',
        openSettings,
        { useCmd: true },
      ),
      createPlatformShortcut(
        'f',
        'Focus Search Box',
        'Navigation & Interface',
        focusSearch,
        { useCmd: true },
      ),
      {
        key: '/',
        action: focusSearch,
        description: 'Focus Search Box',
        category: 'Navigation & Interface',
        preventDefault: true,
      },
    ],
    [handleToggleSidebar, openSettings, focusSearch],
  );

  // Register shortcuts
  useKeyboardShortcuts(interfaceShortcuts, {
    enabled,
    ignoreInputFields: true,
  });

  return {
    handleToggleSidebar,
    openSettings,
    focusSearch,
    shortcuts: interfaceShortcuts,
  };
}
