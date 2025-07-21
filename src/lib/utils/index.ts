import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ClassValue } from 'clsx';
import type { TorrentState } from '@/types/api.ts';

export * from '../helpers';

export { getTorrentStateColor as getStateColor } from '../helpers/colors';
export { formatData as formatBytes } from '../helpers/data';
export { formatDuration as formatTime } from '../helpers/datetime';
export {
  formatPercent as formatProgress,
  formatRatio,
} from '../helpers/number';
export { formatSpeed } from '../helpers/speed';

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export function getStateText(state: TorrentState): string {
  const states: Record<TorrentState, string> = {
    error: 'Error',
    missingFiles: 'Missing Files',
    uploading: 'Uploading',
    pausedUP: 'Paused',
    queuedUP: 'Queued',
    stalledUP: 'Stalled',
    checkingUP: 'Checking',
    forcedUP: 'Forced Upload',
    allocating: 'Allocating',
    downloading: 'Downloading',
    metaDL: 'Downloading Metadata',
    pausedDL: 'Paused',
    queuedDL: 'Queued',
    stalledDL: 'Stalled',
    stoppedDL: 'Stopped',
    checkingDL: 'Checking',
    forcedDL: 'Forced Download',
    checkingResumeData: 'Checking Resume Data',
    moving: 'Moving',
    unknown: 'Unknown',
  };
  return states[state] || 'Unknown';
}

export function getConnectionIcon(status: string): string {
  switch (status) {
    case 'connected':
      return '🟢';
    case 'firewalled':
      return '🟡';
    case 'disconnected':
      return '🔴';
    default:
      return '⚪';
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export function debounce<T extends (...args: Array<any>) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

export function throttle<T extends (...args: Array<any>) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
