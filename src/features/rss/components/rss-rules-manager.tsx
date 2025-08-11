import { useEffect, useState } from 'react';
import {
  DownloadIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';
import { RSSRuleEditor } from './rss-rule-editor';
import type { FeedRule } from '@/types/qbit/rss';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/stores/settings-store';
import { useRSSStore } from '@/stores/rss-store';

interface RSSRulesManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RSSRulesManager({ open, onOpenChange }: RSSRulesManagerProps) {
  const { preferences } = useSettings();
  const {
    rules,
    feeds,
    isRulesLoading,
    removeRule,
    toggleRule,
    getMatchingArticles,
  } = useRSSStore();

  const [selectedRule, setSelectedRule] = useState<FeedRule | null>(null);
  const [matchingArticles, setMatchingArticles] = useState<
    Record<string, Array<string>>
  >({});
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [articleError, setArticleError] = useState<string | null>(null);

  // Check if RSS auto downloading is enabled
  const isAutoDownloadEnabled =
    preferences?.rss_auto_downloading_enabled ?? false;

  // Load matching articles when a rule is selected
  useEffect(() => {
    const loadMatchingArticles = async () => {
      if (!selectedRule) {
        setMatchingArticles({});
        return;
      }

      setIsLoadingArticles(true);
      setArticleError(null);

      try {
        const articles = await getMatchingArticles(selectedRule.name);
        setMatchingArticles(articles);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to load matching articles';
        setArticleError(message);
        setMatchingArticles({});
      } finally {
        setIsLoadingArticles(false);
      }
    };

    loadMatchingArticles();
  }, [selectedRule, getMatchingArticles]);

  const handleDeleteRule = async (ruleName: string) => {
    if (confirm(`Are you sure you want to delete the rule "${ruleName}"?`)) {
      try {
        await removeRule(ruleName);
        if (selectedRule?.name === ruleName) {
          setSelectedRule(null);
        }
      } catch (error) {
        console.error('Failed to delete rule:', error);
        alert('Failed to delete rule');
      }
    }
  };

  const handleToggleRule = async (ruleName: string) => {
    try {
      await toggleRule(ruleName);
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      alert('Failed to toggle rule');
    }
  };

  const handleRuleSelect = (rule: FeedRule) => {
    setSelectedRule(selectedRule?.name === rule.name ? null : rule);
  };

  const handleSaveRule = () => {
    // Refresh the rules list and matching articles
    if (selectedRule) {
      // Find the updated rule
      const updatedRule = rules.find((r) => r.name === selectedRule.name);
      if (updatedRule) {
        setSelectedRule(updatedRule);
      }
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-hidden p-0 sm:max-w-6xl'>
        <DialogHeader className='p-6 pb-0'>
          <DialogTitle>RSS Download Rules</DialogTitle>
        </DialogHeader>

        <div className='flex h-[calc(90vh-8rem)] flex-col md:flex-row'>
          {/* Left sidebar - Rules list */}
          <div className='flex w-full flex-col border-r md:w-1/3'>
            <div className='p-4'>
              <Button className='w-full' onClick={() => setSelectedRule(null)}>
                <PlusIcon className='mr-2 h-4 w-4' />
                Add New Rule
              </Button>
            </div>

            <Separator />

            <ScrollArea className='flex-1'>
              <div className='p-2'>
                {isRulesLoading ? (
                  <div className='p-4 text-center'>Loading rules...</div>
                ) : rules.length === 0 ? (
                  <div className='text-muted-foreground p-4 text-center'>
                    No rules configured
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {rules.map((rule) => (
                      <Card
                        key={rule.name}
                        className={`cursor-pointer transition-colors ${
                          selectedRule?.name === rule.name
                            ? 'border-primary ring-primary ring-2'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleRuleSelect(rule)}
                      >
                        <CardHeader className='p-3'>
                          <div className='flex items-start justify-between'>
                            <CardTitle className='truncate text-sm'>
                              {rule.name}
                            </CardTitle>
                            <div className='flex items-center gap-1'>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-6 w-6 p-0'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleRule(rule.name);
                                }}
                              >
                                {rule.enabled ? (
                                  <PauseIcon className='h-3 w-3' />
                                ) : (
                                  <PlayIcon className='h-3 w-3' />
                                )}
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-6 w-6 p-0'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRule(rule.name);
                                }}
                              >
                                <TrashIcon className='h-3 w-3' />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className='p-3 pt-0'>
                          <div className='text-muted-foreground text-xs'>
                            <div>{rule.affectedFeeds.length} feed(s)</div>
                            <div className='mt-1 flex items-center justify-between'>
                              <span>Priority:</span>
                              {getPriorityBadge(rule.priority)}
                            </div>
                            <div className='mt-1 flex items-center justify-between'>
                              <span>Status:</span>
                              <Badge
                                variant={rule.enabled ? 'default' : 'secondary'}
                              >
                                {rule.enabled ? 'Active' : 'Disabled'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right side - Rule editor and matching articles */}
          <div className='flex flex-1 flex-col'>
            {!isAutoDownloadEnabled && (
              <Alert variant='destructive' className='m-4'>
                <AlertTitle>Auto Download Disabled</AlertTitle>
                <AlertDescription>
                  RSS auto downloading is currently disabled. Enable it in the
                  RSS settings to use these rules.
                </AlertDescription>
              </Alert>
            )}

            <ScrollArea className='flex-1'>
              <div className='h-full p-4'>
                {selectedRule ? (
                  <div className='space-y-6'>
                    <div>
                      <h3 className='text-lg font-semibold'>
                        Edit Rule: {selectedRule.name}
                      </h3>
                      <p className='text-muted-foreground text-sm'>
                        Last match: {formatDate(selectedRule.lastMatch)}
                      </p>
                    </div>

                    <RSSRuleEditor
                      rule={selectedRule}
                      onSave={handleSaveRule}
                      onCancel={() => setSelectedRule(null)}
                    />

                    <Separator />

                    <div>
                      <h3 className='mb-3 text-lg font-semibold'>
                        Matching Articles
                      </h3>

                      {isLoadingArticles ? (
                        <div className='text-center'>
                          Loading matching articles...
                        </div>
                      ) : articleError ? (
                        <Alert variant='destructive'>
                          <AlertDescription>{articleError}</AlertDescription>
                        </Alert>
                      ) : Object.keys(matchingArticles).length === 0 ? (
                        <p className='text-muted-foreground'>
                          No matching articles found
                        </p>
                      ) : (
                        <div className='space-y-4'>
                          {Object.entries(matchingArticles).map(
                            ([feedName, articles]) => (
                              <Card key={feedName}>
                                <CardHeader className='p-3'>
                                  <CardTitle className='text-sm'>
                                    {feeds.find((f) => f.name === feedName)
                                      ?.title || feedName}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className='p-3 pt-0'>
                                  {articles.length === 0 ? (
                                    <p className='text-muted-foreground text-sm'>
                                      No matching articles
                                    </p>
                                  ) : (
                                    <ul className='space-y-1'>
                                      {articles.map((article, index) => (
                                        <li
                                          key={index}
                                          className='truncate text-sm'
                                        >
                                          {article}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </CardContent>
                              </Card>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className='flex h-full flex-col items-center justify-center p-8 text-center'>
                    <div className='bg-muted mb-4 rounded-full p-4'>
                      <DownloadIcon className='text-muted-foreground h-8 w-8' />
                    </div>
                    <h3 className='mb-2 text-xl font-semibold'>
                      RSS Download Rules
                    </h3>
                    <p className='text-muted-foreground mb-4'>
                      Select a rule from the left to edit it, or create a new
                      rule.
                    </p>
                    <Button onClick={() => setSelectedRule(null)}>
                      <PlusIcon className='mr-2 h-4 w-4' />
                      Create New Rule
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
