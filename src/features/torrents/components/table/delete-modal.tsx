import { useState } from 'react';
import type { TorrentInfo } from '@/types/api';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTorrentStore } from '@/stores/torrent-store';

type DeleteProps = {
  torrent: TorrentInfo;
  isOpen: boolean;
  showActionToggle: (open: boolean) => void;
};

export default function DeleteDialog({
  torrent,
  isOpen,
  showActionToggle,
}: DeleteProps) {
  const { deleteTorrents } = useTorrentStore();
  const [deleteFiles, setDeleteFiles] = useState(true);

  const handleDelete = () => {
    deleteTorrents([torrent.hash], deleteFiles);
    showActionToggle(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={showActionToggle}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. You are about to delete Torrent{' '}
            <b>{torrent.name}</b>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='my-2 flex items-center gap-2'>
          <Checkbox
            id='delete-files-checkbox'
            checked={deleteFiles}
            onCheckedChange={(checked) => {
              setDeleteFiles(!!checked);
            }}
          />
          <label htmlFor='delete-files-checkbox'>
            Also delete downloaded files
          </label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant='destructive' onClick={handleDelete}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
