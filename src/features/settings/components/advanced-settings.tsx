import {
  AlertTriangle,
  Database,
  HardDrive,
  Mail,
  Network,
  Play,
  Settings,
  Zap,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Textarea } from '@/components/ui/textarea';
import { useSettings, useSettingsActions } from '@/stores/settings-store';

export function AdvancedSettings() {
  const { preferences, pendingChanges, webUISettings } = useSettings();
  const { setPendingChange } = useSettingsActions();

  if (!preferences) {
    return (
      <div className='space-y-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='text-muted-foreground text-center'>Loading advanced settings...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get current values (pending changes take precedence)
  const getValue = (key: keyof typeof preferences) => {
    return pendingChanges[key] !== undefined ? pendingChanges[key] : preferences[key];
  };

  // Show warning if advanced settings are not enabled in WebUI settings
  const showAdvancedWarning = !webUISettings.showAdvancedSettings;

  return (
    <div className='space-y-6'>
      {showAdvancedWarning && (
        <Alert>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            For better organization, consider enabling "Show advanced settings" in the Interface
            Customization section of Web UI Settings.
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <AlertTriangle className='h-4 w-4' />
        <AlertDescription>
          These are advanced settings for expert users. Changing these values incorrectly may cause
          performance issues or instability.
        </AlertDescription>
      </Alert>

      {/* Disk Cache */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HardDrive className='h-5 w-5' />
            Disk Cache & I/O
          </CardTitle>
          <CardDescription>
            Configure disk caching and I/O behavior for optimal performance.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='disk_cache'>Disk cache size (MiB)</Label>
              <Input
                id='disk_cache'
                type='number'
                min='0'
                value={(getValue('disk_cache') as number) || 64}
                onChange={(e) => setPendingChange('disk_cache', parseInt(e.target.value))}
              />
              <p className='text-muted-foreground text-sm'>
                Amount of memory to use for disk caching. 0 = auto.
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='disk_cache_ttl'>Disk cache TTL (seconds)</Label>
              <Input
                id='disk_cache_ttl'
                type='number'
                min='1'
                value={(getValue('disk_cache_ttl') as number) || 60}
                onChange={(e) => setPendingChange('disk_cache_ttl', parseInt(e.target.value))}
              />
              <p className='text-muted-foreground text-sm'>
                How long to keep data in cache before writing to disk.
              </p>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='disk_io_mode'>Disk I/O mode</Label>
              <Select
                value={(getValue('disk_io_mode') as number)?.toString() || '0'}
                onValueChange={(value) => setPendingChange('disk_io_mode', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Default</SelectItem>
                  <SelectItem value='1'>Memory mapped files</SelectItem>
                  <SelectItem value='2'>POSIX compliant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='disk_io_type'>Disk I/O type</Label>
              <Select
                value={(getValue('disk_io_type') as number)?.toString() || '0'}
                onValueChange={(value) => setPendingChange('disk_io_type', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Default</SelectItem>
                  <SelectItem value='1'>Memory mapped files</SelectItem>
                  <SelectItem value='2'>POSIX compliant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='enable_os_cache'
                  checked={(getValue('enable_os_cache') as boolean) || false}
                  onCheckedChange={(checked) => setPendingChange('enable_os_cache', checked)}
                />
                <Label htmlFor='enable_os_cache'>Enable OS cache</Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='enable_coalesce_read_write'
                  checked={(getValue('enable_coalesce_read_write') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('enable_coalesce_read_write', checked)
                  }
                />
                <Label htmlFor='enable_coalesce_read_write'>Enable coalesce reads & writes</Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='enable_piece_extent_affinity'
                  checked={(getValue('enable_piece_extent_affinity') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('enable_piece_extent_affinity', checked)
                  }
                />
                <Label htmlFor='enable_piece_extent_affinity'>Enable piece extent affinity</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Buffer Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Network className='h-5 w-5' />
            Network Buffers
          </CardTitle>
          <CardDescription>
            Configure network buffer sizes and connection parameters.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='send_buffer_watermark'>Send buffer watermark (bytes)</Label>
              <Input
                id='send_buffer_watermark'
                type='number'
                min='1'
                value={(getValue('send_buffer_watermark') as number) || 500000}
                onChange={(e) =>
                  setPendingChange('send_buffer_watermark', parseInt(e.target.value))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='send_buffer_low_watermark'>Send buffer low watermark (bytes)</Label>
              <Input
                id='send_buffer_low_watermark'
                type='number'
                min='1'
                value={(getValue('send_buffer_low_watermark') as number) || 10000}
                onChange={(e) =>
                  setPendingChange('send_buffer_low_watermark', parseInt(e.target.value))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='send_buffer_watermark_factor'>Send buffer watermark factor (%)</Label>
              <Input
                id='send_buffer_watermark_factor'
                type='number'
                min='1'
                max='100'
                value={(getValue('send_buffer_watermark_factor') as number) || 50}
                onChange={(e) =>
                  setPendingChange('send_buffer_watermark_factor', parseInt(e.target.value))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='socket_backlog_size'>Socket backlog size</Label>
              <Input
                id='socket_backlog_size'
                type='number'
                min='1'
                value={(getValue('socket_backlog_size') as number) || 30}
                onChange={(e) => setPendingChange('socket_backlog_size', parseInt(e.target.value))}
              />
            </div>
          </div>

          <Separator />

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='outgoing_ports_min'>Outgoing ports min</Label>
              <Input
                id='outgoing_ports_min'
                type='number'
                min='1'
                max='65535'
                value={(getValue('outgoing_ports_min') as number) || 0}
                onChange={(e) => setPendingChange('outgoing_ports_min', parseInt(e.target.value))}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='outgoing_ports_max'>Outgoing ports max</Label>
              <Input
                id='outgoing_ports_max'
                type='number'
                min='1'
                max='65535'
                value={(getValue('outgoing_ports_max') as number) || 0}
                onChange={(e) => setPendingChange('outgoing_ports_max', parseInt(e.target.value))}
              />
            </div>
          </div>
          <p className='text-muted-foreground text-sm'>
            Set both to 0 to use any available port. Useful for restrictive firewalls.
          </p>
        </CardContent>
      </Card>

      {/* Resume Data Storage */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Database className='h-5 w-5' />
            Resume Data Storage
          </CardTitle>
          <CardDescription>
            Configure how torrent resume data is stored and managed.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='resume_data_storage_type'>Resume data storage type</Label>
            <Select
              value={(getValue('resume_data_storage_type') as number)?.toString() || '0'}
              onValueChange={(value) =>
                setPendingChange('resume_data_storage_type', parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='0'>Legacy (fastresume files)</SelectItem>
                <SelectItem value='1'>SQLite database</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-muted-foreground text-sm'>
              SQLite database is more efficient for large numbers of torrents.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Queueing */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Play className='h-5 w-5' />
            Torrent Queueing
          </CardTitle>
          <CardDescription>
            Configure torrent queue management and checking behavior.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='queueing_enabled'
              checked={(getValue('queueing_enabled') as boolean) || false}
              onCheckedChange={(checked) => setPendingChange('queueing_enabled', checked)}
            />
            <Label htmlFor='queueing_enabled'>Enable torrent queueing</Label>
          </div>

          {(getValue('queueing_enabled') as boolean) && (
            <div className='ml-6 space-y-2'>
              <Label htmlFor='max_active_checking_torrents'>Maximum active checking torrents</Label>
              <Input
                id='max_active_checking_torrents'
                type='number'
                min='1'
                value={(getValue('max_active_checking_torrents') as number) || 1}
                onChange={(e) =>
                  setPendingChange('max_active_checking_torrents', parseInt(e.target.value))
                }
              />
              <p className='text-muted-foreground text-sm'>
                Number of torrents that can be checked simultaneously.
              </p>
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='torrent_stop_condition'>Stop condition</Label>
            <Select
              value={(getValue('torrent_stop_condition') as number)?.toString() || '0'}
              onValueChange={(value) => setPendingChange('torrent_stop_condition', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='None'>None</SelectItem>
                <SelectItem value='MetadataReceived'>Metadata received</SelectItem>
                <SelectItem value='FilesChecked'>Files checked</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-muted-foreground text-sm'>
              When to automatically stop torrents after adding.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Embedded Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Zap className='h-5 w-5' />
            Embedded Tracker
          </CardTitle>
          <CardDescription>Configure the built-in BitTorrent tracker.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='enable_embedded_tracker'
              checked={(getValue('enable_embedded_tracker') as boolean) || false}
              onCheckedChange={(checked) => setPendingChange('enable_embedded_tracker', checked)}
            />
            <Label htmlFor='enable_embedded_tracker'>Enable embedded tracker</Label>
          </div>

          {(getValue('enable_embedded_tracker') as boolean) && (
            <div className='ml-6 space-y-2'>
              <Label htmlFor='embedded_tracker_port'>Embedded tracker port</Label>
              <Input
                id='embedded_tracker_port'
                type='number'
                min='1'
                max='65535'
                value={(getValue('embedded_tracker_port') as number) || 9000}
                onChange={(e) =>
                  setPendingChange('embedded_tracker_port', parseInt(e.target.value))
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* External Program */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5' />
            External Program
          </CardTitle>
          <CardDescription>Run external programs when torrents complete.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='autorun_enabled'
              checked={(getValue('autorun_enabled') as boolean) || false}
              onCheckedChange={(checked) => setPendingChange('autorun_enabled', checked)}
            />
            <Label htmlFor='autorun_enabled'>Run external program on torrent completion</Label>
          </div>

          {(getValue('autorun_enabled') as boolean) && (
            <div className='ml-6 space-y-2'>
              <Label htmlFor='autorun_program'>Program path</Label>
              <Textarea
                id='autorun_program'
                value={(getValue('autorun_program') as string) || ''}
                onChange={(e) => setPendingChange('autorun_program', e.target.value)}
                placeholder='/path/to/program "%N" "%L" "%F" "%R" "%D" "%C" "%Z" "%T" "%I"'
                rows={3}
              />
              <p className='text-muted-foreground text-sm'>
                Supported parameters: %N (name), %L (label), %F (content path), %R (root path), %D
                (save path), %C (number of files), %Z (torrent size), %T (current tracker), %I (info
                hash)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Mail className='h-5 w-5' />
            Email Notifications
          </CardTitle>
          <CardDescription>Send email notifications when torrents complete.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='mail_notification_enabled'
              checked={(getValue('mail_notification_enabled') as boolean) || false}
              onCheckedChange={(checked) => setPendingChange('mail_notification_enabled', checked)}
            />
            <Label htmlFor='mail_notification_enabled'>Enable email notifications</Label>
          </div>

          {(getValue('mail_notification_enabled') as boolean) && (
            <div className='ml-6 space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='mail_notification_sender'>From email</Label>
                  <Input
                    id='mail_notification_sender'
                    type='email'
                    value={(getValue('mail_notification_sender') as string) || ''}
                    onChange={(e) => setPendingChange('mail_notification_sender', e.target.value)}
                    placeholder='sender@example.com'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='mail_notification_email'>To email</Label>
                  <Input
                    id='mail_notification_email'
                    type='email'
                    value={(getValue('mail_notification_email') as string) || ''}
                    onChange={(e) => setPendingChange('mail_notification_email', e.target.value)}
                    placeholder='recipient@example.com'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='mail_notification_smtp'>SMTP server</Label>
                  <Input
                    id='mail_notification_smtp'
                    value={(getValue('mail_notification_smtp') as string) || ''}
                    onChange={(e) => setPendingChange('mail_notification_smtp', e.target.value)}
                    placeholder='smtp.example.com:587'
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='mail_notification_ssl_enabled'
                    checked={(getValue('mail_notification_ssl_enabled') as boolean) || false}
                    onCheckedChange={(checked) =>
                      setPendingChange('mail_notification_ssl_enabled', checked)
                    }
                  />
                  <Label htmlFor='mail_notification_ssl_enabled'>Use SSL</Label>
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='mail_notification_auth_enabled'
                    checked={(getValue('mail_notification_auth_enabled') as boolean) || false}
                    onCheckedChange={(checked) =>
                      setPendingChange('mail_notification_auth_enabled', checked)
                    }
                  />
                  <Label htmlFor='mail_notification_auth_enabled'>Use authentication</Label>
                </div>

                {(getValue('mail_notification_auth_enabled') as boolean) && (
                  <div className='ml-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label htmlFor='mail_notification_username'>Username</Label>
                      <Input
                        id='mail_notification_username'
                        value={(getValue('mail_notification_username') as string) || ''}
                        onChange={(e) =>
                          setPendingChange('mail_notification_username', e.target.value)
                        }
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='mail_notification_password'>Password</Label>
                      <Input
                        id='mail_notification_password'
                        type='password'
                        value={(getValue('mail_notification_password') as string) || ''}
                        onChange={(e) =>
                          setPendingChange('mail_notification_password', e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Miscellaneous */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5' />
            Miscellaneous
          </CardTitle>
          <CardDescription>Other advanced configuration options.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='check_for_updates'
                checked={(getValue('check_for_updates') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('check_for_updates', checked)}
              />
              <Label htmlFor='check_for_updates'>Check for updates automatically</Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='use_icon_theme'
                checked={(getValue('use_icon_theme') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('use_icon_theme', checked)}
              />
              <Label htmlFor='use_icon_theme'>Use system icon theme</Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='performance_warning'
                checked={(getValue('performance_warning') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('performance_warning', checked)}
              />
              <Label htmlFor='performance_warning'>Show performance warnings</Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='confirm_torrent_deletion'
                checked={(getValue('confirm_torrent_deletion') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('confirm_torrent_deletion', checked)}
              />
              <Label htmlFor='confirm_torrent_deletion'>Confirm torrent deletion</Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='confirm_torrent_recheck'
                checked={(getValue('confirm_torrent_recheck') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('confirm_torrent_recheck', checked)}
              />
              <Label htmlFor='confirm_torrent_recheck'>Confirm torrent recheck</Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='merge_trackers'
                checked={(getValue('merge_trackers') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('merge_trackers', checked)}
              />
              <Label htmlFor='merge_trackers'>Merge trackers to existing torrents</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
