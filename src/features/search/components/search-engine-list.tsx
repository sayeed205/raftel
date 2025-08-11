import {
  DownloadIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  SettingsIcon,
  TrashIcon,
} from 'lucide-react';
import { useState } from 'react';

import { SearchEngineDialog } from './search-engine-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { useSearchStore } from '@/stores/search-store';


export function SearchEngineList() {
  const {
    engines,
    isLoadingEngines,
    error,
    enableEngine,
    disableEngine,
    uninstallEngine,
    updateEngines,
  } = useSearchStore();

  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [togglingEngines, setTogglingEngines] = useState<
    Record<string, boolean>
  >({});

  const { confirmDestructiveAction } = useConfirmationDialog();

  const handleToggleEngine = async (engineName: string, enabled: boolean) => {
    setTogglingEngines((prev) => ({ ...prev, [engineName]: true }));
    try {
      if (enabled) {
        await enableEngine(engineName);
      } else {
        await disableEngine(engineName);
      }
    } catch (error) {
      console.error('Failed to toggle engine:', error);
    } finally {
      setTogglingEngines((prev) => ({ ...prev, [engineName]: false }));
    }
  };

  const handleUpdateEngines = async () => {
    setIsUpdating(true);
    try {
      await updateEngines();
    } catch (error) {
      console.error('Failed to update engines:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUninstallEngine = async (engineName: string) => {
    confirmDestructiveAction(
      'Uninstall Search Engine',
      `Are you sure you want to uninstall the search engine "${engineName}"? This action cannot be undone.`,
      async () => {
        try {
          await uninstallEngine([engineName]);
        } catch (error) {
          console.error('Failed to uninstall engine:', error);
        }
      },
    );
  };

  const getStatusBadge = (engine: any) => {
    if (togglingEngines[engine.name]) {
      return <Badge variant='secondary'>Updating...</Badge>;
    }
    if (engine.enabled) {
      return <Badge variant='default'>Enabled</Badge>;
    }
    return <Badge variant='outline'>Disabled</Badge>;
  };

  if (isLoadingEngines && engines.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-48' />
          <div className='flex gap-2'>
            <Skeleton className='h-10 w-24' />
            <Skeleton className='h-10 w-20' />
          </div>
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-6 w-3/4' />
                <Skeleton className='h-4 w-full' />
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-1/2' />
                  <Skeleton className='h-4 w-2/3' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium'>
            Search Engines ({engines.filter((e) => e.enabled).length}/
            {engines.length} enabled)
          </h3>
          <p className='text-muted-foreground text-sm'>
            Manage your search engines and plugins
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleUpdateEngines}
            disabled={isUpdating}
          >
            <RefreshCwIcon
              className={`mr-2 h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`}
            />
            Update All
          </Button>
          <Button size='sm' onClick={() => setIsInstallDialogOpen(true)}>
            <PlusIcon className='mr-2 h-4 w-4' />
            Install Engine
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {engines.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <div className='space-y-2 text-center'>
              <h3 className='text-lg font-medium'>
                No search engines installed
              </h3>
              <p className='text-muted-foreground'>
                Install search engine plugins to start searching for torrents.
              </p>
              <Button onClick={() => setIsInstallDialogOpen(true)}>
                <DownloadIcon className='mr-2 h-4 w-4' />
                Install Engine
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {engines.map((engine) => (
            <Card
              key={engine.id}
              className='hover:bg-muted/50 transition-colors'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='min-w-0 flex-1 space-y-1'>
                    <CardTitle className='truncate text-base'>
                      {engine.fullName || engine.name}
                    </CardTitle>
                    <CardDescription className='truncate text-xs'>
                      {engine.url}
                    </CardDescription>
                  </div>
                  <div className='ml-2 flex items-center gap-2'>
                    {getStatusBadge(engine)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                        >
                          <MoreHorizontalIcon className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem disabled>
                          <SettingsIcon className='mr-2 h-4 w-4' />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUninstallEngine(engine.name)}
                          className='text-destructive'
                        >
                          <TrashIcon className='mr-2 h-4 w-4' />
                          Uninstall
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Enable Engine</span>
                    <Switch
                      checked={engine.enabled}
                      onCheckedChange={(checked) =>
                        handleToggleEngine(engine.name, checked)
                      }
                      disabled={togglingEngines[engine.name]}
                    />
                  </div>

                  <div className='text-muted-foreground space-y-1 text-sm'>
                    {engine.version && <div>Version: {engine.version}</div>}
                    <div>Categories: {engine.categories.length}</div>
                    {engine.categories.length > 0 && (
                      <div className='mt-2 flex flex-wrap gap-1'>
                        {engine.categories.slice(0, 3).map((category) => (
                          <Badge
                            key={category}
                            variant='secondary'
                            className='text-xs'
                          >
                            {category}
                          </Badge>
                        ))}
                        {engine.categories.length > 3 && (
                          <Badge variant='secondary' className='text-xs'>
                            +{engine.categories.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SearchEngineDialog
        open={isInstallDialogOpen}
        onOpenChange={setIsInstallDialogOpen}
      />
    </div>
  );
}
