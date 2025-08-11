import { useEffect, useState } from 'react';

import type { FeedRule } from '@/types/qbit/rss';
import { Button } from '@/components/ui/button';
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
import { Switch } from '@/components/ui/switch';
import { useRSSStore } from '@/stores/rss-store';

interface RSSRuleEditorProps {
  rule?: FeedRule;
  onSave?: (rule: FeedRule) => void;
  onCancel: () => void;
}

export function RSSRuleEditor({ rule, onSave, onCancel }: RSSRuleEditorProps) {
  const { feeds, addRule, updateRule, rules } = useRSSStore();
  const [name, setName] = useState(rule?.name || '');
  const [enabled, setEnabled] = useState(rule?.enabled ?? true);
  const [affectedFeeds, setAffectedFeeds] = useState<Array<string>>(
    rule?.affectedFeeds || [],
  );
  const [mustContain, setMustContain] = useState(rule?.mustContain || '');
  const [mustNotContain, setMustNotContain] = useState(
    rule?.mustNotContain || '',
  );
  const [useRegex, setUseRegex] = useState(rule?.useRegex ?? false);
  const [smartFilter, setSmartFilter] = useState(rule?.smartFilter ?? false);
  const [ignoreDays, setIgnoreDays] = useState(rule?.ignoreDays || 0);
  const [savePath, setSavePath] = useState(rule?.torrentParams?.savePath || '');
  const [category, setCategory] = useState(rule?.torrentParams?.category || '');
  const [addStopped, setAddStopped] = useState(
    rule?.torrentParams?.paused ?? false,
  );
  const [contentLayout, setContentLayout] = useState<
    'Original' | 'Subfolder' | 'NoSubfolder'
  >(rule?.torrentParams?.contentLayout || 'Original');
  const [nameError, setNameError] = useState<string | null>(null);

  // If we're editing an existing rule, update the form fields when the rule prop changes
  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setEnabled(rule.enabled);
      setAffectedFeeds(rule.affectedFeeds);
      setMustContain(rule.mustContain || '');
      setMustNotContain(rule.mustNotContain || '');
      setUseRegex(rule.useRegex);
      setSmartFilter(rule.smartFilter);
      setIgnoreDays(rule.ignoreDays);
      setSavePath(rule.torrentParams?.savePath || '');
      setCategory(rule.torrentParams?.category || '');
      setAddStopped(rule.torrentParams?.paused ?? false);
      setContentLayout(rule.torrentParams?.contentLayout || 'Original');
      setNameError(null);
    } else {
      // Reset form for new rule
      setName('');
      setEnabled(true);
      setAffectedFeeds([]);
      setMustContain('');
      setMustNotContain('');
      setUseRegex(false);
      setSmartFilter(false);
      setIgnoreDays(0);
      setSavePath('');
      setCategory('');
      setAddStopped(false);
      setContentLayout('Original');
      setNameError(null);
    }
  }, [rule]);

  const handleFeedToggle = (feedName: string) => {
    if (affectedFeeds.includes(feedName)) {
      setAffectedFeeds(affectedFeeds.filter((f) => f !== feedName));
    } else {
      setAffectedFeeds([...affectedFeeds, feedName]);
    }
  };

  const handleSubmit = async () => {
    // Validate rule name
    if (!name.trim()) {
      setNameError('Rule name is required');
      return;
    }

    // Check for duplicate name when creating new rule
    if (!rule && rules.some((r) => r.name === name)) {
      setNameError('A rule with this name already exists');
      return;
    }

    setNameError(null);

    const newRule: FeedRule = {
      name,
      enabled,
      affectedFeeds,
      mustContain,
      mustNotContain,
      useRegex,
      smartFilter,
      ignoreDays,
      priority: 50, // Default priority
      lastMatch: rule?.lastMatch || '',
      previouslyMatchedEpisodes: rule?.previouslyMatchedEpisodes || [],
      torrentParams: {
        savePath,
        category,
        paused: addStopped,
        contentLayout,
        skip_checking: false,
        tags: [],
        autoTMM: false,
        sequentialDownload: false,
        firstLastPiecePrio: false,
      },
    };

    try {
      if (rule) {
        // Update existing rule
        await updateRule(name, newRule);
      } else {
        // Add new rule
        await addRule(name, newRule);
      }

      // If onSave callback is provided, call it
      if (onSave) {
        onSave(newRule);
      }
    } catch (error) {
      console.error('Failed to save rule:', error);
      // In a real app, you might want to show an error message to the user
    }
  };

  return (
    <div className='space-y-6'>
      {/* Rule Definition */}
      <Card>
        <CardHeader>
          <CardTitle>Rule Definition</CardTitle>
          <CardDescription>
            Configure the basic settings for this rule
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='rule-name'>Rule Name</Label>
            <Input
              id='rule-name'
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder='Enter rule name'
              disabled={!!rule} // Disable name editing for existing rules
            />
            {nameError && (
              <p className='text-destructive text-sm'>{nameError}</p>
            )}
          </div>

          <div className='flex items-center space-x-2'>
            <Switch
              id='rule-enabled'
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label htmlFor='rule-enabled'>Enable this rule</Label>
          </div>

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='use-regex'
              checked={useRegex}
              onCheckedChange={(checked) => setUseRegex(checked as boolean)}
            />
            <Label htmlFor='use-regex'>Use Regular Expressions</Label>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Define what torrents this rule should match
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='must-contain'>Must Contain</Label>
            <Input
              id='must-contain'
              value={mustContain}
              onChange={(e) => setMustContain(e.target.value)}
              placeholder='Keywords that must be present'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='must-not-contain'>Must Not Contain</Label>
            <Input
              id='must-not-contain'
              value={mustNotContain}
              onChange={(e) => setMustNotContain(e.target.value)}
              placeholder='Keywords that must not be present'
            />
          </div>

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='smart-filter'
              checked={smartFilter}
              onCheckedChange={(checked) => setSmartFilter(checked as boolean)}
            />
            <Label htmlFor='smart-filter'>Use Smart Episode Filter</Label>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='ignore-days'>
              Ignore Subsequent Matches for (0 to Disable)
            </Label>
            <div className='flex items-center gap-2'>
              <Input
                id='ignore-days'
                type='number'
                min='0'
                value={ignoreDays}
                onChange={(e) => setIgnoreDays(parseInt(e.target.value) || 0)}
                className='w-32'
              />
              <span className='text-muted-foreground text-sm'>days</span>
            </div>
            <div className='text-muted-foreground text-sm'>
              Last Match: {rule?.lastMatch || 'Unknown'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Torrent Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Torrent Settings</CardTitle>
          <CardDescription>
            Configure how matched torrents are handled
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='category'>Assign Category</Label>
            <Input
              id='category'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder='Category name'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='save-path'>Save to a Different Directory</Label>
            <Input
              id='save-path'
              value={savePath}
              onChange={(e) => setSavePath(e.target.value)}
              placeholder='Custom save path'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='content-layout'>Torrent content layout</Label>
            <Select
              value={contentLayout}
              onValueChange={(value: any) => setContentLayout(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Original'>Use global settings</SelectItem>
                <SelectItem value='Subfolder'>Create subfolder</SelectItem>
                <SelectItem value='NoSubfolder'>
                  Don't create subfolder
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center space-x-2'>
            <Switch
              id='add-stopped'
              checked={addStopped}
              onCheckedChange={setAddStopped}
            />
            <Label htmlFor='add-stopped'>Add Stopped</Label>
          </div>
        </CardContent>
      </Card>

      {/* Apply to Feeds */}
      <Card>
        <CardHeader>
          <CardTitle>Apply Rule to Feeds</CardTitle>
          <CardDescription>
            Select which RSS feeds this rule should apply to
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
            {feeds.map((feed) => (
              <div key={feed.name} className='flex items-center space-x-2'>
                <Checkbox
                  id={`feed-${feed.name}`}
                  checked={affectedFeeds.includes(feed.name)}
                  onCheckedChange={() => handleFeedToggle(feed.name)}
                />
                <Label htmlFor={`feed-${feed.name}`} className='truncate'>
                  {feed.title || feed.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex justify-end space-x-2'>
        <Button variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {rule ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </div>
  );
}
