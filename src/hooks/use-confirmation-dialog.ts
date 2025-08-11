import { useCallback, useState } from 'react';

export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  icon?: React.ReactNode;
}

export interface DeleteConfirmationOptions {
  itemName?: string;
  itemCount?: number;
  deleteFiles?: boolean;
  onDeleteFilesChange?: (deleteFiles: boolean) => void;
}

export interface BulkActionConfirmationOptions {
  action: string;
  itemCount: number;
}

/**
 * Hook for managing confirmation dialogs
 * Provides state management and actions for different types of confirmation dialogs
 */
export function useConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void | Promise<void>) | null>(null);

  // Generic confirmation dialog state
  const [confirmationOptions, setConfirmationOptions] = useState<ConfirmationOptions | null>(null);

  // Delete confirmation dialog state
  const [deleteOptions, setDeleteOptions] = useState<DeleteConfirmationOptions | null>(null);

  // Bulk action confirmation dialog state
  const [bulkActionOptions, setBulkActionOptions] = useState<BulkActionConfirmationOptions | null>(
    null,
  );

  // Open generic confirmation dialog
  const openConfirmation = useCallback(
    (options: ConfirmationOptions, onConfirm: () => void | Promise<void>) => {
      setConfirmationOptions(options);
      setConfirmAction(() => onConfirm);
      setDeleteOptions(null);
      setBulkActionOptions(null);
      setIsOpen(true);
    },
    [],
  );

  // Open delete confirmation dialog
  const openDeleteConfirmation = useCallback(
    (options: DeleteConfirmationOptions, onConfirm: () => void | Promise<void>) => {
      setDeleteOptions(options);
      setConfirmAction(() => onConfirm);
      setConfirmationOptions(null);
      setBulkActionOptions(null);
      setIsOpen(true);
    },
    [],
  );

  // Open bulk action confirmation dialog
  const openBulkActionConfirmation = useCallback(
    (options: BulkActionConfirmationOptions, onConfirm: () => void | Promise<void>) => {
      setBulkActionOptions(options);
      setConfirmAction(() => onConfirm);
      setConfirmationOptions(null);
      setDeleteOptions(null);
      setIsOpen(true);
    },
    [],
  );

  // Handle confirmation
  const handleConfirm = useCallback(async () => {
    if (!confirmAction) return;

    setIsLoading(true);
    try {
      await confirmAction();
      setIsOpen(false);
    } catch (error) {
      console.error('Confirmation action failed:', error);
      // Keep dialog open on error so user can retry or cancel
    } finally {
      setIsLoading(false);
    }
  }, [confirmAction]);

  // Handle cancel/close
  const handleCancel = useCallback(() => {
    if (!isLoading) {
      setIsOpen(false);
      setConfirmAction(null);
      setConfirmationOptions(null);
      setDeleteOptions(null);
      setBulkActionOptions(null);
    }
  }, [isLoading]);

  // Reset all state
  const reset = useCallback(() => {
    setIsOpen(false);
    setIsLoading(false);
    setConfirmAction(null);
    setConfirmationOptions(null);
    setDeleteOptions(null);
    setBulkActionOptions(null);
  }, []);

  return {
    // State
    isOpen,
    isLoading,
    confirmationOptions,
    deleteOptions,
    bulkActionOptions,

    // Actions
    openConfirmation,
    openDeleteConfirmation,
    openBulkActionConfirmation,
    handleConfirm,
    handleCancel,
    reset,

    // Convenience methods for common actions
    confirmDelete: (itemName: string, onConfirm: () => void | Promise<void>) => {
      openDeleteConfirmation({ itemName, itemCount: 1 }, onConfirm);
    },

    confirmBulkDelete: (itemCount: number, onConfirm: () => void | Promise<void>) => {
      openDeleteConfirmation({ itemCount }, onConfirm);
    },

    confirmAction: (action: string, description: string, onConfirm: () => void | Promise<void>) => {
      openConfirmation(
        {
          title: `${action}?`,
          description,
          confirmText: action,
          variant: 'default',
        },
        onConfirm,
      );
    },

    confirmDestructiveAction: (
      action: string,
      description: string,
      onConfirm: () => void | Promise<void>,
    ) => {
      openConfirmation(
        {
          title: `${action}?`,
          description,
          confirmText: action,
          variant: 'destructive',
        },
        onConfirm,
      );
    },
  };
}

/**
 * Hook for managing multiple confirmation dialogs
 * Useful when you need different types of confirmations in the same component
 */
export function useMultipleConfirmationDialogs() {
  const deleteDialog = useConfirmationDialog();
  const actionDialog = useConfirmationDialog();
  const bulkActionDialog = useConfirmationDialog();

  return {
    delete: deleteDialog,
    action: actionDialog,
    bulkAction: bulkActionDialog,

    // Close all dialogs
    closeAll: () => {
      deleteDialog.reset();
      actionDialog.reset();
      bulkActionDialog.reset();
    },
  };
}
