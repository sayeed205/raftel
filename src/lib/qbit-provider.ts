import type {
  ApiError,
  Category,
  GlobalTransferInfo,
  ServerState,
  TorrentFile,
  TorrentInfo,
  TorrentPeer,
  TorrentProperties,
  TorrentTracker,
} from '@/types/api';
import type {
  DirectoryContentMode,
  FilePriority,
  PieceState,
} from '@/types/qbit/constants';
import { LogType } from '@/types/qbit/constants';
import type {
  AddTorrentPayload,
  AppPreferencesPayload,
  CreateFeedPayload,
  GetTorrentPayload,
  LoginPayload,
} from '@/types/qbit/payloads';
import type {
  NetworkInterface,
  QBittorrentPreferences,
} from '@/types/qbit/preferences';
import type {
  MaindataResponse,
  SearchResultsResponse,
  TorrentPeersResponse,
} from '@/types/qbit/responses';
import type { Feed, FeedRule } from '@/types/qbit/rss';
import type { SearchJob, SearchPlugin, SearchStatus } from '@/types/search';
import type {
  BuildInfo,
  Cookie,
  Log,
  SSLParameters,
  TorrentCreatorParams,
  TorrentCreatorTask,
} from '@/types/statistics';
import type { Options } from 'ky';
import ky, { HTTPError } from 'ky';

type Parameters = Record<string, any>;

interface RequestConfig {
  validateStatus?: (status: number) => boolean;
  responseType?: 'json' | 'text' | 'arraybuffer' | 'blob';
  headers?: Record<string, string>;
}

class QBitProvider {
  private baseUrl = '/api/v2';
  private isAuthenticated = false;

  constructor() {}

  // / Utility Methods ///

  async getBuildInfo(): Promise<BuildInfo | undefined> {
    try {
      return await this.request<BuildInfo>('/app/buildInfo');
    } catch {
      return undefined;
    }
  }

  async getVersion(): Promise<string> {
    const version = await this.request<string>(
      '/app/version',
      {},
      { responseType: 'text' },
    );
    return version.includes('v') ? version.substring(1) : version;
  }

  async getPreferences(): Promise<QBittorrentPreferences> {
    return this.request<QBittorrentPreferences>('/app/preferences');
  }

  // / AppController ///

  async setPreferences(params: AppPreferencesPayload): Promise<void> {
    const data = {
      json: JSON.stringify(params),
    };
    return this.post('/app/setPreferences', data);
  }

  async shutdownApp(): Promise<boolean> {
    try {
      await this.post('/app/shutdown');
      return true;
    } catch {
      return false;
    }
  }

  async getNetworkInterfaces(): Promise<Array<NetworkInterface>> {
    return this.request<Array<NetworkInterface>>('/app/networkInterfaceList');
  }

  async getAddresses(iface = ''): Promise<Array<string>> {
    return this.request<Array<string>>(
      `/app/networkInterfaceAddressList?iface=${iface}`,
    );
  }

  async sendTestEmail(): Promise<void> {
    await this.post('/app/sendTestEmail');
  }

  async getDirectoryContent(
    dirPath: string,
    mode?: DirectoryContentMode,
  ): Promise<Array<string> | null> {
    try {
      return await this.post(
        '/app/getDirectoryContent',
        { dirPath, mode },
        { validateStatus: (code) => code < 500 },
      );
    } catch {
      return null;
    }
  }

  async getCookies(): Promise<Array<Cookie>> {
    return this.request<Array<Cookie>>('/app/cookies');
  }

  async setCookies(cookies: Array<Cookie>): Promise<void> {
    await this.post('/app/setCookies', {
      cookies: JSON.stringify(cookies),
    });
  }

  async login(params: LoginPayload): Promise<void> {
    const text = await this.request<string>(
      '/auth/login',
      {
        method: 'POST',
        body: new URLSearchParams(params as unknown as Record<string, string>),
      },
      {
        responseType: 'text',
        validateStatus: (status) => status < 500,
      },
    );

    if (text === 'Ok.') {
      this.isAuthenticated = true;
    } else if (text === 'Fails.') {
      throw new Error('Invalid credentials');
    } else {
      throw new Error('Login failed');
    }
  }

