import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QBittorrentPreferences } from '@/types/api';
import qbit from '@/services/qbit';

// WebUI specific settings that are stored locally
export interface WebUISettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  compactMode: boolean;
  showAdvancedSettings: boolean;
  autoRefreshInterval: number;
  torrentTableColumns: Array<string>;
  torrentTableSortBy: string;
  torrentTableSortOrder: 'asc' | 'desc';
  confirmDeletion: boolean;
  showNotifications: boolean;
  soundNotifications: boolean;
  desktopNotifications: boolean;
}

// Default WebUI settings
const defaultWebUISettings: WebUISettings = {
  theme: 'system',
  language: 'en',
  compactMode: false,
  showAdvancedSettings: false,
  autoRefreshInterval: 2000,
  torrentTableColumns: ['name', 'size', 'progress', 'status', 'speed', 'eta'],
  torrentTableSortBy: 'name',
  torrentTableSortOrder: 'asc',
  confirmDeletion: true,
  showNotifications: true,
  soundNotifications: false,
  desktopNotifications: true,
};

// Settings validation errors
export interface SettingsValidationError {
  field: string;
  message: string;
}

interface SettingsState {
  // qBittorrent preferences
  preferences: QBittorrentPreferences | null;

  // WebUI settings
  webUISettings: WebUISettings;

  // State management
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  error: string | null;
  validationErrors: Array<SettingsValidationError>;

  // Change tracking
  pendingChanges: Partial<QBittorrentPreferences>;
  lastSaved: number | null;
}

interface SettingsActions {
  // Preferences management
  fetchPreferences: () => Promise<void>;
  updatePreferences: (prefs: Partial<QBittorrentPreferences>) => Promise<void>;
  setPendingChange: (key: keyof QBittorrentPreferences, value: any) => void;
  discardChanges: () => void;
  saveChanges: () => Promise<void>;

  // WebUI settings management
  updateWebUISettings: (settings: Partial<WebUISettings>) => void;
  resetWebUISettings: () => void;

  // Validation
  validatePreferences: (
    prefs: Partial<QBittorrentPreferences>,
  ) => Array<SettingsValidationError>;
  clearValidationErrors: () => void;

  // Import/Export
  exportSettings: () => string;
  importSettings: (settingsJson: string) => Promise<void>;

  // Reset functionality
  resetToDefaults: () => Promise<void>;
  resetPreferences: () => Promise<void>;

  // Utility
  clearError: () => void;
  refreshSettings: () => Promise<void>;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      preferences: null,
      webUISettings: defaultWebUISettings,
      isLoading: false,
      isSaving: false,
      isDirty: false,
      error: null,
      validationErrors: [],
      pendingChanges: {},
      lastSaved: null,

