import {
  EditIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';
import { useState } from 'react';

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
import { useRSSStore } from '@/stores/rss-store';

import { RSSRuleDialog } from './rss-rule-dialog';

export function RSSRuleList() {
  const {
    rules,
    isRulesLoading,
    removeRule,
    toggleRule,
    setSelectedRule,
    selectedRule,
  } = useRSSStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);

  const { confirmDestructiveAction } = useConfirmationDialog();

  const handleDeleteRule = async (ruleName: string) => {
    confirmDestructiveAction(
      'Delete Rule',
      `Are you sure you want to delete the rule "${ruleName}"? This action cannot be undone.`,
      async () => {
        try {
          await removeRule(ruleName);
        } catch (error) {
          console.error('Failed to delete rule:', error);
        }
      },
    );
  };

  const handleToggleRule = async (ruleName: string) => {
    try {
      await toggleRule(ruleName);
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const handleRuleClick = (ruleName: string) => {
    setSelectedRule(selectedRule === ruleName ? null : ruleName);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 80) return <Badge variant='destructive'>High</Badge>;
    if (priority >= 40) return <Badge variant='default'>Medium</Badge>;
    return <Badge variant='secondary'>Low</Badge>;
  };

  if (isRulesLoading && rules.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-32' />
          <Skeleton className='h-10 w-20' />
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-6 w-3/4' />
                <Skeleton className='h-4 w-full' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-4 w-1/2' />
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
        <h3 className='text-lg font-medium'>RSS Rules ({rules.length})</h3>
        <Button size='sm' onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className='mr-2 h-4 w-4' />
          Add Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <div className='space-y-2 text-center'>
              <h3 className='text-lg font-medium'>No RSS rules configured</h3>
              <p className='text-muted-foreground'>
                Create rules to automatically download torrents from RSS feeds.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusIcon className='mr-2 h-4 w-4' />
                Add Rule
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {rules.map((rule) => (
            <Card
              key={rule.name}
              className={`hover:bg-muted/50 cursor-pointer transition-colors ${
                selectedRule === rule.name ? 'ring-primary ring-2' : ''
              }`}
              onClick={() => handleRuleClick(rule.name)}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='min-w-0 flex-1 space-y-1'>
                    <CardTitle className='truncate text-base'>
                      {rule.name}
                    </CardTitle>
                    <CardDescription className='text-xs'>
                      {rule.affectedFeeds.length} feed(s) •{' '}
                      {rule.mustContain || 'No filter'}
                    </CardDescription>
                  </div>
                  <div className='ml-2 flex items-center gap-2'>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => {
                        handleToggleRule(rule.name);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                        >
                          <MoreHorizontalIcon className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRule(rule.name);
                          }}
                        >
                          {rule.enabled ? (
                            <>
                              <PauseIcon className='mr-2 h-4 w-4' />
                              Disable
                            </>
                          ) : (
                            <>
                              <PlayIcon className='mr-2 h-4 w-4' />
                              Enable
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRule(rule.name);
                          }}
                        >
                          <EditIcon className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRule(rule.name);
                          }}
                          className='text-destructive'
                        >
                          <TrashIcon className='mr-2 h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>Priority:</span>
                    {getPriorityBadge(rule.priority)}
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>Status:</span>
                    <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  {rule.smartFilter && (
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>
                        Smart Filter:
                      </span>
                      <Badge variant='outline'>Enabled</Badge>
                    </div>
                  )}
                  <div className='text-muted-foreground text-xs'>
                    Last match: {formatDate(rule.lastMatch)}
                  </div>
                  {rule.mustContain && (
                    <div className='text-xs'>
                      <span className='text-muted-foreground'>
                        Must contain:
                      </span>
                      <div className='bg-muted mt-1 truncate rounded px-2 py-1 font-mono'>
                        {rule.mustContain}
                      </div>
                    </div>
                  )}
                  {rule.mustNotContain && (
                    <div className='text-xs'>
                      <span className='text-muted-foreground'>
                        Must not contain:
                      </span>
                      <div className='bg-muted mt-1 truncate rounded px-2 py-1 font-mono'>
                        {rule.mustNotContain}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RSSRuleDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode='add'
      />

      {editingRule && (
        <RSSRuleDialog
          open={!!editingRule}
          onOpenChange={(open) => !open && setEditingRule(null)}
          mode='edit'
          ruleName={editingRule}
        />
      )}
    </div>
  );
}
