import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Log, LogFilter, PeerLog, SystemInfo } from '@/types/logs';
import type { LogType } from '@/types/qbit/constants';
import qbApi from '@/lib/api';
import qbit from '@/services/qbit';

interface LogState {
  // Main logs
  logs: Array<Log>;
  lastLogId: number;

  // Peer logs
  peerLogs: Array<PeerLog>;
  lastPeerLogId: number;

  // System information
  systemInfo: SystemInfo | null;

  // Settings and filters
  logLevel: LogType;
  autoRefresh: boolean;
  refreshInterval: number;
  maxLogsInMemory: number;

  // Filtering
  filter: LogFilter;

  // UI state
  isLoading: boolean;
  isLoadingPeerLogs: boolean;
  isLoadingSystemInfo: boolean;
  error: string | null;
  lastUpdate: number;

  // Auto-refresh timer
  refreshTimer: NodeJS.Timeout | null;
}

interface LogActions {
  // Main log operations
  fetchLogs: (lastKnownId?: number) => Promise<void>;
  clearLogs: () => void;

  // Peer log operations
  fetchPeerLogs: (lastKnownId?: number) => Promise<void>;
  clearPeerLogs: () => void;

  // System info operations
  fetchSystemInfo: () => Promise<void>;

  // Settings
  setLogLevel: (level: LogType) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  setMaxLogsInMemory: (max: number) => void;

  // Filtering
  setFilter: (filter: Partial<LogFilter>) => void;
  clearFilter: () => void;
  getFilteredLogs: () => Array<Log>;
  getFilteredPeerLogs: () => Array<PeerLog>;

  // Auto-refresh management
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;

  // Export functionality
  exportLogs: (format: 'json' | 'csv' | 'txt') => string;
  exportPeerLogs: (format: 'json' | 'csv' | 'txt') => string;

  // Utility
  clearError: () => void;
  trimLogsToLimit: () => void;
}

type LogStore = LogState & LogActions;

const defaultFilter: LogFilter = {
  levels: [],
  messageFilter: '',
  componentFilter: '',
};