  async logout(): Promise<void> {
    await this.post('/auth/logout');
    this.isAuthenticated = false;
  }

  async getLogs(
    afterId?: number,
    logsToInclude?: LogType,
  ): Promise<Array<Log>> {
    const includeFilter = logsToInclude ?? LogType.ALL;

    const filterMaskInfo = (includeFilter & LogType.INFO) as LogType;
    const filterMaskNormal = (includeFilter & LogType.NORMAL) as LogType;
    const filterMaskWarning = (includeFilter & LogType.WARNING) as LogType;
    const filterMaskCritical = (includeFilter & LogType.CRITICAL) as LogType;

    const params = {
      last_known_id: afterId,
      info: filterMaskInfo === LogType.INFO,
      normal: filterMaskNormal === LogType.NORMAL,
      warning: filterMaskWarning === LogType.WARNING,
      critical: filterMaskCritical === LogType.CRITICAL,
    };

    return this.request<Array<Log>>(
      `/log/main?${new URLSearchParams(params as any).toString()}`,
    );
  }

  async getPeerLogs(afterId?: number): Promise<Array<any>> {
    const params = {
      last_known_id: afterId || -1,
    };

    return this.request<Array<any>>(
      `/log/peers?${new URLSearchParams(params as any).toString()}`,
    );
  }

  // / AuthController ///

  async createFeed(payload: CreateFeedPayload): Promise<void> {
    await this.post(
      '/rss/addFeed',
      {
        url: payload.url,
        path: payload.name,
      },
      {
        responseType: 'text',
      },
    );
  }

  async setRule(ruleName: string, ruleDef: FeedRule): Promise<void> {
    await this.post(
      '/rss/setRule',
      {
        ruleName,
        ruleDef: JSON.stringify(ruleDef),
      },
      {
        responseType: 'text',
      },
    );
  }

  // / LogController ///

  async getFeeds(withData: boolean): Promise<Array<Feed>> {
    const payload = await this.request<Record<string, any>>(
      `/rss/items?withData=${withData}`,
    );
    const feeds: Array<Feed> = [];
    for (const key in payload) {
      feeds.push({ name: key, ...payload[key] });
    }
    return feeds;
  }

  // / RssController ///

  async getRules(): Promise<Array<FeedRule>> {
    const payload = await this.request<Record<string, any>>('/rss/rules');
    const rules: Array<FeedRule> = [];
    for (const key in payload) {
      const ruleBody = payload[key] as Omit<FeedRule, 'name'>;
      const rule = {
        name: key,
        ...ruleBody,
      };

      if (!Object.hasOwn(rule, 'torrentParams')) {
        rule.torrentParams = {
          savePath: (ruleBody as any).savePath,
          category: (ruleBody as any).assignedCategory,
          paused: (ruleBody as any).addPaused,
          contentLayout: (ruleBody as any).torrentContentLayout,
        };
      }

      rules.push(rule);
    }
    return rules;
  }

  async renameFeed(oldName: string, newName: string): Promise<void> {
    await this.post(
      '/rss/moveItem',
      {
        itemPath: oldName,
        destPath: newName,
      },
      {
        responseType: 'text',
      },
    );
  }

  async setFeedUrl(path: string, url: string): Promise<void> {
    await this.post(
      '/rss/setFeedURL',
      { path, url },
      {
        responseType: 'text',
      },
    );
  }

  async renameRule(ruleName: string, newRuleName: string): Promise<void> {
    await this.post(
      '/rss/renameRule',
      {
        ruleName,
        newRuleName,
      },
      {
        responseType: 'text',
      },
    );
  }

  async deleteRule(ruleName: string): Promise<void> {
    await this.post(
      '/rss/removeRule',
      { ruleName },
      {
        responseType: 'text',
      },
    );
  }

  async deleteFeed(name: string): Promise<void> {
    await this.post(
      '/rss/removeItem',
      {
        path: name,
      },
      {
        responseType: 'text',
      },
    );
  }

  async markAsRead(itemPath: string, articleId?: string): Promise<void> {
    const params: Record<string, string> = { itemPath };
    if (articleId) {
      params['articleId'] = articleId;
    }
    await this.post('/rss/markAsRead', params, {
      responseType: 'text',
    });
  }

