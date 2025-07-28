import type { TorrentCreatorTaskStatus, TorrentFormat } from './api';

export interface TransferInfo {
  /** Global download info */
  dl_info_data: number;
  /** Global download speed */
  dl_info_speed: number;
  /** Global upload info */
  up_info_data: number;
  /** Global upload speed */
  up_info_speed: number;
}

export interface ServerState {
  /** Whether alternative speed limits are enabled */
  use_alt_speed_limits: boolean;
  /** Global download speed limit */
  dl_rate_limit: number;
  /** Global upload speed limit */
  up_rate_limit: number;
  /** Alternative global download speed limit */
  alt_dl_limit: number;
  /** Alternative global upload speed limit */
  alt_up_limit: number;
  /** Current global download speed */
  dl_info_speed: number;
  /** Current global upload speed */
  up_info_speed: number;
  /** Data downloaded this session */
  dl_info_data: number;
  /** Data uploaded this session */
  up_info_data: number;
  /** All-time download */
  alltime_dl: number;
  /** All-time upload */
  alltime_ul: number;
  /** Total peer connections */
  connection_status: string;
  /** DHT nodes */
  dht_nodes: number;
  /** Free space on disk */
  free_space_on_disk: number;
  /** Global ratio */
  global_ratio: string;
  /** Queued I/O jobs */
  queued_io_jobs: number;
  /** qBittorrent version */
  queueing: boolean;
  /** Read cache hits */
  read_cache_hits: string;
  /** Read cache overload */
  read_cache_overload: string;
  /** Refresh interval */
  refresh_interval: number;
  /** Total buffers size */
  total_buffers_size: number;
  /** Total peer connections */
  total_peer_connections: number;
  /** Total queued size */
  total_queued_size: number;
  /** Total wasted session */
  total_wasted_session: number;
  /** Write cache overload */
  write_cache_overload: string;
}

export interface SpeedDataPoint {
  /** Timestamp */
  timestamp: number;
  /** Download speed in bytes/s */
  download: number;
  /** Upload speed in bytes/s */
  upload: number;
}

export interface TransferStats {
  /** Session download */
  sessionDownload: number;
  /** Session upload */
  sessionUpload: number;
  /** Session ratio */
  sessionRatio: number;
  /** Session time */
  sessionTime: number;
  /** All-time download */
  allTimeDownload: number;
  /** All-time upload */
  allTimeUpload: number;
  /** All-time ratio */
  allTimeRatio: number;
  /** All-time time */
  allTimeTime: number;
}

export interface SystemInfo {
  /** Available memory */
  availableMemory: number;
  /** Total memory */
  totalMemory: number;
  /** CPU usage percentage */
  cpuUsage: number;
  /** Disk usage */
  diskUsage: {
    free: number;
    total: number;
    used: number;
  };
  /** Network interfaces */
  networkInterfaces: Array<{
    name: string;
    bytesReceived: number;
    bytesSent: number;
  }>;
}

export interface PeerInfo {
  /** Total peers */
  total: number;
  /** Connected peers */
  connected: number;
  /** Downloading peers */
  downloading: number;
  /** Seeding peers */
  seeding: number;
}

export interface QueueInfo {
  /** Active downloads */
  activeDownloads: number;
  /** Active uploads */
  activeUploads: number;
  /** Queued downloads */
  queuedDownloads: number;
  /** Queued uploads */
  queuedUploads: number;
  /** Paused torrents */
  pausedTorrents: number;
  /** Error torrents */
  errorTorrents: number;
}

export interface StatisticsData {
  /** Transfer information */
  transferInfo: TransferInfo;
  /** Server state */
  serverState: ServerState;
  /** Speed history */
  speedHistory: Array<SpeedDataPoint>;
  /** Transfer statistics */
  transferStats: TransferStats;
  /** System information */
  systemInfo?: SystemInfo;
  /** Peer information */
  peerInfo: PeerInfo;
  /** Queue information */
  queueInfo: QueueInfo;
}

export interface BuildInfo {
  /** qBittorrent version */
  qt: string;
  /** libtorrent version */
  libtorrent: string;
  /** Boost version */
  boost: string;
  /** OpenSSL version */
  openssl: string;
  /** Zlib version */
  zlib: string;
  /** Bitness */
  bitness: number;
}

export interface Cookie {
  /** Cookie domain */
  domain: string;
  /** Cookie path */
  path: string;
  /** Cookie name */
  name: string;
  /** Cookie value */
  value: string;
  /**
   * Cookie expiration date
   * In seconds since Epoch (local server time)
   */
  expirationDate: number;
}

export interface TorrentCreatorParams {
  /** Torrent comment */
  comment?: string;
  /**
   * Torrent format
   * @version libtorrent2
   * @default HYBRID
   */
  format?: TorrentFormat;
  /**
   * Should optimize piece alignment
   * @version libtorrent1
   * @default true
   */
  optimizeAlignment?: boolean;
  /**
   * Padded file size limit
   * @version libtorrent1
   * @default -1
   */
  paddedFileSizeLimit?: number;
  /**
   * Torrent piece size
   * @default 0 (auto)
   */
  pieceSize?: number;
  /**
   * Whether created torrent should be private
   * @default false
   */
  private?: boolean;
  /**
   * Source metadata field
   * used for cross-seeding by some private trackers
   * @since 5.1.0
   */
  source?: string;
  /**
   * Source path containing files to include in torrent
   */
  sourcePath: string;
  /**
   * Whether to start seeding after torrent creation
   * @default if torrentFilePath is empty
   */
  startSeeding?: boolean;
  /**
   * Output torrent path
   */
  torrentFilePath?: string;
  /**
   * Tracker URLs to add to the torrent
   * separated by a pipe (|)
   */
  trackers?: string;
  /**
   * Web seed URLs to add to the torrent
   * separated by a pipe (|)
   */
  urlSeeds?: string;
}

export interface TorrentCreatorTask {
  /**
   * Torrent comment
   */
  comment?: string;
  /** Task error message if failed */
  errorMessage?: string;
  /**
   * Torrent format
   * Needs libtorrent2
   * @default HYBRID
   */
  format?: TorrentFormat;
  /**
   * Should optimize alignment
   * Needs libtorrent1
   * @default true
   */
  optimizeAlignment?: boolean;
  /**
   * Torrent piece size
   * @default 0
   */
  pieceSize?: number;
  /**
   * Whether created torrent should be private
   * @default false
   */
  private?: boolean;
  /**
   * Task progress
   * only if status === RUNNING
   * Between 0 and 100, as integer
   */
  progress?: number;
  /**
   * Source path containing files to include in torrent
   */
  sourcePath: string;
  /**
   * Task status
   */
  status: TorrentCreatorTaskStatus;
  taskID: string;
  /**
   * Source metadata field
   * used for cross-seeding by some private trackers
   * @since 5.1.0
   */
  source?: string;
  timeAdded: string;
  /**
   * @example Wed May 20 03:40:13 1998
   */
  timeFinished: string;
  /**
   * @example Wed May 20 03:40:13 1998
   */
  timeStarted: string;
  /**
   * Output torrent path
   */
  torrentFilePath?: string;
  /**
   * Trackers list
   */
  trackers?: Array<string>;
  /**
   * URL seeds list
   */
  urlSeeds?: Array<string>;
}

export interface SSLParameters {
  /** SSL certificate */
  ssl_certificate: string;
  /** SSL private key */
  ssl_private_key: string;
  /** SSL DH parameters */
  ssl_dh_params: string;
}
