import { AlertTriangle, Trash2 } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  icon?: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon,
  onConfirm,
  isLoading = false,
  children,
}: ConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = React.useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    if (!isConfirming) {
      onOpenChange(false);
    }
  };

  // Default icon based on variant
  const defaultIcon =
    variant === 'destructive' ? (
      <AlertTriangle className='text-destructive h-6 w-6' />
    ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md' showCloseButton={!isConfirming}>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            {icon || defaultIcon}
            <DialogTitle
              className={cn(variant === 'destructive' && 'text-destructive')}
            >
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className='text-left'>
            {description}
          </DialogDescription>
        </DialogHeader>

        {children && <div className='py-4'>{children}</div>}

        <DialogFooter className='flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button
            variant='outline'
            onClick={handleCancel}
            disabled={isConfirming}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isConfirming || isLoading}
          >
            {isConfirming ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Specialized delete confirmation dialog
interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName?: string;
  itemCount?: number;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  deleteFiles?: boolean;
  onDeleteFilesChange?: (deleteFiles: boolean) => void;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  itemName,
  itemCount = 1,
  onConfirm,
  isLoading = false,
  deleteFiles = false,
  onDeleteFilesChange,
}: DeleteConfirmationDialogProps) {
  const isMultiple = itemCount > 1;
  const itemText = isMultiple ? `${itemCount} torrents` : itemName || 'torrent';

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${itemText}?`}
      description={
        isMultiple
          ? `Are you sure you want to delete ${itemCount} torrents? This action cannot be undone.`
          : `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
      }
      confirmText='Delete'
      cancelText='Cancel'
      variant='destructive'
      icon={<Trash2 className='text-destructive h-6 w-6' />}
      onConfirm={onConfirm}
      isLoading={isLoading}
    >
      {onDeleteFilesChange && (
        <div className='flex items-center space-x-2'>
          <input
            type='checkbox'
            id='delete-files'
            checked={deleteFiles}
            onChange={(e) => onDeleteFilesChange(e.target.checked)}
            className='text-destructive focus:ring-destructive h-4 w-4 rounded border-gray-300'
          />
          <label htmlFor='delete-files' className='text-sm font-medium'>
            Also delete files from disk
          </label>
        </div>
      )}
    </ConfirmationDialog>
  );
}

// Bulk action confirmation dialog
interface BulkActionConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: string;
  itemCount: number;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function BulkActionConfirmationDialog({
  open,
  onOpenChange,
  action,
  itemCount,
  onConfirm,
  isLoading = false,
}: BulkActionConfirmationDialogProps) {
  const actionText = action.toLowerCase();
  const isDestructive = ['delete', 'remove'].includes(actionText);

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${action} ${itemCount} torrents?`}
      description={`Are you sure you want to ${actionText} ${itemCount} selected torrents?`}
      confirmText={action}
      cancelText='Cancel'
      variant={isDestructive ? 'destructive' : 'default'}
      icon={
        isDestructive ? (
          <AlertTriangle className='text-destructive h-6 w-6' />
        ) : undefined
      }
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
