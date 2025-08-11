import { useCallback, useEffect, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category: string;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  ignoreInputFields?: boolean;
  target?: HTMLElement | Document;
}

const DEFAULT_OPTIONS: UseKeyboardShortcutsOptions = {
  enabled: true,
  preventDefault: true,
  stopPropagation: true,
  ignoreInputFields: true,
  target: document,
};

/**
 * Hook for managing keyboard shortcuts with context awareness
 * Prevents conflicts with input fields and provides proper cleanup
 */
export function useKeyboardShortcuts(
  shortcuts: Array<KeyboardShortcut>,
  options: UseKeyboardShortcutsOptions = {},
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const shortcutsRef = useRef<Array<KeyboardShortcut>>([]);
  const enabledRef = useRef(opts.enabled);

  // Update refs when props change
  shortcutsRef.current = shortcuts;
  enabledRef.current = opts.enabled;

  const isInputElement = useCallback((element: Element): boolean => {
    const tagName = element.tagName.toLowerCase();
    const inputTypes = ['input', 'textarea', 'select'];

    if (inputTypes.includes(tagName)) {
      return true;
    }

    // Check for contenteditable
    if (element.getAttribute('contenteditable') === 'true') {
      return true;
    }

    // Check for role="textbox"
    if (element.getAttribute('role') === 'textbox') {
      return true;
    }

    return false;
  }, []);

  const matchesShortcut = useCallback(
    (event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
      // Normalize key comparison (handle case sensitivity)
      const eventKey = event.key.toLowerCase();
      const shortcutKey = shortcut.key.toLowerCase();

      // Handle special keys
      const keyMatches =
        eventKey === shortcutKey ||
        (shortcutKey === ' ' && event.code === 'Space') ||
        (shortcutKey === 'escape' && eventKey === 'escape') ||
        (shortcutKey === 'enter' && eventKey === 'enter') ||
        (shortcutKey === 'delete' && eventKey === 'delete') ||
        (shortcutKey === 'f5' && eventKey === 'f5') ||
        (shortcutKey === 'arrowup' && eventKey === 'arrowup') ||
        (shortcutKey === 'arrowdown' && eventKey === 'arrowdown') ||
        (shortcutKey === 'arrowleft' && eventKey === 'arrowleft') ||
        (shortcutKey === 'arrowright' && eventKey === 'arrowright');

      if (!keyMatches) {
        return false;
      }

      // Check modifier keys
      const ctrlMatches = (shortcut.ctrlKey || false) === event.ctrlKey;
      const shiftMatches = (shortcut.shiftKey || false) === event.shiftKey;
      const altMatches = (shortcut.altKey || false) === event.altKey;
      const metaMatches = (shortcut.metaKey || false) === event.metaKey;

      return ctrlMatches && shiftMatches && altMatches && metaMatches;
    },
    [],
  );

  const handleKeyDown = useCallback(
    (event: Event) => {
      // Cast to KeyboardEvent since we know this is a keydown event
      const keyboardEvent = event as KeyboardEvent;

      // Check if shortcuts are enabled
      if (!enabledRef.current) {
        return;
      }

      // Check if we should ignore input fields
      if (opts.ignoreInputFields && keyboardEvent.target instanceof Element) {
        if (isInputElement(keyboardEvent.target)) {
          return;
        }
      }

      // Find matching shortcut
      const matchingShortcut = shortcutsRef.current.find((shortcut) =>
        matchesShortcut(keyboardEvent, shortcut),
      );

      if (matchingShortcut) {
        // Handle preventDefault and stopPropagation
        const shouldPreventDefault =
          matchingShortcut.preventDefault ?? opts.preventDefault;
        const shouldStopPropagation =
          matchingShortcut.stopPropagation ?? opts.stopPropagation;

        if (shouldPreventDefault) {
          keyboardEvent.preventDefault();
        }

        if (shouldStopPropagation) {
          keyboardEvent.stopPropagation();
        }

        // Execute the action
        try {
          matchingShortcut.action();
        } catch (error) {
          console.error('Error executing keyboard shortcut:', error);
        }
      }
    },
    [
      opts.preventDefault,
      opts.stopPropagation,
      opts.ignoreInputFields,
      isInputElement,
      matchesShortcut,
    ],
  );

  useEffect(() => {
    const target = opts.target || document;

    if (target && opts.enabled) {
      target.addEventListener('keydown', handleKeyDown);

      return () => {
        target.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, opts.enabled, opts.target]);

  return {
    shortcuts: shortcutsRef.current,
    enabled: enabledRef.current,
  };
}

/**
 * Hook for managing a single keyboard shortcut
 */
export function useKeyboardShortcut(
  shortcut: Omit<KeyboardShortcut, 'description' | 'category'>,
  options: UseKeyboardShortcutsOptions = {},
) {
  const fullShortcut: KeyboardShortcut = {
    ...shortcut,
    description: '',
    category: 'General',
  };

  return useKeyboardShortcuts([fullShortcut], options);
}

/**
 * Detect the current platform
 */
export function getPlatform(): 'mac' | 'windows' | 'linux' {
  if (typeof window === 'undefined') return 'linux';

  const platform = window.navigator.platform.toLowerCase();
  const userAgent = window.navigator.userAgent.toLowerCase();

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'mac';
  } else if (platform.includes('win') || userAgent.includes('win')) {
    return 'windows';
  } else {
    return 'linux';
  }
}

/**
 * Check if the current platform is macOS
 */
export function isMac(): boolean {
  return getPlatform() === 'mac';
}

/**
 * Utility function to format shortcut key combination for display with platform awareness
 */
export function formatShortcutKey(shortcut: KeyboardShortcut): string {
  const parts: Array<string> = [];
  const platform = getPlatform();

  // Add modifier keys in the correct order for each platform
  if (platform === 'mac') {
    if (shortcut.ctrlKey) parts.push('⌃');
    if (shortcut.altKey) parts.push('⌥');
    if (shortcut.shiftKey) parts.push('⇧');
    if (shortcut.metaKey) parts.push('⌘');
  } else {
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.metaKey) parts.push('Win');
  }

  // Format the main key
  let key = shortcut.key;
  switch (key.toLowerCase()) {
    case ' ':
      key = 'Space';
      break;
    case 'arrowup':
      key = '↑';
      break;
    case 'arrowdown':
      key = '↓';
      break;
    case 'arrowleft':
      key = '←';
      break;
    case 'arrowright':
      key = '→';
      break;
    case 'escape':
      key = 'Esc';
      break;
    case 'enter':
      key = 'Enter';
      break;
    case 'delete':
      key = 'Del';
      break;
    case 'home':
      key = 'Home';
      break;
    case 'end':
      key = 'End';
      break;
    case ',':
      key = ',';
      break;
    case 'f5':
      key = 'F5';
      break;
    default:
      key = key.toUpperCase();
  }

  parts.push(key);

  // Use different separators for different platforms
  const separator = platform === 'mac' ? '' : ' + ';
  return parts.join(separator);
}

/**
 * Create platform-specific shortcut variants
 */
export function createPlatformShortcut(
  key: string,
  description: string,
  category: string,
  action: () => void,
  options: {
    useCmd?: boolean; // Use Cmd on Mac, Ctrl on Windows/Linux
    shiftKey?: boolean;
    altKey?: boolean;
  } = {},
): KeyboardShortcut {
  const { useCmd = false, shiftKey = false, altKey = false } = options;
  const platform = getPlatform();

  return {
    key,
    ctrlKey: useCmd && platform !== 'mac',
    metaKey: useCmd && platform === 'mac',
    shiftKey,
    altKey,
    action,
    description,
    category,
  };
}

/**
 * Utility function to group shortcuts by category
 */
export function groupShortcutsByCategory(
  shortcuts: Array<KeyboardShortcut>,
): Record<string, Array<KeyboardShortcut>> {
  return shortcuts.reduce(
    (groups, shortcut) => {
      const category = shortcut.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(shortcut);
      return groups;
    },
    {} as Record<string, Array<KeyboardShortcut>>,
  );
}
