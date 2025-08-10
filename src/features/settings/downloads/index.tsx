import { FolderOpen, HardDriveIcon, SettingsIcon } from 'lucide-react';
import ContentSection from '../components/content-section';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSettings, useSettingsActions } from '@/stores/settings-store';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SettingsDownloads() {
  const { preferences, pendingChanges, validationErrors } = useSettings();
  const { setPendingChange } = useSettingsActions();

  if (!preferences) {
    return (
      <div className='flex w-full items-center justify-center'>
        <div className='text-center'>
          <div className='border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2'></div>
        </div>
      </div>
    );
  }

  const getValue = (key: keyof typeof preferences) => {
    return pendingChanges[key] !== undefined
      ? pendingChanges[key]
      : preferences[key];
  };

  // Get validation error for a field
  const getFieldError = (field: string) => {
    return validationErrors.find((error) => error.field === field)?.message;
  };

  return (
    <ContentSection
      title='Downloads'
      desc='Update your download settings and behavior.'
    >
      <div className='space-y-6'>
        {/* File Management */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <HardDriveIcon className='h-5 w-5' />
              File Management
            </CardTitle>
            <CardDescription>
              Configure how files are organized and managed during downloads.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Select
                  value={
                    (getValue('torrent_content_layout') as string) || 'Original'
                  }
                  onValueChange={(value) =>
                    setPendingChange('torrent_content_layout', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Original'>Original</SelectItem>
                    <SelectItem value='Subfolder'>Create subfolder</SelectItem>
                    <SelectItem value='NoSubfolder'>
                      Don't create subfolder
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Label htmlFor='torrent_content_layout'>
                  Torrent Content Layout
                  <p className='text-muted-foreground text-sm'>
                    How to organize torrent content in the download directory.
                  </p>
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='create_subfolder_enabled'
                  checked={
                    (getValue('create_subfolder_enabled') as boolean) || false
                  }
                  onCheckedChange={(checked) =>
                    setPendingChange('create_subfolder_enabled', checked)
                  }
                />
                <Label htmlFor='create_subfolder_enabled'>
                  Create subfolder for torrents with multiple files
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='auto_tmm_enabled'
                  checked={(getValue('auto_tmm_enabled') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('auto_tmm_enabled', checked)
                  }
                />
                <Label htmlFor='auto_tmm_enabled'>
                  Enable automatic torrent management
                  <p className='text-muted-foreground text-sm font-light'>
                    Automatically manage torrent save paths based on categories
                    and tags.
                  </p>
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='preallocate_all'
                  checked={(getValue('preallocate_all') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('preallocate_all', checked)
                  }
                />
                <Label htmlFor='preallocate_all'>
                  Pre-allocate disk space for all files
                  <p className='text-muted-foreground text-sm font-light'>
                    Allocate full file size on disk immediately. Prevents
                    fragmentation but uses more disk space.
                  </p>
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='incomplete_files_ext'
                  checked={
                    (getValue('incomplete_files_ext') as boolean) || false
                  }
                  onCheckedChange={(checked) =>
                    setPendingChange('incomplete_files_ext', checked)
                  }
                />
                <Label htmlFor='incomplete_files_ext'>
                  Append .!qB extension to incomplete files
                  <p className='text-muted-foreground text-sm font-light'>
                    Add .!qB extension to files while they are being downloaded.
                  </p>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <Label htmlFor='save_path'>
                  Default Save Path
                  <p className='text-muted-foreground text-sm font-light'>
                    Default directory where completed torrents are saved.
                  </p>
                </Label>
                <div className='flex gap-2'>
                  <Input
                    id='save_path'
                    value={(getValue('save_path') as string) || ''}
                    onChange={(e) =>
                      setPendingChange('save_path', e.target.value)
                    }
                    placeholder='/downloads'
                    className={
                      getFieldError('save_path') ? 'border-destructive' : ''
                    }
                  />
                </div>
                {getFieldError('save_path') && (
                  <p className='text-destructive text-sm'>
                    {getFieldError('save_path')}
                  </p>
                )}
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='temp_path_enabled'
                  checked={(getValue('temp_path_enabled') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('temp_path_enabled', checked)
                  }
                />
                <Label htmlFor='temp_path_enabled'>
                  Use temporary path for incomplete downloads
                </Label>
              </div>

              {(getValue('temp_path_enabled') as boolean) && (
                <div className='ml-6 space-y-2'>
                  <Label htmlFor='temp_path'>
                    Temporary Path
                    <p className='text-muted-foreground text-sm font-light'>
                      Directory for incomplete downloads. Files are moved to the
                      save path when complete.
                    </p>
                  </Label>
                  <div className='flex gap-2'>
                    <Input
                      id='temp_path'
                      value={(getValue('temp_path') as string) || ''}
                      onChange={(e) =>
                        setPendingChange('temp_path', e.target.value)
                      }
                      placeholder='/downloads/incomplete'
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Download Behavior */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <SettingsIcon className='h-5 w-5' />
              Download Behavior
            </CardTitle>
            <CardDescription>
              Configure how torrents behave when added and completed.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='merge_trackers'
                  checked={(getValue('merge_trackers') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('merge_trackers', checked)
                  }
                />
                <Label htmlFor='merge_trackers'>
                  Merge trackers to existing torrents
                  <p className='text-muted-foreground text-sm font-light'>
                    Whether trackers should be merged when adding a duplicate
                    torrent.
                  </p>
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='add_to_top_of_queue'
                  checked={
                    (getValue('add_to_top_of_queue') as boolean) || false
                  }
                  onCheckedChange={(checked) =>
                    setPendingChange('add_to_top_of_queue', checked)
                  }
                />
                <Label htmlFor='add_to_top_of_queue'>
                  Add torrents to top of queue
                  <p className='text-muted-foreground text-sm font-light'>
                    New torrents will be prioritized over existing ones in the
                    download queue.
                  </p>
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='start_paused_enabled'
                  checked={
                    (getValue('start_paused_enabled') as boolean) ||
                    (getValue('add_stopped_enabled') as boolean) ||
                    false
                  }
                  onCheckedChange={(checked) => {
                    setPendingChange('start_paused_enabled', checked);
                    setPendingChange('add_stopped_enabled', checked);
                  }}
                />
                <Label htmlFor='start_paused_enabled'>
                  Do not start the download automatically.
                  <p className='text-muted-foreground text-sm font-light'>
                    New torrents will be added in paused state and need to be
                    manually started.
                  </p>
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Select
                  value={
                    (getValue('torrent_stop_condition') as number).toString() ||
                    '0'
                  }
                  onValueChange={(value) =>
                    setPendingChange('torrent_stop_condition', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='None'>None</SelectItem>
                    <SelectItem value='MetadataReceived'>
                      Metadata received
                    </SelectItem>
                    <SelectItem value='FilesChecked'>Files checked</SelectItem>
                  </SelectContent>
                </Select>

                <Label htmlFor='torrent_content_layout'>
                  Torrent stop condition
                  <p className='text-muted-foreground text-sm font-light'>
                    When to automatically stop torrents after adding.
                  </p>
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Select
                  value={
                    (getValue('auto_delete_mode') as number).toString() || '0'
                  }
                  onValueChange={(value) =>
                    setPendingChange('auto_delete_mode', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Never</SelectItem>
                    <SelectItem value='1'>
                      If torrent was added successfully
                    </SelectItem>
                    <SelectItem value='2'>Always</SelectItem>
                  </SelectContent>
                </Select>
                <Label htmlFor='torrent_content_layout'>
                  Delete .torrent files
                  <p className='text-muted-foreground text-sm'>
                    When to delete .torrent files after adding them to
                    qBittorrent.
                  </p>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentSection>
  );
}
