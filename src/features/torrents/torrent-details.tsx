import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Link, useNavigate } from '@tanstack/react-router';
import {
  TorrentContentTab,
  TorrentGeneralTab,
  TorrentPeersTab,
  TorrentSpeedTab,
  TorrentTrackersTab,
} from './components/tabs';
import type {
  TorrentFile,
  TorrentInfo,
  TorrentPeer,
  TorrentProperties,
  TorrentTracker,
} from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import qbApi from '@/lib/api';
import {
  formatBytes,
  formatProgress,
  getStateColor,
  getStateText,
} from '@/lib/utils';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ProfileDropdown } from '@/components/profile-dropdown.tsx';
import { Route as TorrentDetailsRoute } from '@/routes/_authenticated/torrents/$hash';
import { Header } from '@/components/layout/header.tsx';
import { Main } from '@/components/layout/main.tsx';

interface TorrentDetailsData {
  torrent: TorrentInfo | null;
  properties: TorrentProperties | null;
  files: Array<TorrentFile>;
  trackers: Array<TorrentTracker>;
  peers: Record<string, TorrentPeer>;
}

export default function TorrentDetailsPage() {
  const { hash } = TorrentDetailsRoute.useParams();
  console.log('hash', hash);
  const searchParams = TorrentDetailsRoute.useSearch();
  const navigate = useNavigate({ from: TorrentDetailsRoute.fullPath });

  const [data, setData] = useState<TorrentDetailsData>({
    torrent: null,
    properties: null,
    files: [],
    trackers: [],
    peers: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeTab = searchParams.tab || 'general';

  const handleTabChange = (tab: string) => {
    // setSearchParams({ tab: value });
    navigate({ search: { tab } });
  };

  const fetchTorrentData = async () => {
    if (!hash) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching torrent data for hash:', hash);

      // First try to get the specific torrent
      const torrents = await qbApi.getTorrents({ hashes: hash });
      console.log('Torrents response:', torrents);

      const torrent = torrents.find((t) => t.hash === hash) || null;
      console.log('Found torrent:', torrent);

      if (!torrent) {
        // If not found with specific hash, try getting all torrents to see if hash format is different
        const allTorrents = await qbApi.getTorrents();
        console.log(
          'All torrents:',
          allTorrents.map((t) => ({ name: t.name, hash: t.hash })),
        );

        // Try to find by partial hash match (case insensitive)
        const foundTorrent = allTorrents.find(
          (t) =>
            t.hash.toLowerCase() === hash.toLowerCase() ||
            t.hash.toLowerCase().includes(hash.toLowerCase()) ||
            hash.toLowerCase().includes(t.hash.toLowerCase()),
        );

        if (foundTorrent) {
          console.log('Found torrent by partial match:', foundTorrent);
          // Update the hash to the correct one
          window.history.replaceState(
            null,
            '',
            `/torrent/${foundTorrent.hash}`,
          );

          // Fetch data with correct hash
          const [properties, files, trackers, peersResponse] =
            await Promise.all([
              qbApi.getTorrentProperties(foundTorrent.hash),
              qbApi.getTorrentFiles(foundTorrent.hash),
              qbApi.getTorrentTrackers(foundTorrent.hash),
              qbApi.getTorrentPeers(foundTorrent.hash),
            ]);

          setData({
            torrent: foundTorrent,
            properties,
            files,
            trackers,
            peers: peersResponse.peers,
          });
          return;
        }

        setError('Torrent not found');
        return;
      }

      // Fetch additional data in parallel
      const [properties, files, trackers, peersResponse] = await Promise.all([
        qbApi.getTorrentProperties(hash),
        qbApi.getTorrentFiles(hash),
        qbApi.getTorrentTrackers(hash),
        qbApi.getTorrentPeers(hash),
      ]);

      setData({
        torrent,
        properties,
        files,
        trackers,
        peers: peersResponse.peers,
      });
    } catch (err) {
      console.error('Failed to fetch torrent data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load torrent data',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTorrentData();

    // Set up polling for real-time updates
    const interval = setInterval(fetchTorrentData, 5000);

    return () => clearInterval(interval);
  }, [hash]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (!hash) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground text-lg'>Invalid torrent hash</p>
          <Button className='mt-4' asChild>
            <Link to='/dashboard'>
              Torrents
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading && !data.torrent) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <RefreshCw className='mx-auto mb-4 h-8 w-8 animate-spin' />
          <p>Loading torrent details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <p className='text-destructive mb-4 text-lg'>{error}</p>
          <div className='space-x-2'>
            <Button onClick={fetchTorrentData} variant='outline'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Retry
            </Button>
            <Button onClick={handleBack} asChild>
              <Link to='/dashboard'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data.torrent) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground text-lg'>Torrent not found</p>
          <Button onClick={handleBack} className='mt-4' asChild>
            <Link to='/dashboard'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header>
        <Breadcrumb className='min-w-0 flex-1'>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to='/torrents'>Torrents</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className='truncate'>
                {data.torrent.name || 'Loading…'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className='ml-4 flex items-center gap-2'>
          <Button
            size='icon'
            variant='ghost'
            onClick={fetchTorrentData}
            disabled={isLoading}
            aria-label='Refresh'
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='space-y-6'>
          {/* Torrent quick card */}
          <section className='bg-card rounded-xl border p-4 shadow-sm'>
            <div className='flex items-center gap-4'>
              <Badge
                variant='secondary'
                className={`${getStateColor(data.torrent.state)} text-white`}
              >
                {getStateText(data.torrent.state)}
              </Badge>
              <span className='text-muted-foreground text-sm'>
                {data.torrent ? (
                  <>
                    {formatBytes(data.torrent.size)} •{' '}
                    {formatProgress(data.torrent.progress)}
                  </>
                ) : (
                  <div className='bg-muted h-4 w-32 animate-pulse rounded' />
                )}
              </span>
            </div>
            <h1 className='mt-2 truncate text-xl font-bold'>
              {data.torrent.name ?? (
                <div className='bg-muted h-6 w-3/4 animate-pulse rounded' />
              )}
            </h1>
          </section>

          {/* ───────────── Tabs ───────────── */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'>
              <TabsTrigger value='general'>General</TabsTrigger>
              <TabsTrigger value='trackers'>Trackers</TabsTrigger>
              <TabsTrigger value='peers'>Peers</TabsTrigger>
              <TabsTrigger value='content'>Content</TabsTrigger>
              <TabsTrigger value='speed'>Speed</TabsTrigger>
            </TabsList>

            <div className='mt-4'>
              <TabsContent value='general'>
                <TorrentGeneralTab
                  torrent={data.torrent}
                  properties={data.properties}
                />
              </TabsContent>
              <TabsContent value='trackers'>
                <TorrentTrackersTab
                  torrent={data.torrent}
                  trackers={data.trackers}
                  onRefresh={fetchTorrentData}
                />
              </TabsContent>
              <TabsContent value='peers'>
                <TorrentPeersTab peers={data.peers} />
              </TabsContent>
              <TabsContent value='content'>
                <TorrentContentTab
                  torrent={data.torrent}
                  files={data.files}
                  onRefresh={fetchTorrentData}
                />
              </TabsContent>
              <TabsContent value='speed'>
                <TorrentSpeedTab
                  torrent={data.torrent}
                  properties={data.properties}
                  onRefresh={fetchTorrentData}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Main>
    </>
  );
}
