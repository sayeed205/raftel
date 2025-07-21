import type { TorrentState } from './constants';

export interface RawTorrent {
  /** Time (Unix Epoch) when the torrent was added to the client */
  added_on: number;
  /** Amount of data left to download (bytes) */
  amount_left: number;
  /** Whether this torrent is managed by Automatic Torrent Management */
  auto_tmm: boolean;
  /** Percentage of file pieces currently available */
  availability: number;
  /** Category of the torrent */
  category: string;
  /** Torrent comment */
  comment?: string;
  /** Amount of transfer data completed (bytes) */
  completed: number;
  /** Time (Unix Epoch) when the torrent completed */
  completion_on: number;
  /** Absolute path of torrent content */
  content_path: string;
  /** Torrent download speed limit (bytes/s). -1 if unlimited. */
  dl_limit: number;
  /** Torrent download speed (bytes/s) */
  dlspeed: number;
  /** Torrent download path */
  download_path: string;
  /** Amount of data downloaded */
  downloaded: number;
  /** Amount of data downloaded this session */
  downloaded_session: number;
  /** Torrent ETA (seconds) */
  eta: number;
  /** True if first last piece are prioritized */
  f_l_piece_prio: boolean;
  /** True if force start is enabled for this torrent */
  force_start: boolean;
  /** Whether metadata has been downloaded or not, only useful for magnet links */
  has_metadata?: boolean;
  inactive_seeding_time_limit: number;
  /** Torrent SHA1 Hash */
  infohash_v1: string;
  /** Torrent SHA256 Hash (only in LibTorrent v2) */
  infohash_v2: string;
  /** Last time (Unix Epoch) when a chunk was downloaded/uploaded */
  last_activity: number;
  /** Magnet URI corresponding to this torrent */
  magnet_uri: string;
  max_inactive_seeding_time: number;
  /** Maximum share ratio until torrent is stopped from seeding/uploading */
  max_ratio: number;
  /** Maximum seeding time (seconds) until torrent is stopped from seeding */
  max_seeding_time: number;
  /** Torrent name */
  name: string;
  /** Number of seeds in the swarm */
  num_complete: number;
  /** Number of leechers in the swarm */
  num_incomplete: number;
  /** Number of leechers connected to */
  num_leechs: number;
  /** Number of seeds connected to */
  num_seeds: number;
  /** Ratio / Time Active (in months), indicates how popular the torrent is */
  popularity?: number;
  /** Torrent priority. Returns -1 if queuing is disabled or torrent is in seed mode */
  priority: number;
  /** Whether torrent is private or not */
  private?: boolean;
  /** Torrent progress (percentage/100) */
  progress: number;
  /** Torrent share ratio. Max ratio value: 9999. */
  ratio: number;
  /** Upload share ratio limit */
  ratio_limit: number;
  /** Seconds until next tracker reannounce */
  reannounce?: number;
  /** Root path */
  root_path?: string;
  /** Path where this torrent's data is stored */
  save_path: string;
  /** Torrent elapsed time while complete (seconds) */
  seeding_time: number;
  /** Upload seeding time limit */
  seeding_time_limit: number;
  /** Time (Unix Epoch) when this torrent was last seen complete */
  seen_complete: number;
  /** True if sequential download is enabled */
  seq_dl: boolean;
  /** Total size (bytes) of files selected for download */
  size: number;
  /** Torrent state */
  state: TorrentState;
  /** True if super seeding is enabled */
  super_seeding: boolean;
  /** Comma-concatenated tag list of the torrent */
  tags: string;
  /** Total active time (seconds) */
  time_active: number;
  /** Total size (bytes) of all file in this torrent (including unselected ones) */
  total_size: number;
  /** The first tracker with working status */
  tracker: string;
  /** The number of trackers registered for that torrent */
  trackers_count: number;
  /** Torrent upload speed limit (bytes/s). -1 if unlimited. */
  up_limit: number;
  /** Amount of data uploaded */
  uploaded: number;
  /** Amount of data uploaded this session */
  uploaded_session: number;
  /** Torrent upload speed (bytes/s) */
  upspeed: number;
}

export interface Torrent extends RawTorrent {
  /** Torrent hash */
  hash: string;
}

