import { Network, Router, Shield, Users } from 'lucide-react';
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

export default function SettingsConnection() {
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
      title='Connection'
      desc='Update your connection settings and network configuration.'
    >
      <div className='space-y-6'>
        {/* Listening Port */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Network className='h-5 w-5' />
              Listening Port
            </CardTitle>
            <CardDescription>
              Configure the port used for incoming connections.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='listen_port'>Port</Label>
                <Input
                  id='listen_port'
                  type='number'
                  min='1'
                  max='65535'
                  value={(getValue('listen_port') as number) || 8999}
                  onChange={(e) =>
                    setPendingChange('listen_port', parseInt(e.target.value))
                  }
                  className={
                    getFieldError('listen_port') ? 'border-destructive' : ''
                  }
                />
                {getFieldError('listen_port') && (
                  <p className='text-destructive text-sm'>
                    {getFieldError('listen_port')}
                  </p>
                )}
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='random_port'
                  checked={(getValue('random_port') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('random_port', checked)
                  }
                />
                <Label htmlFor='random_port'>
                  Use random port on each startup
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='upnp'
                  checked={(getValue('upnp') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('upnp', checked)
                  }
                />
                <Label htmlFor='upnp' className='flex items-center gap-2'>
                  <Router className='h-4 w-4' />
                  Use UPnP/NAT-PMP port forwarding from my router
                </Label>
              </div>
              <p className='text-muted-foreground ml-6 text-sm'>
                Automatically configure port forwarding on compatible routers.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Connection Limits */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Connection Limits
            </CardTitle>
            <CardDescription>
              Configure maximum number of connections and upload slots.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='max_connec'>Global maximum connections</Label>
                <Input
                  id='max_connec'
                  type='number'
                  min='0'
                  value={(getValue('max_connec') as number) || 200}
                  onChange={(e) =>
                    setPendingChange('max_connec', parseInt(e.target.value))
                  }
                  className={
                    getFieldError('max_connec') ? 'border-destructive' : ''
                  }
                />
                {getFieldError('max_connec') && (
                  <p className='text-destructive text-sm'>
                    {getFieldError('max_connec')}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='max_uploads'>Global maximum upload slots</Label>
                <Input
                  id='max_uploads'
                  type='number'
                  min='0'
                  value={(getValue('max_uploads') as number) || 4}
                  onChange={(e) =>
                    setPendingChange('max_uploads', parseInt(e.target.value))
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='max_connec_per_torrent'>
                  Maximum connections per torrent
                </Label>
                <Input
                  id='max_connec_per_torrent'
                  type='number'
                  min='0'
                  value={(getValue('max_connec_per_torrent') as number) || 100}
                  onChange={(e) =>
                    setPendingChange(
                      'max_connec_per_torrent',
                      parseInt(e.target.value),
                    )
                  }
                  className={
                    getFieldError('max_connec_per_torrent')
                      ? 'border-destructive'
                      : ''
                  }
                />
                {getFieldError('max_connec_per_torrent') && (
                  <p className='text-destructive text-sm'>
                    {getFieldError('max_connec_per_torrent')}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='max_uploads_per_torrent'>
                  Maximum upload slots per torrent
                </Label>
                <Input
                  id='max_uploads_per_torrent'
                  type='number'
                  min='0'
                  value={(getValue('max_uploads_per_torrent') as number) || 4}
                  onChange={(e) =>
                    setPendingChange(
                      'max_uploads_per_torrent',
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
            </div>
            <p className='text-muted-foreground text-sm'>
              Set to 0 for unlimited connections. Higher values may improve
              performance but use more resources.
            </p>
          </CardContent>
        </Card>

        {/* Proxy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              Proxy Settings
            </CardTitle>
            <CardDescription>
              Configure proxy server for connections.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='proxy_type'>Proxy Type</Label>
                <Select
                  value={(getValue('proxy_type') as number).toString() || '0'}
                  onValueChange={(value) =>
                    setPendingChange('proxy_type', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='None'>None</SelectItem>
                    <SelectItem value='HTTP'>HTTP</SelectItem>
                    <SelectItem value='SOCKS4'>SOCKS4</SelectItem>
                    <SelectItem value='SOCKS5'>SOCKS5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(getValue('proxy_type') as number) !== 0 && (
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label htmlFor='proxy_ip'>Proxy IP</Label>
                      <Input
                        id='proxy_ip'
                        value={(getValue('proxy_ip') as string) || ''}
                        onChange={(e) =>
                          setPendingChange('proxy_ip', e.target.value)
                        }
                        placeholder='127.0.0.1'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='proxy_port'>Proxy Port</Label>
                      <Input
                        id='proxy_port'
                        type='number'
                        min='1'
                        max='65535'
                        value={(getValue('proxy_port') as number) || 8080}
                        onChange={(e) =>
                          setPendingChange(
                            'proxy_port',
                            parseInt(e.target.value),
                          )
                        }
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='proxy_username'>
                        Username (optional)
                      </Label>
                      <Input
                        id='proxy_username'
                        autoComplete='off'
                        value={(getValue('proxy_username') as string) || ''}
                        onChange={(e) =>
                          setPendingChange('proxy_username', e.target.value)
                        }
                        placeholder='Username'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='proxy_password'>
                        Password (optional)
                      </Label>
                      <Input
                        id='proxy_password'
                        type='password'
                        autoComplete='off'
                        value={(getValue('proxy_password') as string) || ''}
                        onChange={(e) =>
                          setPendingChange('proxy_password', e.target.value)
                        }
                        placeholder='Password'
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-4'>
                    <Label>Use proxy for:</Label>

                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='proxy_peer_connections'
                        checked={
                          (getValue('proxy_peer_connections') as boolean) ||
                          false
                        }
                        onCheckedChange={(checked) =>
                          setPendingChange('proxy_peer_connections', checked)
                        }
                      />
                      <Label htmlFor='proxy_peer_connections'>
                        Peer connections
                      </Label>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='proxy_rss'
                        checked={(getValue('proxy_rss') as boolean) || false}
                        onCheckedChange={(checked) =>
                          setPendingChange('proxy_rss', checked)
                        }
                      />
                      <Label htmlFor='proxy_rss'>RSS feeds</Label>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='proxy_misc'
                        checked={(getValue('proxy_misc') as boolean) || false}
                        onCheckedChange={(checked) =>
                          setPendingChange('proxy_misc', checked)
                        }
                      />
                      <Label htmlFor='proxy_misc'>
                        General purposes (search engines, etc.)
                      </Label>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='proxy_hostname_lookup'
                        checked={
                          (getValue('proxy_hostname_lookup') as boolean) ||
                          false
                        }
                        onCheckedChange={(checked) =>
                          setPendingChange('proxy_hostname_lookup', checked)
                        }
                      />
                      <Label htmlFor='proxy_hostname_lookup'>
                        Hostname lookup
                      </Label>
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
