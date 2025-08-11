import { Download, FileText, Settings } from 'lucide-react';
import React, { useState } from 'react';

import type { WebUISettings } from '@/stores/settings-store';
import type { QBittorrentPreferences } from '@/types/api';
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
import { Textarea } from '@/components/ui/textarea';


interface SettingsExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: QBittorrentPreferences | null;
  webUISettings: WebUISettings;
}

interface ExportOptions {
  includePreferences: boolean;
  includeWebUISettings: boolean;
  includeMetadata: boolean;
  filename: string;
  format: 'download' | 'copy';
}

export function SettingsExportDialog({
  open,
  onOpenChange,
  preferences,
  webUISettings,
}: SettingsExportDialogProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includePreferences: true,
    includeWebUISettings: true,
    includeMetadata: true,
    filename: `qbittorrent-settings-${new Date().toISOString().split('T')[0]}`,
    format: 'download',
  });

  const [exportedData, setExportedData] = useState<string>('');
  const [step, setStep] = useState<'options' | 'preview'>('options');

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setStep('options');
      setExportedData('');
      setExportOptions({
        includePreferences: true,
        includeWebUISettings: true,
        includeMetadata: true,
        filename: `qbittorrent-settings-${new Date().toISOString().split('T')[0]}`,
        format: 'download',
      });
    }
  }, [open]);

  // Generate export data
  const generateExportData = () => {
    const exportData: any = {};

    if (exportOptions.includePreferences && preferences) {
      exportData.preferences = preferences;
    }

    if (exportOptions.includeWebUISettings) {
      exportData.webUISettings = webUISettings;
    }

    if (exportOptions.includeMetadata) {
      exportData.exportedAt = new Date().toISOString();
      exportData.version = '1.0';
      exportData.exportedBy = 'Raftel qBittorrent WebUI';
    }

    return JSON.stringify(exportData, null, 2);
  };

  // Handle preview generation
  const handlePreview = () => {
    const data = generateExportData();
    setExportedData(data);
    setStep('preview');
  };

  // Handle export
  const handleExport = () => {
    const data = exportedData || generateExportData();

    if (exportOptions.format === 'download') {
      // Download as file
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportOptions.filename}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(data).then(() => {
        // Could show a toast notification here
        console.log('Settings copied to clipboard');
      });
    }

    onOpenChange(false);
  };

  // Count settings to be exported
  const getSettingsCount = () => {
    let count = 0;
    if (exportOptions.includePreferences && preferences) {
      count += Object.keys(preferences).length;
    }
    if (exportOptions.includeWebUISettings) {
      count += Object.keys(webUISettings).length;
    }
    return count;
  };

  // Get export data size estimate
  const getDataSize = () => {
    const data = generateExportData();
    return (new Blob([data]).size / 1024).toFixed(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Download className='h-5 w-5' />
            Export Settings
          </DialogTitle>
          <DialogDescription>
            Export your qBittorrent preferences and WebUI settings to a JSON
            file.
          </DialogDescription>
        </DialogHeader>

        {step === 'options' && (
          <div className='space-y-6'>
            {/* What to export */}
            <div className='space-y-3'>
              <Label className='text-base font-medium'>What to export</Label>

              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='include-preferences'
                    checked={exportOptions.includePreferences}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includePreferences: !!checked,
                      }))
                    }
                    disabled={!preferences}
                  />
                  <Label
                    htmlFor='include-preferences'
                    className='flex items-center gap-2'
                  >
                    <Settings className='h-4 w-4' />
                    qBittorrent Preferences
                    {preferences && (
                      <Badge variant='secondary'>
                        {Object.keys(preferences).length} settings
                      </Badge>
                    )}
                  </Label>
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='include-webui'
                    checked={exportOptions.includeWebUISettings}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeWebUISettings: !!checked,
                      }))
                    }
                  />
                  <Label
                    htmlFor='include-webui'
                    className='flex items-center gap-2'
                  >
                    <FileText className='h-4 w-4' />
                    WebUI Settings
                    <Badge variant='secondary'>
                      {Object.keys(webUISettings).length} settings
                    </Badge>
                  </Label>
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='include-metadata'
                    checked={exportOptions.includeMetadata}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeMetadata: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor='include-metadata'>
                    Include metadata (export date, version)
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Export format */}
            <div className='space-y-3'>
              <Label className='text-base font-medium'>Export format</Label>

              <div className='space-y-2'>
                <div className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    id='format-download'
                    name='format'
                    checked={exportOptions.format === 'download'}
                    onChange={() =>
                      setExportOptions((prev) => ({
                        ...prev,
                        format: 'download',
                      }))
                    }
                  />
                  <Label htmlFor='format-download'>Download as file</Label>
                </div>

                <div className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    id='format-copy'
                    name='format'
                    checked={exportOptions.format === 'copy'}
                    onChange={() =>
                      setExportOptions((prev) => ({ ...prev, format: 'copy' }))
                    }
                  />
                  <Label htmlFor='format-copy'>Copy to clipboard</Label>
                </div>
              </div>
            </div>

            {/* Filename */}
            {exportOptions.format === 'download' && (
              <>
                <Separator />
                <div className='space-y-2'>
                  <Label htmlFor='filename'>Filename</Label>
                  <div className='flex items-center space-x-2'>
                    <Input
                      id='filename'
                      value={exportOptions.filename}
                      onChange={(e) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          filename: e.target.value,
                        }))
                      }
                      placeholder='Enter filename'
                    />
                    <span className='text-muted-foreground text-sm'>.json</span>
                  </div>
                </div>
              </>
            )}

            {/* Summary */}
            <div className='bg-muted/50 rounded-lg p-4'>
              <div className='space-y-1 text-sm'>
                <div className='font-medium'>Export Summary</div>
                <div>Settings to export: {getSettingsCount()}</div>
                <div>Estimated size: {getDataSize()} KB</div>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-base font-medium'>Export Preview</Label>
              <Badge variant='outline'>
                {exportedData.split('\n').length} lines,{' '}
                {(new Blob([exportedData]).size / 1024).toFixed(1)} KB
              </Badge>
            </div>

            <Textarea
              value={exportedData}
              readOnly
              className='h-64 resize-none font-mono text-xs'
              placeholder='Export data will appear here...'
            />

            <div className='text-muted-foreground text-xs'>
              This is a preview of the data that will be exported. You can
              review it before proceeding.
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          {step === 'options' && (
            <>
              <Button
                variant='outline'
                onClick={handlePreview}
                disabled={
                  !exportOptions.includePreferences &&
                  !exportOptions.includeWebUISettings
                }
              >
                Preview
              </Button>
              <Button
                onClick={handleExport}
                disabled={
                  !exportOptions.includePreferences &&
                  !exportOptions.includeWebUISettings
                }
              >
                {exportOptions.format === 'download' ? 'Download' : 'Copy'}
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button variant='outline' onClick={() => setStep('options')}>
                Back
              </Button>
              <Button onClick={handleExport}>
                {exportOptions.format === 'download' ? 'Download' : 'Copy'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
