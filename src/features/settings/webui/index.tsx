import {
    GlobeIcon,
    LockIcon,
    MonitorIcon,
    ShieldIcon
} from 'lucide-react';

import type { QBittorrentPreferences } from '@/types/qbit/preferences';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import ContentSection from '../components/content-section';

export default function SettingsWebUI() {
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

  const getValue = (key: keyof QBittorrentPreferences) => {
    return pendingChanges[key] !== undefined ? pendingChanges[key] : preferences[key];
  };

  // Get validation error for a field
  const getFieldError = (field: string) => {
    return validationErrors.find((error) => error.field === field)?.message;
  };

  return (
    <ContentSection
      title='Web UI'
      desc='Configure Web UI settings and customization options.'
    >
      <div className='space-y-6'>
        {/* Web User Interface (Remote control) */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <GlobeIcon className='h-5 w-5' />
              Web User Interface (Remote control)
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='web_ui_address'>IP address</Label>
                <Input
                  id='web_ui_address'
                  value={(getValue('web_ui_address') as string) || '*'}
                  onChange={(e) => setPendingChange('web_ui_address', e.target.value)}
                  placeholder='* (all interfaces)'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='web_ui_port'>Port</Label>
                <Input
                  id='web_ui_port'
                  type='number'
                  min='1'
                  max='65535'
                  value={(getValue('web_ui_port') as number) || 8080}
                  onChange={(e) => setPendingChange('web_ui_port', parseInt(e.target.value))}
                  className={getFieldError('web_ui_port') ? 'border-destructive' : ''}
                />
                {getFieldError('web_ui_port') && (
                  <p className='text-destructive text-sm'>{getFieldError('web_ui_port')}</p>
                )}
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='web_ui_upnp'
                checked={(getValue('web_ui_upnp') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('web_ui_upnp', checked)}
              />
              <Label htmlFor='web_ui_upnp'>
                Use UPnP / NAT-PMP to forward the port from my router
              </Label>
            </div>

            <Separator />

            {/* HTTPS Settings */}
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='use_https'
                  checked={(getValue('use_https') as boolean) || false}
                  onCheckedChange={(checked) => setPendingChange('use_https', checked)}
                />
                <Label htmlFor='use_https'>Use HTTPS instead of HTTP</Label>
              </div>

              {(getValue('use_https') as boolean) && (
                <div className='ml-6 space-y-4'>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label htmlFor='web_ui_https_cert_path'>Certificate</Label>
                      <Input
                        id='web_ui_https_cert_path'
                        value={(getValue('web_ui_https_cert_path') as string) || ''}
                        onChange={(e) => setPendingChange('web_ui_https_cert_path', e.target.value)}
                        placeholder='/path/to/certificate.crt'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='web_ui_https_key_path'>Key</Label>
                      <Input
                        id='web_ui_https_key_path'
                        value={(getValue('web_ui_https_key_path') as string) || ''}
                        onChange={(e) => setPendingChange('web_ui_https_key_path', e.target.value)}
                        placeholder='/path/to/private.key'
                      />
                    </div>
                  </div>
                  <p className='text-muted-foreground text-sm'>
                    Information about certificates
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <LockIcon className='h-5 w-5' />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='web_ui_username'>Username</Label>
                <Input
                  id='web_ui_username'
                  value={(getValue('web_ui_username') as string) || 'admin'}
                  onChange={(e) => setPendingChange('web_ui_username', e.target.value)}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='web_ui_password'>Password</Label>
                <Input
                  id='web_ui_password'
                  type='password'
                  value={(getValue('web_ui_password') as string) || ''}
                  onChange={(e) => setPendingChange('web_ui_password', e.target.value)}
                  placeholder='Enter new password'
                />
              </div>
            </div>

            <p className='text-muted-foreground text-sm'>
              Change current password
            </p>

            <Separator />

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='bypass_local_auth'
                checked={(getValue('bypass_local_auth') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('bypass_local_auth', checked)}
              />
              <Label htmlFor='bypass_local_auth'>
                Bypass authentication for clients on localhost
              </Label>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='bypass_auth_subnet_whitelist_enabled'
                  checked={(getValue('bypass_auth_subnet_whitelist_enabled') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('bypass_auth_subnet_whitelist_enabled', checked)
                  }
                />
                <Label htmlFor='bypass_auth_subnet_whitelist_enabled'>
                  Bypass authentication for clients in whitelisted IP subnets
                </Label>
              </div>

              {(getValue('bypass_auth_subnet_whitelist_enabled') as boolean) && (
                <div className='ml-6 space-y-2'>
                  <Input
                    id='bypass_auth_subnet_whitelist'
                    value={(getValue('bypass_auth_subnet_whitelist') as string) || ''}
                    onChange={(e) => setPendingChange('bypass_auth_subnet_whitelist', e.target.value)}
                    placeholder='Example: 172.17.32.0/24, fdff:ffff:c8::/40'
                  />
                  <p className='text-muted-foreground text-sm'>
                    Example: 172.17.32.0/24, fdff:ffff:c8::/40
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div className='space-y-2'>
                <Label htmlFor='web_ui_max_auth_fail_count'>
                  Ban client after consecutive failures
                </Label>
                <Input
                  id='web_ui_max_auth_fail_count'
                  type='number'
                  min='1'
                  value={(getValue('web_ui_max_auth_fail_count') as number) || 5}
                  onChange={(e) =>
                    setPendingChange('web_ui_max_auth_fail_count', parseInt(e.target.value))
                  }
                  className={getFieldError('web_ui_max_auth_fail_count') ? 'border-destructive' : ''}
                />
                {getFieldError('web_ui_max_auth_fail_count') && (
                  <p className='text-destructive text-sm'>{getFieldError('web_ui_max_auth_fail_count')}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='web_ui_ban_duration'>ban for</Label>
                <div className='flex items-center gap-2'>
                  <Input
                    id='web_ui_ban_duration'
                    type='number'
                    min='1'
                    value={(getValue('web_ui_ban_duration') as number) || 3600}
                    onChange={(e) =>
                      setPendingChange('web_ui_ban_duration', parseInt(e.target.value))
                    }
                    className={getFieldError('web_ui_ban_duration') ? 'border-destructive' : ''}
                  />
                  <span className='text-muted-foreground text-sm'>seconds</span>
                </div>
                {getFieldError('web_ui_ban_duration') && (
                  <p className='text-destructive text-sm'>{getFieldError('web_ui_ban_duration')}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='web_ui_session_timeout'>Session timeout</Label>
                <div className='flex items-center gap-2'>
                  <Input
                    id='web_ui_session_timeout'
                    type='number'
                    min='1'
                    value={(getValue('web_ui_session_timeout') as number) || 3600}
                    onChange={(e) =>
                      setPendingChange('web_ui_session_timeout', parseInt(e.target.value))
                    }
                    className={getFieldError('web_ui_session_timeout') ? 'border-destructive' : ''}
                  />
                  <span className='text-muted-foreground text-sm'>seconds</span>
                </div>
                {getFieldError('web_ui_session_timeout') && (
                  <p className='text-destructive text-sm'>{getFieldError('web_ui_session_timeout')}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use alternative WebUI */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MonitorIcon className='h-5 w-5' />
              Use alternative WebUI
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='alternative_webui_enabled'
                checked={(getValue('alternative_webui_enabled') as boolean) || false}
                onCheckedChange={(checked) => setPendingChange('alternative_webui_enabled', checked)}
              />
              <Label htmlFor='alternative_webui_enabled'>Use alternative WebUI</Label>
            </div>

            {(getValue('alternative_webui_enabled') as boolean) && (
              <div className='ml-6 space-y-2'>
                <div className='space-y-2'>
                  <Label htmlFor='alternative_webui_path'>Files location</Label>
                  <Input
                    id='alternative_webui_path'
                    value={(getValue('alternative_webui_path') as string) || ''}
                    onChange={(e) => setPendingChange('alternative_webui_path', e.target.value)}
                    placeholder='/path/to/webui'
                  />
                </div>
                <p className='text-muted-foreground text-sm'>
                  List of alternative WebUI
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ShieldIcon className='h-5 w-5' />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='web_ui_clickjacking_protection_enabled'
                  checked={(getValue('web_ui_clickjacking_protection_enabled') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('web_ui_clickjacking_protection_enabled', checked)
                  }
                />
                <Label htmlFor='web_ui_clickjacking_protection_enabled'>
                  Enable clickjacking protection
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='web_ui_csrf_protection_enabled'
                  checked={(getValue('web_ui_csrf_protection_enabled') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('web_ui_csrf_protection_enabled', checked)
                  }
                />
                <Label htmlFor='web_ui_csrf_protection_enabled'>
                  Enable Cross-Site Request Forgery (CSRF) protection
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='web_ui_secure_cookie_enabled'
                  checked={(getValue('web_ui_secure_cookie_enabled') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('web_ui_secure_cookie_enabled', checked)
                  }
                />
                <Label htmlFor='web_ui_secure_cookie_enabled'>
                  Enable cookie Secure flag (requires HTTPS or localhost connection)
                </Label>
              </div>
              
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='web_ui_host_header_validation_enabled'
                  checked={(getValue('web_ui_host_header_validation_enabled') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('web_ui_host_header_validation_enabled', checked)
                  }
                />
                <Label htmlFor='web_ui_host_header_validation_enabled'>
                  Enable Host header validation
                </Label>
              </div>

              {(getValue('web_ui_host_header_validation_enabled') as boolean) && (
                <div className='ml-6 space-y-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='web_ui_domain_list'>Server domains</Label>
                    <Input
                      id='web_ui_domain_list'
                      value={(getValue('web_ui_domain_list') as string) || '*'}
                      onChange={(e) => setPendingChange('web_ui_domain_list', e.target.value)}
                      placeholder='* (all domains)'
                    />
                  </div>
                  <p className='text-muted-foreground text-sm'>
                    Example: 172.17.32.0/24, fdff:ffff:c8::/40
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Custom HTTP Headers */}
            <div className='space-y-2'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='web_ui_use_custom_http_headers_enabled'
                  checked={(getValue('web_ui_use_custom_http_headers_enabled') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('web_ui_use_custom_http_headers_enabled', checked)
                  }
                />
                <Label htmlFor='web_ui_use_custom_http_headers_enabled'>
                  Add custom HTTP headers
                </Label>
              </div>

              {(getValue('web_ui_use_custom_http_headers_enabled') as boolean) && (
                <div className='ml-6 space-y-2'>
                  <Label htmlFor='web_ui_custom_http_headers'>Header: value pairs, one per line</Label>
                  <textarea
                    id='web_ui_custom_http_headers'
                    value={(getValue('web_ui_custom_http_headers') as string) || ''}
                    onChange={(e) => setPendingChange('web_ui_custom_http_headers', e.target.value)}
                    className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                    placeholder='Header-Name: Header-Value'
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Reverse Proxy */}
            <div className='space-y-2'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='web_ui_reverse_proxy_enabled'
                  checked={(getValue('web_ui_reverse_proxy_enabled') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('web_ui_reverse_proxy_enabled', checked)
                  }
                />
                <Label htmlFor='web_ui_reverse_proxy_enabled'>
                  Enable reverse proxy support
                </Label>
              </div>

              {(getValue('web_ui_reverse_proxy_enabled') as boolean) && (
                <div className='ml-6 space-y-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='web_ui_reverse_proxies_list'>Trusted proxies list</Label>
                    <Input
                      id='web_ui_reverse_proxies_list'
                      value={(getValue('web_ui_reverse_proxies_list') as string) || ''}
                      onChange={(e) => setPendingChange('web_ui_reverse_proxies_list', e.target.value)}
                      placeholder='127.0.0.1, 192.168.0.0/16'
                    />
                  </div>
                  <p className='text-muted-foreground text-sm'>
                    <a 
                      href='https://github.com/qbittorrent/qBittorrent/wiki#reverse-proxy-setup-for-webui-access' 
                      target='_blank' 
                      rel='noopener noreferrer'
                      className='text-blue-500 hover:underline'
                    >
                      Reverse proxy setup examples
                    </a>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Update my dynamic domain name */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <GlobeIcon className='h-5 w-5' />
              Update my dynamic domain name
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='dyndns_enabled'>DynDNS</Label>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='dyndns_enabled'
                  checked={(getValue('dyndns_enabled') as boolean) || false}
                  onCheckedChange={(checked) => setPendingChange('dyndns_enabled', checked)}
                />
                <Label htmlFor='dyndns_enabled'>Use this server for dynamic DNS</Label>
              </div>
            </div>

            {(getValue('dyndns_enabled') as boolean) && (
              <div className='ml-6 space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='dyndns_service'>Service</Label>
                    <Select
                      value={(getValue('dyndns_service') as string) || '0'}
                      onValueChange={(value) => setPendingChange('dyndns_service', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='0'>DynDNS</SelectItem>
                        <SelectItem value='1'>NO-IP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='dyndns_domain'>Domain name</Label>
                    <Input
                      id='dyndns_domain'
                      value={(getValue('dyndns_domain') as string) || ''}
                      onChange={(e) => setPendingChange('dyndns_domain', e.target.value)}
                      placeholder='changeme.dyndns.org'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='dyndns_username'>Username</Label>
                    <Input
                      id='dyndns_username'
                      value={(getValue('dyndns_username') as string) || ''}
                      onChange={(e) => setPendingChange('dyndns_username', e.target.value)}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='dyndns_password'>Password</Label>
                    <Input
                      id='dyndns_password'
                      type='password'
                      value={(getValue('dyndns_password') as string) || ''}
                      onChange={(e) => setPendingChange('dyndns_password', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </ContentSection>
  );
}