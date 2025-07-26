// qBittorrent WebAPI Client - Enhanced with VueTorrent patterns
import type {
  AddTorrentParams,
  AppVersion,
  Category,
  GlobalTransferInfo,
  LoginRequest,
  QBittorrentPreferences,
  ServerState,
  SetSpeedLimitParams,
  SetTorrentCategoryParams,
  SetTorrentLocationParams,
  SetTorrentPriorityParams,
  SetTorrentTagsParams,
  TorrentFile,
  TorrentInfo,
  TorrentPeer,
  TorrentProperties,
  TorrentTracker,
  TorrentsInfoParams,
} from '@/types/api';
import qbitProvider from './qbit-provider';

/**
 * Legacy QBittorrentApi class for backward compatibility
 * This class now delegates to the enhanced QbitProvider
 */
class QBittorrentApi {
  private provider = qbitProvider;

  // Authentication
  async login(credentials: LoginRequest): Promise<void> {
    await this.provider.login({
      username: credentials.username,
      password: credentials.password,
    });
  }

  async logout(): Promise<void> {
    await this.provider.logout();
  }

  // App info
  async getVersion(): Promise<AppVersion> {
    const version = await this.provider.getVersion();
    return { version, api_version: '', api_version_min: '' };
  }

  async getApiVersion(): Promise<string> {
    return this.provider.getApiVersion();
  }

  // Server state
  async getServerState(): Promise<ServerState> {
    return this.provider.getServerState();
  }

  async getGlobalTransferInfo(): Promise<GlobalTransferInfo> {
    return this.provider.getGlobalTransferInfo();
  }

  // Torrents
  async getTorrents(
    params: TorrentsInfoParams = {},
  ): Promise<Array<TorrentInfo>> {
    // Convert legacy params to new format and filter out undefined values
    const convertedParams: any = {};

    if (params.filter !== undefined) convertedParams.filter = params.filter;
    if (params.category !== undefined)
      convertedParams.category = params.category;
    if (params.tag !== undefined) convertedParams.tag = params.tag;
    if (params.sort !== undefined) convertedParams.sort = params.sort;
    if (params.reverse !== undefined) convertedParams.reverse = params.reverse;
    if (params.limit !== undefined) convertedParams.limit = params.limit;
    if (params.offset !== undefined) convertedParams.offset = params.offset;
    if (params.hashes !== undefined) convertedParams.hashes = params.hashes;

    return this.provider.getTorrents(convertedParams);
  }

  async getTorrentProperties(hash: string): Promise<TorrentProperties> {
    return this.provider.getTorrentProperties(hash);
  }

  async getTorrentFiles(hash: string): Promise<Array<TorrentFile>> {
    return this.provider.getTorrentFiles(hash);
  }

  async getTorrentTrackers(hash: string): Promise<Array<TorrentTracker>> {
    return this.provider.getTorrentTrackers(hash);
  }

  async getTorrentPeers(
    hash: string,
  ): Promise<{ peers: Record<string, TorrentPeer> }> {
    return this.provider.getTorrentPeers(hash);
  }

  // Torrent actions
  async pauseTorrents(hashes: string): Promise<void> {
    const hashArray = hashes.split('|');
    await this.provider.pauseTorrents(hashArray);
  }

  async resumeTorrents(hashes: string): Promise<void> {
    const hashArray = hashes.split('|');
    await this.provider.resumeTorrents(hashArray);
  }

  async deleteTorrents(hashes: string, deleteFiles = false): Promise<void> {
    const hashArray = hashes.split('|');
    await this.provider.deleteTorrents(hashArray, deleteFiles);
  }

  async recheckTorrents(hashes: string): Promise<void> {
    const hashArray = hashes.split('|');
    await this.provider.recheckTorrents(hashArray);
  }

  async reannounceTorrents(hashes: string): Promise<void> {
    const hashArray = hashes.split('|');
    await this.provider.reannounceTorrents(hashArray);
  }

  async setTorrentLocation(params: SetTorrentLocationParams): Promise<void> {
    const hashArray = params.hashes.split('|');
    await this.provider.setTorrentSavePath(hashArray, params.location);
  }

  async setTorrentCategory(params: SetTorrentCategoryParams): Promise<void> {
    const hashArray = params.hashes.split('|');
    await this.provider.setCategory(hashArray, params.category);
  }

