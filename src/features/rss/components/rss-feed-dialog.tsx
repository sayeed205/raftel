import { useEffect, useState } from 'react';
import { useRSSStore } from '@/stores/rss-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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

const feedSchema = z.object({
  name: z
    .string()
    .min(1, 'Feed name is required')
    .max(100, 'Feed name too long'),
  url: z.string().url('Please enter a valid URL'),
});

type FeedFormData = z.infer<typeof feedSchema>;

interface RSSFeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  feedName?: string;
}

export function RSSFeedDialog({
  open,
  onOpenChange,
  mode,
  feedName,
}: RSSFeedDialogProps) {
  const { addFeed, setFeedUrl, getFeedByName, feeds } = useRSSStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FeedFormData>({
    resolver: zodResolver(feedSchema),
    defaultValues: {
      name: '',
      url: '',
    },
  });

  useEffect(() => {
    if (open) {
      setError(null);
      if (mode === 'edit' && feedName) {
        const feed = getFeedByName(feedName);
        if (feed) {
          setValue('name', feed.name);
          setValue('url', feed.url);
        }
      } else {
        reset();
      }
    }
  }, [open, mode, feedName, getFeedByName, setValue, reset]);

  const onSubmit = async (data: FeedFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'add') {
        // Check if feed name already exists
        const existingFeed = feeds.find((feed) => feed.name === data.name);
        if (existingFeed) {
          setError('A feed with this name already exists');
          return;
        }

        await addFeed(data.name, data.url);
      } else if (mode === 'edit' && feedName) {
        await setFeedUrl(feedName, data.url);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add RSS Feed' : 'Edit RSS Feed'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Add a new RSS feed to monitor for torrents.'
              : 'Update the RSS feed URL.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Feed Name</Label>
            <Input
              id="name"
              placeholder="Enter feed name"
              disabled={mode === 'edit' || isSubmitting}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Feed URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/rss.xml"
              disabled={isSubmitting}
              {...register('url')}
            />
            {errors.url && (
              <p className="text-destructive text-sm">{errors.url.message}</p>
            )}
          </div>

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
                  ? 'Add Feed'
                  : 'Update Feed'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
