import type { ContentLayout } from './constants';
import type { QBittorrentPreferences } from './preferences';

export interface LoginPayload {
  /** Username */
  username: string;
  /** Password */
  password: string;
}

export interface AddTorrentPayload {
  /** Torrent URLs (magnet links or HTTP URLs) */
  urls?: string;
  /** Torrent files */
  torrents?: Array<File>;
  /** Download folder */
  savepath?: string;
  /** Cookie sent to download the .torrent file */
  cookie?: string;
  /** Category for the torrent */
  category?: string;
  /** Tags for the torrent, split by ',' */
  tags?: string;
  /** Skip hash checking */
  skip_checking?: boolean;
  /** Add torrents in the paused state */
  paused?: boolean;
  /** Create the root folder */
  root_folder?: boolean;
  /** Rename torrent */
  rename?: string;
  /** Set torrent upload speed limit */
  upLimit?: number;
  /** Set torrent download speed limit */
  dlLimit?: number;
  /** Set torrent share ratio limit */
  ratioLimit?: number;
  /** Set torrent seeding time limit */
  seedingTimeLimit?: number;
  /** Whether Automatic Torrent Management should be used */
  autoTMM?: boolean;
  /** Enable sequential download */
  sequentialDownload?: boolean;
  /** Prioritize download first last piece */
  firstLastPiecePrio?: boolean;
  /** Torrent content layout */
  contentLayout?: ContentLayout;
}

export type AppPreferencesPayload = Partial<QBittorrentPreferences>;

export interface GetTorrentPayload {
  /** Filter torrent list */
  filter?:
    | 'all'
    | 'downloading'
    | 'seeding'
    | 'completed'
    | 'paused'
    | 'active'
    | 'inactive'
    | 'resumed'
    | 'stalled'
    | 'stalled_uploading'
    | 'stalled_downloading'
    | 'errored';
  /** Get torrents with the given category */
  category?: string;
  /** Get torrents with the given tag */
  tag?: string;
  /** Sort torrents by given key */
  sort?: string;
  /** Enable reverse sorting */
  reverse?: boolean;
  /** Limit the number of torrents returned */
  limit?: number;
  /** Set offset (if less than 0, offset from end) */
  offset?: number;
  /** Filter by hashes */
  hashes?: string;
}

export interface CreateFeedPayload {
  /** RSS feed URL */
  url: string;
  /** RSS feed name/path */
  name: string;
}

export interface PeerLogPayload {
  /** Last known ID */
  last_known_id?: number;
}