  async setTorrentTags(params: SetTorrentTagsParams): Promise<void> {
    const hashArray = params.hashes.split('|');
    const tagArray = params.tags.split(',');
    await this.provider.addTorrentTag(hashArray, tagArray);
  }

  async removeTorrentTags(params: SetTorrentTagsParams): Promise<void> {
    const hashArray = params.hashes.split('|');
    const tagArray = params.tags.split(',');
    await this.provider.removeTorrentTag(hashArray, tagArray);
  }

  async setTorrentPriority(params: SetTorrentPriorityParams): Promise<void> {
    const hashArray = params.hashes.split('|');
    const priority = params.priority === 1 ? 'increasePrio' : 'decreasePrio';
    await this.provider.setTorrentPriority(hashArray, priority);
  }

  async setTorrentUploadLimit(params: SetSpeedLimitParams): Promise<void> {
    const hashArray = params.hashes.split('|');
    await this.provider.setUploadLimit(hashArray, params.limit);
  }

  async setTorrentDownloadLimit(params: SetSpeedLimitParams): Promise<void> {
    const hashArray = params.hashes.split('|');
    await this.provider.setDownloadLimit(hashArray, params.limit);
  }

  async setSequentialDownload(hashes: string): Promise<void> {
    const hashArray = hashes.split('|');
    await this.provider.toggleSequentialDownload(hashArray);
  }

  async setFirstLastPiecePriority(hashes: string): Promise<void> {
    const hashArray = hashes.split('|');
    await this.provider.toggleFirstLastPiecePriority(hashArray);
  }

  async setAutoTMM(hashes: string, enable: boolean): Promise<void> {
    const hashArray = hashes.split('|');
    await this.provider.setAutoTMM(hashArray, enable);
  }

  async setSuperSeeding(hashes: string, value: boolean): Promise<void> {
    const hashArray = hashes.split('|');
    await this.provider.setSuperSeeding(hashArray, value);
  }

  async setForceStart(hashes: string, value: boolean): Promise<void> {
    const hashArray = hashes.split('|');
    if (value) {
      await this.provider.forceStartTorrents(hashArray);
    } else {
      await this.provider.stopTorrents(hashArray);
    }
  }

  // Categories
  async getCategories(): Promise<Record<string, Category>> {
    const categories = await this.provider.getCategories();
    const result: Record<string, Category> = {};
    categories.forEach((cat) => {
      result[cat.name] = cat;
    });
    return result;
  }

  async createCategory(category: string, savePath: string): Promise<void> {
    await this.provider.createCategory({ name: category, savePath });
  }

  async editCategory(category: string, savePath: string): Promise<void> {
    await this.provider.editCategory({ name: category, savePath });
  }

  async removeCategories(categories: string): Promise<void> {
    const categoryArray = categories.split('\n');
    await this.provider.deleteCategory(categoryArray);
  }

  // Tags
  async getTags(): Promise<Array<string>> {
    return this.provider.getAvailableTags();
  }

  async createTags(tags: string): Promise<void> {
    const tagArray = tags.split(',');
    await this.provider.createTag(tagArray);
  }

  async deleteTags(tags: string): Promise<void> {
    const tagArray = tags.split(',');
    await this.provider.deleteTags(tagArray);
  }

  // Global speed limits
  async getGlobalDownloadLimit(): Promise<number> {
    return this.provider.getGlobalDownloadLimit();
  }

  async setGlobalDownloadLimit(limit: number): Promise<void> {
    await this.provider.setGlobalDownloadLimit(limit);
  }

  async getGlobalUploadLimit(): Promise<number> {
    return this.provider.getGlobalUploadLimit();
  }

  async setGlobalUploadLimit(limit: number): Promise<void> {
    await this.provider.setGlobalUploadLimit(limit);
  }

  // Alternative speed limits
  async toggleAlternativeSpeedLimits(): Promise<void> {
    await this.provider.toggleSpeedLimitsMode();
  }