  async refreshFeed(itemPath: string): Promise<void> {
    await this.post(
      '/rss/refreshItem',
      {
        itemPath,
      },
      {
        responseType: 'text',
      },
    );
  }

  async getMatchingArticles(
    ruleName: string,
  ): Promise<Record<string, Array<string>>> {
    return this.request<Record<string, Array<string>>>(
      `/rss/matchingArticles?ruleName=${ruleName}`,
    );
  }

  async startSearch(
    pattern: string,
    category: string,
    plugins: Array<string>,
  ): Promise<SearchJob> {
    const params = {
      pattern,
      category,
      plugins: plugins.join('|'),
    };

    return this.post('/search/start', params);
  }

  async stopSearch(id: number): Promise<boolean> {
    try {
      await this.post('/search/stop', { id });
      return true;
    } catch {
      return false;
    }
  }

  async getSearchStatus(id?: number): Promise<Array<SearchStatus>> {
    return this.post('/search/status', {
      id: id !== undefined ? id : 0,
    });
  }

  // / SearchController ///

  async getSearchResults(
    id: number,
    offset?: number,
    limit?: number,
  ): Promise<SearchResultsResponse> {
    return this.post('/search/results', {
      id,
      limit,
      offset,
    });
  }

  async deleteSearchPlugin(id: number): Promise<boolean> {
    try {
      await this.post('/search/delete', { id });
      return true;
    } catch {
      return false;
    }
  }

  async getSearchPlugins(): Promise<Array<SearchPlugin>> {
    return this.request<Array<SearchPlugin>>('/search/plugins');
  }

  async installSearchPlugin(sources: Array<string>): Promise<boolean> {
    try {
      await this.post('/search/installPlugin', {
        sources: sources.join('|'),
      });
      return true;
    } catch {
      return false;
    }
  }

  async uninstallSearchPlugin(names: Array<string>): Promise<void> {
    await this.post('/search/uninstallPlugin', { names: names.join('|') });
  }

  async enableSearchPlugin(
    names: Array<string>,
    enable: boolean,
  ): Promise<void> {
    const params = {
      names: names.join('|'),
      enable,
    };

    await this.post('/search/enablePlugin', params);
  }

  async updateSearchPlugins(): Promise<void> {
    await this.post('/search/updatePlugins');
  }

  async downloadTorrentWithSearchPlugin(
    torrentUrl: string,
    pluginName: string,
  ): Promise<void> {
    await this.post('/search/downloadTorrent', { torrentUrl, pluginName });
  }

  async getMaindata(rid?: number): Promise<MaindataResponse> {
    return this.request<MaindataResponse>(`/sync/maindata?rid=${rid || 0}`);
  }

  async syncTorrentPeers(
    hash: string,
    rid?: number,
  ): Promise<TorrentPeersResponse> {
    return this.request<TorrentPeersResponse>(
      `/sync/torrentPeers?hash=${hash}&rid=${rid || 0}`,
    );
  }

  async addTorrentCreatorTask(
    taskParams: TorrentCreatorParams,
  ): Promise<string> {
    if (taskParams.trackers) {
      taskParams.trackers = taskParams.trackers.trim().replaceAll('\n', '|');
    }
    if (taskParams.urlSeeds) {
      taskParams.urlSeeds = taskParams.urlSeeds.trim().replaceAll('\n', '|');
    }

    const response = await this.post('/torrentcreator/addTask', taskParams);
    return response.taskID;
  }

  // / SyncController ///

  async getTorrentCreatorStatus(
    taskID?: string,
  ): Promise<Array<TorrentCreatorTask>> {
    return this.request<Array<TorrentCreatorTask>>(
      `/torrentcreator/status${taskID ? `?taskID=${taskID}` : ''}`,
    );
  }

  async getTorrentCreatorOutput(taskID: string): Promise<Blob> {
    const arrayBuffer = await this.request<ArrayBuffer>(
      `/torrentcreator/torrentFile?taskID=${taskID}`,
      {},
      {
        responseType: 'arraybuffer',
        headers: {
          Accept: 'application/x-bittorrent',
        },
      },
    );
    return new Blob([arrayBuffer], { type: 'application/x-bittorrent' });
  }

