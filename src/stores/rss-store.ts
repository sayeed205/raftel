import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type {
  Feed,
  FeedArticle,
  FeedRule,
  RSSDownloadHistory,
} from '@/types/qbit/rss';
import qbit from '@/services/qbit';

interface RSSState {
  // Data
  feeds: Array<Feed>;
  rules: Array<FeedRule>;
  articles: Array<FeedArticle>;
  downloadHistory: Array<RSSDownloadHistory>;

  // UI State
  selectedFeed: string | null;
  selectedRule: string | null;
  selectedArticles: Array<string>;

  // Loading states
  isLoading: boolean;
  isFeedsLoading: boolean;
  isRulesLoading: boolean;
  isArticlesLoading: boolean;

  // Error states
  error: string | null;
  feedErrors: Record<string, string>;

  // Filters and search
  articleFilter: 'all' | 'unread' | 'read';
  searchQuery: string;

  // Metadata
  lastUpdate: number;
  autoRefresh: boolean;
  refreshInterval: number;
}

interface RSSActions {
  // Feed management
  fetchFeeds: (withData?: boolean) => Promise<void>;
  addFeed: (name: string, url: string) => Promise<void>;
  removeFeed: (name: string) => Promise<void>;
  renameFeed: (oldName: string, newName: string) => Promise<void>;
  setFeedUrl: (path: string, url: string) => Promise<void>;
  refreshFeed: (itemPath: string) => Promise<void>;
  refreshAllFeeds: () => Promise<void>;

  // Rule management
  fetchRules: () => Promise<void>;
  addRule: (ruleName: string, rule: FeedRule) => Promise<void>;
  updateRule: (ruleName: string, rule: FeedRule) => Promise<void>;
  removeRule: (ruleName: string) => Promise<void>;
  renameRule: (oldName: string, newName: string) => Promise<void>;
  toggleRule: (ruleName: string) => Promise<void>;

  // Article management
  fetchArticles: (feedName?: string) => Promise<void>;
  markAsRead: (feedName: string, articleId?: string) => Promise<void>;
  markAsUnread: (feedName: string, articleId: string) => Promise<void>;
  downloadArticle: (feedName: string, articleId: string) => Promise<void>;
  getMatchingArticles: (
    ruleName: string,
  ) => Promise<Record<string, Array<string>>>;

  // Selection management
  setSelectedFeed: (feedName: string | null) => void;
  setSelectedRule: (ruleName: string | null) => void;
  selectArticle: (articleId: string) => void;
  selectArticles: (articleIds: Array<string>) => void;
  clearArticleSelection: () => void;
  toggleArticleSelection: (articleId: string) => void;

  // Filtering and search
  setArticleFilter: (filter: 'all' | 'unread' | 'read') => void;
  setSearchQuery: (query: string) => void;
  getFilteredArticles: () => Array<FeedArticle>;

  // Settings
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;

  // Utility
  clearError: () => void;
  clearFeedError: (feedName: string) => void;
  getFeedByName: (name: string) => Feed | undefined;
  getRuleByName: (name: string) => FeedRule | undefined;
  getArticleById: (id: string) => FeedArticle | undefined;
}

type RSSStore = RSSState & RSSActions;

