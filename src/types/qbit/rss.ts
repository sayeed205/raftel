import type { ContentLayout } from './constants';

export interface FeedArticle {
  /** Article author */
  author: string;
  /** Article category */
  category?: string;
  /** Article publication date */
  date: string;
  /** Article description */
  description?: string;
  /** Article ID */
  id: string;
  /** Whether the article has already been read */
  isRead?: boolean;
  /** Article link */
  link: string;
  /** Article title */
  title: string;
  /** Torrent download URL */
  torrentURL: string;
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
  /** Torrent save path
   * @deprecated since v4.6.0 */
  savePath?: string;
  /** Torrent category
   * @deprecated since v4.6.0 */
  assignedCategory?: string;
  /** Torrent stopped state
   * @deprecated since v4.6.0 */
  addPaused?: boolean;
  /** Torrent content layout
   * @deprecated since v4.6.0 */
  torrentContentLayout?: ContentLayout;
}

export interface FeedRule extends LegacyFeedRule {
  /** The feed URLs the rule applies to */
  affectedFeeds: Array<string>;
  /** Whether the rule is enabled */
  enabled: boolean;
  /**
   * Matches articles based on episode filter.
   *
   * Example: 1x2;8-15;5;30-; will match 2, 5, 8 through 15, 30 and onward episodes of season one
   *
   * Episode filter rules:
   *
   *  - Season number is a mandatory non-zero value
   *  - Episode number is a mandatory positive value
   *  - Filter must end with semicolon
   *  - Three range types for episodes are supported:
   *    - * Single number: 1x25; matches episode 25 of season one
   *    - * Normal range: 1x25-40; matches episodes 25 through 40 of season one
   *    - * Infinite range: 1x25-; matches episodes 25 and upward of season one, and all episodes of later seasons
   */
  /**
   * Ignore articles where its date is within n days
   * Values less than 1 will be ignored
   */
  ignoreDays: number;
  /**
   * The rule last match time
   * Must match RFC-2822 or ISO-8601 date format
   * source: https://www.rfc-editor.org/rfc/rfc2822#page-14
   */
  lastMatch: string;
  /**
   * Wildcard mode: you can use
   *
   *  - ? to match any single character
   *  - \* to match zero or more of any characters
   *  - Whitespaces count as AND operators (all words, any order)
   *  - | is used as OR operator
   *
   * If word order is important use * instead of whitespace.
   *
   * An expression with an empty | clause (e.g. expr|) will match all articles.
   */
  mustContain: string;
  /**
   * Wildcard mode: you can use
   *
   *  - ? to match any single character
   *  - \* to match zero or more of any characters
   *  - Whitespaces count as AND operators (all words, any order)
   *  - | is used as OR operator
   *
   * If word order is important use * instead of whitespace.
   *
   * An expression with an empty | clause (e.g. expr|) will exclude all articles.
   */
  mustNotContain: string;
  /** The rule name */
  name: string;
  /** The list of episodes already matched by smart filter */
  previouslyMatchedEpisodes: Array<string>;
  /** The rule priority */
  priority: number;
  /**
   * Smart Episode Filter will check the episode number to prevent downloading of duplicates.
   * Supports the formats: S01E01, 1x1, 2017.12.31 and 31.12.2017 (Date formats also support - as a separator)
   */
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
