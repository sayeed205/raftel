export interface SearchEngine {
  /** Search engine unique identifier */
  id: string;
  /** Search engine name */
  name: string;
  /** Search engine URL */
  url: string;
  /** Whether search engine is enabled */
  enabled: boolean;
  /** Supported categories */
  categories: Array<string>;
  /** Search engine version */
  version?: string;
  /** Full name of the search engine */
  fullName?: string;
  /** Supported categories with names */
  supportedCategories?: Record<string, string>;
}

export interface SearchResult {
  /** URL of the torrent's description page */
  descrLink: string;
  /** Name of the file */
  fileName: string;
  /** Size of the file in Bytes */
  fileSize: number;
  /** Torrent download link (usually either .torrent file or magnet link) */
  fileUrl: string;
  /** Number of leechers */
  nbLeechers: number;
  /** Number of seeders */
  nbSeeders: number;
  /** URL of the torrent site */
  siteUrl: string;
  /**
   * Engine name
   * @since 5.X
   */
  engineName?: string;
  /**
   * Publication date, in seconds since epoch
   * @since 5.X
   */
  pubDate?: number;
}

export interface SearchJob {
  /** Search job ID */
  id: number;
}

export interface SearchStatus {
  /** Search job ID */
  id: number;
  /** Current status of the search job (either Running or Stopped) */
  status: 'Running' | 'Stopped';
  /** Total number of results. If the status is Running this number may continue to increase */
  total: number;
}

export interface SearchPlugin {
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Plugin URL */
  url: string;
  /** Whether plugin is enabled */
  enabled: boolean;
  /** Supported categories */
  supportedCategories: Array<{ id: string; name: string }>;
  /** Full name */
  fullName: string;
}

export interface SearchQuery {
  /** Search pattern */
  pattern: string;
  /** Search category */
  category?: string;
  /** Search engines to use */
  plugins?: Array<string>;
  /** Minimum number of seeds */
  minSeeds?: number;
  /** Maximum number of seeds */
  maxSeeds?: number;
  /** Minimum file size */
  minSize?: number;
  /** Maximum file size */
  maxSize?: number;
}

export interface SearchHistoryItem {
  /** Search query */
  query: SearchQuery;
  /** Search timestamp */
  timestamp: Date;
  /** Number of results found */
  resultsCount: number;
  /** Search duration in milliseconds */
  duration?: number;
}
