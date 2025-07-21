import { toPrecision } from './number';

const units = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

export function formatDataValue(
  data: number,
  isBinary: boolean,
  precision?: number,
): string {
  const base = isBinary ? 1024 : 1000;
  if (!data || data === 0) return '0';

  let i = 1;
  while (data >= base ** i && i < units.length) {
    i++;
  }
  return toPrecision(data / base ** (i - 1), precision ?? (i > 1 ? 3 : 1));
}

export function formatDataUnit(data: number, isBinary: boolean): string {
  const base = isBinary ? 1024 : 1000;

  let i = 1;
  while (data >= base ** i && i < units.length) {
    i++;
  }
  return `${units[i - 1]}${isBinary && i > 1 ? 'i' : ''}B`;
}

export function formatData(
  data: number,
  isBinary: boolean = true,
  precision?: number,
): string {
  return `${formatDataValue(data, isBinary, precision)} ${formatDataUnit(
    data,
    isBinary,
  )}`;
}

export function formatBytes(bytes: number): string {
  return formatData(bytes, true);
}
