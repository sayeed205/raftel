import type { ContentLayout } from './constants';

export interface FeedArticle {
  /** Article date */
  date: string;
  /** Article description */
  description: string;
  /** Article GUID */
  id: string;
  /** Whether article has been read */
  isRead: boolean;
  /** Article link */
  link: string;
  /** Article title */
  title: string;
  /** Torrent URL */
  torrentURL?: string;
}

export interface Feed {
  /** Feed name */
  name: string;
  /** Feed unique identifier */
  uid: string;
  /** Feed URL */
  url: string;
  /** Feed title */
  title?: string;
  /** Last build date */
  lastBuildDate?: string;
  /** Whether feed is currently loading */
  isLoading?: boolean;
  /** Whether feed has error */
  hasError?: boolean;
  /** Feed articles */
  articles?: Array<FeedArticle>;
}

export interface AddTorrentParams {
  /** Torrent save path */
  savePath?: string;
  /** Torrent category */
  category?: string;
  /** Torrent tags */
  tags?: Array<string>;
  /** Skip hash checking */
  skip_checking?: boolean;
  /** Add torrent in paused state */
  paused?: boolean;
  /** Torrent priority */
  priority?: number;
  /** Download limit */
  dlLimit?: number;
  /** Upload limit */
  upLimit?: number;
  /** Torrent content layout */
  contentLayout?: ContentLayout;
  /** Automatic torrent management */
  autoTMM?: boolean;
  /** Sequential download */
  sequentialDownload?: boolean;
  /** First and last piece priority */
  firstLastPiecePrio?: boolean;
}

export interface LegacyFeedRule {
  /** Torrent save path (deprecated since v4.6.0) */
  savePath?: string;
  /** Torrent category (deprecated since v4.6.0) */
  assignedCategory?: string;
  /** Torrent stopped state (deprecated since v4.6.0) */
  addPaused?: boolean;
  /** Torrent content layout (deprecated since v4.6.0) */
  torrentContentLayout?: ContentLayout;
}

export interface FeedRule extends LegacyFeedRule {
  /** The feed URLs the rule applies to */
  affectedFeeds: Array<string>;
  /** Whether the rule is enabled */
  enabled: boolean;
  /** Episode filter for matching articles */
  episodeFilter: string;
  /** Ignore articles where its date is within n days */
  ignoreDays: number;
  /** The rule last match time */
  lastMatch: string;
  /** Must contain filter */
  mustContain: string;
  /** Must not contain filter */
  mustNotContain: string;
  /** The rule name */
  name: string;
  /** The list of episodes already matched by smart filter */
  previouslyMatchedEpisodes: Array<string>;
  /** The rule priority */
  priority: number;
  /** Smart Episode Filter */
  smartFilter: boolean;
  /** Parameters to apply to torrents added using that rule */
  torrentParams: AddTorrentParams;
  /** Enable regex mode in "mustContain" and "mustNotContain" */
  useRegex: boolean;
}

export interface RSSFeedData {
  feeds: Record<string, Feed>;
  rules: Record<string, FeedRule>;
  history: Array<RSSDownloadHistory>;
}

export interface RSSDownloadHistory {
  id: string;
  feedName: string;
  ruleName: string;
  torrentName: string;
  downloadDate: Date;
  status: 'success' | 'failed' | 'duplicate';
}