export const useLogStore = create<LogStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    logs: [],
    lastLogId: -1,
    peerLogs: [],
    lastPeerLogId: -1,
    systemInfo: null,
    logLevel: 15, // LogType.ALL
    autoRefresh: false,
    refreshInterval: 5000, // 5 seconds
    maxLogsInMemory: 1000,
    filter: defaultFilter,
    isLoading: false,
    isLoadingPeerLogs: false,
    isLoadingSystemInfo: false,
    error: null,
    lastUpdate: 0,
    refreshTimer: null,

    // Main log operations
    fetchLogs: async (lastKnownId) => {
      try {
        set({ isLoading: true, error: null });
        const state = get();
        const id = lastKnownId !== undefined ? lastKnownId : state.lastLogId;

        const logs = await qbit.getLogs(
          id === -1 ? undefined : id,
          state.logLevel,
        );

        if (logs.length > 0) {
          const currentLogs = get().logs;
          const newLogs = [...currentLogs, ...logs];

          // Update last log ID
          const maxId = Math.max(...logs.map((log) => log.id));

          set({
            logs: newLogs,
            lastLogId: maxId,
            isLoading: false,
            lastUpdate: Date.now(),
          });

          // Trim logs if needed
          get().trimLogsToLimit();
        } else {
          set({ isLoading: false });
        }
      } catch (error) {
        console.error('Failed to fetch logs:', error);
        const message =
          error instanceof Error ? error.message : 'Failed to fetch logs';
        set({
          error: message,
          isLoading: false,
        });
      }
    },

    clearLogs: () => {
      set({
        logs: [],
        lastLogId: -1,
      });
    },

    // Peer log operations
    fetchPeerLogs: async (lastKnownId) => {
      try {
        set({ isLoadingPeerLogs: true, error: null });
        const state = get();
        const id =
          lastKnownId !== undefined ? lastKnownId : state.lastPeerLogId;

        const peerLogs = await qbit.getPeerLogs(id === -1 ? undefined : id);

        if (peerLogs.length > 0) {
          const currentPeerLogs = get().peerLogs;
          const newPeerLogs = [...currentPeerLogs, ...peerLogs];

          // Update last peer log ID
          const maxId = Math.max(...peerLogs.map((log) => log.id));

          set({
            peerLogs: newPeerLogs,
            lastPeerLogId: maxId,
            isLoadingPeerLogs: false,
            lastUpdate: Date.now(),
          });

          // Trim peer logs if needed
          const { maxLogsInMemory } = get();
          if (newPeerLogs.length > maxLogsInMemory) {
            const trimmedPeerLogs = newPeerLogs.slice(-maxLogsInMemory);
            set({ peerLogs: trimmedPeerLogs });
          }
        } else {
          set({ isLoadingPeerLogs: false });
        }
      } catch (error) {
        console.error('Failed to fetch peer logs:', error);
        const message =
          error instanceof Error ? error.message : 'Failed to fetch peer logs';
        set({
          error: message,
          isLoadingPeerLogs: false,
        });
      }
    },

    clearPeerLogs: () => {
      set({
        peerLogs: [],
        lastPeerLogId: -1,
      });
    },

    // System info operations
    fetchSystemInfo: async () => {
      try {
        set({ isLoadingSystemInfo: true, error: null });

        // Get various system information from different API endpoints
        const [serverState, version] = await Promise.all([
          qbApi.getServerState(),
          qbit.getVersion(),
        ]);

        const systemInfo: SystemInfo = {
          version: version || 'Unknown',
          buildInfo: 'Build info not available',
          uptime: Date.now() / 1000, // Approximate uptime
          totalSize: serverState.free_space_on_disk || 0,
          freeSpace: serverState.free_space_on_disk || 0,
          dlInfoSpeed: serverState.dl_info_speed || 0,
          dlInfoData: serverState.dl_info_data || 0,
          upInfoSpeed: serverState.up_info_speed || 0,
          upInfoData: serverState.up_info_data || 0,
          dlRateLimit: serverState.dl_rate_limit || 0,
          upRateLimit: serverState.up_rate_limit || 0,
          dhtNodes: serverState.dht_nodes || 0,
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          connectionStatus: serverState.connection_status || 'unknown',
        };

        set({
          systemInfo,
          isLoadingSystemInfo: false,
          lastUpdate: Date.now(),
        });
      } catch (error) {
        console.error('Failed to fetch system info:', error);
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to fetch system info';
        set({
          error: message,
          isLoadingSystemInfo: false,
        });
      }
    },

    // Settings
    setLogLevel: (level) => {
      set({ logLevel: level });
      // Refetch logs with new level
      get().fetchLogs();
    },

    setAutoRefresh: (enabled) => {
      set({ autoRefresh: enabled });
      if (enabled) {
        get().startAutoRefresh();
      } else {
        get().stopAutoRefresh();
      }
    },

    setRefreshInterval: (interval) => {
      set({ refreshInterval: interval });
      // Restart auto-refresh with new interval if it's currently running
      const { autoRefresh } = get();
      if (autoRefresh) {
        get().stopAutoRefresh();
        get().startAutoRefresh();
      }
    },

    setMaxLogsInMemory: (max) => {
      set({ maxLogsInMemory: max });
      get().trimLogsToLimit();
    },

    // Filtering
    setFilter: (newFilter) => {
      const { filter } = get();
      set({
        filter: {
          ...filter,
          ...newFilter,
        },
      });
    },

    clearFilter: () => {
      set({ filter: defaultFilter });
    },

    getFilteredLogs: () => {
      const { logs, filter } = get();

      return logs.filter((log) => {
        // Filter by log levels
        if (filter.levels.length > 0 && !filter.levels.includes(log.type)) {
          return false;
        }

        // Filter by message content
        if (
          filter.messageFilter &&
          !log.message
            .toLowerCase()
            .includes(filter.messageFilter.toLowerCase())
        ) {
          return false;
        }

        // Filter by date range
        if (
          filter.startDate &&
          log.timestamp < filter.startDate.getTime() / 1000
        ) {
          return false;
        }

        if (filter.endDate && log.timestamp > filter.endDate.getTime() / 1000) {
          return false;
        }

        return true;
      });
    },

    getFilteredPeerLogs: () => {
      const { peerLogs, filter } = get();

      return peerLogs.filter((log) => {
        // Filter by IP or reason
        if (filter.messageFilter) {
          const query = filter.messageFilter.toLowerCase();
          if (
            !log.ip.toLowerCase().includes(query) &&
            !log.reason.toLowerCase().includes(query)
          ) {
            return false;
          }
        }

        // Filter by date range
        if (
          filter.startDate &&
          log.timestamp < filter.startDate.getTime() / 1000
        ) {
          return false;
        }

        if (filter.endDate && log.timestamp > filter.endDate.getTime() / 1000) {
          return false;
        }

        return true;
      });
    },

    // Auto-refresh management
    startAutoRefresh: () => {
      const { refreshInterval } = get();
      const timer = setInterval(() => {
        get().fetchLogs();
        get().fetchPeerLogs();
        get().fetchSystemInfo();
      }, refreshInterval);

      set({ refreshTimer: timer });
    },

    stopAutoRefresh: () => {
      const { refreshTimer } = get();
      if (refreshTimer) {
        clearInterval(refreshTimer);
        set({ refreshTimer: null });
      }
    },

    // Export functionality
    exportLogs: (format) => {
      const logs = get().getFilteredLogs();

      switch (format) {
        case 'json':
          return JSON.stringify(logs, null, 2);

        case 'csv':
          const csvHeader = 'ID,Timestamp,Type,Message\n';
          const csvRows = logs
            .map(
              (log) =>
                `${log.id},${new Date(log.timestamp * 1000).toISOString()},${log.type},"${log.message.replace(/"/g, '""')}"`,
            )
            .join('\n');
          return csvHeader + csvRows;

        case 'txt':
          return logs
            .map(
              (log) =>
                `[${new Date(log.timestamp * 1000).toISOString()}] [${log.type}] ${log.message}`,
            )
            .join('\n');

        default:
          return '';
      }
    },

    exportPeerLogs: (format) => {
      const peerLogs = get().getFilteredPeerLogs();

      switch (format) {
        case 'json':
          return JSON.stringify(peerLogs, null, 2);

        case 'csv':
          const csvHeader = 'ID,Timestamp,IP,Blocked,Reason\n';
          const csvRows = peerLogs
            .map(
              (log) =>
                `${log.id},${new Date(log.timestamp * 1000).toISOString()},${log.ip},${log.blocked},"${log.reason.replace(/"/g, '""')}"`,
            )
            .join('\n');
          return csvHeader + csvRows;

        case 'txt':
          return peerLogs
            .map(
              (log) =>
                `[${new Date(log.timestamp * 1000).toISOString()}] ${log.ip} - ${log.blocked ? 'BLOCKED' : 'ALLOWED'}: ${log.reason}`,
            )
            .join('\n');

        default:
          return '';
      }
    },

    // Utility
    clearError: () => {
      set({ error: null });
    },

    trimLogsToLimit: () => {
      const { logs, maxLogsInMemory } = get();
      if (logs.length > maxLogsInMemory) {
        const trimmedLogs = logs.slice(-maxLogsInMemory);
        set({ logs: trimmedLogs });
      }
    },
  })),
);

