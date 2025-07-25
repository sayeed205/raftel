'use client';

import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  formatShortcutKey,
  getPlatform,
  groupShortcutsByCategory,
  type KeyboardShortcut,
} from '@/hooks/use-keyboard-shortcuts';
import {
  Command as CommandIcon,
  HelpCircle,
  Keyboard,
  Layers,
  MousePointer,
  Navigation,
  Play,
  Search,
  Settings,
} from 'lucide-react';
import * as React from 'react';
const { useMemo } = React;

interface KeyboardShortcutsHelpProps {
  shortcuts?: KeyboardShortcut[];
  trigger?: React.ReactNode;
}

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  // Basic Actions
  {
    key: 'a',
    ctrlKey: true,
    description: 'Select All Torrents',
    category: 'Basic Actions',
    action: () => {},
  },
  {
    key: 'r',
    ctrlKey: true,
    shiftKey: true,
    description: 'Resume All Torrents',
    category: 'Basic Actions',
    action: () => {},
  },
  {
    key: 'p',
    ctrlKey: true,
    shiftKey: true,
    description: 'Pause All Torrents',
    category: 'Basic Actions',
    action: () => {},
  },

  // Torrent Management
  {
    key: 'n',
    ctrlKey: true,
    description: 'Add New Torrent',
    category: 'Torrent Management',
    action: () => {},
  },
  {
    key: 'Delete',
    description: 'Delete Selected Torrent(s)',
    category: 'Torrent Management',
    action: () => {},
  },
  {
    key: 'k',
    ctrlKey: true,
    shiftKey: true,
    description: 'Force Recheck',
    category: 'Torrent Management',
    action: () => {},
  },
  {
    key: 'f',
    ctrlKey: true,
    shiftKey: true,
    description: 'Force Start',
    category: 'Torrent Management',
    action: () => {},
  },
  {
    key: ' ',
    ctrlKey: true,
    description: 'Pause/Resume Selected',
    category: 'Torrent Management',
    action: () => {},
  },

  // Navigation & Interface
  {
    key: 'f',
    ctrlKey: true,
    description: 'Focus Search Box',
    category: 'Navigation & Interface',
    action: () => {},
  },
  {
    key: 'r',
    ctrlKey: true,
    description: 'Refresh/Reload',
    category: 'Navigation & Interface',
    action: () => {},
  },
  {
    key: 'b',
    ctrlKey: true,
    description: 'Toggle Sidebar',
    category: 'Navigation & Interface',
    action: () => {},
  },
  {
    key: ',',
    ctrlKey: true,
    description: 'Preferences/Settings',
    category: 'Navigation & Interface',
    action: () => {},
  },

  // Selection & Filtering
  {
    key: 'i',
    ctrlKey: true,
    description: 'Invert Selection',
    category: 'Selection & Filtering',
    action: () => {},
  },
  {
    key: 'a',
    ctrlKey: true,
    shiftKey: true,
    description: 'Select All Finished',
    category: 'Selection & Filtering',
    action: () => {},
  },
  {
    key: 'd',
    ctrlKey: true,
    description: 'Select All Downloading',
    category: 'Selection & Filtering',
    action: () => {},
  },
  {
    key: 's',
    ctrlKey: true,
    description: 'Select All Seeding',
    category: 'Selection & Filtering',
    action: () => {},
  },
  {
    key: 'Home',
    description: 'Go to Top of List',
    category: 'Selection & Filtering',
    action: () => {},
  },
  {
    key: 'End',
    description: 'Go to Bottom of List',
    category: 'Selection & Filtering',
    action: () => {},
  },
  {
    key: 'ArrowUp',
    description: 'Move Selection Up',
    category: 'Selection & Filtering',
    action: () => {},
  },
  {
    key: 'ArrowDown',
    description: 'Move Selection Down',
    category: 'Selection & Filtering',
    action: () => {},
  },

  // General
  {
    key: '?',
    description: 'Show keyboard shortcuts',
    category: 'General',
    action: () => {},
  },
];

// Category icons mapping
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Navigation':
      return <Navigation className='h-4 w-4' />;
    case 'Actions':
      return <Play className='h-4 w-4' />;
    case 'Selection':
      return <MousePointer className='h-4 w-4' />;
    case 'Bulk Actions':
      return <Layers className='h-4 w-4' />;
    case 'Search':
      return <Search className='h-4 w-4' />;
    case 'General':
      return <Settings className='h-4 w-4' />;
    default:
      return <CommandIcon className='h-4 w-4' />;
  }
};

