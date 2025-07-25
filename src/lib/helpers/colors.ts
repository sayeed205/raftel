import type { TorrentState } from '@/types/api';

function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // ensure non-negative integer
}

export function getColorFromName(name: string): string {
  const hash = djb2Hash(name);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export function getRatioColor(ratio: number): string {
  if (ratio < 0.5) return 'text-red-500';
  if (ratio < 1) return 'text-yellow-500';
  if (ratio < 5) return 'text-green-500';
  return 'text-blue-500';
}

export function getTorrentStateColor(state: TorrentState): string {
  switch (state) {
    case 'downloading':
      return 'bg-green-500';
    case 'metaDL':
    case 'forcedDL':
      return 'bg-blue-500';
    case 'uploading':
    case 'forcedUP':
      return 'bg-teal-500';
    case 'pausedDL':
    case 'pausedUP':
      return 'bg-gray-500';
    case 'error':
    case 'missingFiles':
      return 'bg-red-500';
    case 'queuedDL':
    case 'queuedUP':
      return 'bg-yellow-500';
    case 'checkingDL':
    case 'checkingUP':
    case 'checkingResumeData':
      return 'bg-orange-500';
    case 'stalledDL':
    case 'stalledUP':
      return 'bg-yellow-500';
    case 'stoppedDL':
    case 'allocating':
      return 'bg-stone-800';
    case 'moving':
      return 'bg-indigo-500';
    default:
      return 'bg-gray-400';
  }
}

export function getProgressColor(progress: number): string {
  if (progress >= 1) return 'bg-green-500';
  if (progress >= 0.8) return 'bg-blue-500';
  if (progress >= 0.5) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function getHealthColor(seeds: number, peers: number): string {
  const total = seeds + peers;
  if (total >= 10) return 'text-green-500';
  if (total >= 5) return 'text-yellow-500';
  if (total >= 1) return 'text-orange-500';
  return 'text-red-500';
}
