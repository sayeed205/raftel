import React, { useState } from 'react';
import type { WebUISettings } from '@/stores/settings-store';
import { AlertTriangle, RotateCcw, Settings } from 'lucide-react';

import type { QBittorrentPreferences } from '@/types/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';

interface SettingsResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: (options: ResetOptions) => Promise<void>;
  preferences: QBittorrentPreferences | null;
  webUISettings: WebUISettings;
}

interface ResetOptions {
  resetPreferences: boolean;
  resetWebUISettings: boolean;
  createBackup: boolean;
}

const CONFIRMATION_TEXT = 'RESET ALL SETTINGS';

export function SettingsResetDialog({
  open,
  onOpenChange,
  onReset,
  preferences,
  webUISettings,
}: SettingsResetDialogProps) {
  const [resetOptions, setResetOptions] = useState<ResetOptions>({
    resetPreferences: true,
    resetWebUISettings: true,
    createBackup: true,
  });

  const [confirmationText, setConfirmationText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setResetOptions({
        resetPreferences: true,
        resetWebUISettings: true,
        createBackup: true,
      });
      setConfirmationText('');
      setError(null);
    }
  }, [open]);

  // Check if confirmation is valid
  const isConfirmationValid = confirmationText === CONFIRMATION_TEXT;

  // Handle reset
  const handleReset = async () => {
    if (!isConfirmationValid) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create backup if requested
      if (resetOptions.createBackup) {
        const backupData = {
          preferences: resetOptions.resetPreferences ? preferences : null,
          webUISettings: resetOptions.resetWebUISettings ? webUISettings : null,
          exportedAt: new Date().toISOString(),
          version: '1.0',
          backupReason: 'Pre-reset backup',
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qbittorrent-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      await onReset(resetOptions);
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to reset settings';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get count of settings that will be reset
  const getResetCount = () => {
    let count = 0;
    if (resetOptions.resetPreferences && preferences) {
      count += Object.keys(preferences).length;
    }
    if (resetOptions.resetWebUISettings) {
      count += Object.keys(webUISettings).length;
    }
    return count;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Reset Settings
          </DialogTitle>
          <DialogDescription>
            This action will permanently reset your settings to their default
            values. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Warning */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action is irreversible. All your
              custom settings will be lost and restored to their default values.
            </AlertDescription>
          </Alert>

          {/* Reset options */}
          <div className="space-y-3">
            <Label className="text-base font-medium">What to reset</Label>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reset-preferences"
                  checked={resetOptions.resetPreferences}
                  onCheckedChange={(checked) =>
                    setResetOptions((prev) => ({
                      ...prev,
                      resetPreferences: !!checked,
                    }))
                  }
                  disabled={!preferences}
                />
                <Label
                  htmlFor="reset-preferences"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  qBittorrent Preferences
                  {preferences && (
                    <Badge variant="destructive">
                      {Object.keys(preferences).length} settings
                    </Badge>
                  )}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reset-webui"
                  checked={resetOptions.resetWebUISettings}
                  onCheckedChange={(checked) =>
                    setResetOptions((prev) => ({
                      ...prev,
                      resetWebUISettings: !!checked,
                    }))
                  }
                />
                <Label
                  htmlFor="reset-webui"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  WebUI Settings
                  <Badge variant="destructive">
                    {Object.keys(webUISettings).length} settings
                  </Badge>
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Backup option */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-backup"
                checked={resetOptions.createBackup}
                onCheckedChange={(checked) =>
                  setResetOptions((prev) => ({
                    ...prev,
                    createBackup: !!checked,
                  }))
                }
              />
              <Label htmlFor="create-backup">
                Create backup before resetting
              </Label>
            </div>

            {resetOptions.createBackup && (
              <div className="text-muted-foreground ml-6 text-sm">
                A backup file will be automatically downloaded before resetting.
              </div>
            )}
          </div>

          <Separator />

          {/* Confirmation */}
          <div className="space-y-3">
            <Label htmlFor="confirmation" className="text-base font-medium">
              Confirmation
            </Label>
            <div className="text-muted-foreground text-sm">
              Type{' '}
              <code className="bg-muted rounded px-1">{CONFIRMATION_TEXT}</code>{' '}
              to confirm:
            </div>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={CONFIRMATION_TEXT}
              className={isConfirmationValid ? 'border-green-500' : ''}
            />
          </div>

          {/* Summary */}
          {(resetOptions.resetPreferences ||
            resetOptions.resetWebUISettings) && (
            <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-4">
              <div className="space-y-1 text-sm">
                <div className="text-destructive font-medium">
                  Reset Summary
                </div>
                <div>Settings to reset: {getResetCount()}</div>
                <div>
                  Backup will be created:{' '}
                  {resetOptions.createBackup ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={
              !isConfirmationValid ||
              isLoading ||
              (!resetOptions.resetPreferences &&
                !resetOptions.resetWebUISettings)
            }
          >
            {isLoading ? 'Resetting...' : 'Reset Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
