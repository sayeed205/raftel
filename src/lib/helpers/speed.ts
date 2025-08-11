import { formatDataUnit, formatDataValue } from './data';

export function formatSpeedValue(speed: number, isBits: boolean = false): string {
  if (isBits) speed *= 8;
  return formatDataValue(speed, false);
}

export function formatSpeedUnit(speed: number, isBits: boolean = false): string {
  if (isBits) speed *= 8;
  const unit = formatDataUnit(speed, false).slice(0, -1);
  return `${unit}${isBits ? 'bps' : 'B/s'}`;
}

export function formatSpeed(speed: number, isBits: boolean = false): string {
  if (speed === 0) return '0 B/s';
  return `${formatSpeedValue(speed, isBits)} ${formatSpeedUnit(speed, isBits)}`;
}
