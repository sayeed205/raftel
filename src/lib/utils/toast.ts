import { toast } from 'sonner';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    toast.info(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      description: options?.description,
      duration: options?.duration,
    });
  },

  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },
};

// Specialized toast functions for common torrent actions
export const torrentToast = {
  actionSuccess: (action: string, count: number = 1) => {
    const itemText = count === 1 ? 'torrent' : `${count} torrents`;
    showToast.success(`${action} completed`, {
      description: `Successfully ${action.toLowerCase()}ed ${itemText}`,
    });
  },

  actionError: (action: string, error: string, retry?: () => void) => {
    showToast.error(`Failed to ${action.toLowerCase()}`, {
      description: error,
      action: retry
        ? {
            label: 'Retry',
            onClick: retry,
          }
        : undefined,
    });
  },

  deleteSuccess: (count: number = 1, withFiles: boolean = false) => {
    const itemText = count === 1 ? 'torrent' : `${count} torrents`;
    const filesText = withFiles ? ' and files' : '';
    showToast.success('Delete completed', {
      description: `Successfully deleted ${itemText}${filesText}`,
    });
  },

  bulkActionProgress: (action: string, completed: number, total: number) => {
    const progress = Math.round((completed / total) * 100);
    return showToast.loading(`${action} in progress`, {
      description: `${completed}/${total} completed (${progress}%)`,
    });
  },
};
