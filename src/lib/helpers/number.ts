export function toPrecision(value: number, precision: number): string {
  if (value >= 10 ** precision) {
    return Math.floor(value).toString();
  }

  const strValue = value.toFixed(precision);
  if (strValue.length < Math.floor(Math.log10(value)) + 1) {
    return strValue;
  } else {
    const result = strValue.substring(0, precision + 1);
    if (result.endsWith('.')) {
      return result.slice(0, -1);
    }
    return result;
  }
}

/** Formats a percentage value between 0 and 1 */
export function formatPercent(progress: number): string {
  return `${toPrecision(progress * 100, 3)}%`;
}

/** Formats a ratio value */
export function formatRatio(ratio: number): string {
  if (ratio === -1 || ratio === Infinity) return '∞';
  return toPrecision(ratio, 3);
}

/** Clamps a number between min and max values */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Rounds a number to specified decimal places */
export function roundTo(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
