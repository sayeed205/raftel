import React, { useState } from 'react';
import type { WebUISettings } from '@/stores/settings-store';
import { AlertCircle, CheckCircle, Upload } from 'lucide-react';

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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ImportData {
  preferences?: Partial<QBittorrentPreferences>;
  webUISettings?: Partial<WebUISettings>;
  exportedAt?: string;
  version?: string;
}

interface ConflictItem {
  key: string;
  currentValue: any;
  importValue: any;
  section: 'preferences' | 'webUISettings';
  description: string;
}

interface SettingsImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ImportData, options: ImportOptions) => Promise<void>;
  currentPreferences: QBittorrentPreferences | null;
  currentWebUISettings: WebUISettings;
}

interface ImportOptions {
  importPreferences: boolean;
  importWebUISettings: boolean;
  overwriteConflicts: boolean;
  selectedConflicts: Array<string>;
}

export function SettingsImportDialog({
  open,
  onOpenChange,
  onImport,
  currentPreferences,
  currentWebUISettings,
}: SettingsImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportData | null>(null);
  const [conflicts, setConflicts] = useState<Array<ConflictItem>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'review' | 'conflicts'>('select');

  const [importOptions, setImportOptions] = useState<ImportOptions>({
    importPreferences: true,
    importWebUISettings: true,
    overwriteConflicts: false,
    selectedConflicts: [],
  });

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setFile(null);
      setImportData(null);
      setConflicts([]);
      setError(null);
      setStep('select');
      setImportOptions({
        importPreferences: true,
        importWebUISettings: true,
        overwriteConflicts: false,
        selectedConflicts: [],
      });
    }
  }, [open]);

  // Handle file selection
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setIsLoading(true);

    try {
      const text = await selectedFile.text();
      const data = JSON.parse(text) as ImportData;

      // Validate import data structure
      if (!data.preferences && !data.webUISettings) {
        throw new Error(
          'Invalid settings file: No preferences or WebUI settings found'
        );
      }

      // Check version compatibility
      if (data.version && data.version !== '1.0') {
        console.warn(
          `Settings file version ${data.version} may not be fully compatible`
        );
      }

      setImportData(data);

      // Detect conflicts
      const detectedConflicts = detectConflicts(data);
      setConflicts(detectedConflicts);

      setStep(detectedConflicts.length > 0 ? 'conflicts' : 'review');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to parse settings file';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Detect conflicts between current and import data
  const detectConflicts = (data: ImportData): Array<ConflictItem> => {
    const conflicts: Array<ConflictItem> = [];

    // Check preferences conflicts
    if (data.preferences && currentPreferences) {
      Object.entries(data.preferences).forEach(([key, value]) => {
        const currentValue =
          currentPreferences[key as keyof QBittorrentPreferences];
        if (currentValue !== undefined && currentValue !== value) {
          conflicts.push({
            key,
            currentValue,
            importValue: value,
            section: 'preferences',
            description: getPreferenceDescription(key),
          });
        }
      });
    }

    // Check WebUI settings conflicts
    if (data.webUISettings) {
      Object.entries(data.webUISettings).forEach(([key, value]) => {
        const currentValue = currentWebUISettings[key as keyof WebUISettings];
        if (currentValue !== undefined && currentValue !== value) {
          conflicts.push({
            key,
            currentValue,
            importValue: value,
            section: 'webUISettings',
            description: getWebUISettingDescription(key),
          });
        }
      });
    }

    return conflicts;
  };

  // Get human-readable description for preference keys
  const getPreferenceDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      save_path: 'Default save path',
      dl_limit: 'Download speed limit',
      up_limit: 'Upload speed limit',
      listen_port: 'Listening port',
      web_ui_port: 'Web UI port',
      max_connec: 'Maximum connections',
      max_connec_per_torrent: 'Maximum connections per torrent',
      dht: 'DHT enabled',
      pex: 'Peer Exchange enabled',
      lsd: 'Local Service Discovery enabled',
      // Add more as needed
    };
    return (
      descriptions[key] ||
      key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  // Get human-readable description for WebUI setting keys
  const getWebUISettingDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      theme: 'Theme',
      language: 'Language',
      compactMode: 'Compact mode',
      autoRefreshInterval: 'Auto refresh interval',
      confirmDeletion: 'Confirm deletion',
      showNotifications: 'Show notifications',
      // Add more as needed
    };
    return (
      descriptions[key] ||
      key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
    );
  };

  // Handle conflict selection
  const handleConflictToggle = (conflictKey: string, checked: boolean) => {
    setImportOptions((prev) => ({
      ...prev,
      selectedConflicts: checked
        ? [...prev.selectedConflicts, conflictKey]
        : prev.selectedConflicts.filter((k) => k !== conflictKey),
    }));
  };

  // Handle import
  const handleImport = async () => {
    if (!importData) return;

    setIsLoading(true);
    setError(null);

    try {
      // Filter data based on options and conflicts
      const filteredData: ImportData = {};

      if (importOptions.importPreferences && importData.preferences) {
        filteredData.preferences = { ...importData.preferences };

        // Remove conflicted items if not selected for overwrite
        if (!importOptions.overwriteConflicts) {
          conflicts
            .filter(
              (c) =>
                c.section === 'preferences' &&
                !importOptions.selectedConflicts.includes(c.key)
            )
            .forEach((c) => {
              delete filteredData.preferences![
                c.key as keyof QBittorrentPreferences
              ];
            });
        }
      }

      if (importOptions.importWebUISettings && importData.webUISettings) {
        filteredData.webUISettings = { ...importData.webUISettings };

        // Remove conflicted items if not selected for overwrite
        if (!importOptions.overwriteConflicts) {
          conflicts
            .filter(
              (c) =>
                c.section === 'webUISettings' &&
                !importOptions.selectedConflicts.includes(c.key)
            )
            .forEach((c) => {
              delete filteredData.webUISettings![c.key as keyof WebUISettings];
            });
        }
      }

      await onImport(filteredData, importOptions);
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to import settings';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Format value for display
  const formatValue = (value: any): string => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value || '(empty)';
    if (Array.isArray(value)) return value.join(', ');
    return JSON.stringify(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Settings
          </DialogTitle>
          <DialogDescription>
            Import qBittorrent preferences and WebUI settings from a JSON file.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'select' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="settings-file">Select Settings File</Label>
              <Input
                id="settings-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            {file && (
              <div className="text-muted-foreground text-sm">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        )}

        {step === 'review' && importData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">
                Settings file loaded successfully
              </span>
            </div>

            {importData.exportedAt && (
              <div className="text-muted-foreground text-sm">
                Exported: {new Date(importData.exportedAt).toLocaleString()}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-preferences"
                  checked={importOptions.importPreferences}
                  onCheckedChange={(checked) =>
                    setImportOptions((prev) => ({
                      ...prev,
                      importPreferences: !!checked,
                    }))
                  }
                  disabled={!importData.preferences}
                />
                <Label htmlFor="import-preferences">
                  Import qBittorrent Preferences
                  {importData.preferences && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(importData.preferences).length} settings
                    </Badge>
                  )}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="import-webui"
                  checked={importOptions.importWebUISettings}
                  onCheckedChange={(checked) =>
                    setImportOptions((prev) => ({
                      ...prev,
                      importWebUISettings: !!checked,
                    }))
                  }
                  disabled={!importData.webUISettings}
                />
                <Label htmlFor="import-webui">
                  Import WebUI Settings
                  {importData.webUISettings && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(importData.webUISettings).length} settings
                    </Badge>
                  )}
                </Label>
              </div>
            </div>
          </div>
        )}

        {step === 'conflicts' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Settings conflicts detected</span>
            </div>

            <div className="text-muted-foreground text-sm">
              The following settings have different values. Choose which ones to
              overwrite:
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overwrite-all"
                  checked={importOptions.overwriteConflicts}
                  onCheckedChange={(checked) =>
                    setImportOptions((prev) => ({
                      ...prev,
                      overwriteConflicts: !!checked,
                      selectedConflicts: checked
                        ? conflicts.map((c) => c.key)
                        : [],
                    }))
                  }
                />
                <Label htmlFor="overwrite-all" className="font-medium">
                  Overwrite all conflicts
                </Label>
              </div>

              <Separator />

              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {conflicts.map((conflict) => (
                    <div key={conflict.key} className="rounded-lg border p-3">
                      <div className="mb-2 flex items-center space-x-2">
                        <Checkbox
                          id={`conflict-${conflict.key}`}
                          checked={
                            importOptions.overwriteConflicts ||
                            importOptions.selectedConflicts.includes(
                              conflict.key
                            )
                          }
                          onCheckedChange={(checked) =>
                            handleConflictToggle(conflict.key, !!checked)
                          }
                          disabled={importOptions.overwriteConflicts}
                        />
                        <Label
                          htmlFor={`conflict-${conflict.key}`}
                          className="font-medium"
                        >
                          {conflict.description}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {conflict.section === 'preferences'
                            ? 'qBittorrent'
                            : 'WebUI'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Current:</div>
                          <div className="bg-muted rounded p-1 font-mono">
                            {formatValue(conflict.currentValue)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Import:</div>
                          <div className="bg-muted rounded p-1 font-mono">
                            {formatValue(conflict.importValue)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          {step === 'select' && (
            <Button disabled={!file || isLoading}>
              {isLoading ? 'Loading...' : 'Next'}
            </Button>
          )}

          {(step === 'review' || step === 'conflicts') && (
            <Button
              onClick={handleImport}
              disabled={
                isLoading ||
                (!importOptions.importPreferences &&
                  !importOptions.importWebUISettings)
              }
            >
              {isLoading ? 'Importing...' : 'Import Settings'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
