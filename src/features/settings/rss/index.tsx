import { useNavigate } from '@tanstack/react-router';
import { DownloadIcon, FilterIcon, RssIcon } from 'lucide-react';

import type { QBittorrentPreferences } from '@/types/qbit/preferences';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings, useSettingsActions } from '@/stores/settings-store';

import ContentSection from '../components/content-section';

export default function SettingsRss() {
  const { preferences, pendingChanges } = useSettings();
  const { setPendingChange } = useSettingsActions();
  const navigate = useNavigate();

  if (!preferences) {
    return (
      <div className='flex w-full items-center justify-center'>
        <div className='text-center'>
          <div className='border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2'></div>
        </div>
      </div>
    );
  }

  const getValue = (key: keyof QBittorrentPreferences) => {
    return pendingChanges[key] !== undefined
      ? pendingChanges[key]
      : preferences[key];
  };

  const handleEditRules = () => {
    navigate({ to: '/rss', search: { tab: 'rules' } });
  };

  return (
    <ContentSection
      title='RSS'
      desc='Configure RSS feed settings and automatic torrent downloading.'
    >
      <div className='space-y-6'>
        {/* RSS Reader */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <RssIcon className='h-5 w-5' />
              RSS Reader
            </CardTitle>
            <CardDescription>Enable fetching RSS feeds</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='rss_processing_enabled'
                  checked={
                    (getValue('rss_processing_enabled') as boolean) || false
                  }
                  onCheckedChange={(checked) =>
                    setPendingChange('rss_processing_enabled', checked)
                  }
                />
                <Label htmlFor='rss_processing_enabled'>
                  Enable fetching RSS feeds
                </Label>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='rss_refresh_interval'>
                    Feeds refresh interval:
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='rss_refresh_interval'
                      type='number'
                      value={(getValue('rss_refresh_interval') as number) || 30}
                      onChange={(e) =>
                        setPendingChange(
                          'rss_refresh_interval',
                          parseInt(e.target.value),
                        )
                      }
                      className='w-20'
                      min='1'
                    />
                    <span className='text-muted-foreground text-sm'>min</span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='rss_fetch_delay'>
                    Same host request delay:
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='rss_fetch_delay'
                      type='number'
                      value={(getValue('rss_fetch_delay') as number) || 2}
                      onChange={(e) =>
                        setPendingChange(
                          'rss_fetch_delay',
                          parseInt(e.target.value),
                        )
                      }
                      className='w-20'
                      min='0'
                    />
                    <span className='text-muted-foreground text-sm'>sec</span>
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='rss_max_articles_per_feed'>
                  Maximum number of articles per feed:
                </Label>
                <Input
                  id='rss_max_articles_per_feed'
                  type='number'
                  value={
                    (getValue('rss_max_articles_per_feed') as number) || 50
                  }
                  onChange={(e) =>
                    setPendingChange(
                      'rss_max_articles_per_feed',
                      parseInt(e.target.value),
                    )
                  }
                  className='w-32'
                  min='1'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RSS Torrent Auto Downloader */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DownloadIcon className='h-5 w-5' />
              RSS Torrent Auto Downloader
            </CardTitle>
            <CardDescription>
              Enable auto downloading of RSS torrents
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='rss_auto_downloading_enabled'
                  checked={
                    (getValue('rss_auto_downloading_enabled') as boolean) ||
                    false
                  }
                  onCheckedChange={(checked) =>
                    setPendingChange('rss_auto_downloading_enabled', checked)
                  }
                />
                <Label htmlFor='rss_auto_downloading_enabled'>
                  Enable auto downloading of RSS torrents
                </Label>
              </div>

              <div className='flex justify-start'>
                <Button variant='outline' size='sm' onClick={handleEditRules}>
                  Edit auto downloading rules...
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RSS Smart Episode Filter */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FilterIcon className='h-5 w-5' />
              RSS Smart Episode Filter
            </CardTitle>
            <CardDescription>Download REPACK/PROPER episodes</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='rss_download_repack_proper_episodes'
                  checked={
                    (getValue(
                      'rss_download_repack_proper_episodes',
                    ) as boolean) || false
                  }
                  onCheckedChange={(checked) =>
                    setPendingChange(
                      'rss_download_repack_proper_episodes',
                      checked,
                    )
                  }
                />
                <Label htmlFor='rss_download_repack_proper_episodes'>
                  Download REPACK/PROPER episodes
                </Label>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='rss_smart_episode_filters'>
                  Filters (one per line):
                </Label>
                <textarea
                  id='rss_smart_episode_filters'
                  value={
                    (getValue('rss_smart_episode_filters') as string) || ''
                  }
                  onChange={(e) =>
                    setPendingChange(
                      'rss_smart_episode_filters',
                      e.target.value,
                    )
                  }
                  className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                  placeholder='Enter regex patterns, one per line'
                />
                <p className='text-muted-foreground text-sm'>
                  These filters are used to identify episode numbers in RSS feed
                  items. One pattern per line.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentSection>
  );
}
