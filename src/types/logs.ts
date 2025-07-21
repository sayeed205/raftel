import type { LogType } from './qbit/constants';

export interface Log {
  /** Log ID */
  id: number;
  /** Log message */
  message: string;
  /** Log timestamp */
  timestamp: number;
  /** Log type */
  type: LogType;
}

export interface LogFilter {
  /** Log levels to include */
  levels: Array<LogType>;
  /** Start date for filtering */
  startDate?: Date;
  /** End date for filtering */
  endDate?: Date;
  /** Message content filter */
  messageFilter: string;
  /** Component filter */
  componentFilter: string;
}

export interface LogExportOptions {
  /** Export format */
  format: 'json' | 'csv' | 'txt';
  /** Date range */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Log levels to include */
  levels: Array<LogType>;
  /** Maximum number of logs to export */
  maxLogs?: number;
}

export interface LogSettings {
  /** Log level configuration */
  logLevel: LogType;
  /** Auto-refresh interval in seconds */
  refreshInterval: number;
  /** Maximum logs to keep in memory */
  maxLogsInMemory: number;
  /** Enable real-time streaming */
  realTimeStreaming: boolean;
  /** Log rotation settings */
  rotation: {
    enabled: boolean;
    maxSize: number; // in MB
    maxFiles: number;
  };
}

export interface LogAnalytics {
  /** Total log count by type */
  countByType: Record<LogType, number>;
  /** Error rate over time */
  errorRate: Array<{
    timestamp: number;
    count: number;
  }>;
  /** Most common error messages */
  commonErrors: Array<{
    message: string;
    count: number;
    lastSeen: number;
  }>;
  /** Log frequency over time */
  frequency: Array<{
    timestamp: number;
    count: number;
  }>;
}
