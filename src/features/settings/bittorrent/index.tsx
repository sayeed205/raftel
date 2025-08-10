import { Activity, Globe, Lock, Settings, Share } from 'lucide-react';
import ContentSection from '../components/content-section';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import { useSettings, useSettingsActions } from '@/stores/settings-store';

export default function SettingsBitTorrent() {
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

  // Get current values (pending changes take precedence)
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
      title='BitTorrent'
      desc='Update your BitTorrent protocol settings and sharing configuration.'
    >
      <div className='space-y-6'>
        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>
              Configure privacy and peer discovery options.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='dht'
                  checked={(getValue('dht') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('dht', checked)
                  }
                />
                <Label htmlFor='dht'>
                  Enable DHT (decentralized network) to find more peers
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='pex'
                  checked={(getValue('pex') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('pex', checked)
                  }
                />
                <Label htmlFor='pex'>
                  Enable Peer Exchange (PeX) to find more peers
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='lsd'
                  checked={(getValue('lsd') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('lsd', checked)
                  }
                />
                <Label htmlFor='lsd'>
                  Enable Local Peer Discovery to find more peers
                </Label>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='encryption'>Encryption mode:</Label>
                <Select
                  value={(getValue('encryption') as number)?.toString() || '0'}
                  onValueChange={(value) =>
                    setPendingChange('encryption', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Allow encryption</SelectItem>
                    <SelectItem value='1'>Require encryption</SelectItem>
                    <SelectItem value='2'>Disable encryption</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='anonymous_mode'
                  checked={(getValue('anonymous_mode') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('anonymous_mode', checked)
                  }
                />
                <Label htmlFor='anonymous_mode'>
                  Enable anonymous mode{' '}
                  <a
                    href='https://github.com/qbittorrent/qBittorrent/wiki/Anonymous-Mode'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary hover:underline'
                  >
                    (More information)
                  </a>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Torrent Queueing */}
        <Card>
          <CardHeader>
            <CardTitle>Torrent Queueing</CardTitle>
            <CardDescription>
              Configure limits for active downloads and uploads.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
              <div className='space-y-2'>
                <Label htmlFor='max_active_downloads'>
                  Maximum active downloads
                </Label>
                <Input
                  id='max_active_downloads'
                  type='number'
                  min='0'
                  value={(getValue('max_active_downloads') as number) || 100}
                  onChange={(e) =>
                    setPendingChange(
                      'max_active_downloads',
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='max_active_uploads'>
                  Maximum active uploads
                </Label>
                <Input
                  id='max_active_uploads'
                  type='number'
                  min='0'
                  value={(getValue('max_active_uploads') as number) || 100}
                  onChange={(e) =>
                    setPendingChange(
                      'max_active_uploads',
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='max_active_torrents'>
                  Maximum active torrents
                </Label>
                <Input
                  id='max_active_torrents'
                  type='number'
                  min='0'
                  value={(getValue('max_active_torrents') as number) || 100}
                  onChange={(e) =>
                    setPendingChange(
                      'max_active_torrents',
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='max_active_checking_torrents'>
                  Max active checking torrents
                </Label>
                <Input
                  id='max_active_checking_torrents'
                  type='number'
                  min='0'
                  value={
                    (getValue('max_active_checking_torrents') as number) || 1
                  }
                  onChange={(e) =>
                    setPendingChange(
                      'max_active_checking_torrents',
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='dont_count_slow_torrents'
                  checked={
                    (getValue('dont_count_slow_torrents') as boolean) || false
                  }
                  onCheckedChange={(checked) =>
                    setPendingChange('dont_count_slow_torrents', checked)
                  }
                />
                <Label htmlFor='dont_count_slow_torrents'>
                  Do not count slow torrents in these limits
                </Label>
              </div>

              {(getValue('dont_count_slow_torrents') as boolean) && (
                <div className='ml-6 space-y-4'>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div className='space-y-2'>
                      <Label htmlFor='slow_torrent_dl_rate_threshold'>
                        Download rate threshold
                      </Label>
                      <div className='flex items-center gap-2'>
                        <Input
                          id='slow_torrent_dl_rate_threshold'
                          type='number'
                          min='0'
                          value={
                            (getValue(
                              'slow_torrent_dl_rate_threshold',
                            ) as number) || 2
                          }
                          onChange={(e) =>
                            setPendingChange(
                              'slow_torrent_dl_rate_threshold',
                              parseInt(e.target.value),
                            )
                          }
                        />
                        <span className='text-muted-foreground'>KiB/s</span>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='slow_torrent_ul_rate_threshold'>
                        Upload rate threshold
                      </Label>
                      <div className='flex items-center gap-2'>
                        <Input
                          id='slow_torrent_ul_rate_threshold'
                          type='number'
                          min='0'
                          value={
                            (getValue(
                              'slow_torrent_ul_rate_threshold',
                            ) as number) || 2
                          }
                          onChange={(e) =>
                            setPendingChange(
                              'slow_torrent_ul_rate_threshold',
                              parseInt(e.target.value),
                            )
                          }
                        />
                        <span className='text-muted-foreground'>KiB/s</span>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='slow_torrent_inactive_timer'>
                        Torrent inactivity timer
                      </Label>
                      <div className='flex items-center gap-2'>
                        <Input
                          id='slow_torrent_inactive_timer'
                          type='number'
                          min='0'
                          value={
                            (getValue(
                              'slow_torrent_inactive_timer',
                            ) as number) || 60
                          }
                          onChange={(e) =>
                            setPendingChange(
                              'slow_torrent_inactive_timer',
                              parseInt(e.target.value),
                            )
                          }
                        />
                        <span className='text-muted-foreground'>seconds</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Share Limits */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Share className='h-5 w-5' />
              Seeding Limits
            </CardTitle>
            <CardDescription>
              Configure when torrents should stop seeding automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='max_ratio'>When ratio reaches</Label>
                  <Input
                    id='max_ratio'
                    type='number'
                    step='0.1'
                    min='0'
                    value={(getValue('max_ratio') as number) || 1.0}
                    onChange={(e) =>
                      setPendingChange('max_ratio', parseFloat(e.target.value))
                    }
                    className={
                      getFieldError('max_ratio') ? 'border-destructive' : ''
                    }
                  />
                  {getFieldError('max_ratio') && (
                    <p className='text-destructive text-sm'>
                      {getFieldError('max_ratio')}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='max_seeding_time'>
                    When total seeding time reaches
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='max_seeding_time'
                      type='number'
                      min='0'
                      value={(getValue('max_seeding_time') as number) || 1440}
                      onChange={(e) =>
                        setPendingChange(
                          'max_seeding_time',
                          parseInt(e.target.value),
                        )
                      }
                      className={
                        getFieldError('max_seeding_time')
                          ? 'border-destructive'
                          : ''
                      }
                    />
                    <span className='text-muted-foreground'>minutes</span>
                  </div>
                  {getFieldError('max_seeding_time') && (
                    <p className='text-destructive text-sm'>
                      {getFieldError('max_seeding_time')}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='max_inactive_seeding_time'>
                    When inactive seeding time reaches
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='max_inactive_seeding_time'
                      type='number'
                      min='0'
                      value={
                        (getValue('max_inactive_seeding_time') as number) || 30
                      }
                      onChange={(e) =>
                        setPendingChange(
                          'max_inactive_seeding_time',
                          parseInt(e.target.value),
                        )
                      }
                      className={
                        getFieldError('max_inactive_seeding_time')
                          ? 'border-destructive'
                          : ''
                      }
                    />
                    <span className='text-muted-foreground'>minutes</span>
                  </div>
                  {getFieldError('max_inactive_seeding_time') && (
                    <p className='text-destructive text-sm'>
                      {getFieldError('max_inactive_seeding_time')}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='share_limit_action'>then</Label>
                  <Select
                    value={
                      (getValue('max_ratio_act') as number)?.toString() || '0'
                    }
                    onValueChange={(value) =>
                      setPendingChange('max_ratio_act', parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0'>Stop torrent</SelectItem>
                      <SelectItem value='1'>Remove torrent</SelectItem>
                      <SelectItem value='2'>
                        Remove torrent and files
                      </SelectItem>
                      <SelectItem value='3'>Enable super seeding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracker Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Tracker Settings</CardTitle>
            <CardDescription>
              Configure automatic tracker addition for new downloads.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='add_trackers_enabled'
                  checked={
                    (getValue('add_trackers_enabled') as boolean) || false
                  }
                  onCheckedChange={(checked) =>
                    setPendingChange('add_trackers_enabled', checked)
                  }
                />
                <Label htmlFor='add_trackers_enabled'>
                  Automatically append these trackers to new downloads:
                </Label>
              </div>

              {(getValue('add_trackers_enabled') as boolean) && (
                <div className='ml-6 space-y-2'>
                  <textarea
                    id='add_trackers'
                    value={(getValue('add_trackers') as string) || ''}
                    onChange={(e) =>
                      setPendingChange('add_trackers', e.target.value)
                    }
                    placeholder='Enter one tracker URL per line'
                    className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                    rows={4}
                  />
                  <p className='text-muted-foreground text-sm'>
                    Enter one tracker URL per line.
                  </p>
                </div>
              )}

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='add_trackers_from_url_enabled'
                  checked={
                    (getValue('add_trackers_from_url_enabled') as boolean) ||
                    false
                  }
                  onCheckedChange={(checked) =>
                    setPendingChange('add_trackers_from_url_enabled', checked)
                  }
                />
                <Label htmlFor='add_trackers_from_url_enabled'>
                  Automatically append trackers from URL to new downloads:
                </Label>
              </div>

              {(getValue('add_trackers_from_url_enabled') as boolean) && (
                <div className='ml-6 space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='add_trackers_url'>URL:</Label>
                    <Input
                      id='add_trackers_url'
                      value={(getValue('add_trackers_url') as string) || ''}
                      onChange={(e) =>
                        setPendingChange('add_trackers_url', e.target.value)
                      }
                      placeholder='https://example.com/trackers.txt'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label>Fetched trackers:</Label>
                    <div className='rounded-md border p-3'>
                      <p className='text-muted-foreground text-sm'>
                        {(getValue('add_trackers_url_list') as string) ||
                          'No trackers fetched yet'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentSection>
  );
}
