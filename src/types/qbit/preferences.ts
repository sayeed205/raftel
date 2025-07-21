import type {
  AutoDeleteMode,
  BitTorrentProtocol,
  ContentLayout,
  DiskIOMode,
  DiskIOType,
  Encryption,
  FileLogAgeType,
  ProxyType,
  ResumeDataStorageType,
  SchedulerDays,
  ShareLimitAction,
  StopCondition,
  UploadChokingAlgorithm,
  UploadSlotsBehavior,
  UtpTcpMixedMode,
} from './constants';

export interface NetworkInterface {
  name: string;
  value: string;
}

export interface ScanDirs {
  [path: string]: number;
}

export interface QBittorrentPreferences {
  // General settings
  /** Whether torrents should be placed at the top of the queue when added */
  add_to_top_of_queue: boolean;
  /** List of trackers to add to new torrent */
  add_trackers: string;
  /** Enable automatic adding of trackers to new torrents */
  add_trackers_enabled: boolean;
  /** Enable automatic adding of trackers from provided url to new torrents */
  add_trackers_from_url_enabled?: boolean;
  /** URL to fetch trackers from */
  add_trackers_url?: string;
  /** List of trackers fetched from URL */
  readonly add_trackers_url_list?: string;

  // Speed settings
  /** Alternative global download speed limit in KiB/s */
  alt_dl_limit: number;
  /** Alternative global upload speed limit in KiB/s */
  alt_up_limit: number;
  /** Global download speed limit in KiB/s */
  dl_limit: number;
  /** Global upload speed limit in KiB/s */
  up_limit: number;
  /** Enable alternative speed limits scheduler */
  scheduler_enabled: boolean;
  /** Scheduler start time */
  schedule_from_hour: number;
  schedule_from_min: number;
  /** Scheduler end time */
  schedule_to_hour: number;
  schedule_to_min: number;
  /** Scheduler days */
  scheduler_days: SchedulerDays;

  // Download settings
  /** Default save path for torrents */
  save_path: string;
  /** Enable temporary path */
  temp_path_enabled: boolean;
  /** Temporary path for incomplete downloads */
  temp_path: string;
  /** Enable automatic torrent management */
  auto_tmm_enabled: boolean;
  /** Torrent content layout */
  torrent_content_layout: ContentLayout;
  /** Create subfolder for torrents with multiple files */
  create_subfolder_enabled: boolean;
  /** Start torrents in paused state */
  start_paused_enabled: boolean;
  /** Delete .torrent files afterwards */
  auto_delete_mode: AutoDeleteMode;
  /** Pre-allocate disk space for all files */
  preallocate_all: boolean;
  /** Append .!qB extension to incomplete files */
  incomplete_files_ext: boolean;

  // Connection settings
  /** Port used for incoming connections */
  listen_port: number;
  /** Use UPnP/NAT-PMP port forwarding from my router */
  upnp: boolean;
  /** Use random port on each startup */
  random_port: boolean;
  /** Maximum number of connections per torrent */
  max_connec_per_torrent: number;
  /** Maximum number of upload slots per torrent */
  max_uploads_per_torrent: number;
  /** Maximum number of connections globally */
  max_connec: number;
  /** Maximum number of upload slots globally */
  max_uploads: number;
  /** Proxy type */
  proxy_type: ProxyType;
  /** Proxy IP */
  proxy_ip: string;
  /** Proxy port */
  proxy_port: number;
  /** Proxy username */
  proxy_username: string;
  /** Proxy password */
  proxy_password: string;
  /** Use proxy for peer connections */
  proxy_peer_connections: boolean;
  /** Use proxy for RSS purposes */
  proxy_rss: boolean;
  /** Use proxy for general purposes */
  proxy_misc: boolean;
  /** Use proxy for hostname lookup */
  proxy_hostname_lookup: boolean;

  // BitTorrent settings
  /** Enable DHT to find more peers */
  dht: boolean;
  /** Enable Peer Exchange (PeX) to find more peers */
  pex: boolean;
  /** Enable Local Peer Discovery to find more peers */
  lsd: boolean;
  /** Encryption mode */
  encryption: Encryption;
  /** Maximum active downloads */
  max_active_downloads: number;
  /** Maximum active uploads */
  max_active_uploads: number;
  /** Maximum active torrents */
  max_active_torrents: number;
  /** Don't count slow torrents in these limits */
  dont_count_slow_torrents: boolean;
  /** Download rate threshold KiB/s */
  slow_torrent_dl_rate_threshold: number;
  /** Upload rate threshold KiB/s */
  slow_torrent_ul_rate_threshold: number;
  /** Inactive seeding time limit */
  slow_torrent_inactive_timer: number;
  /** Share ratio limit */
  max_ratio_enabled: boolean;
  max_ratio: number;
  /** Share ratio action */
  max_ratio_act: ShareLimitAction;
  /** Seeding time limit */
  max_seeding_time_enabled: boolean;
  max_seeding_time: number;
  /** Seeding time action */
  max_seeding_time_act: ShareLimitAction;
  /** BitTorrent protocol */
  bittorrent_protocol: BitTorrentProtocol;
  /** Upload choking algorithm */
  upload_choking_algorithm: UploadChokingAlgorithm;
  /** Upload slots behavior */
  upload_slots_behavior: UploadSlotsBehavior;
  /** UTP-TCP mixed mode algorithm */
  utp_tcp_mixed_mode: UtpTcpMixedMode;

