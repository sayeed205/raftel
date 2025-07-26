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
  /** Result name/title */
  name: string;
  /** File size in bytes */
  size: number;
  /** Number of seeds */
  seeds: number;
  /** Number of leechers/peers */
  peers: number;
  /** Search engine that provided this result */
  engine: string;
  /** Magnet link */
  magnetLink?: string;
  /** Direct download URL */
  downloadUrl?: string;
  /** Result description URL */
  descrLink?: string;
  /** Result category */
  category?: string;
  /** Publication date */
  pubDate?: string;
}

export interface SearchJob {
  /** Search job ID */
  id: number;
  /** Search pattern */
  pattern: string;
  /** Search category */
  category: string;
  /** Search engines used */
  plugins: Array<string>;
  /** Job status */
  status: 'Running' | 'Stopped';
  /** Total results found */
  total: number;
}

export interface SearchStatus {
  /** Search job ID */
  id: number;
  /** Search status */
  status: 'Running' | 'Stopped';
  /** Total results */
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

export interface SearchResultsResponse {
  /** Search results */
  results: Array<SearchResult>;
  /** Search status */
  status: 'Running' | 'Stopped';
  /** Total results */
  total: number;
}
