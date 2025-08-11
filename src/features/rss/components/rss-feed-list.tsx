import {
  EditIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
} from 'lucide-react';
import { useState } from 'react';

import { RSSFeedDialog } from './rss-feed-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { useRSSStore } from '@/stores/rss-store';


export function RSSFeedList() {
  const {
    feeds,
    isFeedsLoading,
    feedErrors,
    refreshFeed,
    refreshAllFeeds,
    removeFeed,
    setSelectedFeed,
    selectedFeed,
  } = useRSSStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<Record<string, boolean>>({});

  const { confirmDestructiveAction } = useConfirmationDialog();

  const handleRefreshFeed = async (feedName: string) => {
    setIsRefreshing((prev) => ({ ...prev, [feedName]: true }));
    try {
      await refreshFeed(feedName);
    } finally {
      setIsRefreshing((prev) => ({ ...prev, [feedName]: false }));
    }
  };

  const handleRefreshAll = async () => {
    try {
      await refreshAllFeeds();
    } catch (error) {
      console.error('Failed to refresh all feeds:', error);
    }
  };

  const handleDeleteFeed = async (feedName: string) => {
    confirmDestructiveAction(
      'Delete Feed',
      `Are you sure you want to delete the feed "${feedName}"? This action cannot be undone.`,
      async () => {
        try {
          await removeFeed(feedName);
        } catch (error) {
          console.error('Failed to delete feed:', error);
        }
      },
    );
  };

  const handleFeedClick = (feedName: string) => {
    setSelectedFeed(selectedFeed === feedName ? null : feedName);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (feed: any) => {
    if (feed.isLoading || isRefreshing[feed.name]) {
      return <Badge variant='secondary'>Refreshing...</Badge>;
    }
    if (feed.hasError || feedErrors[feed.name]) {
      return <Badge variant='destructive'>Error</Badge>;
    }
    return <Badge variant='default'>Active</Badge>;
  };

  if (isFeedsLoading && feeds.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-32' />
          <div className='flex gap-2'>
            <Skeleton className='h-10 w-24' />
            <Skeleton className='h-10 w-20' />
          </div>
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-6 w-3/4' />
                <Skeleton className='h-4 w-full' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-4 w-1/2' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium'>RSS Feeds ({feeds.length})</h3>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefreshAll}
            disabled={isFeedsLoading}
          >
            <RefreshCwIcon className='mr-2 h-4 w-4' />
            Refresh All
          </Button>
          <Button size='sm' onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon className='mr-2 h-4 w-4' />
            Add Feed
          </Button>
        </div>
      </div>

      {feeds.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <div className='space-y-2 text-center'>
              <h3 className='text-lg font-medium'>No RSS feeds configured</h3>
              <p className='text-muted-foreground'>
                Add your first RSS feed to start monitoring for new torrents.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusIcon className='mr-2 h-4 w-4' />
                Add Feed
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {feeds.map((feed) => (
            <Card
              key={feed.name}
              className={`hover:bg-muted/50 cursor-pointer transition-colors ${
                selectedFeed === feed.name ? 'ring-primary ring-2' : ''
              }`}
              onClick={() => handleFeedClick(feed.name)}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='min-w-0 flex-1 space-y-1'>
                    <CardTitle className='truncate text-base'>
                      {feed.title || feed.name}
                    </CardTitle>
                    <CardDescription className='truncate text-xs'>
                      {feed.url}
                    </CardDescription>
                  </div>
                  <div className='ml-2 flex items-center gap-2'>
                    {getStatusBadge(feed)}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                        >
                          <MoreHorizontalIcon className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRefreshFeed(feed.name);
                          }}
                          disabled={isRefreshing[feed.name]}
                        >
                          <RefreshCwIcon className='mr-2 h-4 w-4' />
                          Refresh
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingFeed(feed.name);
                          }}
                        >
                          <EditIcon className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFeed(feed.name);
                          }}
                          className='text-destructive'
                        >
                          <TrashIcon className='mr-2 h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='text-muted-foreground space-y-2 text-sm'>
                  <div>Articles: {feed.articles?.length || 0}</div>
                  <div>Last updated: {formatDate(feed.lastBuildDate)}</div>
                  {feedErrors[feed.name] && (
                    <Alert className='mt-2'>
                      <AlertDescription className='text-xs'>
                        {feedErrors[feed.name]}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RSSFeedDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode='add'
      />

      {editingFeed && (
        <RSSFeedDialog
          open={!!editingFeed}
          onOpenChange={(open) => !open && setEditingFeed(null)}
          mode='edit'
          feedName={editingFeed}
        />
      )}
    </div>
  );
}
