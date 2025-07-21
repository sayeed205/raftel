export const QBIT_MAX_ETA = 8_640_000; // 100 days
export const INFINITY_SYMBOL = '∞';

export function formatEta(value: number, isForced: boolean = false): string {
  const MAX_UNITS = 2; // Will display 2 units max, from highest to lowest

  if (value >= QBIT_MAX_ETA || (isForced && value === 0)) {
    return INFINITY_SYMBOL;
  }

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const year = day * 365;

  const durations = [year, day, hour, minute, 1];
  const units = 'ydhms';

  let index = 0;
  let unitSize = 0;
  const parts = [];

  while (unitSize < MAX_UNITS && index !== durations.length) {
    const duration = durations[index];
    if (value < duration) {
      index++;
      continue;
    }

    const result = Math.floor(value / duration);
    parts.push(result + units[index]);

    value %= duration;
    index++;
    unitSize++;
  }

  if (!parts.length) {
    return '0' + units[durations.length - 1];
  }

  return parts.join(' ');
}

export function formatDuration(seconds: number): string {
  if (seconds === QBIT_MAX_ETA || seconds < 0) return INFINITY_SYMBOL;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export function formatDurationMs(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  return formatDuration(Math.floor(milliseconds / 1000));
}

export function formatTimeMs(value: number): string {
  return new Date(value).toLocaleString();
}

export function formatTimeSec(value: number): string {
  return formatTimeMs(value * 1000);
}

export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}
