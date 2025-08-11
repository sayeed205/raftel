import { Bell, Globe, Lock, Monitor, Palette, RefreshCw, Table } from 'lucide-react';

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
import { Slider } from '@/components/ui/slider';
import { useSettings, useSettingsActions } from '@/stores/settings-store';

export function WebUISettings() {
  const { preferences, webUISettings, pendingChanges, validationErrors } = useSettings();
  const { setPendingChange, updateWebUISettings } = useSettingsActions();

  if (!preferences) {
    return (
      <div className='space-y-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='text-muted-foreground text-center'>Loading Web UI settings...</div>
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
      {/* Web UI Server Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Globe className='h-5 w-5' />
            Web UI Server
          </CardTitle>
          <CardDescription>Configure Web UI server settings and access control.</CardDescription>
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
              <p className='text-muted-foreground text-sm'>
                IP address to bind the Web UI to. Use * for all interfaces.
              </p>
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

          <div className='space-y-2'>
            <Label htmlFor='web_ui_domain_list'>Allowed domains (optional)</Label>
            <Input
              id='web_ui_domain_list'
              value={(getValue('web_ui_domain_list') as string) || ''}
              onChange={(e) => setPendingChange('web_ui_domain_list', e.target.value)}
              placeholder='example.com, *.example.com'
            />
            <p className='text-muted-foreground text-sm'>
              Comma-separated list of allowed domains. Leave empty to allow all.
            </p>
          </div>

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='web_ui_upnp'
              checked={(getValue('web_ui_upnp') as boolean) || false}
              onCheckedChange={(checked) => setPendingChange('web_ui_upnp', checked)}
            />
            <Label htmlFor='web_ui_upnp'>Use UPnP for Web UI port</Label>
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Lock className='h-5 w-5' />
            Authentication & Security
          </CardTitle>
          <CardDescription>Configure authentication and security settings.</CardDescription>
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
              <p className='text-muted-foreground text-sm'>Leave empty to keep current password.</p>
            </div>
          </div>

          <Separator />

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='web_ui_session_timeout'>Session timeout (seconds)</Label>
              <Input
                id='web_ui_session_timeout'
                type='number'
                min='60'
                value={(getValue('web_ui_session_timeout') as number) || 3600}
                onChange={(e) =>
                  setPendingChange('web_ui_session_timeout', parseInt(e.target.value))
                }
              />
              <p className='text-muted-foreground text-sm'>
                How long sessions remain active without activity.
              </p>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='web_ui_max_auth_fail_count'>Max authentication failures</Label>
                <Input
                  id='web_ui_max_auth_fail_count'
                  type='number'
                  min='1'
                  value={(getValue('web_ui_max_auth_fail_count') as number) || 5}
                  onChange={(e) =>
                    setPendingChange('web_ui_max_auth_fail_count', parseInt(e.target.value))
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='web_ui_ban_duration'>Ban duration (seconds)</Label>
                <Input
                  id='web_ui_ban_duration'
                  type='number'
                  min='1'
                  value={(getValue('web_ui_ban_duration') as number) || 3600}
                  onChange={(e) =>
                    setPendingChange('web_ui_ban_duration', parseInt(e.target.value))
                  }
                />
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='web_ui_csrf_protection_enabled'
                  checked={(getValue('web_ui_csrf_protection_enabled') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('web_ui_csrf_protection_enabled', checked)
                  }
                />
                <Label htmlFor='web_ui_csrf_protection_enabled'>Enable CSRF protection</Label>
              </div>

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
                  id='web_ui_secure_cookie_enabled'
                  checked={(getValue('web_ui_secure_cookie_enabled') as boolean) || false}
                  onCheckedChange={(checked) =>
                    setPendingChange('web_ui_secure_cookie_enabled', checked)
                  }
                />
                <Label htmlFor='web_ui_secure_cookie_enabled'>
                  Enable secure cookie (HTTPS only)
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HTTPS Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Lock className='h-5 w-5' />
            HTTPS Settings
          </CardTitle>
          <CardDescription>Configure HTTPS encryption for the Web UI.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='web_ui_https_enabled'
              checked={(getValue('web_ui_https_enabled') as boolean) || false}
              onCheckedChange={(checked) => setPendingChange('web_ui_https_enabled', checked)}
            />
            <Label htmlFor='web_ui_https_enabled'>Use HTTPS instead of HTTP</Label>
          </div>

          {(getValue('web_ui_https_enabled') as boolean) && (
            <div className='ml-6 space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='web_ui_https_cert_path'>Certificate path</Label>
                <Input
                  id='web_ui_https_cert_path'
                  value={(getValue('web_ui_https_cert_path') as string) || ''}
                  onChange={(e) => setPendingChange('web_ui_https_cert_path', e.target.value)}
                  placeholder='/path/to/certificate.crt'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='web_ui_https_key_path'>Private key path</Label>
                <Input
                  id='web_ui_https_key_path'
                  value={(getValue('web_ui_https_key_path') as string) || ''}
                  onChange={(e) => setPendingChange('web_ui_https_key_path', e.target.value)}
                  placeholder='/path/to/private.key'
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alternative Web UI */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Monitor className='h-5 w-5' />
            Alternative Web UI
          </CardTitle>
          <CardDescription>Use a custom Web UI instead of the default one.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='alternative_webui_enabled'
              checked={(getValue('alternative_webui_enabled') as boolean) || false}
              onCheckedChange={(checked) => setPendingChange('alternative_webui_enabled', checked)}
            />
            <Label htmlFor='alternative_webui_enabled'>Use alternative Web UI</Label>
          </div>

          {(getValue('alternative_webui_enabled') as boolean) && (
            <div className='ml-6 space-y-2'>
              <Label htmlFor='alternative_webui_path'>Web UI path</Label>
              <Input
                id='alternative_webui_path'
                value={(getValue('alternative_webui_path') as string) || ''}
                onChange={(e) => setPendingChange('alternative_webui_path', e.target.value)}
                placeholder='/path/to/webui'
              />
              <p className='text-muted-foreground text-sm'>Path to the alternative Web UI files.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interface Customization */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Palette className='h-5 w-5' />
            Interface Customization
          </CardTitle>
          <CardDescription>Customize the appearance and behavior of the Web UI.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='theme'>Theme</Label>
              <Select
                value={webUISettings.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') =>
                  updateWebUISettings({ theme: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='light'>Light</SelectItem>
                  <SelectItem value='dark'>Dark</SelectItem>
                  <SelectItem value='system'>System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='language'>Language</Label>
              <Select
                value={webUISettings.language}
                onValueChange={(value) => updateWebUISettings({ language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='en'>English</SelectItem>
                  <SelectItem value='es'>Español</SelectItem>
                  <SelectItem value='fr'>Français</SelectItem>
                  <SelectItem value='de'>Deutsch</SelectItem>
                  <SelectItem value='it'>Italiano</SelectItem>
                  <SelectItem value='pt'>Português</SelectItem>
                  <SelectItem value='ru'>Русский</SelectItem>
                  <SelectItem value='zh'>中文</SelectItem>
                  <SelectItem value='ja'>日本語</SelectItem>
                  <SelectItem value='ko'>한국어</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='compactMode'
                checked={webUISettings.compactMode}
                onCheckedChange={(checked) =>
                  updateWebUISettings({ compactMode: checked as boolean })
                }
              />
              <Label htmlFor='compactMode'>Compact mode</Label>
            </div>
            <p className='text-muted-foreground ml-6 text-sm'>
              Use a more compact layout to fit more information on screen.
            </p>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='showAdvancedSettings'
                checked={webUISettings.showAdvancedSettings}
                onCheckedChange={(checked) =>
                  updateWebUISettings({
                    showAdvancedSettings: checked as boolean,
                  })
                }
              />
              <Label htmlFor='showAdvancedSettings'>Show advanced settings</Label>
            </div>
            <p className='text-muted-foreground ml-6 text-sm'>
              Display advanced configuration options in settings.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Refresh */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <RefreshCw className='h-5 w-5' />
            Data Refresh
          </CardTitle>
          <CardDescription>
            Configure how often the interface updates with new data.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='autoRefreshInterval'>
                Auto-refresh interval: {webUISettings.autoRefreshInterval / 1000}s
              </Label>
              <Slider
                id='autoRefreshInterval'
                min={1000}
                max={10000}
                step={500}
                value={[webUISettings.autoRefreshInterval]}
                onValueChange={([value]) => updateWebUISettings({ autoRefreshInterval: value })}
                className='w-full'
              />
              <div className='text-muted-foreground flex justify-between text-sm'>
                <span>1s</span>
                <span>10s</span>
              </div>
              <p className='text-muted-foreground text-sm'>
                How often to refresh torrent data and statistics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Table className='h-5 w-5' />
            Table Settings
          </CardTitle>
          <CardDescription>Configure torrent table display and sorting options.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='torrentTableSortBy'>Default sort column</Label>
              <Select
                value={webUISettings.torrentTableSortBy}
                onValueChange={(value) => updateWebUISettings({ torrentTableSortBy: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='name'>Name</SelectItem>
                  <SelectItem value='size'>Size</SelectItem>
                  <SelectItem value='progress'>Progress</SelectItem>
                  <SelectItem value='status'>Status</SelectItem>
                  <SelectItem value='speed'>Speed</SelectItem>
                  <SelectItem value='eta'>ETA</SelectItem>
                  <SelectItem value='ratio'>Ratio</SelectItem>
                  <SelectItem value='added_on'>Added</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='torrentTableSortOrder'>Sort order</Label>
              <Select
                value={webUISettings.torrentTableSortOrder}
                onValueChange={(value: 'asc' | 'desc') =>
                  updateWebUISettings({ torrentTableSortOrder: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='asc'>Ascending</SelectItem>
                  <SelectItem value='desc'>Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bell className='h-5 w-5' />
            Notifications
          </CardTitle>
          <CardDescription>Configure notification settings for torrent events.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='showNotifications'
                checked={webUISettings.showNotifications}
                onCheckedChange={(checked) =>
                  updateWebUISettings({ showNotifications: checked as boolean })
                }
              />
              <Label htmlFor='showNotifications'>Show notifications</Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='desktopNotifications'
                checked={webUISettings.desktopNotifications}
                onCheckedChange={(checked) =>
                  updateWebUISettings({
                    desktopNotifications: checked as boolean,
                  })
                }
              />
              <Label htmlFor='desktopNotifications'>Desktop notifications</Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='soundNotifications'
                checked={webUISettings.soundNotifications}
                onCheckedChange={(checked) =>
                  updateWebUISettings({
                    soundNotifications: checked as boolean,
                  })
                }
              />
              <Label htmlFor='soundNotifications'>Sound notifications</Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='confirmDeletion'
                checked={webUISettings.confirmDeletion}
                onCheckedChange={(checked) =>
                  updateWebUISettings({ confirmDeletion: checked as boolean })
                }
              />
              <Label htmlFor='confirmDeletion'>Confirm torrent deletion</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
