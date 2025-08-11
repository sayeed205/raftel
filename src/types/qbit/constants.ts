// Torrent States
export const TorrentState = {
  ERROR: 'error',
  MISSING_FILES: 'missingFiles',
  UPLOADING: 'uploading',
  PAUSED_UP: 'pausedUP',
  QUEUED_UP: 'queuedUP',
  STALLED_UP: 'stalledUP',
  CHECKING_UP: 'checkingUP',
  FORCED_UP: 'forcedUP',
  ALLOCATING: 'allocating',
  DOWNLOADING: 'downloading',
  META_DL: 'metaDL',
  PAUSED_DL: 'pausedDL',
  QUEUED_DL: 'queuedDL',
  STALLED_DL: 'stalledDL',
  CHECKING_DL: 'checkingDL',
  FORCED_DL: 'forcedDL',
  CHECKING_RESUME_DATA: 'checkingResumeData',
  MOVING: 'moving',
  UNKNOWN: 'unknown',
} as const;

export type TorrentState = (typeof TorrentState)[keyof typeof TorrentState];

// File Priority
export const FilePriority = {
  MIXED: -1,
  DO_NOT_DOWNLOAD: 0,
  NORMAL: 1,
  HIGH: 6,
  MAXIMUM: 7,
} as const;

export type FilePriority = (typeof FilePriority)[keyof typeof FilePriority];

// Tracker Status
export const TrackerStatus = {
  DISABLED: 0,
  NOT_CONTACTED: 1,
  WORKING: 2,
  UPDATING: 3,
  NOT_WORKING: 4,
} as const;

export type TrackerStatus = (typeof TrackerStatus)[keyof typeof TrackerStatus];

// Connection Status
export const ConnectionStatus = {
  CONNECTED: 'connected',
  FIREWALLED: 'firewalled',
  DISCONNECTED: 'disconnected',
} as const;

export type ConnectionStatus =
  (typeof ConnectionStatus)[keyof typeof ConnectionStatus];

// Proxy Types
export const ProxyType = {
  NONE: 'None',
  SOCKS4: 'SOCKS4',
  SOCKS5: 'SOCKS5',
  HTTP: 'HTTP',
} as const;

export type ProxyType = (typeof ProxyType)[keyof typeof ProxyType];

// Encryption
export const Encryption = {
  PREFER_PLAINTEXT: 0,
  PREFER_ENCRYPTION: 1,
  REQUIRE_ENCRYPTION: 2,
} as const;

export type Encryption = (typeof Encryption)[keyof typeof Encryption];

// Content Layout
export const ContentLayout = {
  ORIGINAL: 'Original',
  SUBFOLDER: 'Subfolder',
  NO_SUBFOLDER: 'NoSubfolder',
} as const;

export type ContentLayout = (typeof ContentLayout)[keyof typeof ContentLayout];

// Share Limit Action
export const ShareLimitAction = {
  PAUSE: 0,
  REMOVE: 1,
  REMOVE_AND_DELETE_FILES: 2,
  ENABLE_SUPER_SEEDING: 3,
} as const;

export type ShareLimitAction =
  (typeof ShareLimitAction)[keyof typeof ShareLimitAction];

// Stop Condition
export const StopCondition = {
  NONE: 'None',
  METADATA_RECEIVED: 'MetadataReceived',
  FILES_CHECKED: 'FilesChecked',
} as const;

export type StopCondition = (typeof StopCondition)[keyof typeof StopCondition];

// BitTorrent Protocol
export const BitTorrentProtocol = {
  TCP_AND_UTP: 0,
  TCP: 1,
  UTP: 2,
} as const;

export type BitTorrentProtocol =
  (typeof BitTorrentProtocol)[keyof typeof BitTorrentProtocol];

// Upload Choking Algorithm
export const UploadChokingAlgorithm = {
  ROUND_ROBIN: 0,
  FASTEST_UPLOAD: 1,
  ANTI_LEECH: 2,
} as const;

export type UploadChokingAlgorithm =
  (typeof UploadChokingAlgorithm)[keyof typeof UploadChokingAlgorithm];

// Upload Slots Behavior
export const UploadSlotsBehavior = {
  FIXED_SLOTS: 0,
  UPLOAD_RATE_BASED: 1,
} as const;

export type UploadSlotsBehavior =
  (typeof UploadSlotsBehavior)[keyof typeof UploadSlotsBehavior];

// UTP TCP Mixed Mode
export const UtpTcpMixedMode = {
  PREFER_TCP: 0,
  PEER_PROPORTIONAL: 1,
} as const;

export type UtpTcpMixedMode =
  (typeof UtpTcpMixedMode)[keyof typeof UtpTcpMixedMode];

