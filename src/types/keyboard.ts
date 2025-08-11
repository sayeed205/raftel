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

export interface KeyboardShortcutGroup {
  category: string;
  shortcuts: Array<KeyboardShortcut>;
}

export interface KeyboardShortcutConfig {
  navigation: Array<KeyboardShortcut>;
  actions: Array<KeyboardShortcut>;
  selection: Array<KeyboardShortcut>;
  search: Array<KeyboardShortcut>;
  general: Array<KeyboardShortcut>;
  bulkActions: Array<KeyboardShortcut>;
}

export type ShortcutCategory =
  | 'Navigation'
  | 'Actions'
  | 'Selection'
  | 'Search'
  | 'General'
  | 'Bulk Actions';