// Selector hooks for convenience
export const useLogs = () => {
  const { logs, isLoading, error, lastUpdate, getFilteredLogs } = useLogStore();
  return { logs, isLoading, error, lastUpdate, getFilteredLogs };
};

export const usePeerLogs = () => {
  const {
    peerLogs,
    isLoadingPeerLogs,
    error,
    lastUpdate,
    getFilteredPeerLogs,
  } = useLogStore();
  return {
    peerLogs,
    isLoading: isLoadingPeerLogs,
    error,
    lastUpdate,
    getFilteredPeerLogs,
  };
};

export const useSystemInfo = () => {
  const { systemInfo, isLoadingSystemInfo, error, fetchSystemInfo } =
    useLogStore();
  return {
    systemInfo,
    isLoading: isLoadingSystemInfo,
    error,
    fetchSystemInfo,
  };
};

export const useLogSettings = () => {
  const {
    logLevel,
    autoRefresh,
    refreshInterval,
    maxLogsInMemory,
    setLogLevel,
    setAutoRefresh,
    setRefreshInterval,
    setMaxLogsInMemory,
  } = useLogStore();

  return {
    logLevel,
    autoRefresh,
    refreshInterval,
    maxLogsInMemory,
    setLogLevel,
    setAutoRefresh,
    setRefreshInterval,
    setMaxLogsInMemory,
  };
};

export const useLogFilter = () => {
  const { filter, setFilter, clearFilter } = useLogStore();
  return { filter, setFilter, clearFilter };
};

export const useLogActions = () => {
  const {
    fetchLogs,
    fetchPeerLogs,
    fetchSystemInfo,
    clearLogs,
    clearPeerLogs,
    exportLogs,
    exportPeerLogs,
    startAutoRefresh,
    stopAutoRefresh,
  } = useLogStore();

  return {
    fetchLogs,
    fetchPeerLogs,
    fetchSystemInfo,
    clearLogs,
    clearPeerLogs,
    exportLogs,
    exportPeerLogs,
    startAutoRefresh,
    stopAutoRefresh,
  };
};