  // RSS settings
  /** RSS refresh interval in minutes */
  rss_refresh_interval: number;
  /** Maximum articles per RSS feed */
  rss_max_articles_per_feed: number;
  /** Process RSS feeds */
  rss_processing_enabled: boolean;
  /** Auto downloading from RSS feeds */
  rss_auto_downloading_enabled: boolean;
  /** Smart episode filter */
  rss_download_repack_proper_episodes: boolean;
  /** RSS smart filter */
  rss_smart_episode_filters: string;

  // Web UI settings
  /** Web UI port */
  web_ui_port: number;
  /** Web UI address */
  web_ui_address: string;
  /** Web UI domain list */
  web_ui_domain_list: string;
  /** Web UI username */
  web_ui_username: string;
  /** Web UI password */
  web_ui_password: string;
  /** Enable CSRF protection */
  web_ui_csrf_protection_enabled: boolean;
  /** Enable clickjacking protection */
  web_ui_clickjacking_protection_enabled: boolean;
  /** Enable secure cookie */
  web_ui_secure_cookie_enabled: boolean;
  /** Maximum authentication failure count */
  web_ui_max_auth_fail_count: number;
  /** Authentication failure ban duration in seconds */
  web_ui_ban_duration: number;
  /** Session timeout in seconds */
  web_ui_session_timeout: number;
  /** Use alternative Web UI */
  alternative_webui_enabled: boolean;
  /** Alternative Web UI path */
  alternative_webui_path: string;
  /** Use HTTPS instead of HTTP */
  web_ui_https_enabled: boolean;
  /** HTTPS certificate path */
  web_ui_https_cert_path: string;
  /** HTTPS key path */
  web_ui_https_key_path: string;
  /** Use UPnP for Web UI port */
  web_ui_upnp: boolean;

  // Advanced settings
  /** Resume data storage type */
  resume_data_storage_type: ResumeDataStorageType;
  /** Torrent queueing */
  queueing_enabled: boolean;
  /** Maximum active checking torrents */
  max_active_checking_torrents: number;
  /** Disk cache size in MiB */
  disk_cache: number;
  /** Disk cache TTL in seconds */
  disk_cache_ttl: number;
  /** Disk IO mode */
  disk_io_mode: DiskIOMode;
  /** Disk IO type */
  disk_io_type: DiskIOType;
  /** Enable OS cache */
  enable_os_cache: boolean;
  /** Enable coalesce reads & writes */
  enable_coalesce_read_write: boolean;
  /** Enable piece extent affinity */
  enable_piece_extent_affinity: boolean;
  /** Send upload piece suggestions */
  enable_upload_suggestions: boolean;
  /** Send buffer watermark */
  send_buffer_watermark: number;
  /** Send buffer low watermark */
  send_buffer_low_watermark: number;
  /** Send buffer watermark factor */
  send_buffer_watermark_factor: number;
  /** Connection speed */
  connection_speed: number;
  /** Socket backlog size */
  socket_backlog_size: number;
  /** Outgoing ports min */
  outgoing_ports_min: number;
  /** Outgoing ports max */
  outgoing_ports_max: number;
  /** UTP rate limit */
  utp_rate_limited: boolean;
  /** Mixed mode algorithm */
  mixed_mode_algorithm: UtpTcpMixedMode;
  /** Enable embedded tracker */
  enable_embedded_tracker: boolean;
  /** Embedded tracker port */
  embedded_tracker_port: number;
  /** Check for updates */
  check_for_updates: boolean;
  /** Use icon theme */
  use_icon_theme: boolean;

  // Logging
  /** Log level */
  log_level: number;
  /** Enable logging to file */
  log_file_enabled: boolean;
  /** Log file path */
  log_file_path: string;
  /** Backup old log files */
  log_backup_enabled: boolean;
  /** Maximum log file size in KiB */
  log_max_size: number;
  /** Delete old log files */
  log_delete_old: boolean;
  /** Log file age type */
  log_delete_old_type: FileLogAgeType;
  /** Log file age */
  log_delete_old_value: number;
  /** Performance warning */
  performance_warning: boolean;

  // Behavior
  /** Confirm torrent deletion */
  confirm_torrent_deletion: boolean;
  /** Confirm torrent recheck */
  confirm_torrent_recheck: boolean;
  /** Confirm exit when downloads active */
  confirm_remove_all_tags: boolean;
  /** Listen on IPv6 address */
  listen_on_ipv6_address: boolean;
  /** Announce to all trackers in a tier */
  announce_to_all_trackers: boolean;
  /** Announce to all tiers */
  announce_to_all_tiers: boolean;
  /** Announce IP */
  announce_ip: string;
  /** Stop condition */
  torrent_stop_condition: StopCondition;
  /** Merge trackers to existing torrents */
  merge_trackers: boolean;

  // Watched folders
  /** Scan directories */
  scan_dirs: ScanDirs;
  /** Export directory */
  export_dir: string;
  /** Export directory for finished torrents */
  export_dir_fin: string;
  /** Mail notification */
  mail_notification_enabled: boolean;
  /** Mail notification email */
  mail_notification_sender: string;
  /** Mail notification email */
  mail_notification_email: string;
  /** Mail notification SMTP server */
  mail_notification_smtp: string;
  /** Mail notification SSL */
  mail_notification_ssl_enabled: boolean;
  /** Mail notification authentication */
  mail_notification_auth_enabled: boolean;
  /** Mail notification username */
  mail_notification_username: string;
  /** Mail notification password */
  mail_notification_password: string;

  // Run external program
  /** Run external program on torrent completion */
  autorun_enabled: boolean;
  /** External program path */
  autorun_program: string;
}