// Disk IO Mode
export const DiskIOMode = {
  DEFAULT: 0,
  DISABLE_OS_CACHE: 1,
  ENABLE_OS_CACHE: 2,
} as const;

export type DiskIOMode = (typeof DiskIOMode)[keyof typeof DiskIOMode];

// Disk IO Type
export const DiskIOType = {
  DEFAULT: 0,
  MEMORY_MAPPED_FILES: 1,
  POSIX_COMPLIANT: 2,
  SIMPLE_PREAD_PWRITE: 3,
} as const;

export type DiskIOType = (typeof DiskIOType)[keyof typeof DiskIOType];

// Auto Delete Mode
export const AutoDeleteMode = {
  NEVER: 0,
  IF_RATIO_REACHED: 1,
  IF_RATIO_OR_TIME_REACHED: 2,
} as const;

export type AutoDeleteMode =
  (typeof AutoDeleteMode)[keyof typeof AutoDeleteMode];

// File Log Age Type
export const FileLogAgeType = {
  DAYS: 0,
  MONTHS: 1,
  YEARS: 2,
} as const;

export type FileLogAgeType =
  (typeof FileLogAgeType)[keyof typeof FileLogAgeType];

// Resume Data Storage Type
export const ResumeDataStorageType = {
  LEGACY: 'Legacy',
  SQLITE: 'SQLite',
} as const;

export type ResumeDataStorageType =
  (typeof ResumeDataStorageType)[keyof typeof ResumeDataStorageType];

// Torrent Content Remove Option
export const TorrentContentRemoveOption = {
  DELETE: 'Delete',
  MOVE_TO_TRASH: 'MoveToTrash',
} as const;

export type TorrentContentRemoveOption =
  (typeof TorrentContentRemoveOption)[keyof typeof TorrentContentRemoveOption];

// Scheduler Days (bitmask)
export const SchedulerDays = {
  EVERY_DAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 4,
  THURSDAY: 8,
  FRIDAY: 16,
  SATURDAY: 32,
  SUNDAY: 64,
} as const;

export type SchedulerDays = number;

// Dynamic DNS Service
export const DynDnsService = {
  USE_DYNDNS: 0,
  USE_NOIP: 1,
} as const;

export type DynDnsService = (typeof DynDnsService)[keyof typeof DynDnsService];

// Log Types
export const LogType = {
  NONE: 0,
  NORMAL: 1 << 0,
  INFO: 1 << 1,
  WARNING: 1 << 2,
  CRITICAL: 1 << 3,
  ALL: (1 << 0) | (1 << 1) | (1 << 2) | (1 << 3),
} as const;

export type LogType = (typeof LogType)[keyof typeof LogType];

// Piece States
export const PieceState = {
  MISSING: 0,
  DOWNLOADING: 1,
  DOWNLOADED: 2,
} as const;

export type PieceState = (typeof PieceState)[keyof typeof PieceState];

// Directory Content Mode
export const DirectoryContentMode = {
  FILES: 0,
  FOLDERS: 1,
  ALL: 2,
} as const;

export type DirectoryContentMode =
  (typeof DirectoryContentMode)[keyof typeof DirectoryContentMode];

// Torrent Creator Task Status
export const TorrentCreatorTaskStatus = {
  FAILED: 'Failed',
  QUEUED: 'Queued',
  RUNNING: 'Running',
  FINISHED: 'Finished',
} as const;

export type TorrentCreatorTaskStatus =
  (typeof TorrentCreatorTaskStatus)[keyof typeof TorrentCreatorTaskStatus];

// Torrent Format
export const TorrentFormat = {
  V1: 'v1',
  V2: 'v2',
  HYBRID: 'hybrid',
} as const;
export type TorrentFormat = (typeof TorrentFormat)[keyof typeof TorrentFormat];

// Torrent Filter State
export const FilterState = {
  ALL: 'all',
  DOWNLOADING: 'downloading',
  SEEDING: 'seeding',
  COMPLETED: 'completed',
  /** @deprecated since 5.X, use stopped instead */
  PAUSED: 'paused',
  STOPPED: 'stopped',
  /** @deprecated since 5.X, use running instead */
  RESUMED: 'resumed',
  RUNNING: 'running',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  STALLED: 'stalled',
  STALLED_UPLOADING: 'stalled_uploading',
  STALLED_DOWNLOADING: 'stalled_downloading',
  CHECKING: 'checking',
  MOVING: 'moving',
  ERRORED: 'errored',
} as const;

export type FilterState = (typeof FilterState)[keyof typeof FilterState];

// Torrent Operating Mode
export const TorrentOperatingMode = {
  AUTO_MANAGED: 'AutoManaged',
  FORCED: 'Forced',
};
export type TorrentOperatingMode =
  (typeof TorrentOperatingMode)[keyof typeof TorrentOperatingMode];
