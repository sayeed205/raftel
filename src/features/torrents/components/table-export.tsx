import { useCallback, useState } from 'react';

import { Download, FileText } from 'lucide-react';

import type { TorrentInfo } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  formatBytes,
  formatProgress,
  formatRatio,
  formatSpeed,
  formatTime,
  getStateText,
} from '@/lib/utils';

interface TableExportProps {
  torrents: Array<TorrentInfo>;
  selectedTorrents: Array<string>;
}

type ExportFormat = 'csv' | 'json' | 'txt' | 'custom';

interface ExportField {
  key: string;
  label: string;
  selected: boolean;
  formatter?: (value: any, torrent: TorrentInfo) => string;
}

const DEFAULT_EXPORT_FIELDS: Array<ExportField> = [
  {
    key: 'name',
    label: 'Name',
    selected: true,
  },
  {
    key: 'size',
    label: 'Size',
    selected: true,
    formatter: (value) => formatBytes(value),
  },
  {
    key: 'progress',
    label: 'Progress',
    selected: true,
    formatter: (value) => formatProgress(value),
  },
  {
    key: 'state',
    label: 'Status',
    selected: true,
    formatter: (value) => getStateText(value),
  },
  {
    key: 'category',
    label: 'Category',
    selected: false,
  },
  {
    key: 'tags',
    label: 'Tags',
    selected: false,
  },
  {
    key: 'dlspeed',
    label: 'Download Speed',
    selected: false,
    formatter: (value) => formatSpeed(value),
  },
  {
    key: 'upspeed',
    label: 'Upload Speed',
    selected: false,
    formatter: (value) => formatSpeed(value),
  },
  {
    key: 'ratio',
    label: 'Ratio',
    selected: false,
    formatter: (value) => formatRatio(value),
  },
  {
    key: 'eta',
    label: 'ETA',
    selected: false,
    formatter: (value) => {
      const formatted = formatTime(value);
      return typeof formatted === 'string' ? formatted : 'N/A';
    },
  },
  {
    key: 'num_seeds',
    label: 'Seeds',
    selected: false,
  },
  {
    key: 'num_leechs',
    label: 'Peers',
    selected: false,
  },
  {
    key: 'priority',
    label: 'Priority',
    selected: false,
  },
  {
    key: 'added_on',
    label: 'Added Date',
    selected: false,
    formatter: (value) => (value ? new Date(value * 1000).toLocaleDateString() : ''),
  },
  {
    key: 'completed_on',
    label: 'Completed Date',
    selected: false,
    formatter: (value) => (value ? new Date(value * 1000).toLocaleDateString() : ''),
  },
  {
    key: 'hash',
    label: 'Hash',
    selected: false,
  },
];