export const useRSSStore = create<RSSStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    feeds: [],
    rules: [],
    articles: [],
    downloadHistory: [],
    selectedFeed: null,
    selectedRule: null,
    selectedArticles: [],
    isLoading: false,
    isFeedsLoading: false,
    isRulesLoading: false,
    isArticlesLoading: false,
    error: null,
    feedErrors: {},
    articleFilter: 'all',
    searchQuery: '',
    lastUpdate: 0,
    autoRefresh: false,
    refreshInterval: 300000, // 5 minutes

    // Feed management
    fetchFeeds: async (withData = true) => {
      try {
        set({ isFeedsLoading: true, error: null });

        const feeds = await qbit.getFeeds(withData);

        // Extract articles from feeds if withData is true
        const allArticles: Array<FeedArticle> = [];
        const feedErrors: Record<string, string> = {};

        feeds.forEach((feed) => {
          if (feed.articles) {
            const feedArticles = feed.articles.map((article: any) => ({
              ...article,
              feedName: feed.name,
            }));
            allArticles.push(...feedArticles);
          }

          if (feed.hasError) {
            feedErrors[feed.name] = 'Failed to fetch feed';
          }
        });

        set({
          feeds,
          articles: withData ? allArticles : get().articles,
          feedErrors,
          isFeedsLoading: false,
          lastUpdate: Date.now(),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to fetch feeds';
        set({
          error: message,
          isFeedsLoading: false,
        });
        throw error;
      }
    },

    addFeed: async (name: string, url: string) => {
      try {
        set({ isLoading: true, error: null });

        await qbit.createFeed({ name, url });

        // Refresh feeds after adding
        await get().fetchFeeds();

        set({ isLoading: false });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to add feed';
        set({
          error: message,
          isLoading: false,
        });
        throw error;
      }
    },

    removeFeed: async (name: string) => {
      try {
        set({ isLoading: true, error: null });

        await qbit.deleteFeed(name);

        // Remove feed from local state
        const { feeds, articles } = get();
        const updatedFeeds = feeds.filter((feed) => feed.name !== name);
        const updatedArticles = articles.filter(
          (article) => (article as any).feedName !== name,
        );

        set({
          feeds: updatedFeeds,
          articles: updatedArticles,
          selectedFeed: get().selectedFeed === name ? null : get().selectedFeed,
          isLoading: false,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to remove feed';
        set({
          error: message,
          isLoading: false,
        });
        throw error;
      }
    },

    renameFeed: async (oldName: string, newName: string) => {
      try {
        set({ isLoading: true, error: null });

        await qbit.renameFeed(oldName, newName);

        // Update local state
        const { feeds, articles } = get();
        const updatedFeeds = feeds.map((feed) =>
          feed.name === oldName ? { ...feed, name: newName } : feed,
        );
        const updatedArticles = articles.map((article) =>
          (article as any).feedName === oldName
            ? { ...article, feedName: newName }
            : article,
        );

        set({
          feeds: updatedFeeds,
          articles: updatedArticles,
          selectedFeed:
            get().selectedFeed === oldName ? newName : get().selectedFeed,
          isLoading: false,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to rename feed';
        set({
          error: message,
          isLoading: false,
        });
        throw error;
      }
    },

    setFeedUrl: async (path: string, url: string) => {
      try {
        set({ isLoading: true, error: null });

        await qbit.setFeedUrl(path, url);

        // Update local state
        const { feeds } = get();
        const updatedFeeds = feeds.map((feed) =>
          feed.name === path ? { ...feed, url } : feed,
        );

        set({
          feeds: updatedFeeds,
          isLoading: false,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to update feed URL';
        set({
          error: message,
          isLoading: false,
        });
        throw error;
      }
    },

    refreshFeed: async (itemPath: string) => {
      try {
        // Set loading state for specific feed
        const { feeds, feedErrors } = get();
        const updatedFeeds = feeds.map((feed) =>
          feed.name === itemPath ? { ...feed, isLoading: true } : feed,
        );
        const updatedErrors = { ...feedErrors };
        delete updatedErrors[itemPath];

        set({
          feeds: updatedFeeds,
          feedErrors: updatedErrors,
        });

        await qbit.refreshFeed(itemPath);

        // Refresh feeds data after refresh
        await get().fetchFeeds();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to refresh feed';
        const { feeds, feedErrors } = get();
        const updatedFeeds = feeds.map((feed) =>
          feed.name === itemPath
            ? { ...feed, isLoading: false, hasError: true }
            : feed,
        );

        set({
          feeds: updatedFeeds,
          feedErrors: {
            ...feedErrors,
            [itemPath]: message,
          },
        });
        throw error;
      }
    },

    refreshAllFeeds: async () => {
      const { feeds } = get();
      const refreshPromises = feeds.map((feed) => get().refreshFeed(feed.name));

      try {
        await Promise.allSettled(refreshPromises);
      } catch (error) {
        // Individual feed errors are handled in refreshFeed
        console.warn('Some feeds failed to refresh:', error);
      }
    },

    // Rule management
    fetchRules: async () => {
      try {
        set({ isRulesLoading: true, error: null });

        const rules = await qbit.getRules();

        set({
          rules,
          isRulesLoading: false,
          lastUpdate: Date.now(),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to fetch rules';
        set({
          error: message,
          isRulesLoading: false,
        });
        throw error;
      }
    },

    addRule: async (ruleName: string, rule: FeedRule) => {
      try {
        set({ isLoading: true, error: null });

        await qbit.setRule(ruleName, rule);

        // Add rule to local state
        const { rules } = get();
        const newRule = { ...rule, name: ruleName };

        set({
          rules: [...rules, newRule],
          isLoading: false,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to add rule';
        set({
          error: message,
          isLoading: false,
        });
        throw error;
      }
    },

    updateRule: async (ruleName: string, rule: FeedRule) => {
      try {
        set({ isLoading: true, error: null });

        await qbit.setRule(ruleName, rule);

        // Update rule in local state
        const { rules } = get();
        const updatedRules = rules.map((r) =>
          r.name === ruleName ? { ...rule, name: ruleName } : r,
        );

        set({
          rules: updatedRules,
          isLoading: false,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to update rule';
        set({
          error: message,
          isLoading: false,
        });
        throw error;
      }
    },

    removeRule: async (ruleName: string) => {
      try {
        set({ isLoading: true, error: null });

        await qbit.deleteRule(ruleName);

        // Remove rule from local state
        const { rules } = get();
        const updatedRules = rules.filter((rule) => rule.name !== ruleName);

        set({
          rules: updatedRules,
          selectedRule:
            get().selectedRule === ruleName ? null : get().selectedRule,
          isLoading: false,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to remove rule';
        set({
          error: message,
          isLoading: false,
        });
        throw error;
      }
    },

    renameRule: async (oldName: string, newName: string) => {
      try {
        set({ isLoading: true, error: null });

        await qbit.renameRule(oldName, newName);

        // Update rule in local state
        const { rules } = get();
        const updatedRules = rules.map((rule) =>
          rule.name === oldName ? { ...rule, name: newName } : rule,
        );

        set({
          rules: updatedRules,
          selectedRule:
            get().selectedRule === oldName ? newName : get().selectedRule,
          isLoading: false,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to rename rule';
        set({
          error: message,
          isLoading: false,
        });
        throw error;
      }
    },

    toggleRule: async (ruleName: string) => {
      const { rules } = get();
      const rule = rules.find((r) => r.name === ruleName);

      if (rule) {
        const updatedRule = { ...rule, enabled: !rule.enabled };
        await get().updateRule(ruleName, updatedRule);
      }
    },

    // Article management
    fetchArticles: async (feedName?: string) => {
      // Articles are fetched as part of fetchFeeds with withData=true
      // This method can be used to refresh articles for a specific feed
      if (feedName) {
        await get().refreshFeed(feedName);
      } else {
        await get().fetchFeeds(true);
      }
    },

    markAsRead: async (feedName: string, articleId?: string) => {
      try {
        await qbit.markAsRead(feedName, articleId);

        // Update local state
        const { articles } = get();
        const updatedArticles = articles.map((article) => {
          if ((article as any).feedName === feedName) {
            if (!articleId || article.id === articleId) {
              return { ...article, isRead: true };
            }
          }
          return article;
        });

        set({ articles: updatedArticles });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to mark as read';
        set({ error: message });
        throw error;
      }
    },

    markAsUnread: async (feedName: string, articleId: string) => {
      // qBittorrent doesn't have a markAsUnread API, so we'll just update local state
      const { articles } = get();
      const updatedArticles = articles.map((article) =>
        article.id === articleId && (article as any).feedName === feedName
          ? { ...article, isRead: false }
          : article,
      );

      set({ articles: updatedArticles });
    },

    downloadArticle: async (feedName: string, articleId: string) => {
      try {
        const article = get().articles.find((a) => a.id === articleId);

        if (!article || !article.torrentURL) {
          throw new Error('Article or torrent URL not found');
        }

        // Add torrent using the torrent URL
        await qbit.addTorrents([], article.torrentURL);

        // Mark article as read after downloading
        await get().markAsRead(feedName, articleId);

        // Add to download history
        const { downloadHistory } = get();
        const historyEntry: RSSDownloadHistory = {
          id: `${Date.now()}-${articleId}`,
          feedName,
          ruleName: '', // We don't have rule context here
          torrentName: article.title,
          downloadDate: new Date(),
          status: 'success',
        };

        set({
          downloadHistory: [historyEntry, ...downloadHistory],
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to download article';
        set({ error: message });
        throw error;
      }
    },

    getMatchingArticles: async (ruleName: string) => {
      try {
        return await qbit.getMatchingArticles(ruleName);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to get matching articles';
        set({ error: message });
        throw error;
      }
    },

    // Selection management
    setSelectedFeed: (feedName: string | null) => {
      set({ selectedFeed: feedName });
    },

    setSelectedRule: (ruleName: string | null) => {
      set({ selectedRule: ruleName });
    },

    selectArticle: (articleId: string) => {
      set({ selectedArticles: [articleId] });
    },

    selectArticles: (articleIds: Array<string>) => {
      set({ selectedArticles: articleIds });
    },

    clearArticleSelection: () => {
      set({ selectedArticles: [] });
    },

    toggleArticleSelection: (articleId: string) => {
      const { selectedArticles } = get();
      const isSelected = selectedArticles.includes(articleId);

      if (isSelected) {
        set({
          selectedArticles: selectedArticles.filter((id) => id !== articleId),
        });
      } else {
        set({
          selectedArticles: [...selectedArticles, articleId],
        });
      }
    },

    // Filtering and search
    setArticleFilter: (filter: 'all' | 'unread' | 'read') => {
      set({ articleFilter: filter });
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
    },

    getFilteredArticles: () => {
      const { articles, articleFilter, searchQuery, selectedFeed } = get();

      return articles.filter((article) => {
        // Filter by selected feed
        if (selectedFeed && (article as any).feedName !== selectedFeed) {
          return false;
        }

        // Filter by read status
        if (articleFilter === 'read' && !article.isRead) {
          return false;
        }
        if (articleFilter === 'unread' && article.isRead) {
          return false;
        }

        // Filter by search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesTitle = article.title.toLowerCase().includes(query);
          const matchesDescription = article.description
            ?.toLowerCase()
            .includes(query);

          if (!matchesTitle && !matchesDescription) {
            return false;
          }
        }

        return true;
      });
    },

    // Settings
    setAutoRefresh: (enabled: boolean) => {
      set({ autoRefresh: enabled });
    },

    setRefreshInterval: (interval: number) => {
      set({ refreshInterval: interval });
    },

    // Utility
    clearError: () => {
      set({ error: null });
    },

    clearFeedError: (feedName: string) => {
      const { feedErrors } = get();
      const updatedErrors = { ...feedErrors };
      delete updatedErrors[feedName];
      set({ feedErrors: updatedErrors });
    },

    getFeedByName: (name: string) => {
      return get().feeds.find((feed) => feed.name === name);
    },

    getRuleByName: (name: string) => {
      return get().rules.find((rule) => rule.name === name);
    },

    getArticleById: (id: string) => {
      return get().articles.find((article) => article.id === id);
    },
  })),
);

// Selector hooks for convenience
export const useRSSFeeds = () => {
  const { feeds, isFeedsLoading, feedErrors, fetchFeeds, refreshFeed } =
    useRSSStore();
  return { feeds, isFeedsLoading, feedErrors, fetchFeeds, refreshFeed };
};

export const useRSSRules = () => {
  const { rules, isRulesLoading, fetchRules, addRule, updateRule, removeRule } =
    useRSSStore();
  return { rules, isRulesLoading, fetchRules, addRule, updateRule, removeRule };
};

export const useRSSArticles = () => {
  const {
    articles,
    isArticlesLoading,
    articleFilter,
    searchQuery,
    selectedArticles,
    getFilteredArticles,
    setArticleFilter,
    setSearchQuery,
    selectArticle,
    clearArticleSelection,
    markAsRead,
    downloadArticle,
  } = useRSSStore();

  return {
    articles,
    isArticlesLoading,
    articleFilter,
    searchQuery,
    selectedArticles,
    getFilteredArticles,
    setArticleFilter,
    setSearchQuery,
    selectArticle,
    clearArticleSelection,
    markAsRead,
    downloadArticle,
  };
};

export const useRSSSelection = () => {
  const { selectedFeed, selectedRule, setSelectedFeed, setSelectedRule } =
    useRSSStore();

  return {
    selectedFeed,
    selectedRule,
    setSelectedFeed,
    setSelectedRule,
  };
};
