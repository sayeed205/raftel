import type { Category, ServerState } from '@/types/api';

import type { SearchResult } from '../search';

import type { RawTorrent, TorrentPeer } from './torrent';

interface FullUpdate {
  /** Whether the response contains all or partial data */
  full_update: true;
  /**
   * Response ID
   * Will cycle between 1 and 1,000,000
   **/
  rid: number;
  /** Current state of the server */
  server_state: ServerState;
  /** Categories data of the server */
  categories?: Record<string, Category>;
  /** Tags list of the server */
  tags?: Array<string>;
  /** Torrents data of the server */
  torrents?: Record<string, RawTorrent>;
  /**
   * Trackers data of the server
   *
   * Key: Tracker URL
   *
   * Value: Torrents hash array
   */
  trackers?: Record<string, Array<string>>;
}

interface PartialUpdate {
  /**
   * Response ID
   * Will cycle between 1 and 1,000,000
   **/
  rid: number;
  /** Diff state of the server since last snapshot */
  server_state?: Partial<ServerState>;
  /** Added or updated categories since last snapshot */
  categories?: Record<string, Partial<Category>>;
  /** Removed categories' name since last snapshot */
  categories_removed?: Array<string>;
  /** Added tags since last snapshot */
  tags?: Array<string>;
  /** Removed tags since last snapshot */
  tags_removed?: Array<string>;
  /** Added or updated torrents since last snapshot */
  torrents?: Record<string, Partial<RawTorrent>>;
  /** Removed torrents' hash since last snapshot */
  torrents_removed?: Array<string>;
  /**
   * Added or updated trackers since last snapshot
   *
   * Key: Tracker URL
   *
   * Value: Torrents hash array
   */
  trackers?: Record<string, Array<string>>;
  /** Removed trackers' URL since last snapshot */
  trackers_removed?: Array<string>;
}

export type MainDataResponse = FullUpdate | PartialUpdate;

export interface TorrentPeersResponse {
  /** Request ID for incremental updates */
  rid: number;
  /** Whether this is a full update */
  full_update?: boolean;
  /** Show flags */
  show_flags: boolean;
  /** Peers data */
  peers: Record<string, TorrentPeer>;
  /** Peers removed */
  peers_removed?: Array<string>;
}

export interface SearchResultsResponse {
  /** Array of result objects-see table below */
  results: Array<SearchResult>;
  /** Current status of the search job (either Running or Stopped) */
  status: 'Running' | 'Stopped';
  /** Total number of results. If the status is Running this number may continue to increase */
  total: number;
}

export interface PeerLogResponse {
  /** Log ID */
  id: number;
  /** IP address */
  ip: string;
  /** Timestamp */
  timestamp: number;
  /** Blocked status */
  blocked: boolean;
  /** Reason for blocking */
  reason: string;
}

export function isFullUpdate(response: MainDataResponse): response is FullUpdate {
  return 'full_update' in response && response.full_update;
}
