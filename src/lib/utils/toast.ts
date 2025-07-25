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

// Progress tracking for long-running operations
export class ProgressToast {
  private toastId: string | number;
  private total: number;
  private completed = 0;
  private action: string;

  constructor(action: string, total: number) {
    this.action = action;
    this.total = total;
    this.toastId = showToast.loading(`${action} starting...`, {
      description: `0/${total} completed (0%)`,
    });
  }

  update(completed: number, message?: string) {
    this.completed = completed;
    const progress = Math.round((completed / this.total) * 100);

    toast.loading(message || `${this.action} in progress`, {
      id: this.toastId,
      description: `${completed}/${this.total} completed (${progress}%)`,
    });
  }

  success(message?: string) {
    toast.success(message || `${this.action} completed`, {
      id: this.toastId,
      description: `Successfully processed ${this.total} items`,
    });
  }

  error(error: string, retry?: () => void) {
    toast.error(`${this.action} failed`, {
      id: this.toastId,
      description: error,
      action: retry
        ? {
            label: 'Retry',
            onClick: retry,
          }
        : undefined,
    });
  }

  dismiss() {
    toast.dismiss(this.toastId);
  }
}

// Specialized toast functions for common torrent actions
export const torrentToast = {
  actionSuccess: (action: string, count: number = 1) => {
    const itemText = count === 1 ? 'torrent' : `${count} torrents`;
    const actionText = action.charAt(0).toUpperCase() + action.slice(1);
    showToast.success(`${actionText} completed`, {
      description: `Successfully ${action.toLowerCase()}ed ${itemText}`,
      duration: 3000,
    });
  },

  actionError: (action: string, error: string, retry?: () => void) => {
    showToast.error(`Failed to ${action.toLowerCase()}`, {
      description: error,
      duration: 5000,
      action: retry
        ? {
            label: 'Retry',
            onClick: retry,
          }
        : undefined,
    });
  },

  actionStarted: (action: string, count: number = 1) => {
    const itemText = count === 1 ? 'torrent' : `${count} torrents`;
    const actionText = action.charAt(0).toUpperCase() + action.slice(1);
    return showToast.loading(`${actionText}ing ${itemText}...`, {
      description: 'Please wait while the operation completes',
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

  // Connection and sync notifications
  connectionError: (retry?: () => void) => {
    showToast.error('Connection failed', {
      description: 'Unable to connect to qBittorrent server',
      action: retry
        ? {
            label: 'Retry',
            onClick: retry,
          }
        : undefined,
    });
  },

  syncSuccess: () => {
    showToast.success('Sync completed', {
      description: 'Torrent data updated successfully',
      duration: 2000, // Shorter duration for frequent sync notifications
    });
  },

  syncError: (error: string, retry?: () => void) => {
    showToast.error('Sync failed', {
      description: error,
      action: retry
        ? {
            label: 'Retry',
            onClick: retry,
          }
        : undefined,
    });
  },

  // Upload/download notifications
  uploadProgress: (filename: string, progress: number) => {
    return showToast.loading(`Uploading ${filename}`, {
      description: `${progress}% completed`,
    });
  },

  uploadSuccess: (filename: string) => {
    showToast.success('Upload completed', {
      description: `${filename} uploaded successfully`,
    });
  },

  uploadError: (filename: string, error: string, retry?: () => void) => {
    showToast.error('Upload failed', {
      description: `Failed to upload ${filename}: ${error}`,
      action: retry
        ? {
            label: 'Retry',
            onClick: retry,
          }
        : undefined,
    });
  },

  // Settings notifications
  settingsSaved: () => {
    showToast.success('Settings saved', {
      description: 'Your preferences have been updated',
    });
  },

  settingsError: (error: string) => {
    showToast.error('Failed to save settings', {
      description: error,
    });
  },
};
