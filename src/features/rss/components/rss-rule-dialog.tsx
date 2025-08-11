import { useEffect, useState } from 'react';
import { useRSSStore } from '@/stores/rss-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import type { FeedRule } from '@/types/qbit/rss';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ruleSchema = z.object({
  name: z
    .string()
    .min(1, 'Rule name is required')
    .max(100, 'Rule name too long'),
  enabled: z.boolean(),
  affectedFeeds: z
    .array(z.string())
    .min(1, 'At least one feed must be selected'),
  mustContain: z.string().optional(),
  mustNotContain: z.string().optional(),
  useRegex: z.boolean(),
  smartFilter: z.boolean(),
  ignoreDays: z.number().min(0).max(365),
  priority: z.number().min(0).max(100),
  // Torrent parameters
  savePath: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  paused: z.boolean(),
  skipChecking: z.boolean(),
  contentLayout: z.enum(['Original', 'Subfolder', 'NoSubfolder']).optional(),
  autoTMM: z.boolean(),
  sequentialDownload: z.boolean(),
  firstLastPiecePrio: z.boolean(),
  dlLimit: z.number().min(-1).optional(),
  upLimit: z.number().min(-1).optional(),
});

type RuleFormData = z.infer<typeof ruleSchema>;

interface RSSRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  ruleName?: string;
}