export function TableExport({ torrents, selectedTorrents }: TableExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [fields, setFields] = useState<Array<ExportField>>(DEFAULT_EXPORT_FIELDS);
  const [exportSelected, setExportSelected] = useState(false);
  const [customTemplate, setCustomTemplate] = useState('{{name}} - {{size}} ({{progress}})');

  const torrentsToExport =
    exportSelected && selectedTorrents.length > 0
      ? torrents.filter((t) => selectedTorrents.includes(t.hash))
      : torrents;

  const selectedFields = fields.filter((field) => field.selected);

  const toggleField = useCallback((fieldKey: string) => {
    setFields((prev) =>
      prev.map((field) =>
        field.key === fieldKey ? { ...field, selected: !field.selected } : field,
      ),
    );
  }, []);

  const selectAllFields = useCallback(() => {
    setFields((prev) => prev.map((field) => ({ ...field, selected: true })));
  }, []);

  const deselectAllFields = useCallback(() => {
    setFields((prev) => prev.map((field) => ({ ...field, selected: false })));
  }, []);

  const getFieldValue = useCallback((torrent: TorrentInfo, field: ExportField): string => {
    const rawValue = torrent[field.key as keyof TorrentInfo];

    if (field.formatter) {
      return field.formatter(rawValue, torrent);
    }

    return String(rawValue || '');
  }, []);

  const generateCSV = useCallback((): string => {
    const headers = selectedFields.map((field) => field.label);
    const rows = torrentsToExport.map((torrent) =>
      selectedFields.map((field) => {
        const value = getFieldValue(torrent, field);
        // Escape CSV values that contain commas, quotes, or newlines
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }),
    );

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }, [selectedFields, torrentsToExport, getFieldValue]);

  const generateJSON = useCallback((): string => {
    const data = torrentsToExport.map((torrent) => {
      const obj: Record<string, string> = {};
      selectedFields.forEach((field) => {
        obj[field.key] = getFieldValue(torrent, field);
      });
      return obj;
    });

    return JSON.stringify(data, null, 2);
  }, [selectedFields, torrentsToExport, getFieldValue]);

  const generateTXT = useCallback((): string => {
    const lines = torrentsToExport.map((torrent) => {
      const values = selectedFields.map((field) => {
        const value = getFieldValue(torrent, field);
        return `${field.label}: ${value}`;
      });
      return values.join(' | ');
    });

    return lines.join('\n');
  }, [selectedFields, torrentsToExport, getFieldValue]);

  const generateCustom = useCallback((): string => {
    return torrentsToExport
      .map((torrent) => {
        let line = customTemplate;

        // Replace template variables
        fields.forEach((field) => {
          const placeholder = `{{${field.key}}}`;
          if (line.includes(placeholder)) {
            const value = getFieldValue(torrent, field);
            line = line.replace(new RegExp(placeholder, 'g'), value);
          }
        });

        return line;
      })
      .join('\n');
  }, [customTemplate, torrentsToExport, fields, getFieldValue]);

  const generateExport = useCallback((): string => {
    switch (format) {
      case 'csv':
        return generateCSV();
      case 'json':
        return generateJSON();
      case 'txt':
        return generateTXT();
      case 'custom':
        return generateCustom();
      default:
        return '';
    }
  }, [format, generateCSV, generateJSON, generateTXT, generateCustom]);

  const downloadExport = useCallback(() => {
    const content = generateExport();
    const blob = new Blob([content], { type: getContentType() });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = getFileName();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsOpen(false);
  }, [generateExport]);

  const getContentType = useCallback((): string => {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      case 'txt':
      case 'custom':
        return 'text/plain';
      default:
        return 'text/plain';
    }
  }, [format]);

  const getFileName = useCallback((): string => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const prefix = exportSelected ? 'selected-torrents' : 'all-torrents';

    switch (format) {
      case 'csv':
        return `${prefix}-${timestamp}.csv`;
      case 'json':
        return `${prefix}-${timestamp}.json`;
      case 'txt':
        return `${prefix}-${timestamp}.txt`;
      case 'custom':
        return `${prefix}-${timestamp}.txt`;
      default:
        return `${prefix}-${timestamp}.txt`;
    }
  }, [format, exportSelected]);

  const copyToClipboard = useCallback(async () => {
    const content = generateExport();
    try {
      await navigator.clipboard.writeText(content);
      // You might want to show a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [generateExport]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Download className='mr-2 h-4 w-4' />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Export Torrent Data</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Export Options */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label className='text-sm font-medium'>Export Format</Label>
              <Select value={format} onValueChange={(value: ExportFormat) => setFormat(value)}>
                <SelectTrigger className='mt-2'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='csv'>CSV (Comma Separated)</SelectItem>
                  <SelectItem value='json'>JSON</SelectItem>
                  <SelectItem value='txt'>Text (Pipe Separated)</SelectItem>
                  <SelectItem value='custom'>Custom Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className='text-sm font-medium'>Export Scope</Label>
              <div className='mt-2 space-y-2'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    checked={!exportSelected}
                    onCheckedChange={() => setExportSelected(false)}
                  />
                  <span className='text-sm'>All torrents ({torrents.length})</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    checked={exportSelected}
                    onCheckedChange={() => setExportSelected(true)}
                    disabled={selectedTorrents.length === 0}
                  />
                  <span className='text-sm'>Selected torrents ({selectedTorrents.length})</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Custom Template */}
          {format === 'custom' && (
            <div>
              <Label className='text-sm font-medium'>Custom Template</Label>
              <Textarea
                value={customTemplate}
                onChange={(e) => setCustomTemplate(e.target.value)}
                placeholder='Use {{fieldName}} placeholders, e.g., {{name}} - {{size}} ({{progress}})'
                className='mt-2 h-20'
              />
              <div className='text-muted-foreground mt-1 text-xs'>
                Available placeholders: {fields.map((f) => `{{${f.key}}}`).join(', ')}
              </div>
            </div>
          )}

          {/* Field Selection */}
          {format !== 'custom' && (
            <div>
              <div className='mb-3 flex items-center justify-between'>
                <Label className='text-sm font-medium'>Fields to Export</Label>
                <div className='flex gap-2'>
                  <Button variant='ghost' size='sm' onClick={selectAllFields}>
                    Select All
                  </Button>
                  <Button variant='ghost' size='sm' onClick={deselectAllFields}>
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className='grid max-h-60 grid-cols-2 gap-2 overflow-y-auto'>
                {fields.map((field) => (
                  <div key={field.key} className='flex items-center space-x-2'>
                    <Checkbox
                      checked={field.selected}
                      onCheckedChange={() => toggleField(field.key)}
                    />
                    <span className='text-sm'>{field.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Preview */}
          <div>
            <Label className='text-sm font-medium'>Preview</Label>
            <div className='bg-muted mt-2 rounded-md p-3'>
              <div className='text-muted-foreground mb-2 text-xs'>
                {torrentsToExport.length} torrents • {selectedFields.length} fields •{' '}
                {format.toUpperCase()} format
              </div>
              <pre className='max-h-32 overflow-x-auto overflow-y-auto text-xs whitespace-pre-wrap'>
                {generateExport().split('\n').slice(0, 5).join('\n')}
                {torrentsToExport.length > 5 && '\n...'}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className='flex justify-between'>
            <Button variant='outline' onClick={copyToClipboard}>
              <FileText className='mr-2 h-4 w-4' />
              Copy to Clipboard
            </Button>

            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={downloadExport}>
                <Download className='mr-2 h-4 w-4' />
                Download {format.toUpperCase()}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
