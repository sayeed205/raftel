import { useState } from 'react';
import { useSearchStore } from '@/stores/search-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const installEngineSchema = z.object({
  sources: z.string().min(1, 'At least one source URL is required'),
});

type InstallEngineForm = z.infer<typeof installEngineSchema>;

interface SearchEngineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchEngineDialog({
  open,
  onOpenChange,
}: SearchEngineDialogProps) {
  const { installEngine } = useSearchStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InstallEngineForm>({
    resolver: zodResolver(installEngineSchema),
    defaultValues: {
      sources: '',
    },
  });

  const onSubmit = async (data: InstallEngineForm) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Split sources by newlines and filter out empty lines
      const sources = data.sources
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      await installEngine(sources);
      reset();
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to install search engine';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      reset();
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Install Search Engine</DialogTitle>
          <DialogDescription>
            Install new search engine plugins from URLs or file paths.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="sources">Plugin Sources</Label>
            <Textarea
              id="sources"
              placeholder={`Enter plugin URLs or file paths, one per line:

https://raw.githubusercontent.com/qbittorrent/search-plugins/master/nova3/engines/legittorrents.py
https://raw.githubusercontent.com/qbittorrent/search-plugins/master/nova3/engines/piratebay.py`}
              className="min-h-[120px] font-mono text-sm"
              {...register('sources')}
            />
            {errors.sources && (
              <p className="text-destructive text-sm">
                {errors.sources.message}
              </p>
            )}
            <p className="text-muted-foreground text-sm">
              Enter plugin URLs or file paths, one per line. You can find
              official plugins at{' '}
              <a
                href="https://github.com/qbittorrent/search-plugins"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                qBittorrent Search Plugins
              </a>
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                'Installing...'
              ) : (
                <>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Install
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
