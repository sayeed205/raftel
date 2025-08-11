import { useState } from 'react';

import { Edit, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { TorrentInfo } from '@/types/api';
import type { TorrentTracker } from '@/types/qbit/torrent.ts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import qbit from '@/services/qbit';

interface TorrentTrackersTabProps {
  torrent: TorrentInfo;
  trackers: Array<TorrentTracker>;
  onRefresh: () => void;
}

const getTrackerStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return 'Disabled';
    case 1:
      return 'Not contacted yet';
    case 2:
      return 'Working';
    case 3:
      return 'Updating';
    case 4:
      return 'Not working';
    default:
      return 'Unknown';
  }
};

const getTrackerStatusColor = (status: number): string => {
  switch (status) {
    case 2:
      return 'bg-green-500';
    case 3:
      return 'bg-blue-500';
    case 4:
      return 'bg-red-500';
    case 0:
      return 'bg-gray-500';
    default:
      return 'bg-yellow-500';
  }
};

export function TorrentTrackersTab({ torrent, trackers, onRefresh }: TorrentTrackersTabProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTracker, setEditingTracker] = useState<TorrentTracker | null>(null);
  const [newTrackerUrls, setNewTrackerUrls] = useState('');
  const [editTrackerUrl, setEditTrackerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTrackers = async () => {
    if (!newTrackerUrls.trim()) return;

    try {
      setIsLoading(true);

      // Note: qBittorrent API doesn't have a direct add tracker endpoint in the current implementation
      // This would need to be implemented in the API client
      toast.info('Add tracker functionality needs to be implemented in the API client');

      setNewTrackerUrls('');
      setIsAddDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to add trackers:', error);
      toast.error('Failed to add trackers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTracker = async () => {
    if (!editTrackerUrl.trim() || !editingTracker) return;

    try {
      setIsLoading(true);

      // Note: qBittorrent API doesn't have a direct edit tracker endpoint in the current implementation
      // This would need to be implemented in the API client
      toast.info('Edit tracker functionality needs to be implemented in the API client');

      setEditTrackerUrl('');
      setEditingTracker(null);
      setIsEditDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to edit tracker:', error);
      toast.error('Failed to edit tracker');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTracker = async (tracker: TorrentTracker) => {
    if (!confirm(`Are you sure you want to remove tracker: ${tracker.url}?`)) return;

    try {
      setIsLoading(true);

      // Note: qBittorrent API doesn't have a direct delete tracker endpoint in the current implementation
      // This would need to be implemented in the API client
      toast.info('Delete tracker functionality needs to be implemented in the API client');

      onRefresh();
    } catch (error) {
      console.error('Failed to delete tracker:', error);
      toast.error('Failed to delete tracker');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReannounce = async () => {
    try {
      setIsLoading(true);
      await qbit.reannounceTorrents([torrent.hash]);
      toast.success('Reannounce sent to all trackers');
      onRefresh();
    } catch (error) {
      console.error('Failed to reannounce:', error);
      toast.error('Failed to reannounce to trackers');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (tracker: TorrentTracker) => {
    setEditingTracker(tracker);
    setEditTrackerUrl(tracker.url);
    setIsEditDialogOpen(true);
  };

  return (
    <div className='space-y-6'>
      {/* Actions */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg'>Tracker Management</CardTitle>
            <div className='flex items-center space-x-2'>
              <Button size='sm' variant='outline' onClick={handleReannounce} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Reannounce
              </Button>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size='sm'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Trackers
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Trackers</DialogTitle>
                  </DialogHeader>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='tracker-urls'>Tracker URLs (one per line)</Label>
                      <Textarea
                        id='tracker-urls'
                        placeholder='http://tracker.example.com:8080/announce&#10;udp://tracker.example.com:8080/announce'
                        value={newTrackerUrls}
                        onChange={(e) => setNewTrackerUrls(e.target.value)}
                        rows={6}
                      />
                    </div>
                    <div className='flex justify-end space-x-2'>
                      <Button variant='outline' onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddTrackers}
                        disabled={!newTrackerUrls.trim() || isLoading}
                      >
                        Add Trackers
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Trackers Table */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Trackers ({trackers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {trackers.length === 0 ? (
            <div className='text-muted-foreground py-8 text-center'>No trackers found</div>
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Seeds</TableHead>
                    <TableHead>Peers</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className='w-24'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trackers.map((tracker, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant='outline'>{tracker.tier}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className='max-w-md'>
                          <span className='font-mono text-sm break-all'>{tracker.url}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='secondary'
                          className={`${getTrackerStatusColor(tracker.status)} text-white`}
                        >
                          {getTrackerStatusText(tracker.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{tracker.num_seeds >= 0 ? tracker.num_seeds : 'N/A'}</TableCell>
                      <TableCell>{tracker.num_peers >= 0 ? tracker.num_peers : 'N/A'}</TableCell>
                      <TableCell>
                        <div className='max-w-xs'>
                          <span className='text-muted-foreground text-xs break-words'>
                            {tracker.msg || 'No message'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-1'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => openEditDialog(tracker)}
                            disabled={isLoading}
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => handleDeleteTracker(tracker)}
                            disabled={isLoading}
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
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

      {/* Edit Tracker Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tracker</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='edit-tracker-url'>Tracker URL</Label>
              <Input
                id='edit-tracker-url'
                value={editTrackerUrl}
                onChange={(e) => setEditTrackerUrl(e.target.value)}
                placeholder='http://tracker.example.com:8080/announce'
              />
            </div>
            <div className='flex justify-end space-x-2'>
              <Button variant='outline' onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditTracker} disabled={!editTrackerUrl.trim() || isLoading}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
