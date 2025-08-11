import { useEffect } from 'react';
import { useRSSStore } from '@/stores/rss-store';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';

import { RSSArticleList } from './components/rss-article-list';
import { RSSFeedList } from './components/rss-feed-list';
import { RSSRuleList } from './components/rss-rule-list';

export default function RSSPage() {
  const { fetchFeeds, fetchRules, autoRefresh, refreshInterval } =
    useRSSStore();

  useEffect(() => {
    // Initial data fetch
    fetchFeeds(true);
    fetchRules();
  }, [fetchFeeds, fetchRules]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchFeeds(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchFeeds]);

  return (
    <>
      <Header>
        <h2 className="text-2xl font-bold tracking-tight">RSS</h2>
      </Header>

      <Main>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
          <Tabs defaultValue="feeds" className="space-y-4">
            <TabsList>
              <TabsTrigger value="feeds">Feeds</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="articles">Articles</TabsTrigger>
            </TabsList>

            <TabsContent value="feeds" className="space-y-4">
              <RSSFeedList />
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <RSSRuleList />
            </TabsContent>

            <TabsContent value="articles" className="space-y-4">
              <RSSArticleList />
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  );
}
