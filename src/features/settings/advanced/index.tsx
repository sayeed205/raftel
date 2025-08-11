import { ExternalLink } from 'lucide-react';

import type { NetworkInterface, QBittorrentPreferences } from '@/types/qbit/preferences';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
import qbit from '@/services/qbit';
import { useSettings, useSettingsActions } from '@/stores/settings-store';
import { useEffect, useState } from 'react';
import ContentSection from '../components/content-section';

interface IPAddressOption {
    name: string;
    value: string;
}


export default function SettingsAdvanced() {
    const { preferences, pendingChanges, validationErrors } = useSettings();
    const { setPendingChange } = useSettingsActions();

    const [networkInterfaceOptions, setNetworkInterfaceOptions] = useState<NetworkInterface[]>([
        { name: 'Any interface', value: 'any' }
    ]);

    const [ipAddressOptions, setIpAddressOptions] = useState<IPAddressOption[]>([
        { name: 'All addresses', value: 'all' },
        { name: 'All IPv4 addresses', value: '0.0.0.0' },
        { name: 'All IPv6 addresses', value: '::' },
        { name: '127.0.0.1', value: '127.0.0.1' },
        { name: '::1', value: '::1' }
    ]);

    // Helper functions that don't depend on preferences
    const getValue = (key: keyof QBittorrentPreferences) => {
        if (!preferences) return undefined;
        return pendingChanges[key] !== undefined ? pendingChanges[key] : preferences[key];
    };

    const getFieldError = (field: string) => {
        return validationErrors.find((error) => error.field === field)?.message;
    };

    // Fetch network interfaces
    const fetchNetworkInterfaces = async () => {
        try {
            const networkInterfaces = await qbit.getNetworkInterfaces();
            const newOptions: NetworkInterface[] = [
                { name: 'Any interface', value: 'any' }
            ];

            for (const networkInterface of networkInterfaces) {
                newOptions.push({ name: networkInterface.name, value: networkInterface.value });
            }

            setNetworkInterfaceOptions(newOptions);
        } catch (error) {
            console.error('Failed to fetch network interfaces:', error);
            // Keep the default options on error
        }
    };

    console.log(preferences)

    // Fetch IP addresses for the selected network interface
    const fetchIPAddresses = async (networkInterface: string) => {
        try {
            // Always fetch IP addresses, even when no specific interface is selected
            const ipAddresses = await qbit.getAddresses(networkInterface || '');

            const newOptions: IPAddressOption[] = [
                { name: 'All addresses', value: 'all' },
                { name: 'All IPv4 addresses', value: '0.0.0.0' },
                { name: 'All IPv6 addresses', value: '::' }
            ];

            // Add the fetched IP addresses
            for (const ipAddress of ipAddresses) {
                newOptions.push({ name: ipAddress, value: ipAddress });
            }

            setIpAddressOptions(newOptions);
        } catch (error) {
            console.error('Failed to fetch IP addresses:', error);
            // Fallback to default options on error
            setIpAddressOptions([
                { name: 'All addresses', value: 'all' },
                { name: 'All IPv4 addresses', value: '0.0.0.0' },
                { name: 'All IPv6 addresses', value: '::' },
                { name: '127.0.0.1', value: '127.0.0.1' },
                { name: '::1', value: '::1' }
            ]);
        }
    };

    // Handle network interface change
    const handleNetworkInterfaceChange = (value: string) => {
        const actualValue = value === 'any' ? '' : value;
        setPendingChange('current_network_interface', actualValue);
        fetchIPAddresses(actualValue);
    };

    // Effect to fetch network interfaces on component mount
    useEffect(() => {
        fetchNetworkInterfaces();
    }, []);

    // Effect to fetch IP addresses when network interface changes
    console.log(getValue('current_network_interface'))
    useEffect(() => {
        if (preferences) {
            const currentInterface = getValue('current_network_interface') as string;
            fetchIPAddresses(currentInterface);
        }
    }, [preferences?.current_network_interface, pendingChanges.current_network_interface, preferences]);

    if (!preferences) {
        return (
            <div className='flex w-full items-center justify-center'>
                <div className='text-center'>
                    <div className='border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2'></div>
                </div>
            </div>
        );
    }

    return (
        <ContentSection
            title='Advanced'
            desc='Advanced qBittorrent configuration for experts.'
        >
            <div className='space-y-6'>
                <Alert>
                    <AlertDescription>
                        These are advanced settings for expert users. Changing these values incorrectly may cause
                        performance issues or instability.
                    </AlertDescription>
                </Alert>

                {/* qBittorrent Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center justify-between'>
                            qBittorrent Section
                            <Button variant='ghost' size='sm' asChild>
                                <a
                                    href='https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='flex items-center gap-1'
                                >
                                    Open documentation
                                    <ExternalLink className='h-3 w-3' />
                                </a>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        {/* Resume data storage type */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='resume_data_storage_type'>
                                    Resume data storage type (requires restart):
                                </Label>
                                <Select
                                    value={getValue('resume_data_storage_type')?.toString() || 'Legacy'}
                                    onValueChange={(value) =>
                                        setPendingChange('resume_data_storage_type', parseInt(value))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='Legacy'>Fastresume files</SelectItem>
                                        <SelectItem value='SQLite'>SQLite database (experimental)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='torrent_content_remove_option'>Torrent content removing mode:</Label>
                                <Select
                                    value={getValue('torrent_content_remove_option')?.toString() || '0'}
                                    onValueChange={(value) =>
                                        setPendingChange('torrent_content_remove_option', parseInt(value))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='Delete'>Delete files permanently</SelectItem>
                                        <SelectItem value='MoveToTrash'>Move files to trash (if possible)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Memory and network settings */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='memory_working_set_limit' className='flex items-center gap-1'>
                                    Physical memory (RAM) usage limit:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://wikipedia.org/wiki/Working_set'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id='memory_working_set_limit'
                                        type='number'
                                        min='0'
                                        value={(getValue('memory_working_set_limit') as number) || 0}
                                        onChange={(e) =>
                                            setPendingChange('memory_working_set_limit', parseInt(e.target.value))
                                        }
                                        className={getFieldError('memory_working_set_limit') ? 'border-destructive' : ''}
                                        title='This option is less effective on Linux'
                                    />
                                    <span className='text-sm text-muted-foreground'>MiB</span>
                                </div>
                                {getFieldError('memory_working_set_limit') && (
                                    <p className='text-destructive text-sm'>{getFieldError('memory_working_set_limit')}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='current_network_interface'>Network interface:</Label>
                                <Select
                                    value={getValue('current_network_interface') as string || 'any'}
                                    onValueChange={handleNetworkInterfaceChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Any interface' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {networkInterfaceOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* IP address binding */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='current_interface_address'>Optional IP address to bind to:</Label>
                                <Select
                                    value={getValue('current_interface_address') as string || 'all'}
                                    onValueChange={(value) => setPendingChange('current_interface_address', value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='All addresses' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ipAddressOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='save_resume_data_interval'>Save resume data interval:</Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id='save_resume_data_interval'
                                        type='number'
                                        min='1'
                                        value={(getValue('save_resume_data_interval') as number) || 60}
                                        onChange={(e) =>
                                            setPendingChange('save_resume_data_interval', parseInt(e.target.value))
                                        }
                                        className={getFieldError('save_resume_data_interval') ? 'border-destructive' : ''}
                                    />
                                    <span className='text-sm text-muted-foreground'>min</span>
                                </div>
                                {getFieldError('save_resume_data_interval') && (
                                    <p className='text-destructive text-sm'>{getFieldError('save_resume_data_interval')}</p>
                                )}
                            </div>
                        </div>

                        {/* File size and intervals */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='torrent_file_size_limit'>.torrent file size limit:</Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id='torrent_file_size_limit'
                                        type='number'
                                        min='1'
                                        value={(getValue('torrent_file_size_limit') as number) || 100}
                                        onChange={(e) =>
                                            setPendingChange('torrent_file_size_limit', parseInt(e.target.value))
                                        }
                                        className={getFieldError('torrent_file_size_limit') ? 'border-destructive' : ''}
                                    />
                                    <span className='text-sm text-muted-foreground'>MiB</span>
                                </div>
                                {getFieldError('torrent_file_size_limit') && (
                                    <p className='text-destructive text-sm'>{getFieldError('torrent_file_size_limit')}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='refresh_interval'>Refresh interval:</Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id='refresh_interval'
                                        type='number'
                                        min='100'
                                        value={(getValue('refresh_interval') as number) || 1500}
                                        onChange={(e) => setPendingChange('refresh_interval', parseInt(e.target.value))}
                                        className={getFieldError('refresh_interval') ? 'border-destructive' : ''}
                                        title='It controls the internal state update interval which in turn will affect UI updates'
                                    />
                                    <span className='text-sm text-muted-foreground'>ms</span>
                                </div>
                                {getFieldError('refresh_interval') && (
                                    <p className='text-destructive text-sm'>{getFieldError('refresh_interval')}</p>
                                )}
                            </div>
                        </div>

                        {/* Application instance name */}
                        <div className='space-y-2'>
                            <Label htmlFor='app_instance_name'>Customize application instance name:</Label>
                            <Input
                                id='app_instance_name'
                                value={(getValue('app_instance_name') as string) || ''}
                                onChange={(e) => setPendingChange('app_instance_name', e.target.value)}
                                title='It appends the text to the window title to help distinguish qBittorrent instances'
                                placeholder='Custom instance name'
                            />
                        </div>

                        {/* Checkboxes */}
                        <div className='space-y-4'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='recheck_completed_torrents'
                                    checked={(getValue('recheck_completed_torrents') as boolean) || false}
                                    onCheckedChange={(checked) => setPendingChange('recheck_completed_torrents', checked)}
                                />
                                <Label htmlFor='recheck_completed_torrents'>Recheck torrents on completion</Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='resolve_peer_countries'
                                    checked={(getValue('resolve_peer_countries') as boolean) || false}
                                    onCheckedChange={(checked) => setPendingChange('resolve_peer_countries', checked)}
                                />
                                <Label htmlFor='resolve_peer_countries'>Resolve peer countries</Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='reannounce_when_address_changed'
                                    checked={(getValue('reannounce_when_address_changed') as boolean) || false}
                                    onCheckedChange={(checked) =>
                                        setPendingChange('reannounce_when_address_changed', checked)
                                    }
                                />
                                <Label htmlFor='reannounce_when_address_changed'>
                                    Reannounce to all trackers when IP or port changed
                                </Label>
                            </div>
                        </div>

                        {/* Embedded tracker */}
                        <div className='space-y-4'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='enable_embedded_tracker'
                                    checked={(getValue('enable_embedded_tracker') as boolean) || false}
                                    onCheckedChange={(checked) => setPendingChange('enable_embedded_tracker', checked)}
                                />
                                <Label htmlFor='enable_embedded_tracker'>Enable embedded tracker</Label>
                            </div>

                            {getValue('enable_embedded_tracker') && (
                                <div className='ml-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='embedded_tracker_port'>Embedded tracker port:</Label>
                                        <Input
                                            id='embedded_tracker_port'
                                            type='number'
                                            min='1'
                                            max='65535'
                                            value={(getValue('embedded_tracker_port') as number) || 9000}
                                            onChange={(e) =>
                                                setPendingChange('embedded_tracker_port', parseInt(e.target.value))
                                            }
                                            className={getFieldError('embedded_tracker_port') ? 'border-destructive' : ''}
                                        />
                                        {getFieldError('embedded_tracker_port') && (
                                            <p className='text-destructive text-sm'>{getFieldError('embedded_tracker_port')}</p>
                                        )}
                                    </div>

                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='embedded_tracker_port_forwarding'
                                            checked={(getValue('embedded_tracker_port_forwarding') as boolean) || false}
                                            onCheckedChange={(checked) =>
                                                setPendingChange('embedded_tracker_port_forwarding', checked)
                                            }
                                        />
                                        <Label htmlFor='embedded_tracker_port_forwarding'>
                                            Enable port forwarding for embedded tracker
                                        </Label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Python executable path */}
                        <div className='space-y-2'>
                            <Label htmlFor='python_executable_path'>
                                Python executable path (may require restart):
                            </Label>
                            <Input
                                id='python_executable_path'
                                value={(getValue('python_executable_path') as string) || ''}
                                onChange={(e) => setPendingChange('python_executable_path', e.target.value)}
                                placeholder='(Auto detect if empty)'
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* libtorrent Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center justify-between'>
                            libtorrent Section
                            <Button variant='ghost' size='sm' asChild>
                                <a
                                    href='https://www.libtorrent.org/reference-Settings.html'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='flex items-center gap-1'
                                >
                                    Open documentation
                                    <ExternalLink className='h-3 w-3' />
                                </a>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        {/* Bdecode limits */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='bdecode_depth_limit' className='flex items-center gap-1'>
                                    Bdecode depth limit:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Bdecoding.html#bdecode()'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Input
                                    id='bdecode_depth_limit'
                                    type='number'
                                    min='1'
                                    value={(getValue('bdecode_depth_limit') as number) || 100}
                                    onChange={(e) => setPendingChange('bdecode_depth_limit', parseInt(e.target.value))}
                                    className={getFieldError('bdecode_depth_limit') ? 'border-destructive' : ''}
                                />
                                {getFieldError('bdecode_depth_limit') && (
                                    <p className='text-destructive text-sm'>{getFieldError('bdecode_depth_limit')}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='bdecode_token_limit' className='flex items-center gap-1'>
                                    Bdecode token limit:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Bdecoding.html#bdecode()'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Input
                                    id='bdecode_token_limit'
                                    type='number'
                                    min='1'
                                    value={(getValue('bdecode_token_limit') as number) || 3000000}
                                    onChange={(e) => setPendingChange('bdecode_token_limit', parseInt(e.target.value))}
                                    className={getFieldError('bdecode_token_limit') ? 'border-destructive' : ''}
                                />
                                {getFieldError('bdecode_token_limit') && (
                                    <p className='text-destructive text-sm'>{getFieldError('bdecode_token_limit')}</p>
                                )}
                            </div>
                        </div>

                        {/* Thread settings */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='async_io_threads' className='flex items-center gap-1'>
                                    Asynchronous I/O threads:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#aio_threads'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Input
                                    id='async_io_threads'
                                    type='number'
                                    min='1'
                                    value={(getValue('async_io_threads') as number) || 10}
                                    onChange={(e) => setPendingChange('async_io_threads', parseInt(e.target.value))}
                                    className={getFieldError('async_io_threads') ? 'border-destructive' : ''}
                                />
                                {getFieldError('async_io_threads') && (
                                    <p className='text-destructive text-sm'>{getFieldError('async_io_threads')}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='hashing_threads' className='flex items-center gap-1'>
                                    Hashing threads:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#hashing_threads'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Input
                                    id='hashing_threads'
                                    type='number'
                                    min='1'
                                    value={(getValue('hashing_threads') as number) || 2}
                                    onChange={(e) => setPendingChange('hashing_threads', parseInt(e.target.value))}
                                    className={getFieldError('hashing_threads') ? 'border-destructive' : ''}
                                />
                                {getFieldError('hashing_threads') && (
                                    <p className='text-destructive text-sm'>{getFieldError('hashing_threads')}</p>
                                )}
                            </div>
                        </div>

                        {/* File pool and memory settings */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='file_pool_size' className='flex items-center gap-1'>
                                    File pool size:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#file_pool_size'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Input
                                    id='file_pool_size'
                                    type='number'
                                    min='1'
                                    value={(getValue('file_pool_size') as number) || 40}
                                    onChange={(e) => setPendingChange('file_pool_size', parseInt(e.target.value))}
                                    className={getFieldError('file_pool_size') ? 'border-destructive' : ''}
                                />
                                {getFieldError('file_pool_size') && (
                                    <p className='text-destructive text-sm'>{getFieldError('file_pool_size')}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='checking_memory_use' className='flex items-center gap-1'>
                                    Outstanding memory when checking torrents:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#checking_mem_usage'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id='checking_memory_use'
                                        type='number'
                                        min='1'
                                        value={(getValue('checking_memory_use') as number) || 32}
                                        onChange={(e) => setPendingChange('checking_memory_use', parseInt(e.target.value))}
                                        className={getFieldError('checking_memory_use') ? 'border-destructive' : ''}
                                    />
                                    <span className='text-sm text-muted-foreground'>MiB</span>
                                </div>
                                {getFieldError('checking_memory_use') && (
                                    <p className='text-destructive text-sm'>{getFieldError('checking_memory_use')}</p>
                                )}
                            </div>
                        </div>

                        {/* Disk I/O settings */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='disk_queue_size' className='flex items-center gap-1'>
                                    Disk queue size:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#max_queued_disk_bytes'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id='disk_queue_size'
                                        type='number'
                                        min='1'
                                        value={(getValue('disk_queue_size') as number) || 1024}
                                        onChange={(e) => setPendingChange('disk_queue_size', parseInt(e.target.value))}
                                        className={getFieldError('disk_queue_size') ? 'border-destructive' : ''}
                                    />
                                    <span className='text-sm text-muted-foreground'>KiB</span>
                                </div>
                                {getFieldError('disk_queue_size') && (
                                    <p className='text-destructive text-sm'>{getFieldError('disk_queue_size')}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='disk_io_type' className='flex items-center gap-1'>
                                    Disk IO type (requires restart):
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/single-page-ref.html#default-disk-io-constructor'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Select
                                    value={getValue('disk_io_type')?.toString() || '0'}
                                    onValueChange={(value) => setPendingChange('disk_io_type', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='0'>Default</SelectItem>
                                        <SelectItem value='1'>Memory mapped files</SelectItem>
                                        <SelectItem value='2'>POSIX-compliant</SelectItem>
                                        <SelectItem value='3'>Simple pread/pwrite</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Disk I/O modes */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='disk_io_read_mode' className='flex items-center gap-1'>
                                    Disk IO read mode:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#disk_io_read_mode'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Select
                                    value={getValue('disk_io_read_mode')?.toString() || '0'}
                                    onValueChange={(value) => setPendingChange('disk_io_read_mode', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='0'>Disable OS cache</SelectItem>
                                        <SelectItem value='1'>Enable OS cache</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='disk_io_write_mode' className='flex items-center gap-1'>
                                    Disk IO write mode:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#disk_io_write_mode'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Select
                                    value={getValue('disk_io_write_mode')?.toString() || '0'}
                                    onValueChange={(value) => setPendingChange('disk_io_write_mode', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='0'>Disable OS cache</SelectItem>
                                        <SelectItem value='1'>Enable OS cache</SelectItem>
                                        <SelectItem value='2'>Write-through</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Advanced checkboxes */}
                        <div className='space-y-4'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='enable_piece_extent_affinity'
                                    checked={(getValue('enable_piece_extent_affinity') as boolean) || false}
                                    onCheckedChange={(checked) =>
                                        setPendingChange('enable_piece_extent_affinity', checked)
                                    }
                                />
                                <Label htmlFor='enable_piece_extent_affinity' className='flex items-center gap-1'>
                                    Use piece extent affinity:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://libtorrent.org/single-page-ref.html#piece_extent_affinity'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='enable_upload_suggestions'
                                    checked={(getValue('enable_upload_suggestions') as boolean) || false}
                                    onCheckedChange={(checked) => setPendingChange('enable_upload_suggestions', checked)}
                                />
                                <Label htmlFor='enable_upload_suggestions' className='flex items-center gap-1'>
                                    Send upload piece suggestions:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#suggest_mode'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                            </div>
                        </div>

                        {/* Buffer settings */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            <div className='space-y-2'>
                                <Label htmlFor='send_buffer_watermark' className='flex items-center gap-1'>
                                    Send buffer watermark:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#send_buffer_watermark'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id='send_buffer_watermark'
                                        type='number'
                                        min='1'
                                        value={(getValue('send_buffer_watermark') as number) || 500}
                                        onChange={(e) =>
                                            setPendingChange('send_buffer_watermark', parseInt(e.target.value))
                                        }
                                        className={getFieldError('send_buffer_watermark') ? 'border-destructive' : ''}
                                    />
                                    <span className='text-sm text-muted-foreground'>KiB</span>
                                </div>
                                {getFieldError('send_buffer_watermark') && (
                                    <p className='text-destructive text-sm'>{getFieldError('send_buffer_watermark')}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='send_buffer_low_watermark' className='flex items-center gap-1'>
                                    Send buffer low watermark:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#send_buffer_low_watermark'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id='send_buffer_low_watermark'
                                        type='number'
                                        min='1'
                                        value={(getValue('send_buffer_low_watermark') as number) || 10}
                                        onChange={(e) =>
                                            setPendingChange('send_buffer_low_watermark', parseInt(e.target.value))
                                        }
                                        className={getFieldError('send_buffer_low_watermark') ? 'border-destructive' : ''}
                                    />
                                    <span className='text-sm text-muted-foreground'>K
                                        iB</span>
                                </div>
                                {getFieldError('send_buffer_low_watermark') && (
                                    <p className='text-destructive text-sm'>{getFieldError('send_buffer_low_watermark')}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='send_buffer_watermark_factor' className='flex items-center gap-1'>
                                    Send buffer watermark factor:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#send_buffer_watermark_factor'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id='send_buffer_watermark_factor'
                                        type='number'
                                        min='1'
                                        max='100'
                                        value={(getValue('send_buffer_watermark_factor') as number) || 50}
                                        onChange={(e) =>
                                            setPendingChange('send_buffer_watermark_factor', parseInt(e.target.value))
                                        }
                                        className={getFieldError('send_buffer_watermark_factor') ? 'border-destructive' : ''}
                                    />
                                    <span className='text-sm text-muted-foreground'>%</span>
                                </div>
                                {getFieldError('send_buffer_watermark_factor') && (
                                    <p className='text-destructive text-sm'>{getFieldError('send_buffer_watermark_factor')}</p>
                                )}
                            </div>
                        </div>

                        {/* Connection settings */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='connection_speed' className='flex items-center gap-1'>
                                    Outgoing connections per second:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#connection_speed'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Input
                                    id='connection_speed'
                                    type='number'
                                    min='1'
                                    value={(getValue('connection_speed') as number) || 20}
                                    onChange={(e) => setPendingChange('connection_speed', parseInt(e.target.value))}
                                    className={getFieldError('connection_speed') ? 'border-destructive' : ''}
                                />
                                {getFieldError('connection_speed') && (
                                    <p className='text-destructive text-sm'>{getFieldError('connection_speed')}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='socket_backlog_size' className='flex items-center gap-1'>
                                    Socket backlog size:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#listen_queue_size'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Input
                                    id='socket_backlog_size'
                                    type='number'
                                    min='1'
                                    value={(getValue('socket_backlog_size') as number) || 30}
                                    onChange={(e) => setPendingChange('socket_backlog_size', parseInt(e.target.value))}
                                    className={getFieldError('socket_backlog_size') ? 'border-destructive' : ''}
                                />
                                {getFieldError('socket_backlog_size') && (
                                    <p className='text-destructive text-sm'>{getFieldError('socket_backlog_size')}</p>
                                )}
                            </div>
                        </div>

                        {/* Socket buffer sizes */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='socket_send_buffer_size' className='flex items-center gap-1'>
                                    Socket send buffer size [0: system default]:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#send_socket_buffer_size'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id='socket_send_buffer_size'
                                        type='number'
                                        min='0'
                                        value={(getValue('socket_send_buffer_size') as number) || 0}
                                        onChange={(e) =>
                                            setPendingChange('socket_send_buffer_size', parseInt(e.target.value))
                                        }
                                        className={getFieldError('socket_send_buffer_size') ? 'border-destructive' : ''}
                                    />
                                    <span className='text-sm text-muted-foreground'>KiB</span>
                                </div>
                                {getFieldError('socket_send_buffer_size') && (
                                    <p className='text-destructive text-sm'>{getFieldError('socket_send_buffer_size')}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='socket_receive_buffer_size' className='flex items-center gap-1'>
                                    Socket receive buffer size [0: system default]:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#recv_socket_buffer_size'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id='socket_receive_buffer_size'
                                        type='number'
                                        min='0'
                                        value={(getValue('socket_receive_buffer_size') as number) || 0}
                                        onChange={(e) =>
                                            setPendingChange('socket_receive_buffer_size', parseInt(e.target.value))
                                        }
                                        className={getFieldError('socket_receive_buffer_size') ? 'border-destructive' : ''}
                                    />
                                    <span className='text-sm text-muted-foreground'>KiB</span>
                                </div>
                                {getFieldError('socket_receive_buffer_size') && (
                                    <p className='text-destructive text-sm'>{getFieldError('socket_receive_buffer_size')}</p>
                                )}
                            </div>
                        </div>

                        {/* Port settings */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='outgoing_ports_min' className='flex items-center gap-1'>
                                    Outgoing ports (Min) [0: disabled]:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#outgoing_port'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Input
                                    id='outgoing_ports_min'
                                    type='number'
                                    min='0'
                                    max='65535'
                                    value={(getValue('outgoing_ports_min') as number) || 0}
                                    onChange={(e) => setPendingChange('outgoing_ports_min', parseInt(e.target.value))}
                                    className={getFieldError('outgoing_ports_min') ? 'border-destructive' : ''}
                                />
                                {getFieldError('outgoing_ports_min') && (
                                    <p className='text-destructive text-sm'>{getFieldError('outgoing_ports_min')}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='outgoing_ports_max' className='flex items-center gap-1'>
                                    Outgoing ports (Max) [0: disabled]:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#outgoing_port'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Input
                                    id='outgoing_ports_max'
                                    type='number'
                                    min='0'
                                    max='65535'
                                    value={(getValue('outgoing_ports_max') as number) || 0}
                                    onChange={(e) => setPendingChange('outgoing_ports_max', parseInt(e.target.value))}
                                    className={getFieldError('outgoing_ports_max') ? 'border-destructive' : ''}
                                />
                                {getFieldError('outgoing_ports_max') && (
                                    <p className='text-destructive text-sm'>{getFieldError('outgoing_ports_max')}</p>
                                )}
                            </div>
                        </div>

                        {/* UPnP and ToS settings */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='upnp_lease_duration' className='flex items-center gap-1'>
                                    UPnP lease duration [0: permanent lease]:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#upnp_lease_duration'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Input
                                    id='upnp_lease_duration'
                                    type='number'
                                    min='0'
                                    value={(getValue('upnp_lease_duration') as number) || 0}
                                    onChange={(e) => setPendingChange('upnp_lease_duration', parseInt(e.target.value))}
                                    className={getFieldError('upnp_lease_duration') ? 'border-destructive' : ''}
                                />
                                {getFieldError('upnp_lease_duration') && (
                                    <p className='text-destructive text-sm'>{getFieldError('upnp_lease_duration')}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='peer_tos' className='flex items-center gap-1'>
                                    Type of service (ToS) for connections to peers:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#peer_tos'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Input
                                    id='peer_tos'
                                    type='number'
                                    min='0'
                                    max='255'
                                    value={(getValue('peer_tos') as number) || 0}
                                    onChange={(e) => setPendingChange('peer_tos', parseInt(e.target.value))}
                                    className={getFieldError('peer_tos') ? 'border-destructive' : ''}
                                />
                                {getFieldError('peer_tos') && (
                                    <p className='text-destructive text-sm'>{getFieldError('peer_tos')}</p>
                                )}
                            </div>
                        </div>

                        {/* μTP-TCP mixed mode */}
                        <div className='space-y-2'>
                            <Label htmlFor='utp_tcp_mixed_mode' className='flex items-center gap-1'>
                                μTP-TCP mixed mode algorithm:
                                <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                    <a
                                        href='https://www.libtorrent.org/reference-Settings.html#mixed_mode_algorithm'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-blue-500 hover:text-blue-700'
                                    >
                                        (?)
                                    </a>
                                </Button>
                            </Label>
                            <Select
                                value={getValue('utp_tcp_mixed_mode')?.toString() || '0'}
                                onValueChange={(value) => setPendingChange('utp_tcp_mixed_mode', parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='0'>Prefer TCP</SelectItem>
                                    <SelectItem value='1'>Peer proportional (throttles TCP)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Network and security checkboxes */}
                        <div className='space-y-4'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='idn_support_enabled'
                                    checked={(getValue('idn_support_enabled') as boolean) || false}
                                    onCheckedChange={(checked) => setPendingChange('idn_support_enabled', checked)}
                                />
                                <Label htmlFor='idn_support_enabled' className='flex items-center gap-1'>
                                    Support internationalized domain name (IDN):
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#allow_idna'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='enable_multi_connections_from_same_ip'
                                    checked={(getValue('enable_multi_connections_from_same_ip') as boolean) || false}
                                    onCheckedChange={(checked) =>
                                        setPendingChange('enable_multi_connections_from_same_ip', checked)
                                    }
                                />
                                <Label htmlFor='enable_multi_connections_from_same_ip' className='flex items-center gap-1'>
                                    Allow multiple connections from the same IP address:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#allow_multiple_connections_per_ip'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='validate_https_tracker_certificate'
                                    checked={(getValue('validate_https_tracker_certificate') as boolean) || false}
                                    onCheckedChange={(checked) =>
                                        setPendingChange('validate_https_tracker_certificate', checked)
                                    }
                                />
                                <Label htmlFor='validate_https_tracker_certificate' className='flex items-center gap-1'>
                                    Validate HTTPS tracker certificate:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#validate_https_trackers'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='ssrf_mitigation'
                                    checked={(getValue('ssrf_mitigation') as boolean) || false}
                                    onCheckedChange={(checked) => setPendingChange('ssrf_mitigation', checked)}
                                />
                                <Label htmlFor='ssrf_mitigation' className='flex items-center gap-1'>
                                    Server-side request forgery (SSRF) mitigation:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#ssrf_mitigation'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='block_peers_on_privileged_ports'
                                    checked={(getValue('block_peers_on_privileged_ports') as boolean) || false}
                                    onCheckedChange={(checked) =>
                                        setPendingChange('block_peers_on_privileged_ports', checked)
                                    }
                                />
                                <Label htmlFor='block_peers_on_privileged_ports' className='flex items-center gap-1'>
                                    Disallow connection to peers on privileged ports:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://libtorrent.org/single-page-ref.html#no_connect_privileged_ports'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                            </div>
                        </div>

                        {/* Upload behavior settings */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='upload_slots_behavior' className='flex items-center gap-1'>
                                    Upload slots behavior:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#choking_algorithm'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Select
                                    value={getValue('upload_slots_behavior')?.toString() || '0'}
                                    onValueChange={(value) => setPendingChange('upload_slots_behavior', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='0'>Fixed slots</SelectItem>
                                        <SelectItem value='1'>Upload rate based</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='upload_choking_algorithm' className='flex items-center gap-1'>
                                    Upload choking algorithm:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#seed_choking_algorithm'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Select
                                    value={getValue('upload_choking_algorithm')?.toString() || '0'}
                                    onValueChange={(value) => setPendingChange('upload_choking_algorithm', parseInt(value))}
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
                            </div>
                        </div>

                        {/* Tracker announce settings */}
                        <div className='space-y-4'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='announce_to_all_trackers'
                                    checked={(getValue('announce_to_all_trackers') as boolean) || false}
                                    onCheckedChange={(checked) => setPendingChange('announce_to_all_trackers', checked)}
                                />
                                <Label htmlFor='announce_to_all_trackers' className='flex items-center gap-1'>
                                    Always announce to all trackers in a tier:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#announce_to_all_trackers'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='announce_to_all_tiers'
                                    checked={(getValue('announce_to_all_tiers') as boolean) || false}
                                    onCheckedChange={(checked) => setPendingChange('announce_to_all_tiers', checked)}
                                />
                                <Label htmlFor='announce_to_all_tiers' className='flex items-center gap-1'>
                                    Always announce to all tiers:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#announce_to_all_tiers'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                            </div>
                        </div>

                        {/* Announce IP and port */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='announce_ip' className='flex items-center gap-1'>
                                    IP address reported to trackers (requires restart):
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#announce_ip'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Input
                                    id='announce_ip'
                                    value={(getValue('announce_ip') as string) || ''}
                                    onChange={(e) => setPendingChange('announce_ip', e.target.value)}
                                    placeholder='Leave empty for auto-detection'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='max_concurrent_http_announces' className='flex items-center gap-1'>
                                    Max concurrent HTTP announces:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#max_concurrent_http_announces'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <Input
                                    id='max_concurrent_http_announces'
                                    type='number'
                                    min='1'
                                    value={(getValue('max_concurrent_http_announces') as number) || 50}
                                    onChange={(e) =>
                                        setPendingChange('max_concurrent_http_announces', parseInt(e.target.value))
                                    }
                                    className={getFieldError('max_concurrent_http_announces') ? 'border-destructive' : ''}
                                />
                                {getFieldError('max_concurrent_http_announces') && (
                                    <p className='text-destructive text-sm'>{getFieldError('max_concurrent_http_announces')}</p>
                                )}
                            </div>
                        </div>

                        {/* Stop tracker timeout */}
                        <div className='space-y-2'>
                            <Label htmlFor='stop_tracker_timeout' className='flex items-center gap-1'>
                                Stop tracker timeout [0: disabled]:
                                <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                    <a
                                        href='https://www.libtorrent.org/reference-Settings.html#stop_tracker_timeout'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-blue-500 hover:text-blue-700'
                                    >
                                        (?)
                                    </a>
                                </Button>
                            </Label>
                            <Input
                                id='stop_tracker_timeout'
                                type='number'
                                min='0'
                                value={(getValue('stop_tracker_timeout') as number) || 5}
                                onChange={(e) => setPendingChange('stop_tracker_timeout', parseInt(e.target.value))}
                                className={getFieldError('stop_tracker_timeout') ? 'border-destructive' : ''}
                            />
                            {getFieldError('stop_tracker_timeout') && (
                                <p className='text-destructive text-sm'>{getFieldError('stop_tracker_timeout')}</p>
                            )}
                        </div>

                        {/* Peer turnover settings */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            <div className='space-y-2'>
                                <Label htmlFor='peer_turnover' className='flex items-center gap-1'>
                                    Peer turnover disconnect percentage:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#peer_turnover'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id='peer_turnover'
                                        type='number'
                                        min='0'
                                        max='100'
                                        value={(getValue('peer_turnover') as number) || 4}
                                        onChange={(e) => setPendingChange('peer_turnover', parseInt(e.target.value))}
                                        className={getFieldError('peer_turnover') ? 'border-destructive' : ''}
                                    />
                                    <span className='text-sm text-muted-foreground'>%</span>
                                </div>
                                {getFieldError('peer_turnover') && (
                                    <p className='text-destructive text-sm'>{getFieldError('peer_turnover')}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='peer_turnover_cutoff' className='flex items-center gap-1'>
                                    Peer turnover threshold percentage:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#peer_turnover'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id='peer_turnover_cutoff'
                                        type='number'
                                        min='0'
                                        max='100'
                                        value={(getValue('peer_turnover_cutoff') as number) || 90}
                                        onChange={(e) => setPendingChange('peer_turnover_cutoff', parseInt(e.target.value))}
                                        className={getFieldError('peer_turnover_cutoff') ? 'border-destructive' : ''}
                                    />
                                    <span className='text-sm text-muted-foreground'>%</span>
                                </div>
                                {getFieldError('peer_turnover_cutoff') && (
                                    <p className='text-destructive text-sm'>{getFieldError('peer_turnover_cutoff')}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='peer_turnover_interval' className='flex items-center gap-1'>
                                    Peer turnover disconnect interval:
                                    <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                        <a
                                            href='https://www.libtorrent.org/reference-Settings.html#peer_turnover'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-500 hover:text-blue-700'
                                        >
                                            (?)
                                        </a>
                                    </Button>
                                </Label>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        id='peer_turnover_interval'
                                        type='number'
                                        min='1'
                                        value={(getValue('peer_turnover_interval') as number) || 300}
                                        onChange={(e) => setPendingChange('peer_turnover_interval', parseInt(e.target.value))}
                                        className={getFieldError('peer_turnover_interval') ? 'border-destructive' : ''}
                                    />
                                    <span className='text-sm text-muted-foreground'>s</span>
                                </div>
                                {getFieldError('peer_turnover_interval') && (
                                    <p className='text-destructive text-sm'>{getFieldError('peer_turnover_interval')}</p>
                                )}
                            </div>
                        </div>

                        {/* Request queue size */}
                        <div className='space-y-2'>
                            <Label htmlFor='request_queue_size' className='flex items-center gap-1'>
                                Maximum outstanding requests to a single peer:
                                <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                    <a
                                        href='https://www.libtorrent.org/reference-Settings.html#max_out_request_queue'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-blue-500 hover:text-blue-700'
                                    >
                                        (?)
                                    </a>
                                </Button>
                            </Label>
                            <Input
                                id='request_queue_size'
                                type='number'
                                min='1'
                                value={(getValue('request_queue_size') as number) || 500}
                                onChange={(e) => setPendingChange('request_queue_size', parseInt(e.target.value))}
                                className={getFieldError('request_queue_size') ? 'border-destructive' : ''}
                            />
                            {getFieldError('request_queue_size') && (
                                <p className='text-destructive text-sm'>{getFieldError('request_queue_size')}</p>
                            )}
                        </div>

                        {/* DHT bootstrap nodes */}
                        <div className='space-y-2'>
                            <Label htmlFor='dht_bootstrap_nodes' className='flex items-center gap-1'>
                                DHT bootstrap nodes:
                                <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                    <a
                                        href='https://www.libtorrent.org/reference-Settings.html#dht_bootstrap_nodes'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-blue-500 hover:text-blue-700'
                                    >
                                        (?)
                                    </a>
                                </Button>
                            </Label>
                            <Input
                                id='dht_bootstrap_nodes'
                                value={(getValue('dht_bootstrap_nodes') as string) || ''}
                                onChange={(e) => setPendingChange('dht_bootstrap_nodes', e.target.value)}
                                placeholder='Resets to default if empty'
                            />
                        </div>

                        {/* I2P settings */}
                        {/* {getValue('i2p_enabled') && ( */}
                        {(
                            <div className='space-y-4'>
                                <h4 className='text-lg font-medium'>I2P Settings</h4>
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='i2p_inbound_quantity' className='flex items-center gap-1'>
                                            I2P inbound quantity:
                                            <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                                <a
                                                    href='https://www.libtorrent.org/reference-Settings.html#i2p_inbound_quantity'
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-blue-500 hover:text-blue-700'
                                                >
                                                    (?)
                                                </a>
                                            </Button>
                                        </Label>
                                        <Input
                                            id='i2p_inbound_quantity'
                                            type='number'
                                            min='1'
                                            max='16'
                                            value={(getValue('i2p_inbound_quantity') as number) || 3}
                                            onChange={(e) => setPendingChange('i2p_inbound_quantity', parseInt(e.target.value))}
                                            className={getFieldError('i2p_inbound_quantity') ? 'border-destructive' : ''}
                                        />
                                        {getFieldError('i2p_inbound_quantity') && (
                                            <p className='text-destructive text-sm'>{getFieldError('i2p_inbound_quantity')}</p>
                                        )}
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor='i2p_outbound_quantity' className='flex items-center gap-1'>
                                            I2P outbound quantity:
                                            <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                                <a
                                                    href='https://www.libtorrent.org/reference-Settings.html#i2p_outbound_quantity'
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-blue-500 hover:text-blue-700'
                                                >
                                                    (?)
                                                </a>
                                            </Button>
                                        </Label>
                                        <Input
                                            id='i2p_outbound_quantity'
                                            type='number'
                                            min='1'
                                            max='16'
                                            value={(getValue('i2p_outbound_quantity') as number) || 3}
                                            onChange={(e) => setPendingChange('i2p_outbound_quantity', parseInt(e.target.value))}
                                            className={getFieldError('i2p_outbound_quantity') ? 'border-destructive' : ''}
                                        />
                                        {getFieldError('i2p_outbound_quantity') && (
                                            <p className='text-destructive text-sm'>{getFieldError('i2p_outbound_quantity')}</p>
                                        )}
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor='i2p_inbound_length' className='flex items-center gap-1'>
                                            I2P inbound length:
                                            <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                                <a
                                                    href='https://www.libtorrent.org/reference-Settings.html#i2p_inbound_length'
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-blue-500 hover:text-blue-700'
                                                >
                                                    (?)
                                                </a>
                                            </Button>
                                        </Label>
                                        <Input
                                            id='i2p_inbound_length'
                                            type='number'
                                            min='0'
                                            max='7'
                                            value={(getValue('i2p_inbound_length') as number) || 3}
                                            onChange={(e) => setPendingChange('i2p_inbound_length', parseInt(e.target.value))}
                                            className={getFieldError('i2p_inbound_length') ? 'border-destructive' : ''}
                                        />
                                        {getFieldError('i2p_inbound_length') && (
                                            <p className='text-destructive text-sm'>{getFieldError('i2p_inbound_length')}</p>
                                        )}
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor='i2p_outbound_length' className='flex items-center gap-1'>
                                            I2P outbound length:
                                            <Button variant='ghost' size='sm' asChild className='h-auto p-0'>
                                                <a
                                                    href='https://www.libtorrent.org/reference-Settings.html#i2p_outbound_length'
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-blue-500 hover:text-blue-700'
                                                >
                                                    (?)
                                                </a>
                                            </Button>
                                        </Label>
                                        <Input
                                            id='i2p_outbound_length'
                                            type='number'
                                            min='0'
                                            max='7'
                                            value={(getValue('i2p_outbound_length') as number) || 3}
                                            onChange={(e) => setPendingChange('i2p_outbound_length', parseInt(e.target.value))}
                                            className={getFieldError('i2p_outbound_length') ? 'border-destructive' : ''}
                                        />
                                        {getFieldError('i2p_outbound_length') && (
                                            <p className='text-destructive text-sm'>{getFieldError('i2p_outbound_length')}</p>
                                        )}
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