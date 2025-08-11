import { useEffect, useState } from 'react';

import { Link, useNavigate } from '@tanstack/react-router';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Download,
  HardDrive,
  Plus,
  RefreshCw,
  Settings,
  TrendingDown,
  TrendingUp,
  Upload,
  Users,
  Wifi,
} from 'lucide-react';

import { Header } from '@/components/layout/header.tsx';
import { Main } from '@/components/layout/main.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AddTorrentModal } from '@/features/torrents/components/add-torrent-modal.tsx';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatBytes, formatProgress, formatSpeed, getStateColor, getStateText } from '@/lib/utils';
import { useTorrentStore } from '@/stores/torrent-store';

export default function DashboardPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { torrents, serverState, isLoading, fetchTorrents } = useTorrentStore();

  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let isWindowFocused = true;

    const handleVisibilityChange = () => {
      isWindowFocused = !document.hidden;
      if (isWindowFocused && !interval) {
        startPolling();
      } else if (!isWindowFocused && interval) {
        stopPolling();
      }
    };

    const startPolling = () => {
      if (!interval) {
        fetchTorrents();
        interval = setInterval(() => {
          fetchTorrents();
        }, 4000); // Poll every 4s when focused
      }
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchTorrents]);

  // Calculate statistics
  const totalTorrents = torrents.length;
  const activeTorrents = torrents.filter((t) => t.dlspeed > 0 || t.upspeed > 0).length;
  const stalledTorrents = torrents.filter((t) =>
    ['stalledDL', 'stalledUP'].includes(t.state),
  ).length;
  const seedingTorrents = torrents.filter((t) =>
    ['uploading', 'stalledUP', 'queuedUP'].includes(t.state),
  ).length;
  const downloadingTorrents = torrents.filter((t) =>
    ['downloading', 'metaDL', 'stalledDL', 'queuedDL'].includes(t.state),
  ).length;
  const completedTorrents = torrents.filter((t) => t.progress === 1).length;
  const pausedTorrents = torrents.filter((t) => ['pausedDL', 'pausedUP'].includes(t.state)).length;

  // Calculate speeds
  const totalDownloadSpeed = torrents.reduce((sum, t) => sum + t.dlspeed, 0);
  const totalUploadSpeed = torrents.reduce((sum, t) => sum + t.upspeed, 0);

  // Get recent activity (last 10 torrents, sorted by added date if available, or by name)
  const recentTorrents = [...torrents]
    .sort((a, b) => (b.added_on || 0) - (a.added_on || 0))
    .slice(0, 10);

  const handleAddTorrentClick = () => {
    setAddModalOpen(true);
  };

  const handleViewAllTorrents = () => {
    navigate({ to: '/torrents' });
  };

  const handleViewStatistics = () => {
    navigate({ to: '/dashboard' }); // Statistics not implemented yet
  };

  return (
    <>
      <Header fixed>
        <h3 className={isMobile ? 'text-lg font-semibold' : 'text-2xl'}>Dashboard</h3>
      </Header>
      <Main>
        <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
          {/* Overview Statistics */}
          <div
            className={
              isMobile
                ? 'grid grid-cols-2 gap-3'
                : 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'
            }
          >
            <Card>
              <CardHeader
                className={`flex flex-row items-center justify-between space-y-0 ${
                  isMobile ? 'pb-1' : 'pb-2'
                }`}
              >
                <CardTitle className={isMobile ? 'text-xs font-medium' : 'text-sm font-medium'}>
                  {isMobile ? 'Torrents' : 'Total Torrents'}
                </CardTitle>
                <Download className={`text-muted-foreground ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </CardHeader>
              <CardContent>
                <div className={isMobile ? 'text-lg font-bold' : 'text-2xl font-bold'}>
                  {totalTorrents}
                </div>
                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  {activeTorrents} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                className={`flex flex-row items-center justify-between space-y-0 ${
                  isMobile ? 'pb-1' : 'pb-2'
                }`}
              >
                <CardTitle className={isMobile ? 'text-xs font-medium' : 'text-sm font-medium'}>
                  {isMobile ? 'Down' : 'Download Speed'}
                </CardTitle>
                <TrendingDown
                  className={`text-muted-foreground ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`}
                />
              </CardHeader>
              <CardContent>
                <div className={isMobile ? 'text-lg font-bold' : 'text-2xl font-bold'}>
                  {formatSpeed(totalDownloadSpeed)}
                </div>
                <p className='text-muted-foreground text-xs'>{downloadingTorrents} downloading</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                className={`flex flex-row items-center justify-between space-y-0 ${
                  isMobile ? 'pb-1' : 'pb-2'
                }`}
              >
                <CardTitle className={isMobile ? 'text-xs font-medium' : 'text-sm font-medium'}>
                  {isMobile ? 'Up' : 'Upload Speed'}
                </CardTitle>
                <TrendingUp
                  className={`text-muted-foreground ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`}
                />
              </CardHeader>
              <CardContent>
                <div className={isMobile ? 'text-lg font-bold' : 'text-2xl font-bold'}>
                  {formatSpeed(totalUploadSpeed)}
                </div>
                <p className='text-muted-foreground text-xs'>{seedingTorrents} seeding</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                className={`flex flex-row items-center justify-between space-y-0 ${
                  isMobile ? 'pb-1' : 'pb-2'
                }`}
              >
                <CardTitle className={isMobile ? 'text-xs font-medium' : 'text-sm font-medium'}>
                  {isMobile ? 'Space' : 'Free Space'}
                </CardTitle>
                <HardDrive
                  className={`text-muted-foreground ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`}
                />
              </CardHeader>
              <CardContent>
                <div className={isMobile ? 'text-lg font-bold' : 'text-2xl font-bold'}>
                  {formatBytes(serverState?.free_space_on_disk || 0)}
                </div>
                <p className='text-muted-foreground text-xs'>
                  {isMobile ? 'Available' : 'Available storage'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics */}
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Torrent Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  Torrent Status
                  <Button
                    variant='ghost'
                    size='sm'
                    // onClick={handleViewAllTorrents}
                    // asChild
                  >
                    <Link to='/torrents'>View All</Link>
                    <ArrowRight className='ml-1 h-4 w-4' />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='flex items-center gap-2 text-sm'>
                        <Activity className='h-4 w-4 text-green-500' />
                        Active
                      </span>
                      <Badge variant='outline'>{activeTorrents}</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='flex items-center gap-2 text-sm'>
                        <Download className='h-4 w-4 text-blue-500' />
                        Downloading
                      </span>
                      <Badge variant='outline'>{downloadingTorrents}</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='flex items-center gap-2 text-sm'>
                        <Upload className='h-4 w-4 text-green-500' />
                        Seeding
                      </span>
                      <Badge variant='outline'>{seedingTorrents}</Badge>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-green-600'>Completed</span>
                      <Badge variant='outline'>{completedTorrents}</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-500'>Paused</span>
                      <Badge variant='outline'>{pausedTorrents}</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-orange-500'>Stalled</span>
                      <Badge variant='outline'>{stalledTorrents}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Server Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  Server Status
                  <Button variant='ghost' size='sm' onClick={handleViewStatistics}>
                    Statistics
                    <BarChart3 className='ml-1 h-4 w-4' />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='flex items-center gap-2 text-sm'>
                      <Wifi className='h-4 w-4' />
                      Connection
                    </span>
                    <Badge
                      variant={
                        serverState?.connection_status === 'connected' ? 'default' : 'destructive'
                      }
                    >
                      {serverState?.connection_status || 'Unknown'}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Session Downloaded</span>
                    <span className='font-mono text-sm'>
                      {formatBytes(serverState?.dl_info_data || 0)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Session Uploaded</span>
                    <span className='font-mono text-sm'>
                      {formatBytes(serverState?.up_info_data || 0)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='flex items-center gap-2 text-sm'>
                      <Users className='h-4 w-4' />
                      DHT Nodes
                    </span>
                    <span className='font-mono text-sm'>{serverState?.dht_nodes || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                Recent Activity
                <Button variant='ghost' size='sm' onClick={handleViewAllTorrents}>
                  View All Torrents
                  <ArrowRight className='ml-1 h-4 w-4' />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && torrents.length === 0 ? (
                <div className='flex h-32 items-center justify-center'>
                  <div className='text-center'>
                    <RefreshCw className='mx-auto mb-2 h-6 w-6 animate-spin' />
                    <p className='text-muted-foreground text-sm'>Loading torrents...</p>
                  </div>
                </div>
              ) : recentTorrents.length === 0 ? (
                <div className='flex h-32 items-center justify-center'>
                  <div className='text-center'>
                    <Download className='text-muted-foreground mx-auto mb-2 h-8 w-8' />
                    <p className='text-muted-foreground text-sm'>No torrents yet</p>
                    <Button size='sm' className='mt-2' onClick={handleAddTorrentClick}>
                      Add your first torrent
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='space-y-3'>
                  {recentTorrents.map((torrent) => (
                    <div
                      key={torrent.hash}
                      className='hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors'
                      onClick={() =>
                        navigate({
                          to: '/torrents/$hash',
                          params: { hash: torrent.hash },
                          search: { tab: '' },
                        })
                      }
                    >
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <h4 className='truncate font-medium'>{torrent.name}</h4>
                          <Badge
                            variant='secondary'
                            className={`${getStateColor(torrent.state)} text-xs text-white`}
                          >
                            {getStateText(torrent.state)}
                          </Badge>
                        </div>
                        <div className='text-muted-foreground mt-1 flex items-center gap-4 text-xs'>
                          <span>{formatBytes(torrent.size)}</span>
                          <span>{formatProgress(torrent.progress)}</span>
                          {torrent.dlspeed > 0 && (
                            <span className='text-blue-600'>↓ {formatSpeed(torrent.dlspeed)}</span>
                          )}
                          {torrent.upspeed > 0 && (
                            <span className='text-green-600'>↑ {formatSpeed(torrent.upspeed)}</span>
                          )}
                        </div>
                      </div>
                      <div className='w-24 flex-shrink-0'>
                        <Progress value={torrent.progress * 100} className='h-2' />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <Button onClick={handleAddTorrentClick} className='h-16'>
                  <div className='text-center'>
                    <Plus className='mx-auto mb-1 h-6 w-6' />
                    <div>Add Torrent</div>
                  </div>
                </Button>
                <Button variant='outline' onClick={handleViewAllTorrents} className='h-16'>
                  <div className='text-center'>
                    <Download className='mx-auto mb-1 h-6 w-6' />
                    <div>Manage Torrents</div>
                  </div>
                </Button>
                <Button
                  variant='outline'
                  onClick={() => navigate({ to: '/settings' })}
                  className='flex h-16 items-center justify-center text-center'
                  // asChild
                >
                  <Link to='/settings'>
                    <Settings className='mx-auto mb-1 h-6 w-6' />
                    <div>Settings</div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>

      <AddTorrentModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAdded={() => {
          setAddModalOpen(false);
          fetchTorrents();
        }}
      />
    </>
  );
}