  // / TorrentCreatorController ///

  async deleteTorrentCreatorTask(taskID: string): Promise<boolean> {
    try {
      await this.post('/torrentcreator/deleteTask', { taskID });
      return true;
    } catch {
      return false;
    }
  }

  async getTorrents(payload?: GetTorrentPayload): Promise<Array<TorrentInfo>> {
    const queryString = payload
      ? new URLSearchParams(payload as any).toString()
      : '';
    const endpoint = queryString
      ? `/torrents/info?${queryString}`
      : '/torrents/info';
    return this.request<Array<TorrentInfo>>(endpoint);
  }

  async getTorrentTrackers(hash: string): Promise<Array<TorrentTracker>> {
    return this.request<Array<TorrentTracker>>(
      `/torrents/trackers?hash=${hash}`,
    );
  }

  async setTorrentName(hash: string, name: string): Promise<void> {
    await this.post('/torrents/rename', { hash, name });
  }

  // / TorrentsController ///

  async getTorrentPieceStates(hash: string): Promise<Array<PieceState>> {
    return this.request<Array<PieceState>>(
      `/torrents/pieceStates?hash=${hash}`,
    );
  }

  async getTorrentFiles(
    hash: string,
    indexes?: Array<number>,
  ): Promise<Array<TorrentFile>> {
    const params = indexes
      ? `?hash=${hash}&indexes=${indexes.join('|')}`
      : `?hash=${hash}`;
    const files = await this.request<Array<TorrentFile>>(
      `/torrents/files${params}`,
    );

    // Add indexes if missing for compatibility with older qBittorrent versions
    return files.some((file) => file.index === undefined)
      ? files.map((file, index) => ({ ...file, index }))
      : files;
  }

  async getAvailableTags(): Promise<Array<string>> {
    const tags = await this.request<Array<string>>('/torrents/tags');
    return tags.sort((a, b) =>
      a.localeCompare(b.toLowerCase(), undefined, { sensitivity: 'base' }),
    );
  }

  async getTorrentProperties(hash: string): Promise<TorrentProperties> {
    return this.request<TorrentProperties>(`/torrents/properties?hash=${hash}`);
  }

  async addTorrents(
    torrents: Array<File>,
    urls: string,
    params?: AddTorrentPayload,
  ): Promise<void> {
    let data: FormData | URLSearchParams;

    if (torrents.length > 0) {
      // Torrent files
      const formData = new FormData();
      for (const [key, value] of Object.entries(params || {})) {
        if (value !== undefined) {
          formData.set(key, String(value));
        }
      }

      for (const torrent of torrents) {
        formData.append('torrents', torrent);
      }

      data = formData;
    } else {
      // Magnet links
      data = new URLSearchParams((params || {}) as Parameters);
    }

    if (urls) {
      data.set('urls', urls);
    }

    await this.request(
      '/torrents/add',
      {
        method: 'POST',
        body: data,
        headers: torrents.length > 0 ? {} : undefined, // Don't set Content-Type for FormData
      },
      { responseType: 'text' },
    );
  }

  async setTorrentFilePriority(
    hash: string,
    idList: Array<number>,
    priority: FilePriority,
  ): Promise<void> {
    const params = {
      hash,
      id: idList.join('|'),
      priority,
    };

    return this.post('/torrents/filePrio', params);
  }

  async deleteTorrents(
    hashes: Array<string>,
    deleteFiles: boolean,
  ): Promise<void> {
    if (!hashes.length) return;
    return this.torrentAction('delete', hashes, { deleteFiles });
  }

  async pauseTorrents(hashes: Array<string>): Promise<void> {
    return this.torrentAction('stop', hashes);
  }

  async stopTorrents(hashes: Array<string>): Promise<void> {
    return this.torrentAction('stop', hashes);
  }

  async resumeTorrents(hashes: Array<string>): Promise<void> {
    return this.torrentAction('resume', hashes);
  }

  async startTorrents(hashes: Array<string>): Promise<void> {
    return this.torrentAction('start', hashes);
  }