      // Preferences management
      fetchPreferences: async () => {
        const state = get();
        if (state.isLoading) return;

        set({ isLoading: true, error: null });

        try {
          const preferences = await qbit.getPreferences();
          set({
            preferences,
            isLoading: false,
            pendingChanges: {},
            isDirty: false,
            validationErrors: [],
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to fetch preferences';
          set({
            isLoading: false,
            error: message,
          });
          throw error;
        }
      },

      updatePreferences: async (prefs: Partial<QBittorrentPreferences>) => {
        const state = get();
        set({ isSaving: true, error: null });

        try {
          // Validate before saving
          const validationErrors = state.validatePreferences(prefs);
          if (validationErrors.length > 0) {
            set({ validationErrors, isSaving: false });
            throw new Error('Validation failed');
          }

          await qbit.setPreferences(prefs);

          // Refresh preferences to get the updated values
          await state.fetchPreferences();

          set({
            isSaving: false,
            isDirty: false,
            pendingChanges: {},
            lastSaved: Date.now(),
            validationErrors: [],
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to update preferences';
          set({
            isSaving: false,
            error: message,
          });
          throw error;
        }
      },

      setPendingChange: (key: keyof QBittorrentPreferences, value: any) => {
        const state = get();
        const newPendingChanges = { ...state.pendingChanges, [key]: value };

        set({
          pendingChanges: newPendingChanges,
          isDirty: Object.keys(newPendingChanges).length > 0,
          validationErrors: [], // Clear validation errors when user makes changes
        });
      },

      discardChanges: () => {
        set({
          pendingChanges: {},
          isDirty: false,
          validationErrors: [],
        });
      },

      saveChanges: async () => {
        const state = get();
        if (Object.keys(state.pendingChanges).length === 0) return;

        await state.updatePreferences(state.pendingChanges);
      },

      // WebUI settings management
      updateWebUISettings: (settings: Partial<WebUISettings>) => {
        const state = get();
        const newSettings = { ...state.webUISettings, ...settings };
        set({ webUISettings: newSettings });
      },

      resetWebUISettings: () => {
        set({ webUISettings: defaultWebUISettings });
      },

      // Validation
      validatePreferences: (
        prefs: Partial<QBittorrentPreferences>,
      ): Array<SettingsValidationError> => {
        const errors: Array<SettingsValidationError> = [];

        // Port validation
        if (prefs.listen_port !== undefined) {
          if (prefs.listen_port < 1 || prefs.listen_port > 65535) {
            errors.push({
              field: 'listen_port',
              message: 'Port must be between 1 and 65535',
            });
          }
        }

        // Web UI port validation
        if (prefs.web_ui_port !== undefined) {
          if (prefs.web_ui_port < 1 || prefs.web_ui_port > 65535) {
            errors.push({
              field: 'web_ui_port',
              message: 'Web UI port must be between 1 and 65535',
            });
          }
        }

        // Speed limit validation
        if (prefs.dl_limit !== undefined && prefs.dl_limit < 0) {
          errors.push({
            field: 'dl_limit',
            message: 'Download limit cannot be negative',
          });
        }

        if (prefs.up_limit !== undefined && prefs.up_limit < 0) {
          errors.push({
            field: 'up_limit',
            message: 'Upload limit cannot be negative',
          });
        }

        // Connection limits validation
        if (prefs.max_connec !== undefined && prefs.max_connec < 0) {
          errors.push({
            field: 'max_connec',
            message: 'Maximum connections cannot be negative',
          });
        }

        if (
          prefs.max_connec_per_torrent !== undefined &&
          prefs.max_connec_per_torrent < 0
        ) {
          errors.push({
            field: 'max_connec_per_torrent',
            message: 'Maximum connections per torrent cannot be negative',
          });
        }

        // Path validation
        if (prefs.save_path !== undefined && prefs.save_path.trim() === '') {
          errors.push({
            field: 'save_path',
            message: 'Save path cannot be empty',
          });
        }

        // Ratio validation
        if (prefs.max_ratio !== undefined && prefs.max_ratio < 0) {
          errors.push({
            field: 'max_ratio',
            message: 'Maximum ratio cannot be negative',
          });
        }

        // Seeding time validation
        if (
          prefs.max_seeding_time !== undefined &&
          prefs.max_seeding_time < 0
        ) {
          errors.push({
            field: 'max_seeding_time',
            message: 'Maximum seeding time cannot be negative',
          });
        }

        return errors;
      },

      clearValidationErrors: () => {
        set({ validationErrors: [] });
      },

      // Import/Export
      exportSettings: (): string => {
        const state = get();
        const exportData = {
          preferences: state.preferences,
          webUISettings: state.webUISettings,
          exportedAt: new Date().toISOString(),
          version: '1.0',
          exportedBy: 'Raftel qBittorrent WebUI',
        };
        return JSON.stringify(exportData, null, 2);
      },

      importSettings: async (settingsJson: string) => {
        set({ isLoading: true, error: null });

        try {
          const importData = JSON.parse(settingsJson);

          // Validate import data structure
          if (!importData.preferences && !importData.webUISettings) {
            throw new Error(
              'Invalid settings file: No preferences or WebUI settings found',
            );
          }

          // Validate version compatibility
          if (importData.version && importData.version !== '1.0') {
            console.warn(
              `Settings file version ${importData.version} may not be fully compatible`,
            );
          }

          // Import WebUI settings if present
          if (importData.webUISettings) {
            const state = get();

            // Validate WebUI settings structure
            const validWebUIKeys = Object.keys(defaultWebUISettings);
            const filteredWebUISettings: Partial<WebUISettings> = {};

            Object.entries(importData.webUISettings).forEach(([key, value]) => {
              if (validWebUIKeys.includes(key)) {
                (filteredWebUISettings as any)[key] = value;
              }
            });

            state.updateWebUISettings(filteredWebUISettings);
          }

          // Import qBittorrent preferences if present
          if (importData.preferences) {
            const state = get();

            // Validate preferences before importing
            const validationErrors = state.validatePreferences(
              importData.preferences,
            );
            if (validationErrors.length > 0) {
              throw new Error(
                `Invalid preferences: ${validationErrors.map((e) => e.message).join(', ')}`,
              );
            }

            await state.updatePreferences(importData.preferences);
          }

          set({ isLoading: false });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to import settings';
          set({
            isLoading: false,
            error: message,
          });
          throw error;
        }
      },

      // Reset functionality
      resetToDefaults: async () => {
        const state = get();
        await state.resetPreferences();
        state.resetWebUISettings();
      },

      resetPreferences: async () => {
        set({ isLoading: true, error: null });

        try {
          // Since qBittorrent doesn't have a built-in reset API,
          // we'll need to set default values manually
          const defaultPreferences: Partial<QBittorrentPreferences> = {
            // Core defaults - these should match qBittorrent's defaults
            save_path: '',
            temp_path_enabled: false,
            temp_path: '',
            auto_tmm_enabled: false,
            start_paused_enabled: false,
            dl_limit: 0,
            up_limit: 0,
            max_connec: 200,
            max_connec_per_torrent: 100,
            max_uploads_per_torrent: 4,
            max_uploads: 20,
            listen_port: 8999,
            upnp: true,
            random_port: false,
            dht: true,
            pex: true,
            lsd: true,
            max_active_downloads: 3,
            max_active_uploads: 3,
            max_active_torrents: 5,
            max_ratio_enabled: false,
            max_ratio: -1,
            max_seeding_time_enabled: false,
            max_seeding_time: -1,
            web_ui_port: 8080,
            web_ui_address: '*',
            web_ui_username: 'admin',
            // Note: We don't reset password for security reasons
          };

          await get().updatePreferences(defaultPreferences);

          set({
            isLoading: false,
            pendingChanges: {},
            isDirty: false,
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to reset preferences';
          set({
            isLoading: false,
            error: message,
          });
          throw error;
        }
      },

      // Utility
      clearError: () => {
        set({ error: null });
      },

      refreshSettings: async () => {
        await get().fetchPreferences();
      },
    }),
    {
      name: 'raftel-settings',
      partialize: (state) => ({
        // Only persist WebUI settings, not qBittorrent preferences
        webUISettings: state.webUISettings,
      }),
      version: 1,
    },
  ),
);

// Selector hooks for convenience
export const useSettings = () => {
  const {
    preferences,
    webUISettings,
    isLoading,
    isSaving,
    isDirty,
    error,
    validationErrors,
    pendingChanges,
  } = useSettingsStore();
  return {
    preferences,
    webUISettings,
    isLoading,
    isSaving,
    isDirty,
    error,
    validationErrors,
    pendingChanges,
  };
};

export const useSettingsActions = () => {
  const {
    fetchPreferences,
    updatePreferences,
    setPendingChange,
    discardChanges,
    saveChanges,
    updateWebUISettings,
    resetWebUISettings,
    validatePreferences,
    clearValidationErrors,
    exportSettings,
    importSettings,
    resetToDefaults,
    resetPreferences,
    clearError,
    refreshSettings,
  } = useSettingsStore();

  return {
    fetchPreferences,
    updatePreferences,
    setPendingChange,
    discardChanges,
    saveChanges,
    updateWebUISettings,
    resetWebUISettings,
    validatePreferences,
    clearValidationErrors,
    exportSettings,
    importSettings,
    resetToDefaults,
    resetPreferences,
    clearError,
    refreshSettings,
  };
};
