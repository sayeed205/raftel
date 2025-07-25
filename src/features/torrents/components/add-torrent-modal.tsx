import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import qbApi from '@/lib/api';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export function AddTorrentModal({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [adding, setAdding] = useState(false);
  const [magnet, setMagnet] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setAdding(true);
    try {
      await qbApi.addTorrents({ torrents: Array.from(files) });
      onAdded();
      onOpenChange(false);
    } catch (err: any) {
      toast.error('Failed to add torrent: ' + err.message);
      console.error('Failed to add torrent:', err);
    } finally {
      setAdding(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    setAdding(true);
    try {
      await qbApi.addTorrents({ torrents: Array.from(files) });
      onAdded();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to add torrent:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleMagnetAdd = async () => {
    if (!magnet.trim()) return;
    setAdding(true);
    try {
      await qbApi.addTorrents({ urls: magnet.trim() });
      setMagnet('');
      onAdded();
      onOpenChange(false);
    } catch (err: any) {
      toast.error('Failed to add magnet: ' + err.message);
      console.error('Failed to add magnet:', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Add Torrent</DialogTitle>
        </DialogHeader>
        <div
          className={`rounded border-2 border-dashed p-6 text-center transition-colors ${
            dragActive ? 'border-primary bg-muted' : 'border-muted'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={handleDrop}
        >
          <div className='mb-2'>Drag & drop .torrent files here</div>
          <div className='text-muted-foreground mb-2 text-xs'>or</div>
          <Button
            variant='outline'
            onClick={() => fileInputRef.current?.click()}
            disabled={adding}
          >
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type='file'
            accept='.torrent,application/x-bittorrent'
            multiple
            className='hidden'
            onChange={handleFileChange}
          />
        </div>
        <div className='mt-6'>
          <Input
            placeholder='Paste magnet link here'
            value={magnet}
            onChange={(e) => setMagnet(e.target.value)}
            disabled={adding}
          />
          <Button
            className='mt-2 w-full'
            onClick={handleMagnetAdd}
            disabled={adding || !magnet.trim()}
          >
            Add Magnet Link
          </Button>
        </div>
        <DialogFooter>
          <Button
            variant='secondary'
            onClick={() => onOpenChange(false)}
            disabled={adding}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
