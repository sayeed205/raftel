export function titleCase(str: string): string {
  if (str.length === 0) return str;

  return str
    .split(' ')
    .map((w) => w[0] && w[0].toUpperCase() + w.substring(1).toLowerCase())
    .join(' ');
}

export function capitalize(str: string): string {
  if (str.length === 0) return str;

  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function extractHostname(url: string): string {
  const match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  if (
    match != null &&
    match.length > 2 &&
    typeof match[2] === 'string' &&
    match[2].length > 0
  ) {
    return match[2];
  } else {
    return '';
  }
}

export function getDomainBody(string: string): string {
  const match = string.match(/:\/\/([^/]+\.)?([^/.]+)\.[^/.:]+/i);
  if (
    match != null &&
    match.length > 2 &&
    typeof match[2] === 'string' &&
    match[2].length > 0
  ) {
    return match[2];
  } else {
    return '';
  }
}

/**
 * Protocol (Optional): http, https, udp
 * Hostname (Required): should match any valid hostname or IP address
 * Port (Optional): should match any port number
 * Path (Optional): should match any string appended to the URL
 */
function getUrlRegExp() {
  return new RegExp(
    /(?:(?<protocol>https?|udp):\/\/)?(?<host>[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\d{1,3}(?:\.\d{1,3}){3}|\[[a-fA-F0-9:]+])(?::(?<port>\d+))?(?<path>\/\S*)?/gi,
  );
}

export function splitByUrl(data: string): Array<string> {
  const urls = data.match(getUrlRegExp());
  let resultArray: Array<string> = [];

  if (urls) {
    urls.forEach(function (url) {
      let tmpResult;
      if (resultArray.length === 0) {
        tmpResult = data.toString().split(url);
      } else {
        tmpResult = resultArray[resultArray.length - 1].toString().split(url);
        resultArray.pop();
      }

      tmpResult.splice(1, 0, url);
      resultArray = [...resultArray, ...tmpResult];
    });
  } else {
    resultArray[0] = data;
  }

  resultArray = resultArray.filter((element) => {
    return element !== '';
  });

  return resultArray;
}

export function containsUrl(data: string): boolean {
  return getUrlRegExp().test(data);
}

export function isValidUri(
  data: string,
  allowedProtocols: Array<string> = ['http:', 'https:', 'udp:'],
): boolean {
  try {
    const parsedURL = new URL(data);
    return allowedProtocols.includes(parsedURL.protocol);
  } catch (_) {
    return false;
  }
}

export function codeToFlag(code: string): { char: string; url: string } {
  const magicNumber = 0x1f1a5;

  code = code.toUpperCase();
  const codePoints = [...code].map((c) => magicNumber + c.charCodeAt(0));
  const char = String.fromCodePoint(...codePoints);
  const url =
    'https://cdn.jsdelivr.net/npm/twemoji/2/svg/' +
    `${codePoints[0].toString(16)}-${codePoints[1].toString(16)}.svg`;

  return {
    char,
    url,
  };
}

export function normalize(data: string): string {
  return data
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[<>:"/\\|?*]/g, '_');
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