export function RSSRuleDialog({
  open,
  onOpenChange,
  mode,
  ruleName,
}: RSSRuleDialogProps) {
  const { feeds, rules, addRule, updateRule, getRuleByName } = useRSSStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: '',
      enabled: true,
      affectedFeeds: [],
      mustContain: '',
      mustNotContain: '',
      useRegex: false,
      smartFilter: false,
      ignoreDays: 0,
      priority: 50,
      savePath: '',
      category: '',
      tags: [],
      paused: false,
      skipChecking: false,
      contentLayout: 'Original',
      autoTMM: false,
      sequentialDownload: false,
      firstLastPiecePrio: false,
      dlLimit: -1,
      upLimit: -1,
    },
  });

  useEffect(() => {
    if (open) {
      setError(null);
      if (mode === 'edit' && ruleName) {
        const rule = getRuleByName(ruleName);
        if (rule) {
          setValue('name', rule.name);
          setValue('enabled', rule.enabled);
          setValue('affectedFeeds', rule.affectedFeeds);
          setValue('mustContain', rule.mustContain || '');
          setValue('mustNotContain', rule.mustNotContain || '');
          setValue('useRegex', rule.useRegex);
          setValue('smartFilter', rule.smartFilter);
          setValue('ignoreDays', rule.ignoreDays);
          setValue('priority', rule.priority);

          // Torrent parameters
          setValue('savePath', rule.torrentParams?.savePath || '');
          setValue('category', rule.torrentParams?.category || '');
          setValue('tags', rule.torrentParams?.tags || []);
          setValue('paused', rule.torrentParams?.paused || false);
          setValue('skipChecking', rule.torrentParams?.skip_checking || false);
          setValue(
            'contentLayout',
            rule.torrentParams?.contentLayout || 'Original'
          );
          setValue('autoTMM', rule.torrentParams?.autoTMM || false);
          setValue(
            'sequentialDownload',
            rule.torrentParams?.sequentialDownload || false
          );
          setValue(
            'firstLastPiecePrio',
            rule.torrentParams?.firstLastPiecePrio || false
          );
          setValue('dlLimit', rule.torrentParams?.dlLimit || -1);
          setValue('upLimit', rule.torrentParams?.upLimit || -1);
        }
      } else {
        reset();
      }
    }
  }, [open, mode, ruleName, getRuleByName, setValue, reset]);

  const onSubmit = async (data: RuleFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'add') {
        // Check if rule name already exists
        const existingRule = rules.find((rule) => rule.name === data.name);
        if (existingRule) {
          setError('A rule with this name already exists');
          return;
        }
      }

      const ruleData: FeedRule = {
        name: data.name,
        enabled: data.enabled,
        affectedFeeds: data.affectedFeeds,
        mustContain: data.mustContain || '',
        mustNotContain: data.mustNotContain || '',
        useRegex: data.useRegex,
        smartFilter: data.smartFilter,
        ignoreDays: data.ignoreDays,
        priority: data.priority,
        lastMatch: '',
        previouslyMatchedEpisodes: [],
        torrentParams: {
          savePath: data.savePath,
          category: data.category,
          tags: data.tags,
          paused: data.paused,
          skip_checking: data.skipChecking,
          contentLayout: data.contentLayout,
          autoTMM: data.autoTMM,
          sequentialDownload: data.sequentialDownload,
          firstLastPiecePrio: data.firstLastPiecePrio,
          dlLimit: data.dlLimit === -1 ? undefined : data.dlLimit,
          upLimit: data.upLimit === -1 ? undefined : data.upLimit,
        },
      };

      if (mode === 'add') {
        await addRule(data.name, ruleData);
      } else if (mode === 'edit' && ruleName) {
        await updateRule(ruleName, ruleData);
      }

      onOpenChange(false);
      reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      reset();
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add RSS Rule' : 'Edit RSS Rule'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Create a new rule to automatically download torrents from RSS feeds.'
              : 'Update the RSS rule configuration.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="torrent">Torrent Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Settings</CardTitle>
                  <CardDescription>
                    Configure the rule name, feeds, and priority
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Rule Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter rule name"
                        disabled={mode === 'edit' || isSubmitting}
                        {...register('name')}
                      />
                      {errors.name && (
                        <p className="text-destructive text-sm">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority (0-100)</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="0"
                        max="100"
                        disabled={isSubmitting}
                        {...register('priority', { valueAsNumber: true })}
                      />
                      {errors.priority && (
                        <p className="text-destructive text-sm">
                          {errors.priority.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="enabled"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    <Label>Enable this rule</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Affected Feeds</Label>
                    <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto rounded border p-2">
                      {feeds.map((feed) => (
                        <div
                          key={feed.name}
                          className="flex items-center space-x-2"
                        >
                          <Controller
                            name="affectedFeeds"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                checked={field.value.includes(feed.name)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, feed.name]);
                                  } else {
                                    field.onChange(
                                      field.value.filter((f) => f !== feed.name)
                                    );
                                  }
                                }}
                                disabled={isSubmitting}
                              />
                            )}
                          />
                          <Label className="truncate text-sm">
                            {feed.title || feed.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {errors.affectedFeeds && (
                      <p className="text-destructive text-sm">
                        {errors.affectedFeeds.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filter Settings</CardTitle>
                  <CardDescription>
                    Configure filters to match specific torrents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mustContain">Must Contain</Label>
                    <Input
                      id="mustContain"
                      placeholder="Keywords that must be present"
                      disabled={isSubmitting}
                      {...register('mustContain')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mustNotContain">Must Not Contain</Label>
                    <Input
                      id="mustNotContain"
                      placeholder="Keywords that must not be present"
                      disabled={isSubmitting}
                      {...register('mustNotContain')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ignoreDays">Ignore Days</Label>
                    <Input
                      id="ignoreDays"
                      type="number"
                      min="0"
                      max="365"
                      placeholder="Days to ignore articles"
                      disabled={isSubmitting}
                      {...register('ignoreDays', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="useRegex"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    <Label>Use Regular Expressions</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="smartFilter"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    <Label>Smart Episode Filter</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="torrent" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Torrent Settings</CardTitle>
                  <CardDescription>
                    Configure how matched torrents are added
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="savePath">Save Path</Label>
                      <Input
                        id="savePath"
                        placeholder="Custom save path"
                        disabled={isSubmitting}
                        {...register('savePath')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        placeholder="Torrent category"
                        disabled={isSubmitting}
                        {...register('category')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contentLayout">Content Layout</Label>
                    <Controller
                      name="contentLayout"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Original">Original</SelectItem>
                            <SelectItem value="Subfolder">
                              Create subfolder
                            </SelectItem>
                            <SelectItem value="NoSubfolder">
                              Don't create subfolder
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dlLimit">
                        Download Limit (KB/s, -1 = unlimited)
                      </Label>
                      <Input
                        id="dlLimit"
                        type="number"
                        min="-1"
                        disabled={isSubmitting}
                        {...register('dlLimit', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="upLimit">
                        Upload Limit (KB/s, -1 = unlimited)
                      </Label>
                      <Input
                        id="upLimit"
                        type="number"
                        min="-1"
                        disabled={isSubmitting}
                        {...register('upLimit', { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="paused"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        )}
                      />
                      <Label>Add in paused state</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Controller
                        name="skipChecking"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        )}
                      />
                      <Label>Skip hash checking</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="autoTMM"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        )}
                      />
                      <Label>Automatic Torrent Management</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Controller
                        name="sequentialDownload"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        )}
                      />
                      <Label>Sequential download</Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="firstLastPiecePrio"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    <Label>First and last piece priority</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === 'add'
                  ? 'Adding...'
                  : 'Updating...'
                : mode === 'add'
                  ? 'Add Rule'
                  : 'Update Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
