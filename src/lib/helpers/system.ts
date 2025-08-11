/**
 * Check if user is on Windows
 */
export const isWindows = window.navigator.userAgent.toLowerCase().includes('windows');

/**
 * Check if user is on MAC
 */
export const isMac = window.navigator.userAgent.toLowerCase().includes('mac');

/**
 * Check if user is on Linux
 */
export const isLinux = window.navigator.userAgent.toLowerCase().includes('linux');

/**
 * Check if user is on mobile device
 */
export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  window.navigator.userAgent,
);

/**
 * Check if user is on tablet
 */
export const isTablet = /iPad|Android(?!.*Mobile)/i.test(window.navigator.userAgent);

/**
 * Check Ctrl/Cmd key
 */
export function doesCommand(e: { metaKey: boolean; ctrlKey: boolean }): boolean {
  return isMac ? e.metaKey : e.ctrlKey;
}

/**
 * Open link in new tab
 */
export function openLink(link: string): void {
  window.open(link, '_blank', 'noreferrer');
}

/**
 * Download file as blob
 */
export function downloadFile(filename: string, blob: Blob): void {
  const href = window.URL.createObjectURL(blob);
  const el = Object.assign(document.createElement('a'), {
    href,
    download: filename,
    style: { opacity: '0' },
  });
  document.body.appendChild(el);
  el.click();
  el.remove();
  window.URL.revokeObjectURL(href);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Get browser information
 */
export function getBrowserInfo(): {
  name: string;
  version: string;
  platform: string;
} {
  const userAgent = window.navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';

  if (userAgent.includes('Chrome')) {
    name = 'Chrome';
    version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox';
    version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Safari')) {
    name = 'Safari';
    version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Edge')) {
    name = 'Edge';
    version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
  }

  let platform = 'Unknown';
  if (isWindows) platform = 'Windows';
  else if (isMac) platform = 'macOS';
  else if (isLinux) platform = 'Linux';
  else if (isMobile) platform = 'Mobile';

  return { name, version, platform };
}

/**
 * Check if feature is supported
 */
export function isFeatureSupported(feature: string): boolean {
  switch (feature) {
    case 'clipboard':
      return !!navigator.clipboard;
    case 'notifications':
      return 'Notification' in window;
    case 'serviceWorker':
      return 'serviceWorker' in navigator;
    case 'webWorker':
      return typeof Worker !== 'undefined';
    case 'localStorage':
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    case 'sessionStorage':
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    default:
      return false;
  }
}

/**
 * Get screen information
 */
export function getScreenInfo(): {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
} {
  return {
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
  };
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isFeatureSupported('notifications')) {
    return 'denied';
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}