  async forceStartTorrents(hashes: Array<string>): Promise<void> {
    return this.torrentAction('setForceStart', hashes, { value: true });
  }

  async toggleSequentialDownload(hashes: Array<string>): Promise<void> {
    return this.torrentAction('toggleSequentialDownload', hashes);
  }

  async toggleFirstLastPiecePriority(hashes: Array<string>): Promise<void> {
    return this.torrentAction('toggleFirstLastPiecePrio', hashes);
  }

  async setSuperSeeding(hashes: Array<string>, value: boolean): Promise<void> {
    return this.torrentAction('setSuperSeeding', hashes, { value });
  }

  async setAutoTMM(hashes: Array<string>, enable: boolean): Promise<void> {
    return this.torrentAction('setAutoManagement', hashes, { enable });
  }

  async setDownloadLimit(hashes: Array<string>, limit: number): Promise<void> {
    return this.torrentAction('setDownloadLimit', hashes, { limit });
  }

  async setUploadLimit(hashes: Array<string>, limit: number): Promise<void> {
    return this.torrentAction('setUploadLimit', hashes, { limit });
  }

  async getTorrentsCount(): Promise<number> {
    return this.request<number>('/torrents/count');
  }

  async setShareLimit(
    hashes: Array<string>,
    ratioLimit: number,
    seedingTimeLimit: number,
    inactiveSeedingTimeLimit: number,
  ): Promise<void> {
    return this.torrentAction('setShareLimits', hashes, {
      ratioLimit,
      seedingTimeLimit,
      inactiveSeedingTimeLimit,
    });
  }

  async reannounceTorrents(hashes: Array<string>): Promise<void> {
    return this.torrentAction('reannounce', hashes);
  }

  async recheckTorrents(hashes: Array<string>): Promise<void> {
    return this.torrentAction('recheck', hashes);
  }

  async setTorrentDownloadPath(
    hashes: Array<string>,
    path: string,
  ): Promise<void> {
    const params = {
      id: hashes.length ? hashes.join('|') : 'all',
      path,
    };

    return this.post('/torrents/setDownloadPath', params);
  }

  async setTorrentSavePath(hashes: Array<string>, path: string): Promise<void> {
    const params = {
      id: hashes.length ? hashes.join('|') : 'all',
      path,
    };

    return this.post('/torrents/setSavePath', params);
  }

  async addTorrentTrackers(hash: string, trackers: string): Promise<void> {
    const params = {
      hash,
      urls: trackers,
    };

    return this.post('/torrents/addTrackers', params);
  }

  async editTorrentTracker(
    hash: string,
    origUrl: string,
    newUrl: string,
  ): Promise<void> {
    const params = {
      hash,
      origUrl,
      newUrl,
    };

    return this.post('/torrents/editTracker', params);
  }

  async removeTorrentTrackers(
    hash: string,
    trackers: Array<string>,
  ): Promise<void> {
    const params = {
      hash,
      urls: trackers.join('|'),
    };

    return this.post('/torrents/removeTrackers', params);
  }

  async addTorrentPeers(
    hashes: Array<string>,
    peers: Array<string>,
  ): Promise<void> {
    return this.torrentAction('addPeers', hashes, {
      peers: peers.join('|'),
    });
  }

  async renameFile(
    hash: string,
    oldPath: string,
    newPath: string,
  ): Promise<void> {
    const params = {
      hash,
      oldPath,
      newPath,
    };

    return this.post('/torrents/renameFile', params);
  }

  async renameFolder(
    hash: string,
    oldPath: string,
    newPath: string,
  ): Promise<void> {
    const params = {
      hash,
      oldPath,
      newPath,
    };

    return this.post('/torrents/renameFolder', params);
  }

  async setTorrentPriority(
    hashes: Array<string>,
    priority: 'increasePrio' | 'decreasePrio' | 'topPrio' | 'bottomPrio',
  ): Promise<void> {
    return this.post(`/torrents/${priority}`, {
      hashes: hashes.join('|'),
    });
  }

  async addTorrentTag(
    hashes: Array<string>,
    tags: Array<string>,
  ): Promise<void> {
    return this.torrentAction('addTags', hashes, { tags: tags.join(',') });
  }

