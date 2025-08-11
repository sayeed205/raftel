import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { TorrentState } from '@/types/api';

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
