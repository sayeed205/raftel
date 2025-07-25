import { useCallback, useState } from 'react';

export interface ConfirmationState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function useConfirmationDialog() {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const showConfirmation = useCallback(
    (config: Omit<ConfirmationState, 'isOpen'>) => {
      setState({
        ...config,
        isOpen: true,
      });
    },
    [],
  );

  const hideConfirmation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({
      ...prev,
      isLoading: loading,
    }));
  }, []);

  return {
    confirmationState: state,
    showConfirmation,
    hideConfirmation,
    setLoading,
  };
}

// Specialized hook for delete confirmations
export interface DeleteConfirmationState {
  isOpen: boolean;
  itemName?: string;
  itemCount: number;
  deleteFiles: boolean;
  onConfirm: (deleteFiles: boolean) => void | Promise<void>;
  isLoading?: boolean;
}

export function useDeleteConfirmation() {
  const [state, setState] = useState<DeleteConfirmationState>({
    isOpen: false,
    itemCount: 1,
    deleteFiles: false,
    onConfirm: () => {},
  });

  const showDeleteConfirmation = useCallback(
    (config: Omit<DeleteConfirmationState, 'isOpen' | 'deleteFiles'>) => {
      setState({
        ...config,
        deleteFiles: false,
        isOpen: true,
      });
    },
    [],
  );

  const hideDeleteConfirmation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const setDeleteFiles = useCallback((deleteFiles: boolean) => {
    setState((prev) => ({
      ...prev,
      deleteFiles,
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({
      ...prev,
      isLoading: loading,
    }));
  }, []);

  return {
    deleteState: state,
    showDeleteConfirmation,
    hideDeleteConfirmation,
    setDeleteFiles,
    setLoading,
  };
}

// Specialized hook for bulk action confirmations
export interface BulkActionConfirmationState {
  isOpen: boolean;
  action: string;
  itemCount: number;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function useBulkActionConfirmation() {
  const [state, setState] = useState<BulkActionConfirmationState>({
    isOpen: false,
    action: '',
    itemCount: 0,
    onConfirm: () => {},
  });

  const showBulkConfirmation = useCallback(
    (config: Omit<BulkActionConfirmationState, 'isOpen'>) => {
      setState({
        ...config,
        isOpen: true,
      });
    },
    [],
  );

  const hideBulkConfirmation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({
      ...prev,
      isLoading: loading,
    }));
  }, []);

  return {
    bulkState: state,
    showBulkConfirmation,
    hideBulkConfirmation,
    setLoading,
  };
}
