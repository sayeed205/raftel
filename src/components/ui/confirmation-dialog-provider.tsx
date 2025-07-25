import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import * as React from 'react';
import {
  BulkActionConfirmationDialog,
  ConfirmationDialog,
  DeleteConfirmationDialog,
} from './confirmation-dialog';

interface ConfirmationDialogProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that renders confirmation dialogs based on hook state
 * Use this with the useConfirmationDialog hook for a complete confirmation system
 */
export function ConfirmationDialogProvider({
  children,
}: ConfirmationDialogProviderProps) {
  const {
    isOpen,
    isLoading,
    confirmationOptions,
    deleteOptions,
    bulkActionOptions,
    handleConfirm,
    handleCancel,
  } = useConfirmationDialog();

  return (
    <>
      {children}

      {/* Generic confirmation dialog */}
      {confirmationOptions && (
        <ConfirmationDialog
          open={isOpen}
          onOpenChange={handleCancel}
          title={confirmationOptions.title}
          description={confirmationOptions.description}
          confirmText={confirmationOptions.confirmText}
          cancelText={confirmationOptions.cancelText}
          variant={confirmationOptions.variant}
          icon={confirmationOptions.icon}
          onConfirm={handleConfirm}
          isLoading={isLoading}
        />
      )}

      {/* Delete confirmation dialog */}
      {deleteOptions && (
        <DeleteConfirmationDialog
          open={isOpen}
          onOpenChange={handleCancel}
          itemName={deleteOptions.itemName}
          itemCount={deleteOptions.itemCount}
          onConfirm={handleConfirm}
          isLoading={isLoading}
          deleteFiles={deleteOptions.deleteFiles}
          onDeleteFilesChange={deleteOptions.onDeleteFilesChange}
        />
      )}

      {/* Bulk action confirmation dialog */}
      {bulkActionOptions && (
        <BulkActionConfirmationDialog
          open={isOpen}
          onOpenChange={handleCancel}
          action={bulkActionOptions.action}
          itemCount={bulkActionOptions.itemCount}
          onConfirm={handleConfirm}
          isLoading={isLoading}
        />
      )}
    </>
  );
}

/**
 * Standalone confirmation dialogs component
 * Use this when you want to manage dialog state manually
 */
interface ConfirmationDialogsProps {
  // Generic confirmation dialog
  confirmationDialog?: {
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
  };

  // Delete confirmation dialog
  deleteDialog?: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemName?: string;
    itemCount?: number;
    onConfirm: () => void | Promise<void>;
    isLoading?: boolean;
    deleteFiles?: boolean;
    onDeleteFilesChange?: (deleteFiles: boolean) => void;
  };

  // Bulk action confirmation dialog
  bulkActionDialog?: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    action: string;
    itemCount: number;
    onConfirm: () => void | Promise<void>;
    isLoading?: boolean;
  };
}

export function ConfirmationDialogs({
  confirmationDialog,
  deleteDialog,
  bulkActionDialog,
}: ConfirmationDialogsProps) {
  return (
    <>
      {confirmationDialog && (
        <ConfirmationDialog
          open={confirmationDialog.open}
          onOpenChange={confirmationDialog.onOpenChange}
          title={confirmationDialog.title}
          description={confirmationDialog.description}
          confirmText={confirmationDialog.confirmText}
          cancelText={confirmationDialog.cancelText}
          variant={confirmationDialog.variant}
          icon={confirmationDialog.icon}
          onConfirm={confirmationDialog.onConfirm}
          isLoading={confirmationDialog.isLoading}
        />
      )}

      {deleteDialog && (
        <DeleteConfirmationDialog
          open={deleteDialog.open}
          onOpenChange={deleteDialog.onOpenChange}
          itemName={deleteDialog.itemName}
          itemCount={deleteDialog.itemCount}
          onConfirm={deleteDialog.onConfirm}
          isLoading={deleteDialog.isLoading}
          deleteFiles={deleteDialog.deleteFiles}
          onDeleteFilesChange={deleteDialog.onDeleteFilesChange}
        />
      )}

      {bulkActionDialog && (
        <BulkActionConfirmationDialog
          open={bulkActionDialog.open}
          onOpenChange={bulkActionDialog.onOpenChange}
          action={bulkActionDialog.action}
          itemCount={bulkActionDialog.itemCount}
          onConfirm={bulkActionDialog.onConfirm}
          isLoading={bulkActionDialog.isLoading}
        />
      )}
    </>
  );
}
