import { Activity, Globe, Lock, Settings, Share } from 'lucide-react';

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

export function BitTorrentSettings() {
  const { preferences, pendingChanges, validationErrors } = useSettings();
  const { setPendingChange } = useSettingsActions();

  if (!preferences) {
    return (
      <div className='space-y-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='text-muted-foreground text-center'>
              Loading BitTorrent settings...
            </div>
          </CardContent>
        </Card>
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
    <div className='space-y-6'>
      {/* Protocol Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Globe className='h-5 w-5' />
            Protocol Settings
          </CardTitle>
          <CardDescription>
            Configure BitTorrent protocol and peer discovery options.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='dht'
                checked={(getValue('dht') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('dht', checked)}
              />
              <Label htmlFor='dht'>Enable DHT (decentralized network)</Label>
            </div>
            <p className='text-muted-foreground ml-6 text-sm'>
              Distributed Hash Table helps find more peers without relying on
              trackers.
            </p>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='pex'
                checked={(getValue('pex') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('pex', checked)}
              />
              <Label htmlFor='pex'>Enable Peer Exchange (PeX)</Label>
            </div>
            <p className='text-muted-foreground ml-6 text-sm'>
              Allow peers to exchange information about other peers.
            </p>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='lsd'
                checked={(getValue('lsd') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('lsd', checked)}
              />
              <Label htmlFor='lsd'>Enable Local Peer Discovery</Label>
            </div>
            <p className='text-muted-foreground ml-6 text-sm'>
              Find peers on the local network for faster transfers.
            </p>

            <Separator />

            <div className='space-y-2'>
              <Label htmlFor='bittorrent_protocol'>BitTorrent Protocol</Label>
              <Select
                value={
                  (getValue('bittorrent_protocol') as number)?.toString() || '0'
                }
                onValueChange={(value) =>
                  setPendingChange('bittorrent_protocol', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>TCP and μTP</SelectItem>
                  <SelectItem value='1'>TCP</SelectItem>
                  <SelectItem value='2'>μTP</SelectItem>
                </SelectContent>
              </Select>
              <p className='text-muted-foreground text-sm'>
                Choose which transport protocol to use for peer connections.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Encryption */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Lock className='h-5 w-5' />
            Encryption
          </CardTitle>
          <CardDescription>
            Configure connection encryption to avoid traffic shaping.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='encryption'>Encryption Mode</Label>
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
                <SelectItem value='0'>Prefer encryption</SelectItem>
                <SelectItem value='1'>Require encryption</SelectItem>
                <SelectItem value='2'>Disable encryption</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-muted-foreground text-sm'>
              Encryption can help avoid ISP traffic shaping but may reduce the
              number of available peers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Torrents */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='h-5 w-5' />
            Active Torrents
          </CardTitle>
          <CardDescription>
            Configure limits for active downloads and uploads.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <Label htmlFor='max_active_downloads'>
                Maximum active downloads
              </Label>
              <Input
                id='max_active_downloads'
                type='number'
                min='0'
                value={(getValue('max_active_downloads') as number) || 3}
                onChange={(e) =>
                  setPendingChange(
                    'max_active_downloads',
                    parseInt(e.target.value),
                  )
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='max_active_uploads'>Maximum active uploads</Label>
              <Input
                id='max_active_uploads'
                type='number'
                min='0'
                value={(getValue('max_active_uploads') as number) || 3}
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
                value={(getValue('max_active_torrents') as number) || 5}
                onChange={(e) =>
                  setPendingChange(
                    'max_active_torrents',
                    parseInt(e.target.value),
                  )
                }
              />
            </div>
          </div>
          <p className='text-muted-foreground text-sm'>
            Set to 0 for unlimited. These limits help manage bandwidth and
            system resources.
          </p>

          <Separator />

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
                Don't count slow torrents in these limits
              </Label>
            </div>

            {(getValue('dont_count_slow_torrents') as boolean) && (
              <div className='ml-6 space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='slow_torrent_dl_rate_threshold'>
                      Download rate threshold (KiB/s)
                    </Label>
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
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='slow_torrent_ul_rate_threshold'>
                      Upload rate threshold (KiB/s)
                    </Label>
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
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='slow_torrent_inactive_timer'>
                    Inactive seeding time limit (minutes)
                  </Label>
                  <Input
                    id='slow_torrent_inactive_timer'
                    type='number'
                    min='0'
                    value={
                      (getValue('slow_torrent_inactive_timer') as number) || 60
                    }
                    onChange={(e) =>
                      setPendingChange(
                        'slow_torrent_inactive_timer',
                        parseInt(e.target.value),
                      )
                    }
                  />
                  <p className='text-muted-foreground text-sm'>
                    Torrents below the rate thresholds for this time won't count
                    toward active limits.
                  </p>
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
            Share Limits
          </CardTitle>
          <CardDescription>
            Configure when torrents should stop seeding automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='max_ratio_enabled'
                checked={(getValue('max_ratio_enabled') as boolean) || false}
                onCheckedChange={(checked) =>
                  setPendingChange('max_ratio_enabled', checked)
                }
              />
              <Label htmlFor='max_ratio_enabled'>
                Enable share ratio limit
              </Label>
            </div>

            {(getValue('max_ratio_enabled') as boolean) && (
              <div className='ml-6 space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='max_ratio'>Maximum ratio</Label>
                    <Input
                      id='max_ratio'
                      type='number'
                      step='0.1'
                      min='0'
                      value={(getValue('max_ratio') as number) || 1.0}
                      onChange={(e) =>
                        setPendingChange(
                          'max_ratio',
                          parseFloat(e.target.value),
                        )
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
                    <Label htmlFor='max_ratio_act'>
                      Action when ratio reached
                    </Label>
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
                        <SelectItem value='0'>Pause torrent</SelectItem>
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
            )}

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='max_seeding_time_enabled'
                checked={
                  (getValue('max_seeding_time_enabled') as boolean) || false
                }
                onCheckedChange={(checked) =>
                  setPendingChange('max_seeding_time_enabled', checked)
                }
              />
              <Label htmlFor='max_seeding_time_enabled'>
                Enable seeding time limit
              </Label>
            </div>

            {(getValue('max_seeding_time_enabled') as boolean) && (
              <div className='ml-6 space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='max_seeding_time'>
                      Maximum seeding time (minutes)
                    </Label>
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
                    {getFieldError('max_seeding_time') && (
                      <p className='text-destructive text-sm'>
                        {getFieldError('max_seeding_time')}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='max_seeding_time_act'>
                      Action when time reached
                    </Label>
                    <Select
                      value={
                        (
                          getValue('max_seeding_time_act') as number
                        )?.toString() || '0'
                      }
                      onValueChange={(value) =>
                        setPendingChange(
                          'max_seeding_time_act',
                          parseInt(value),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='0'>Pause torrent</SelectItem>
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Protocol Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5' />
            Advanced Protocol Settings
          </CardTitle>
          <CardDescription>
            Advanced BitTorrent protocol configuration for expert users.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='upload_choking_algorithm'>
                Upload choking algorithm
              </Label>
              <Select
                value={
                  (
                    getValue('upload_choking_algorithm') as number
                  )?.toString() || '1'
                }
                onValueChange={(value) =>
                  setPendingChange('upload_choking_algorithm', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Round-robin</SelectItem>
                  <SelectItem value='1'>Fastest upload</SelectItem>
                  <SelectItem value='2'>Anti-leech</SelectItem>
                </SelectContent>
              </Select>
              <p className='text-muted-foreground text-sm'>
                Algorithm used to decide which peers to upload to.
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='upload_slots_behavior'>
                Upload slots behavior
              </Label>
              <Select
                value={
                  (getValue('upload_slots_behavior') as number)?.toString() ||
                  '0'
                }
                onValueChange={(value) =>
                  setPendingChange('upload_slots_behavior', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Fixed slots</SelectItem>
                  <SelectItem value='1'>Upload rate based</SelectItem>
                </SelectContent>
              </Select>
              <p className='text-muted-foreground text-sm'>
                How upload slots are allocated to peers.
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='utp_tcp_mixed_mode'>
                μTP-TCP mixed mode algorithm
              </Label>
              <Select
                value={
                  (getValue('utp_tcp_mixed_mode') as number)?.toString() || '0'
                }
                onValueChange={(value) =>
                  setPendingChange('utp_tcp_mixed_mode', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Prefer TCP</SelectItem>
                  <SelectItem value='1'>Peer proportional</SelectItem>
                </SelectContent>
              </Select>
              <p className='text-muted-foreground text-sm'>
                How to balance between TCP and μTP connections.
              </p>
            </div>

            <Separator />

            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='announce_to_all_trackers'
                  checked={
                    (getValue('announce_to_all_trackers') as boolean) || false
                  }
                  onCheckedChange={(checked) =>
                    setPendingChange('announce_to_all_trackers', checked)
                  }
                />
                <Label htmlFor='announce_to_all_trackers'>
                  Announce to all trackers in a tier
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='announce_to_all_tiers'
                  checked={
                    (getValue('announce_to_all_tiers') as boolean) || false
                  }
                  onCheckedChange={(checked) =>
                    setPendingChange('announce_to_all_tiers', checked)
                  }
                />
                <Label htmlFor='announce_to_all_tiers'>
                  Announce to all tiers
                </Label>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='announce_ip'>Announce IP (optional)</Label>
                <Input
                  id='announce_ip'
                  value={(getValue('announce_ip') as string) || ''}
                  onChange={(e) =>
                    setPendingChange('announce_ip', e.target.value)
                  }
                  placeholder='Leave empty for auto-detection'
                />
                <p className='text-muted-foreground text-sm'>
                  IP address to announce to trackers. Leave empty for automatic
                  detection.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