  async removeTorrentTag(
    hashes: Array<string>,
    tags?: Array<string>,
  ): Promise<void> {
    const options = tags ? { tags: tags.join(',') } : undefined;
    return this.torrentAction('removeTags', hashes, options);
  }

  async createTag(tags: Array<string>): Promise<void> {
    return this.post('/torrents/createTags', {
      tags: tags.join(','),
    });
  }

  async deleteTags(tags: Array<string>): Promise<void> {
    return this.post('/torrents/deleteTags', {
      tags: tags.join(','),
    });
  }

  async getCategories(): Promise<Array<Category>> {
    const data = await this.request<Record<string, Category>>(
      '/torrents/categories',
    );
    return Object.values(data);
  }

  async deleteCategory(categories: Array<string>): Promise<void> {
    return this.post('/torrents/removeCategories', {
      categories: categories.join('\n'),
    });
  }

  async createCategory(cat: Category): Promise<void> {
    return this.post('/torrents/createCategory', {
      category: cat.name,
      savePath: cat.savePath,
    });
  }

  async setCategory(hashes: Array<string>, category: string): Promise<void> {
    return this.torrentAction('setCategory', hashes, { category });
  }

  async editCategory(cat: Category): Promise<void> {
    const params = {
      category: cat.name,
      savePath: cat.savePath,
    };

    return this.post('/torrents/editCategory', params);
  }

  async exportTorrent(hash: string): Promise<Blob> {
    const arrayBuffer = await this.request<ArrayBuffer>(
      `/torrents/export?hash=${hash}`,
      {},
      {
        responseType: 'arraybuffer',
        headers: {
          Accept: 'application/x-bittorrent',
        },
      },
    );
    return new Blob([arrayBuffer], { type: 'application/x-bittorrent' });
  }

  async SSLParameters(hash: string): Promise<SSLParameters> {
    return this.request<SSLParameters>(`/torrents/SSLParameters?hash=${hash}`);
  }

  async setSSLParameters(
    hash: string,
    params: SSLParameters,
  ): Promise<boolean> {
    try {
      await this.post('/torrents/setSSLParameters', {
        hash,
        ssl_certificate: params.ssl_certificate,
        ssl_private_key: params.ssl_private_key,
        ssl_dh_params: params.ssl_dh_params,
      });
      return true;
    } catch {
      return false;
    }
  }

  async toggleSpeedLimitsMode(): Promise<void> {
    return this.post('/transfer/toggleSpeedLimitsMode');
  }

  async getGlobalDownloadLimit(): Promise<number> {
    return this.request<number>('/transfer/downloadLimit');
  }

  async getGlobalUploadLimit(): Promise<number> {
    return this.request<number>('/transfer/uploadLimit');
  }

  // / TransferController ///

  async setGlobalDownloadLimit(limit: number): Promise<void> {
    return this.post('/transfer/setDownloadLimit', {
      limit,
    });
  }

  async setGlobalUploadLimit(limit: number): Promise<void> {
    const data = {
      limit,
    };

    return this.post('/transfer/setUploadLimit', data);
  }

  async banPeers(peers: Array<string>): Promise<void> {
    const params = {
      peers: peers.join('|'),
    };

    return this.post('/transfer/banPeers', params);
  }

  getAuthStatus(): boolean {
    return this.isAuthenticated;
  }

  async checkAuth(): Promise<boolean> {
    try {
      await this.request('/sync/maindata');
      this.isAuthenticated = true;
      return true;
    } catch (error: any) {
      if (error.status === 403 || error.status === 401) {
        this.isAuthenticated = false;
        return false;
      }
      this.isAuthenticated = false;
      return false;
    }
  }

  // Legacy compatibility methods for existing API
  async getServerState(): Promise<ServerState> {
    // qBittorrent doesn't have a separate serverState endpoint
    // We need to get this from the mainData sync
    const mainData = await this.getMaindata();
    return (
      mainData.server_state || {
        connection_status: 'disconnected',
        dht_nodes: 0,
        dl_info_data: 0,
        dl_info_speed: 0,
        dl_rate_limit: 0,
        free_space_on_disk: 0,
        global_ratio: '0',
        queued_io_jobs: 0,
        queueing: false,
        read_cache_hits: '0',
        read_cache_overload: '0',
        refresh_interval: 1500,
        total_buffers_size: 0,
        total_peer_connections: 0,
        total_queued_size: 0,
        total_wasted_session: 0,
        up_info_data: 0,
        up_info_speed: 0,
        up_rate_limit: 0,
        use_alt_speed_limits: false,
        write_cache_overload: '0',
      }
    );
  }

