// qBittorrent WebAPI Types
export interface TorrentInfo {
  added_on: number;
  amount_left: number;
  auto_tmm: boolean;
  availability: number;
  category: string;
  completed: number;
  completion_on: number;
  content_path: string;
  dl_limit: number;
  dlspeed: number;
  download_path: string;
  downloaded: number;
  downloaded_session: number;
  eta: number;
  f_l_piece_prio: boolean;
  force_start: boolean;
  hash: string;
  infohash_v1: string;
  infohash_v2: string;
  last_activity: number;
  magnet_uri: string;
  max_ratio: number;
  max_seeding_time: number;
  name: string;
  num_complete: number;
  num_incomplete: number;
  num_leechs: number;
  num_seeds: number;
  priority: number;
  progress: number;
  ratio: number;
  ratio_limit: number;
  save_path: string;
  seeding_time: number;
  seeding_time_limit: number;
  seen_complete: number;
  seq_dl: boolean;
  size: number;
  state: TorrentState;
  super_seeding: boolean;
  tags: string;
  time_active: number;
  total_size: number;
  tracker: string;
  trackers_count: number;
  up_limit: number;
  uploaded: number;
  uploaded_session: number;
  upspeed: number;
}

export type TorrentState =
  | 'error'
  | 'missingFiles'
  | 'uploading'
  | 'pausedUP'
  | 'queuedUP'
  | 'stalledUP'
  | 'checkingUP'
  | 'forcedUP'
  | 'allocating'
  | 'downloading'
  | 'metaDL'
  | 'pausedDL'
  | 'queuedDL'
  | 'stalledDL'
  | 'stoppedDL'
  | 'checkingDL'
  | 'forcedDL'
  | 'checkingResumeData'
  | 'moving'
  | 'unknown';

export interface ServerState {
  connection_status: 'connected' | 'firewalled' | 'disconnected';
  dht_nodes: number;
  dl_info_data: number;
  dl_info_speed: number;
  dl_rate_limit: number;
  free_space_on_disk: number;
  global_ratio: string;
  queued_io_jobs: number;
  queueing: boolean;
  read_cache_hits: string;
  read_cache_overload: string;
  refresh_interval: number;
  total_buffers_size: number;
  total_peer_connections: number;
  total_queued_size: number;
  total_wasted_session: number;
  up_info_data: number;
  up_info_speed: number;
  up_rate_limit: number;
  use_alt_speed_limits: boolean;
  write_cache_overload: string;
}

export interface AppVersion {
  version: string;
  api_version: string;
  api_version_min: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TorrentPeer {
  client: string;
  connection: string;
  country: string;
  country_code: string;
  dl_speed: number;
  downloaded: number;
  files: string;
  flags: string;
  flags_desc: string;
  ip: string;
  port: number;
  progress: number;
  relevance: number;
  up_speed: number;
  uploaded: number;
}

export interface Category {
  name: string;
  savePath: string;
}

export interface TorrentFilter {
  all: number;
  downloading: number;
  seeding: number;
  completed: number;
  paused: number;
  active: number;
  inactive: number;
  resumed: number;
  stalled: number;
  stalled_uploading: number;
  stalled_downloading: number;
  errored: number;
}

export interface GlobalTransferInfo {
  dl_info_speed: number;
  dl_info_data: number;
  up_info_speed: number;
  up_info_data: number;
  dl_rate_limit: number;
  up_rate_limit: number;
  dht_nodes: number;
  connection_status: string;
}

// Request/Response types for API calls
export interface TorrentsInfoParams {
  filter?: string;
  category?: string;
  tag?: string;
  sort?: string;
  reverse?: boolean;
  limit?: number;
  offset?: number;
  hashes?: string;
}

export interface AddTorrentParams {
  urls?: string;
  torrents?: Array<File>;
  savepath?: string;
  category?: string;
  tags?: string;
  skip_checking?: boolean;
  paused?: boolean;
  root_folder?: boolean;
  rename?: string;
  upLimit?: number;
  dlLimit?: number;
  ratioLimit?: number;
  seedingTimeLimit?: number;
  autoTMM?: boolean;
  sequentialDownload?: boolean;
  firstLastPiecePrio?: boolean;
}

export interface SetTorrentLocationParams {
  hashes: string;
  location: string;
}

export interface SetTorrentCategoryParams {
  hashes: string;
  category: string;
}

export interface SetTorrentTagsParams {
  hashes: string;
  tags: string;
}

export interface SetTorrentPriorityParams {
  hashes: string;
  priority: number;
}

export interface SetSpeedLimitParams {
  hashes: string;
  limit: number;
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
}

// Re-export enhanced types from qbit modules
export * from './qbit/constants';
export type { NetworkInterface, QBittorrentPreferences, ScanDirs } from './qbit/preferences';
export type { Feed, FeedArticle, FeedRule, RSSDownloadHistory, RSSFeedData } from './qbit/rss';
export type {
  SearchEngine,
  SearchHistoryItem,
  SearchJob,
  SearchPlugin,
  SearchQuery,
  SearchResult,
  SearchStatus,
} from './search';
export type {
  PeerInfo,
  QueueInfo,
  SpeedDataPoint,
  StatisticsData,
  SystemInfo,
  TransferStats,
} from './statistics';

// Extended torrent info with computed properties
export interface ExtendedTorrentInfo extends TorrentInfo {
  // Additional computed properties
  downloadedPercent: number;
  remainingTime: string;
  averageSpeed: number;
  healthScore: number;
}
