import { useMemo, useState } from 'react';

import { DownloadIcon, ExternalLinkIcon, FilterIcon, MailOpenIcon, SearchIcon } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { useRSSStore } from '@/stores/rss-store';

export function RSSArticleList() {
  const {
    articles,
    isArticlesLoading,
    selectedFeed,
    selectedArticles,
    articleFilter,
    searchQuery,
    setArticleFilter,
    setSearchQuery,

    selectArticles,
    clearArticleSelection,
    toggleArticleSelection,
    markAsRead,
    downloadArticle,
    getFilteredArticles,
  } = useRSSStore();

  const [sortBy, setSortBy] = useState<'date' | 'title' | 'feed'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { confirmAction } = useConfirmationDialog();

  const filteredAndSortedArticles = useMemo(() => {
    const filtered = getFilteredArticles();

    return filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'feed':
          comparison = ((a as any).feedName || '').localeCompare((b as any).feedName || '');
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [getFilteredArticles, sortBy, sortOrder]);

  const handleDownloadArticle = async (article: any) => {
    if (!article.torrentURL) {
      alert('No torrent URL available for this article');
      return;
    }

    confirmAction('Download', `Are you sure you want to download "${article.title}"?`, async () => {
      try {
        await downloadArticle(article.feedName, article.id);
      } catch (error) {
        console.error('Failed to download article:', error);
      }
    });
  };

  const handleMarkAsRead = async (article: any) => {
    try {
      await markAsRead(article.feedName, article.id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedArticles.length === 0) return;

    confirmAction(
      'Mark as Read',
      `Are you sure you want to mark ${selectedArticles.length} article(s) as read?`,
      async () => {
        try {
          // Group articles by feed
          const articlesByFeed = new Map<string, Array<string>>();

          selectedArticles.forEach((articleId) => {
            const article = articles.find((a) => a.id === articleId);
            if (article && (article as any).feedName) {
              const feedName = (article as any).feedName;
              if (!articlesByFeed.has(feedName)) {
                articlesByFeed.set(feedName, []);
              }
              articlesByFeed.get(feedName)!.push(articleId);
            }
          });

          // Mark articles as read for each feed
          for (const [feedName, articleIds] of articlesByFeed) {
            for (const articleId of articleIds) {
              await markAsRead(feedName, articleId);
            }
          }

          clearArticleSelection();
        } catch (error) {
          console.error('Failed to mark articles as read:', error);
        }
      },
    );
  };

  const handleBulkDownload = async () => {
    if (selectedArticles.length === 0) return;

    const articlesWithTorrents = selectedArticles
      .map((id) => articles.find((a) => a.id === id))
      .filter((article) => article && article.torrentURL);

    if (articlesWithTorrents.length === 0) {
      alert('No articles with torrent URLs selected');
      return;
    }

    confirmAction(
      'Download All',
      `Are you sure you want to download ${articlesWithTorrents.length} torrent(s)?`,
      async () => {
        try {
          for (const article of articlesWithTorrents) {
            if (article) {
              await downloadArticle((article as any).feedName, article.id);
            }
          }
          clearArticleSelection();
        } catch (error) {
          console.error('Failed to download articles:', error);
        }
      },
    );
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === filteredAndSortedArticles.length) {
      clearArticleSelection();
    } else {
      selectArticles(filteredAndSortedArticles.map((a) => a.id));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const getUnreadCount = () => {
    return filteredAndSortedArticles.filter((article) => !article.isRead).length;
  };

  if (isArticlesLoading && articles.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-32' />
          <div className='flex gap-2'>
            <Skeleton className='h-10 w-32' />
            <Skeleton className='h-10 w-24' />
          </div>
        </div>
        <div className='space-y-2'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='p-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-5 w-3/4' />
                    <Skeleton className='h-4 w-1/2' />
                    <Skeleton className='h-3 w-1/4' />
                  </div>
                  <Skeleton className='h-8 w-20' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium'>RSS Articles ({filteredAndSortedArticles.length})</h3>
          {getUnreadCount() > 0 && (
            <p className='text-muted-foreground text-sm'>{getUnreadCount()} unread</p>
          )}
        </div>

        {selectedArticles.length > 0 && (
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={handleBulkMarkAsRead}>
              <MailOpenIcon className='mr-2 h-4 w-4' />
              Mark as Read ({selectedArticles.length})
            </Button>
            <Button variant='outline' size='sm' onClick={handleBulkDownload}>
              <DownloadIcon className='mr-2 h-4 w-4' />
              Download ({selectedArticles.length})
            </Button>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-wrap items-center gap-4'>
            <div className='flex items-center gap-2'>
              <SearchIcon className='text-muted-foreground h-4 w-4' />
              <Input
                placeholder='Search articles...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-64'
              />
            </div>

            <div className='flex items-center gap-2'>
              <FilterIcon className='text-muted-foreground h-4 w-4' />
              <Select value={articleFilter} onValueChange={(value: any) => setArticleFilter(value)}>
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='unread'>Unread</SelectItem>
                  <SelectItem value='read'>Read</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground text-sm'>Sort by:</span>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className='w-24'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='date'>Date</SelectItem>
                  <SelectItem value='title'>Title</SelectItem>
                  <SelectItem value='feed'>Feed</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>

            {filteredAndSortedArticles.length > 0 && (
              <div className='flex items-center gap-2'>
                <Checkbox
                  checked={selectedArticles.length === filteredAndSortedArticles.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className='text-muted-foreground text-sm'>Select all</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feed Filter Info */}
      {selectedFeed && (
        <Alert>
          <AlertDescription>
            Showing articles from feed: <strong>{selectedFeed}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Articles List */}
      {filteredAndSortedArticles.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <div className='space-y-2 text-center'>
              <h3 className='text-lg font-medium'>No articles found</h3>
              <p className='text-muted-foreground'>
                {articles.length === 0
                  ? 'No articles available. Add RSS feeds to see articles.'
                  : 'No articles match your current filters.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-2'>
          {filteredAndSortedArticles.map((article) => (
            <Card
              key={article.id}
              className={`hover:bg-muted/50 transition-colors ${
                !article.isRead ? 'border-l-primary border-l-4' : ''
              }`}
            >
              <CardContent className='p-4'>
                <div className='flex items-start gap-3'>
                  <Checkbox
                    checked={selectedArticles.includes(article.id)}
                    onCheckedChange={() => toggleArticleSelection(article.id)}
                  />

                  <div className='min-w-0 flex-1 space-y-2'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='min-w-0 flex-1'>
                        <h4
                          className={`leading-tight font-medium ${
                            !article.isRead ? 'font-semibold' : ''
                          }`}
                        >
                          {article.title}
                        </h4>
                        <div className='mt-1 flex items-center gap-2'>
                          <Badge variant='outline' className='text-xs'>
                            {(article as any).feedName}
                          </Badge>
                          <span className='text-muted-foreground text-xs'>
                            {formatDate(article.date)}
                          </span>
                          {!article.isRead && (
                            <Badge variant='default' className='text-xs'>
                              New
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className='flex items-center gap-1'>
                        {!article.isRead && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleMarkAsRead(article)}
                            title='Mark as read'
                          >
                            <MailOpenIcon className='h-4 w-4' />
                          </Button>
                        )}

                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => window.open(article.link, '_blank')}
                          title='Open article'
                        >
                          <ExternalLinkIcon className='h-4 w-4' />
                        </Button>

                        {article.torrentURL && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDownloadArticle(article)}
                            title='Download torrent'
                          >
                            <DownloadIcon className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    </div>

                    {article.description && (
                      <p className='text-muted-foreground line-clamp-2 text-sm'>
                        {article.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
