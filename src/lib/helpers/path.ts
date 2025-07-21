export const FileType = {
  ARCHIVE: 'archive',
  AUDIO: 'audio',
  BOOK: 'book',
  DOCUMENT: 'document',
  EXECUTABLE: 'executable',
  IMAGE: 'image',
  INFORMATION: 'information',
  SCRIPT: 'script',
  SUBTITLE: 'subtitle',
  VIDEO: 'video',
  UNKNOWN: 'unknown',
} as const;

export type FileType = (typeof FileType)[keyof typeof FileType];

export const typesMap: Record<FileType, string> = {
  [FileType.ARCHIVE]: '📦',
  [FileType.AUDIO]: '🎵',
  [FileType.BOOK]: '📖',
  [FileType.DOCUMENT]: '📄',
  [FileType.EXECUTABLE]: '⚙️',
  [FileType.IMAGE]: '🖼️',
  [FileType.INFORMATION]: 'ℹ️',
  [FileType.SCRIPT]: '📜',
  [FileType.SUBTITLE]: '💬',
  [FileType.VIDEO]: '🎬',
  [FileType.UNKNOWN]: '📁',
};

export const extMap: Record<string, FileType> = {
  '7z': FileType.ARCHIVE,
  bz2: FileType.ARCHIVE,
  cab: FileType.ARCHIVE,
  gz: FileType.ARCHIVE,
  iso: FileType.ARCHIVE,
  rar: FileType.ARCHIVE,
  sfx: FileType.ARCHIVE,
  tar: FileType.ARCHIVE,
  tgz: FileType.ARCHIVE,
  xz: FileType.ARCHIVE,
  zip: FileType.ARCHIVE,

  alac: FileType.AUDIO,
  flac: FileType.AUDIO,
  mp3: FileType.AUDIO,
  ogg: FileType.AUDIO,
  wav: FileType.AUDIO,
  wma: FileType.AUDIO,

  cb7: FileType.BOOK,
  cbr: FileType.BOOK,
  cbt: FileType.BOOK,
  cbz: FileType.BOOK,
  epub: FileType.BOOK,
  mobi: FileType.BOOK,

  doc: FileType.DOCUMENT,
  docx: FileType.DOCUMENT,
  htm: FileType.DOCUMENT,
  html: FileType.DOCUMENT,
  pdf: FileType.DOCUMENT,
  rtf: FileType.DOCUMENT,
  txt: FileType.DOCUMENT,
  xhtml: FileType.DOCUMENT,

  apk: FileType.EXECUTABLE,
  app: FileType.EXECUTABLE,
  bin: FileType.EXECUTABLE,
  deb: FileType.EXECUTABLE,
  dmg: FileType.EXECUTABLE,
  exe: FileType.EXECUTABLE,
  jar: FileType.EXECUTABLE,
  msi: FileType.EXECUTABLE,

  avif: FileType.IMAGE,
  bmp: FileType.IMAGE,
  gif: FileType.IMAGE,
  heif: FileType.IMAGE,
  jfif: FileType.IMAGE,
  jpeg: FileType.IMAGE,
  jpg: FileType.IMAGE,
  png: FileType.IMAGE,
  svg: FileType.IMAGE,
  tiff: FileType.IMAGE,
  webp: FileType.IMAGE,

  nfo: FileType.INFORMATION,

  bat: FileType.SCRIPT,
  c: FileType.SCRIPT,
  cmd: FileType.SCRIPT,
  com: FileType.SCRIPT,
  cpp: FileType.SCRIPT,
  cs: FileType.SCRIPT,
  css: FileType.SCRIPT,
  h: FileType.SCRIPT,
  hpp: FileType.SCRIPT,
  java: FileType.SCRIPT,
  js: FileType.SCRIPT,
  py: FileType.SCRIPT,
  vbs: FileType.SCRIPT,

  idx: FileType.SUBTITLE,
  srt: FileType.SUBTITLE,
  sub: FileType.SUBTITLE,

  '3gp': FileType.VIDEO,
  avi: FileType.VIDEO,
  flv: FileType.VIDEO,
  gifv: FileType.VIDEO,
  m2ts: FileType.VIDEO,
  m4v: FileType.VIDEO,
  mkv: FileType.VIDEO,
  mov: FileType.VIDEO,
  mp4: FileType.VIDEO,
  mpeg: FileType.VIDEO,
  mpg: FileType.VIDEO,
  mts: FileType.VIDEO,
  ts: FileType.VIDEO,
  wmv: FileType.VIDEO,
};

export function basename(path: string | null | undefined): string {
  if (!path) return '';

  const uniPath = path.replace(/\\/g, '/');
  if (uniPath.indexOf('/') === -1) return path;

  return uniPath.split('/').reverse()[0];
}

export function splitExt(path: string | null | undefined): [string, string] {
  if (!path) return ['', ''];

  const uniPath = path.replace(/\\/g, '/');
  if (!uniPath.includes('.', 1)) return [uniPath, ''];

  const groups = uniPath.split('.');
  const ext = groups.pop()!;
  return [groups.join('.'), ext.toLowerCase()];
}

export function getExtType(ext: string): FileType {
  if (ext.startsWith('.')) {
    ext = ext.slice(1);
  }
  return extMap[ext.toLowerCase()] || FileType.UNKNOWN;
}

export function getTypeIcon(type: FileType | null | undefined): string {
  return typesMap[type || FileType.UNKNOWN];
}

export function getFileIcon(filename: string): string {
  return getTypeIcon(getExtType(splitExt(filename.toLowerCase())[1]));
}

export function joinPath(...parts: Array<string>): string {
  return parts
    .map((part) => part.replace(/^\/+|\/+$/g, ''))
    .filter((part) => part.length > 0)
    .join('/');
}

export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/\/+/g, '/');
}

export function getParentPath(path: string): string {
  const normalized = normalizePath(path);
  const parts = normalized.split('/');
  parts.pop();
  return parts.join('/') || '/';
}
