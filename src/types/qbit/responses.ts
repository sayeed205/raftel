import type { SearchResult } from '../search';
import type { TorrentPeer } from './torrent';
import type { ServerState } from '@/types/api.ts';

export interface MaindataResponse {
  /** Request ID for incremental updates */
  rid: number;
  /** Whether this is a full update */
  full_update?: boolean;
  /** Torrents data */
  torrents?: Record<string, any>;
  /** Torrents removed */
  torrents_removed?: Array<string>;
  /** Categories data */
  categories?: Record<string, any>;
  /** Categories removed */
  categories_removed?: Array<string>;
  /** Tags data */
  tags?: Array<string>;
  /** Tags removed */
  tags_removed?: Array<string>;
  /** Server state */
  server_state?: ServerState;
}

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
  /** Search results */
  results: Array<SearchResult>;
  /** Search status */
  status: 'Running' | 'Stopped';
  /** Total results */
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

export function isFullUpdate(response: MaindataResponse): boolean {
  return response.full_update === true;
}
