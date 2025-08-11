import { FolderOpen, HardDrive, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useSettings, useSettingsActions } from '@/stores/settings-store';

export function DownloadSettings() {
  const { preferences, pendingChanges, validationErrors } = useSettings();
  const { setPendingChange } = useSettingsActions();

  if (!preferences) {
    return (
      <div className='space-y-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='text-muted-foreground text-center'>Loading download settings...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get current values (pending changes take precedence)
  const getValue = (key: keyof typeof preferences) => {
    return pendingChanges[key] !== undefined ? pendingChanges[key] : preferences[key];
  };

  // Get validation error for a field
  const getFieldError = (field: string) => {
    return validationErrors.find((error) => error.field === field)?.message;
  };

  return (
    <div className='space-y-6'>
      {/* Download Paths */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FolderOpen className='h-5 w-5' />
            Download Paths
          </CardTitle>
          <CardDescription>
            Configure where torrents are saved and how files are organized.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='save_path'>Default Save Path</Label>
              <div className='flex gap-2'>
                <Input
                  id='save_path'
                  value={(getValue('save_path') as string) || ''}
                  onChange={(e) => setPendingChange('save_path', e.target.value)}
                  placeholder='/downloads'
                  className={getFieldError('save_path') ? 'border-destructive' : ''}
                />
                <Button variant='outline' size='icon'>
                  <FolderOpen className='h-4 w-4' />
                </Button>
              </div>
              {getFieldError('save_path') && (
                <p className='text-destructive text-sm'>{getFieldError('save_path')}</p>
              )}
              <p className='text-muted-foreground text-sm'>
                Default directory where completed torrents are saved.
              </p>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='temp_path_enabled'
                checked={(getValue('temp_path_enabled') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('temp_path_enabled', checked)}
              />
              <Label htmlFor='temp_path_enabled'>Use temporary path for incomplete downloads</Label>
            </div>

            {(getValue('temp_path_enabled') as boolean) && (
              <div className='ml-6 space-y-2'>
                <Label htmlFor='temp_path'>Temporary Path</Label>
                <div className='flex gap-2'>
                  <Input
                    id='temp_path'
                    value={(getValue('temp_path') as string) || ''}
                    onChange={(e) => setPendingChange('temp_path', e.target.value)}
                    placeholder='/downloads/incomplete'
                  />
                  <Button variant='outline' size='icon'>
                    <FolderOpen className='h-4 w-4' />
                  </Button>
                </div>
                <p className='text-muted-foreground text-sm'>
                  Directory for incomplete downloads. Files are moved to the save path when
                  complete.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Management */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HardDrive className='h-5 w-5' />
            File Management
          </CardTitle>
          <CardDescription>
            Configure how files are organized and managed during downloads.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='torrent_content_layout'>Torrent Content Layout</Label>
              <Select
                value={(getValue('torrent_content_layout') as string) || 'Original'}
                onValueChange={(value) => setPendingChange('torrent_content_layout', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Original'>Original</SelectItem>
                  <SelectItem value='Subfolder'>Create subfolder</SelectItem>
                  <SelectItem value='NoSubfolder'>Don't create subfolder</SelectItem>
                </SelectContent>
              </Select>
              <p className='text-muted-foreground text-sm'>
                How to organize torrent content in the download directory.
              </p>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='create_subfolder_enabled'
                checked={(getValue('create_subfolder_enabled') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('create_subfolder_enabled', checked)}
              />
              <Label htmlFor='create_subfolder_enabled'>
                Create subfolder for torrents with multiple files
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='auto_tmm_enabled'
                checked={(getValue('auto_tmm_enabled') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('auto_tmm_enabled', checked)}
              />
              <Label htmlFor='auto_tmm_enabled'>Enable automatic torrent management</Label>
            </div>
            <p className='text-muted-foreground ml-6 text-sm'>
              Automatically manage torrent save paths based on categories and tags.
            </p>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='preallocate_all'
                checked={(getValue('preallocate_all') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('preallocate_all', checked)}
              />
              <Label htmlFor='preallocate_all'>Pre-allocate disk space for all files</Label>
            </div>
            <p className='text-muted-foreground ml-6 text-sm'>
              Allocate full file size on disk immediately. Prevents fragmentation but uses more disk
              space.
            </p>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='incomplete_files_ext'
                checked={(getValue('incomplete_files_ext') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('incomplete_files_ext', checked)}
              />
              <Label htmlFor='incomplete_files_ext'>
                Append .!qB extension to incomplete files
              </Label>
            </div>
            <p className='text-muted-foreground ml-6 text-sm'>
              Add .!qB extension to files while they are being downloaded.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Download Behavior */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5' />
            Download Behavior
          </CardTitle>
          <CardDescription>Configure how torrents behave when added and completed.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='start_paused_enabled'
                checked={(getValue('start_paused_enabled') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('start_paused_enabled', checked)}
              />
              <Label htmlFor='start_paused_enabled'>Start torrents in paused state</Label>
            </div>
            <p className='text-muted-foreground ml-6 text-sm'>
              New torrents will be added in paused state and need to be manually started.
            </p>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='add_to_top_of_queue'
                checked={(getValue('add_to_top_of_queue') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('add_to_top_of_queue', checked)}
              />
              <Label htmlFor='add_to_top_of_queue'>Add torrents to top of queue</Label>
            </div>
            <p className='text-muted-foreground ml-6 text-sm'>
              New torrents will be prioritized over existing ones in the download queue.
            </p>

            <Separator />

            <div className='space-y-2'>
              <Label htmlFor='auto_delete_mode'>Delete .torrent files</Label>
              <Select
                value={(getValue('auto_delete_mode') as number)?.toString() || '0'}
                onValueChange={(value) => setPendingChange('auto_delete_mode', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Never</SelectItem>
                  <SelectItem value='1'>If torrent was added successfully</SelectItem>
                  <SelectItem value='2'>Always</SelectItem>
                </SelectContent>
              </Select>
              <p className='text-muted-foreground text-sm'>
                When to delete .torrent files after adding them to qBittorrent.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
