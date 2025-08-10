import { Calendar, Clock, Download, Gauge, Upload } from 'lucide-react';
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

export default function SettingsSpeed() {
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

  // Format speed limit for display (0 means unlimited)
  const formatSpeedLimit = (value: number) => {
    return value === 0 ? '' : value.toString();
  };

  // Parse speed limit from input (empty means unlimited/0)
  const parseSpeedLimit = (value: string) => {
    const parsed = parseInt(value);
    return isNaN(parsed) || value === '' ? 0 : parsed;
  };

  return (
    <ContentSection
      title='Speed'
      desc='Update your speed limits and scheduling configuration.'
    >
      <div className='space-y-6'>
        {/* Global Speed Limits */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Gauge className='h-5 w-5' />
              Global Speed Limits
            </CardTitle>
            <CardDescription>
              Set global download and upload speed limits. Leave empty for
              unlimited.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='dl_limit' className='flex items-center gap-2'>
                  <Download className='h-4 w-4' />
                  Download Limit (KiB/s)
                </Label>
                <Input
                  id='dl_limit'
                  type='number'
                  min='0'
                  value={formatSpeedLimit((getValue('dl_limit') as number) || 0)}
                  onChange={(e) =>
                    setPendingChange('dl_limit', parseSpeedLimit(e.target.value))
                  }
                  placeholder='Unlimited'
                  className={
                    getFieldError('dl_limit') ? 'border-destructive' : ''
                  }
                />
                {getFieldError('dl_limit') && (
                  <p className='text-destructive text-sm'>
                    {getFieldError('dl_limit')}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='up_limit' className='flex items-center gap-2'>
                  <Upload className='h-4 w-4' />
                  Upload Limit (KiB/s)
                </Label>
                <Input
                  id='up_limit'
                  type='number'
                  min='0'
                  value={formatSpeedLimit((getValue('up_limit') as number) || 0)}
                  onChange={(e) =>
                    setPendingChange('up_limit', parseSpeedLimit(e.target.value))
                  }
                  placeholder='Unlimited'
                  className={
                    getFieldError('up_limit') ? 'border-destructive' : ''
                  }
                />
                {getFieldError('up_limit') && (
                  <p className='text-destructive text-sm'>
                    {getFieldError('up_limit')}
                  </p>
                )}
              </div>
            </div>
            <p className='text-muted-foreground text-sm'>
              Global speed limits apply to all torrents. Set to 0 or leave empty
              for unlimited speed.
            </p>
          </CardContent>
        </Card>

        {/* Alternative Speed Limits */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Clock className='h-5 w-5' />
              Alternative Speed Limits
            </CardTitle>
            <CardDescription>
              Configure alternative speed limits for scheduled times or manual
              activation.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='alt_dl_limit' className='flex items-center gap-2'>
                  <Download className='h-4 w-4' />
                  Alternative Download Limit (KiB/s)
                </Label>
                <Input
                  id='alt_dl_limit'
                  type='number'
                  min='0'
                  value={formatSpeedLimit(
                    (getValue('alt_dl_limit') as number) || 0,
                  )}
                  onChange={(e) =>
                    setPendingChange(
                      'alt_dl_limit',
                      parseSpeedLimit(e.target.value),
                    )
                  }
                  placeholder='Unlimited'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='alt_up_limit' className='flex items-center gap-2'>
                  <Upload className='h-4 w-4' />
                  Alternative Upload Limit (KiB/s)
                </Label>
                <Input
                  id='alt_up_limit'
                  type='number'
                  min='0'
                  value={formatSpeedLimit(
                    (getValue('alt_up_limit') as number) || 0,
                  )}
                  onChange={(e) =>
                    setPendingChange(
                      'alt_up_limit',
                      parseSpeedLimit(e.target.value),
                    )
                  }
                  placeholder='Unlimited'
                />
              </div>
            </div>

            <Separator />

            {/* Scheduler */}
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='scheduler_enabled'
                  checked={(getValue('scheduler_enabled') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('scheduler_enabled', checked)
                  }
                />
                <Label htmlFor='scheduler_enabled'>
                  Enable alternative speed limits scheduler
                </Label>
              </div>

              {(getValue('scheduler_enabled') as boolean) && (
                <div className='ml-6 space-y-4'>
                  <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='schedule_from_hour'>From Hour</Label>
                      <Select
                        value={
                          (
                            getValue('schedule_from_hour') as number
                          )?.toString() || '0'
                        }
                        onValueChange={(value) =>
                          setPendingChange('schedule_from_hour', parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='schedule_from_min'>From Minute</Label>
                      <Select
                        value={
                          (getValue('schedule_from_min') as number)?.toString() ||
                          '0'
                        }
                        onValueChange={(value) =>
                          setPendingChange('schedule_from_min', parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 60 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='schedule_to_hour'>To Hour</Label>
                      <Select
                        value={
                          (getValue('schedule_to_hour') as number)?.toString() ||
                          '0'
                        }
                        onValueChange={(value) =>
                          setPendingChange('schedule_to_hour', parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='schedule_to_min'>To Minute</Label>
                      <Select
                        value={
                          (getValue('schedule_to_min') as number)?.toString() ||
                          '0'
                        }
                        onValueChange={(value) =>
                          setPendingChange('schedule_to_min', parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 60 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4' />
                      Schedule Days
                    </Label>
                    <Select
                      value={
                        (getValue('scheduler_days') as number)?.toString() || '0'
                      }
                      onValueChange={(value) =>
                        setPendingChange('scheduler_days', parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='0'>Every Day</SelectItem>
                        <SelectItem value='1'>Weekdays</SelectItem>
                        <SelectItem value='2'>Weekends</SelectItem>
                        <SelectItem value='3'>Monday</SelectItem>
                        <SelectItem value='4'>Tuesday</SelectItem>
                        <SelectItem value='5'>Wednesday</SelectItem>
                        <SelectItem value='6'>Thursday</SelectItem>
                        <SelectItem value='7'>Friday</SelectItem>
                        <SelectItem value='8'>Saturday</SelectItem>
                        <SelectItem value='9'>Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <p className='text-muted-foreground text-sm'>
                    Alternative speed limits will be automatically activated
                    during the scheduled time period.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Rate Limits Settings</CardTitle>
            <CardDescription>
              Configure how rate limits are applied to different types of connections.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='limit_utp_rate'
                  checked={(getValue('limit_utp_rate') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('limit_utp_rate', checked)
                  }
                />
                <Label htmlFor='limit_utp_rate'>
                  Apply rate limit to µTP protocol
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='limit_tcp_overhead'
                  checked={(getValue('limit_tcp_overhead') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('limit_tcp_overhead', checked)
                  }
                />
                <Label htmlFor='limit_tcp_overhead'>
                  Apply rate limit to transport overhead
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='limit_lan_peers'
                  checked={(getValue('limit_lan_peers') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('limit_lan_peers', checked)
                  }
                />
                <Label htmlFor='limit_lan_peers'>
                  Apply rate limit to peers on LAN
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentSection>
  );
}