  // / Utility Methods ///

  async getGlobalTransferInfo(): Promise<GlobalTransferInfo> {
    // qBittorrent doesn't have a separate transfer/info endpoint
    // We need to get this from the maindata sync
    const maindata = await this.getMaindata();
    return {
      dl_info_speed: maindata.server_state?.dl_info_speed || 0,
      dl_info_data: maindata.server_state?.dl_info_data || 0,
      up_info_speed: maindata.server_state?.up_info_speed || 0,
      up_info_data: maindata.server_state?.up_info_data || 0,
      dl_rate_limit: maindata.server_state?.dl_rate_limit || 0,
      up_rate_limit: maindata.server_state?.up_rate_limit || 0,
      dht_nodes: maindata.server_state?.dht_nodes || 0,
      connection_status:
        maindata.server_state?.connection_status || 'disconnected',
    };
  }

  async getTorrentPeers(
    hash: string,
  ): Promise<{ peers: Record<string, TorrentPeer> }> {
    return this.request<{ peers: Record<string, TorrentPeer> }>(
      `/sync/torrentPeers?hash=${hash}`,
    );
  }

  async getApiVersion(): Promise<string> {
    return this.request<string>(
      '/app/webapiVersion',
      {},
      { responseType: 'text' },
    );
  }

  async syncMainData(rid = 0): Promise<any> {
    return this.request<any>(`/sync/maindata?rid=${rid}`);
  }

  private async request<T>(
    endpoint: string,
    options: Options = {},
    config?: RequestConfig,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Referer: window.location.origin,
      ...config?.headers,
      ...options.headers,
    };

    const kyOptions: Options = {
      credentials: 'include',
      ...options,
      headers,
      throwHttpErrors: false,
    };

    try {
      const response = await ky(url, kyOptions);

      // Handle validation status
      const isValidStatus = config?.validateStatus
        ? config.validateStatus(response.status)
        : response.ok;

      if (!isValidStatus) {
        if (response.status === 403 || response.status === 401) {
          this.isAuthenticated = false;
          throw new Error('Authentication required');
        }

        throw {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      // Handle different response types
      const responseType = config?.responseType || 'json';

      switch (responseType) {
        case 'json':
          try {
            const text = await response.text();
            if (!text.trim()) {
              // Return empty object for empty responses
              return {} as T;
            }
            return JSON.parse(text) as T;
          } catch (jsonError) {
            throw new Error(
              `Failed to parse JSON response: ${jsonError instanceof Error ? jsonError.message : 'Invalid JSON'}`,
            );
          }
        case 'text':
          return response.text() as Promise<T>;
        case 'arraybuffer':
          return response.arrayBuffer() as Promise<T>;
        case 'blob':
          return response.blob() as Promise<T>;
        default:
          return response.text() as Promise<T>;
      }
    } catch (error) {
      if (error instanceof HTTPError) {
        const apiError: ApiError = {
          message: `HTTP ${error.response.status}: ${error.response.statusText}`,
          status: error.response.status,
        };
        throw apiError;
      } else {
        throw error;
      }
    }
  }

  private async post(
    route: string,
    params?: Parameters,
    config?: RequestConfig,
  ): Promise<any> {
    const data = new URLSearchParams(params);
    return this.request(
      route,
      {
        method: 'POST',
        body: data,
      },
      config,
    );
  }

  private async torrentAction(
    action: string,
    hashes: Array<string>,
    extra?: Parameters,
  ): Promise<any> {
    const params = {
      hashes: hashes.length ? hashes.join('|') : 'all',
      ...extra,
    };

    return this.post(`/torrents/${action}`, params);
  }
}

// Export singleton instance
const qbitProvider = new QBitProvider();
export default qbitProvider;