  // Add torrents
  async addTorrents(params: AddTorrentParams): Promise<void> {
    await this.provider.addTorrents(params.torrents || [], params.urls || '', {
      savepath: params.savepath,
      category: params.category,
      tags: params.tags,
      skip_checking: params.skip_checking,
      paused: params.paused,
      root_folder: params.root_folder,
      rename: params.rename,
      upLimit: params.upLimit,
      dlLimit: params.dlLimit,
      ratioLimit: params.ratioLimit,
      seedingTimeLimit: params.seedingTimeLimit,
      autoTMM: params.autoTMM,
      sequentialDownload: params.sequentialDownload,
      firstLastPiecePrio: params.firstLastPiecePrio,
    });
  }

  // Preferences
  async getPreferences(): Promise<QBittorrentPreferences> {
    return this.provider.getPreferences();
  }

  async setPreferences(prefs: Record<string, any>): Promise<void> {
    await this.provider.setPreferences(prefs);
  }

  // Sync
  async syncMainData(rid = 0): Promise<any> {
    return this.provider.syncMainData(rid);
  }

  // RSS methods
  async getFeeds(withData = true): Promise<Array<any>> {
    return this.provider.getFeeds(withData);
  }

  async getRules(): Promise<Array<any>> {
    return this.provider.getRules();
  }

  async createFeed(name: string, url: string): Promise<void> {
    await this.provider.createFeed({ name, url });
  }

  async deleteFeed(name: string): Promise<void> {
    await this.provider.deleteFeed(name);
  }

  async renameFeed(oldName: string, newName: string): Promise<void> {
    await this.provider.renameFeed(oldName, newName);
  }

  async setFeedUrl(path: string, url: string): Promise<void> {
    await this.provider.setFeedUrl(path, url);
  }

  async refreshFeed(itemPath: string): Promise<void> {
    await this.provider.refreshFeed(itemPath);
  }

  async createRule(ruleName: string, rule: any): Promise<void> {
    await this.provider.setRule(ruleName, rule);
  }

  async updateRule(ruleName: string, rule: any): Promise<void> {
    await this.provider.setRule(ruleName, rule);
  }

  async deleteRule(ruleName: string): Promise<void> {
    await this.provider.deleteRule(ruleName);
  }

  async renameRule(oldName: string, newName: string): Promise<void> {
    await this.provider.renameRule(oldName, newName);
  }

  async markAsRead(feedName: string, articleId?: string): Promise<void> {
    await this.provider.markAsRead(feedName, articleId);
  }

  async getMatchingArticles(
    ruleName: string,
  ): Promise<Record<string, Array<string>>> {
    return this.provider.getMatchingArticles(ruleName);
  }

  // Search methods
  async getSearchPlugins(): Promise<Array<any>> {
    return this.provider.getSearchPlugins();
  }

  async startSearch(
    pattern: string,
    category: string,
    plugins: Array<string>,
  ): Promise<any> {
    return this.provider.startSearch(pattern, category, plugins);
  }

  async stopSearch(id: number): Promise<boolean> {
    return this.provider.stopSearch(id);
  }

  async getSearchStatus(id?: number): Promise<Array<any>> {
    return this.provider.getSearchStatus(id);
  }

  async getSearchResults(
    id: number,
    offset?: number,
    limit?: number,
  ): Promise<any> {
    return this.provider.getSearchResults(id, offset, limit);
  }

  async deleteSearch(id: number): Promise<boolean> {
    return this.provider.deleteSearchPlugin(id);
  }

  async installSearchPlugin(sources: Array<string>): Promise<boolean> {
    return this.provider.installSearchPlugin(sources);
  }

  async uninstallSearchPlugin(names: Array<string>): Promise<void> {
    return this.provider.uninstallSearchPlugin(names);
  }

  async enableSearchPlugin(
    names: Array<string>,
    enable: boolean,
  ): Promise<void> {
    return this.provider.enableSearchPlugin(names, enable);
  }

  async updateSearchPlugins(): Promise<void> {
    return this.provider.updateSearchPlugins();
  }

  // Log methods
  async getLogs(afterId?: number, logsToInclude?: any): Promise<Array<any>> {
    return this.provider.getLogs(afterId, logsToInclude);
  }

  async getPeerLogs(afterId?: number): Promise<Array<any>> {
    return this.provider.getPeerLogs(afterId);
  }

  // Utility methods
  getAuthStatus(): boolean {
    return this.provider.getAuthStatus();
  }

  async checkAuth(): Promise<boolean> {
    return this.provider.checkAuth();
  }
}

// Export singleton instance
const qbApi = new QBittorrentApi();
export default qbApi;
