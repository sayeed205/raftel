# Keyboard Shortcuts Integration Guide

This document shows how to integrate the keyboard shortcuts system into the Raftel application.

## Quick Integration

### 1. Add to Torrents Page

Update `raftel/src/features/torrents/index.tsx`:

```tsx
import { KeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help';
import { useTorrentsPageShortcuts } from './hooks/use-torrents-page-shortcuts';

export default function TorrentsPage() {
  // ... existing code ...

  // Add keyboard shortcuts
  const shortcuts = useTorrentsPageShortcuts({
    onRefresh: () => fetchTorrents(),
    onAddTorrent: () => setAddModalOpen(true),
  });

  // ... existing code ...

  return (
    <>
      <Header>
        <section className='flex items-center gap-4'>
          <div className='relative max-w-md flex-1'>
            <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
            <Input
              ref={shortcuts.searchInputRef} // Add ref for focus
              placeholder='Search torrents...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
        </section>
        <div className='ml-auto flex items-center gap-2'>
          {/* Add keyboard shortcuts help - follows shadcn Command conventions */}
          <KeyboardShortcutsHelp shortcuts={shortcuts.shortcuts} />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ... rest of existing code ... */}
    </>
  );
}
```

### 2. Add Floating Help Button (Alternative)

For a floating help button, add to any page:

```tsx
import { KeyboardShortcutsHelpButton } from '@/components/keyboard-shortcuts-help';
import { useTorrentKeyboardShortcuts } from '@/hooks/use-torrent-keyboard-shortcuts';

export default function SomePage() {
  const shortcuts = useTorrentKeyboardShortcuts();

  return (
    <div>
      {/* Your page content */}
      
      {/* Floating help button with command dialog */}
      <KeyboardShortcutsHelpButton shortcuts={shortcuts.shortcuts} />
    </div>
  );
}
```

### 3. Add Command Palette (Advanced)

For a full command palette experience:

```tsx
import { KeyboardShortcutsCommandPalette } from '@/components/keyboard-shortcuts-help';
import { useTorrentKeyboardShortcuts } from '@/hooks/use-torrent-keyboard-shortcuts';

export default function App() {
  const shortcuts = useTorrentKeyboardShortcuts();

  return (
    <div>
      {/* Your app content */}
      
      {/* Command palette - opens with Ctrl+K or Cmd+K */}
      <KeyboardShortcutsCommandPalette shortcuts={shortcuts.shortcuts} />
    </div>
  );
}
```

## Available Shortcuts

### Basic Actions
- `Ctrl+A` / `⌘+A` - Select All Torrents
- `Ctrl+Shift+R` / `⌘+Shift+R` - Resume All Torrents  
- `Ctrl+Shift+P` / `⌘+Shift+P` - Pause All Torrents

### Torrent Management
- `Ctrl+N` / `⌘+N` - Add New Torrent
- `Delete` - Delete Selected Torrent(s)
- `Ctrl+Shift+K` / `⌘+Shift+K` - Force Recheck
- `Ctrl+Shift+F` / `⌘+Shift+F` - Force Start
- `Ctrl+Space` / `⌘+Space` - Pause/Resume Selected

### Navigation & Interface
- `Ctrl+F` / `⌘+F` - Focus Search Box
- `Ctrl+R` / `⌘+R` - Refresh/Reload
- `Ctrl+B` / `⌘+B` - Toggle Sidebar
- `Ctrl+,` / `⌘+,` - Preferences/Settings

### Selection & Filtering
- `Ctrl+I` / `⌘+I` - Invert Selection
- `Ctrl+Shift+A` / `⌘+Shift+A` - Select All Finished
- `Ctrl+D` / `⌘+D` - Select All Downloading
- `Ctrl+S` / `⌘+S` - Select All Seeding
- `Home` - Go to Top of List
- `End` - Go to Bottom of List
- `↑` Arrow Key - Move Selection Up
- `↓` Arrow Key - Move Selection Down

### General
- `?` - Show keyboard shortcuts help
- `/` - Focus search input (alternative)

## Customization

### Custom Shortcuts

```tsx
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

const customShortcuts = [
  {
    key: 'x',
    ctrlKey: true,
    action: () => console.log('Custom action'),
    description: 'Custom action',
    category: 'Custom',
  },
];

useKeyboardShortcuts(customShortcuts);
```

### Disable Shortcuts

```tsx
const shortcuts = useTorrentKeyboardShortcuts({
  enabled: false, // Disable all shortcuts
});
```

### Context-Specific Shortcuts

```tsx
// Only enable shortcuts on specific pages
const isOnTorrentsPage = location.pathname.includes('/torrents');
const shortcuts = useTorrentKeyboardShortcuts({
  enabled: isOnTorrentsPage,
});
```

## Implementation Details

The keyboard shortcuts system consists of:

1. **Core Hook** (`use-keyboard-shortcuts.ts`) - Base functionality
2. **Navigation Hook** (`use-torrent-navigation.ts`) - J/K, arrows, Enter, Esc
3. **Actions Hook** (`use-torrent-actions.ts`) - Space, Delete, F5, Ctrl+R
4. **Selection Hook** (`use-torrent-selection.ts`) - Ctrl+A, Ctrl+D, bulk actions
5. **Combined Hook** (`use-torrent-keyboard-shortcuts.ts`) - All shortcuts together
6. **Help Component** (`keyboard-shortcuts-help.tsx`) - Help dialog
7. **Page Integration** (`use-torrents-page-shortcuts.ts`) - Page-specific integration

## Dialog Styles

The help dialog follows shadcn Command component conventions:

### Standard Help Dialog
```tsx
<KeyboardShortcutsHelp shortcuts={shortcuts} />
```

### Command Palette (Ctrl+K/Cmd+K)
```tsx
<KeyboardShortcutsCommandPalette shortcuts={shortcuts} />
```

### Floating Help Button
```tsx
<KeyboardShortcutsHelpButton shortcuts={shortcuts} />
```

## Features

- ✅ **Shadcn Command Component**: Follows official shadcn/ui conventions
- ✅ **Context Awareness**: Ignores input fields automatically
- ✅ **Proper Event Handling**: Clean setup and teardown
- ✅ **Searchable Interface**: Built-in search functionality
- ✅ **Categorized Display**: Organized by function with icons
- ✅ **Command Palette**: Ctrl+K/Cmd+K support
- ✅ **Keyboard Navigation**: Full keyboard accessibility
- ✅ **Visual Shortcuts**: Proper kbd styling for shortcuts
- ✅ **TypeScript Support**: Full type safety
- ✅ **Mobile Friendly**: Responsive design
- ✅ **Integration Ready**: Works with existing Zustand store
- ✅ **Router Support**: TanStack Router navigation