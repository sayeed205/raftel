import { useMemo, useState } from 'react';

import { Search, Users } from 'lucide-react';

import type { TorrentPeer } from '@/types/qbit/torrent.ts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatBytes, formatProgress, formatSpeed } from '@/lib/utils';

interface TorrentPeersTabProps {
  peers: Record<string, TorrentPeer>;
}

const getConnectionTypeText = (connection: string): string => {
  // Parse connection flags
  const flags = connection.toLowerCase();
  const types = [];

  if (flags.includes('bt')) types.push('BitTorrent');
  if (flags.includes('ut')) types.push('μTorrent');
  if (flags.includes('lt')) types.push('libtorrent');
  if (flags.includes('az')) types.push('Azureus');
  if (flags.includes('tr')) types.push('Transmission');
  if (flags.includes('de')) types.push('Deluge');
  if (flags.includes('qb')) types.push('qBittorrent');

  return types.length > 0 ? types.join(', ') : connection;
};

const getConnectionTypeColor = (connection: string): string => {
  const conn = connection.toLowerCase();
  if (conn.includes('e')) return 'bg-green-500'; // Encrypted
  if (conn.includes('h')) return 'bg-blue-500'; // Holepunched
  if (conn.includes('p')) return 'bg-purple-500'; // Peer exchange
  if (conn.includes('l')) return 'bg-orange-500'; // Local
  return 'bg-gray-500';
};

const getFlagDescription = (flags: string, flagsDesc: string): string => {
  if (flagsDesc) return flagsDesc;

  // Parse common flags
  const descriptions = [];
  if (flags.includes('D')) descriptions.push('Downloading');
  if (flags.includes('U')) descriptions.push('Uploading');
  if (flags.includes('O')) descriptions.push('Optimistic unchoke');
  if (flags.includes('S')) descriptions.push('Snubbed');
  if (flags.includes('I')) descriptions.push('Incoming connection');
  if (flags.includes('K')) descriptions.push('Peer is unchoking us');
  if (flags.includes('?')) descriptions.push('Peer is choked');
  if (flags.includes('X'))
    descriptions.push('Peer was included in peerlists obtained through Peer Exchange (PEX)');
  if (flags.includes('H')) descriptions.push('Peer was obtained through DHT');
  if (flags.includes('E')) descriptions.push('Peer is using Protocol Encryption');
  if (flags.includes('L')) descriptions.push('Peer is local');

  return descriptions.length > 0 ? descriptions.join(', ') : flags;
};

export function TorrentPeersTab({ peers }: TorrentPeersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const peersList = useMemo(() => {
    return Object.entries(peers).map(([key, peer]) => ({
      key,
      ...peer,
    }));
  }, [peers]);

  const filteredPeers = useMemo(() => {
    if (!searchTerm) return peersList;

    const term = searchTerm.toLowerCase();
    return peersList.filter(
      (peer) =>
        peer.ip.toLowerCase().includes(term) ||
        peer.client.toLowerCase().includes(term) ||
        peer.country.toLowerCase().includes(term) ||
        peer.country_code.toLowerCase().includes(term),
    );
  }, [peersList, searchTerm]);

  const stats = useMemo(() => {
    const totalPeers = peersList.length;
    const downloadingPeers = peersList.filter((p) => p.dl_speed > 0).length;
    const uploadingPeers = peersList.filter((p) => p.up_speed > 0).length;
    const seeders = peersList.filter((p) => p.progress >= 1).length;
    const leechers = totalPeers - seeders;

    return {
      total: totalPeers,
      downloading: downloadingPeers,
      uploading: uploadingPeers,
      seeders,
      leechers,
    };
  }, [peersList]);

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-5'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2'>
              <Users className='text-muted-foreground h-4 w-4' />
              <div>
                <p className='text-2xl font-bold'>{stats.total}</p>
                <p className='text-muted-foreground text-xs'>Total Peers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2'>
              <div className='h-3 w-3 rounded-full bg-green-500' />
              <div>
                <p className='text-2xl font-bold'>{stats.seeders}</p>
                <p className='text-muted-foreground text-xs'>Seeders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2'>
              <div className='h-3 w-3 rounded-full bg-blue-500' />
              <div>
                <p className='text-2xl font-bold'>{stats.leechers}</p>
                <p className='text-muted-foreground text-xs'>Leechers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2'>
              <div className='h-3 w-3 rounded-full bg-orange-500' />
              <div>
                <p className='text-2xl font-bold'>{stats.downloading}</p>
                <p className='text-muted-foreground text-xs'>Downloading</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2'>
              <div className='h-3 w-3 rounded-full bg-purple-500' />
              <div>
                <p className='text-2xl font-bold'>{stats.uploading}</p>
                <p className='text-muted-foreground text-xs'>Uploading</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg'>Connected Peers</CardTitle>
            <div className='flex items-center space-x-2'>
              <div className='relative'>
                <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
                <Input
                  placeholder='Search peers...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-64 pl-8'
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPeers.length === 0 ? (
            <div className='text-muted-foreground py-8 text-center'>
              {peersList.length === 0 ? 'No peers connected' : 'No peers match your search'}
            </div>
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Down Speed</TableHead>
                    <TableHead>Up Speed</TableHead>
                    <TableHead>Downloaded</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Connection</TableHead>
                    <TableHead>Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPeers.map((peer) => (
                    <TableRow key={peer.key}>
                      <TableCell>
                        <div className='font-mono text-sm'>
                          {peer.ip}:{peer.port}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-2'>
                          {peer.country_code && (
                            <span className='bg-muted rounded px-1 font-mono text-xs'>
                              {peer.country_code.toUpperCase()}
                            </span>
                          )}
                          <span className='text-sm'>{peer.country || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className='font-mono text-sm'>{peer.client}</span>
                      </TableCell>
                      <TableCell>
                        <div className='flex min-w-[120px] items-center space-x-2'>
                          <Progress value={peer.progress * 100} className='flex-1' />
                          <span className='w-12 text-right text-xs'>
                            {formatProgress(peer.progress)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-sm ${
                            peer.dl_speed > 0
                              ? 'font-medium text-green-600'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {formatSpeed(peer.dl_speed)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-sm ${
                            peer.up_speed > 0
                              ? 'font-medium text-blue-600'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {formatSpeed(peer.up_speed)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className='text-sm'>{formatBytes(peer.downloaded)}</span>
                      </TableCell>
                      <TableCell>
                        <span className='text-sm'>{formatBytes(peer.uploaded)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='secondary'
                          className={`${getConnectionTypeColor(
                            peer.connection,
                          )} text-xs text-white`}
                          title={getConnectionTypeText(peer.connection)}
                        >
                          {peer.connection}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='max-w-xs'>
                          <Badge
                            variant='outline'
                            className='text-xs'
                            title={getFlagDescription(peer.flags, peer.flags_desc)}
                          >
                            {peer.flags}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