export interface TorrentProperties {
  /** When this torrent was added (unix timestamp) */
  addition_date: number;
  /** Torrent comment */
  comment: string;
  /** Torrent completion date (unix timestamp) */
  completion_date: number;
  /** Torrent creator */
  created_by: string;
  /** Torrent creation date (Unix timestamp) */
  creation_date: number;
  /** Torrent download limit (bytes/s) */
  dl_limit: number;
  /** Torrent download speed (bytes/second) */
  dl_speed: number;
  /** Torrent average download speed (bytes/second) */
  dl_speed_avg: number;
  /** Torrent download path */
  download_path: string;
  /** Torrent ETA (seconds) */
  eta: number;
  /** Whether torrent metadata has been downloaded */
  has_metadata?: boolean;
  /** Torrent hash */
  hash: string;
  /** Torrent Infohash V1 */
  infohash_v1: string;
  /** Torrent Infohash V2 */
  infohash_v2: string;
  /** Last seen complete date (unix timestamp) */
  last_seen: number;
  /** Torrent name */
  name: string;
  /** Torrent connection count */
  nb_connections: number;
  /** Torrent connection count limit */
  nb_connections_limit: number;
  /** Number of peers connected to */
  peers: number;
  /** Number of peers in the swarm */
  peers_total: number;
  /** Torrent piece size (bytes) */
  piece_size: number;
  /** Number of pieces owned */
  pieces_have: number;
  /** Number of pieces of the torrent */
  pieces_num: number;
  /** Torrent popularity */
  popularity?: number;
  /** Whether torrent is private or not */
  private?: boolean;
  /** Number of seconds until the next announce */
  reannounce: number;
  /** Torrent save path */
  save_path: string;
  /** Torrent elapsed time while complete (seconds) */
  seeding_time: number;
  /** Number of seeds connected to */
  seeds: number;
  /** Number of seeds in the swarm */
  seeds_total: number;
  /** Torrent share ratio */
  share_ratio: number;
  /** Torrent elapsed time (seconds) */
  time_elapsed: number;
  /** Total data downloaded for torrent (bytes) */
  total_downloaded: number;
  /** Total data downloaded this session (bytes) */
  total_downloaded_session: number;
  /** Torrent total size (bytes) */
  total_size: number;
  /** Total data uploaded for torrent (bytes) */
  total_uploaded: number;
  /** Total data uploaded this session (bytes) */
  total_uploaded_session: number;
  /** Total data wasted for torrent (bytes) */
  total_wasted: number;
  /** Torrent upload limit (bytes/s) */
  up_limit: number;
  /** Torrent upload speed (bytes/second) */
  up_speed: number;
  /** Torrent average upload speed (bytes/second) */
  up_speed_avg: number;
}

export interface TorrentFile {
  /** File availability (percentage/100) */
  availability: number;
  /** File index */
  index: number;
  /** True if file is seeded/complete */
  is_seed?: boolean;
  /** File name (including relative path) */
  name: string;
  /** File piece range */
  piece_range: [number, number];
  /** File priority */
  priority: number;
  /** File progress (percentage/100) */
  progress: number;
  /** File size (bytes) */
  size: number;
}

export interface TorrentTracker {
  /** Tracker message (there is no way of knowing what this message is - it's up to tracker admins) */
  msg: string;
  /** Number of peers for current torrent, as reported by the tracker */
  num_peers: number;
  /** Number of seeds for current torrent, as reported by the tracker */
  num_seeds: number;
  /** Tracker status */
  status: number;
  /** Tracker tier */
  tier: number;
  /** Tracker url */
  url: string;
}

export interface TorrentPeer {
  /** Client used by peer */
  client: string;
  /** Peer connection type flag */
  connection: string;
  /** Country/region this peer belongs to */
  country: string;
  /** Country code this peer belongs to */
  country_code: string;
  /** Peer download speed (bytes/s) */
  dl_speed: number;
  /** Amount of data downloaded from this peer (bytes) */
  downloaded: number;
  /** Peer client flags */
  flags: string;
  /** Peer client flags description */
  flags_desc: string;
  /** Peer IP address */
  ip: string;
  /** Peer port */
  port: number;
  /** Peer progress (percentage/100) */
  progress: number;
  /** Relevance of this peer */
  relevance: number;
  /** Peer upload speed (bytes/s) */
  up_speed: number;
  /** Amount of data uploaded to this peer (bytes) */
  uploaded: number;
}

export interface ExtendedTorrentInfo extends Torrent {
  // Additional computed properties
  downloadedPercent: number;
  remainingTime: string;
  averageSpeed: number;
  healthScore: number;

  // Detailed information
  properties?: TorrentProperties;
  files?: Array<TorrentFile>;
  trackers?: Array<TorrentTracker>;
  peers?: Array<TorrentPeer>;
}
