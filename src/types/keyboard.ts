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
    shortcuts: KeyboardShortcut[];
}

export interface KeyboardShortcutConfig {
    navigation: KeyboardShortcut[];
    actions: KeyboardShortcut[];
    selection: KeyboardShortcut[];
    search: KeyboardShortcut[];
    general: KeyboardShortcut[];
    bulkActions: KeyboardShortcut[];
}

export type ShortcutCategory =
    | 'Navigation'
    | 'Actions'
    | 'Selection'
    | 'Search'
    | 'General'
    | 'Bulk Actions';