export function KeyboardShortcutsHelp({
  shortcuts = DEFAULT_SHORTCUTS,
  trigger,
}: KeyboardShortcutsHelpProps) {
  const [open, setOpen] = React.useState(false);

  // Register keyboard shortcut to open help
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        e.key === '?' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        // Check if we're not in an input field
        const target = e.target as HTMLElement;
        const isInputField =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.contentEditable === 'true';

        if (!isInputField) {
          e.preventDefault();
          setOpen((open) => !open);
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Group shortcuts by category
  const groupedShortcuts = groupShortcutsByCategory(shortcuts);

  // Category order for consistent display
  const categoryOrder = [
    'General',
    'Basic Actions',
    'Torrent Management',
    'Navigation & Interface',
    'Selection & Filtering',
  ];

  // Sort categories according to preferred order
  const sortedCategories = categoryOrder.filter(
    (category) => groupedShortcuts[category]?.length > 0,
  );

  // Add any additional categories not in the predefined order
  Object.keys(groupedShortcuts).forEach((category) => {
    if (!categoryOrder.includes(category)) {
      sortedCategories.push(category);
    }
  });

  const defaultTrigger = (
    <Button variant='ghost' size='sm'>
      <HelpCircle className='mr-2 h-4 w-4' />
      Help
    </Button>
  );

  return (
    <>
      {/* Trigger button */}
      <div onClick={() => setOpen(true)}>{trigger || defaultTrigger}</div>

      {/* Help text */}
      <p className='text-muted-foreground hidden text-sm md:block'>
        Press{' '}
        <kbd className='bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none'>
          ?
        </kbd>{' '}
        for help
      </p>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder='Search keyboard shortcuts...' />
        <CommandList>
          <CommandEmpty>No shortcuts found.</CommandEmpty>

          {sortedCategories.map((category, categoryIndex) => (
            <React.Fragment key={category}>
              <CommandGroup heading={category}>
                {groupedShortcuts[category].map((shortcut, index) => (
                  <CommandItem
                    key={`${category}-${index}`}
                    value={`${shortcut.description} ${formatShortcutKey(shortcut)}`}
                  >
                    {getCategoryIcon(category)}
                    <span>{shortcut.description}</span>
                    <CommandShortcut>
                      {formatShortcutKey(shortcut)}
                    </CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
              {categoryIndex < sortedCategories.length - 1 && (
                <CommandSeparator />
              )}
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

/**
 * Floating help button component that can be placed anywhere
 */
export function KeyboardShortcutsHelpButton({
  shortcuts,
  className = 'fixed bottom-4 right-4 z-50',
}: KeyboardShortcutsHelpProps & { className?: string }) {
  return (
    <div className={className}>
      <KeyboardShortcutsHelp
        shortcuts={shortcuts}
        trigger={
          <Button
            variant='outline'
            size='icon'
            className='rounded-full shadow-lg transition-shadow hover:shadow-xl'
            title='Keyboard shortcuts (Press ? for help)'
          >
            <Keyboard className='h-4 w-4' />
          </Button>
        }
      />
    </div>
  );
}

/**
 * Header help button component for use in navigation headers
 */
export function KeyboardShortcutsHeaderButton({
  shortcuts,
  useCommandDialog = true,
}: KeyboardShortcutsHelpProps) {
  const shortcutText = React.useMemo(() => {
    const platform = getPlatform();
    return platform === 'mac' ? '⌘?' : 'Ctrl+?';
  }, []);

  return (
    <KeyboardShortcutsHelp
      shortcuts={shortcuts}
      useCommandDialog={useCommandDialog}
      trigger={
        <Button
          variant='ghost'
          size='sm'
          className='text-muted-foreground hover:text-foreground'
          title={`Keyboard shortcuts (${shortcutText})`}
        >
          <span className='mr-2'>Help</span>
          <kbd className='bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none'>
            {shortcutText}
          </kbd>
        </Button>
      }
    />
  );
}

/**
 * Command palette style shortcuts (fullscreen overlay)
 * Opens with Ctrl+K or Cmd+K
 */
export function KeyboardShortcutsCommandPalette({
  shortcuts = DEFAULT_SHORTCUTS,
}: {
  shortcuts?: KeyboardShortcut[];
}) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Group shortcuts by category
  const groupedShortcuts = groupShortcutsByCategory(shortcuts);

  // Category order for consistent display
  const categoryOrder = [
    'General',
    'Basic Actions',
    'Torrent Management',
    'Navigation & Interface',
    'Selection & Filtering',
  ];

  // Sort categories according to preferred order
  const sortedCategories = categoryOrder.filter(
    (category) => groupedShortcuts[category]?.length > 0,
  );

  // Add any additional categories not in the predefined order
  Object.keys(groupedShortcuts).forEach((category) => {
    if (!categoryOrder.includes(category)) {
      sortedCategories.push(category);
    }
  });

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Type a command or search shortcuts...' />
      <CommandList>
        <CommandEmpty>No shortcuts found.</CommandEmpty>

        {sortedCategories.map((category, categoryIndex) => (
          <React.Fragment key={category}>
            <CommandGroup heading={category}>
              {groupedShortcuts[category].map((shortcut, index) => (
                <CommandItem
                  key={`${category}-${index}`}
                  value={`${shortcut.description} ${formatShortcutKey(shortcut)}`}
                >
                  {getCategoryIcon(category)}
                  <span>{shortcut.description}</span>
                  <CommandShortcut>
                    {formatShortcutKey(shortcut)}
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
            {categoryIndex < sortedCategories.length - 1 && (
              <CommandSeparator />
            )}
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
