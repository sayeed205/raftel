import type { TorrentInfo } from '@/types/api';

export interface CategoryStats {
  name: string;
  count: number;
  totalSize: number;
  downloadedSize: number;
  uploadedSize: number;
  averageProgress: number;
  activeCount: number;
  completedCount: number;
}

export interface TagStats {
  name: string;
  count: number;
  totalSize: number;
  downloadedSize: number;
  uploadedSize: number;
  averageProgress: number;
  activeCount: number;
  completedCount: number;
}

export interface TorrentStatistics {
  categories: Array<CategoryStats>;
  tags: Array<TagStats>;
  totalTorrents: number;
  totalSize: number;
  totalDownloaded: number;
  totalUploaded: number;
  activeCount: number;
  completedCount: number;
}

export function calculateCategoryStats(torrents: Array<TorrentInfo>): Array<CategoryStats> {
  const categoryMap = new Map<
    string,
    {
      torrents: Array<TorrentInfo>;
      totalSize: number;
      downloadedSize: number;
      uploadedSize: number;
      activeCount: number;
      completedCount: number;
    }
  >();

  // Group torrents by category
  torrents.forEach((torrent) => {
    const category = torrent.category || 'Uncategorized';

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        torrents: [],
        totalSize: 0,
        downloadedSize: 0,
        uploadedSize: 0,
        activeCount: 0,
        completedCount: 0,
      });
    }

    const stats = categoryMap.get(category)!;
    stats.torrents.push(torrent);
    stats.totalSize += torrent.size;
    stats.downloadedSize += torrent.downloaded;
    stats.uploadedSize += torrent.uploaded;

    if (torrent.dlspeed > 0 || torrent.upspeed > 0) {
      stats.activeCount++;
    }

    if (torrent.progress >= 1) {
      stats.completedCount++;
    }
  });

  // Convert to CategoryStats array
  return Array.from(categoryMap.entries())
    .map(([name, stats]) => ({
      name,
      count: stats.torrents.length,
      totalSize: stats.totalSize,
      downloadedSize: stats.downloadedSize,
      uploadedSize: stats.uploadedSize,
      averageProgress:
        stats.torrents.reduce((sum, t) => sum + t.progress, 0) / stats.torrents.length,
      activeCount: stats.activeCount,
      completedCount: stats.completedCount,
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateTagStats(torrents: Array<TorrentInfo>): Array<TagStats> {
  const tagMap = new Map<
    string,
    {
      torrents: Array<TorrentInfo>;
      totalSize: number;
      downloadedSize: number;
      uploadedSize: number;
      activeCount: number;
      completedCount: number;
    }
  >();

  // Group torrents by tags
  torrents.forEach((torrent) => {
    if (torrent.tags) {
      const torrentTags = torrent.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      torrentTags.forEach((tag) => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, {
            torrents: [],
            totalSize: 0,
            downloadedSize: 0,
            uploadedSize: 0,
            activeCount: 0,
            completedCount: 0,
          });
        }

        const stats = tagMap.get(tag)!;
        stats.torrents.push(torrent);
        stats.totalSize += torrent.size;
        stats.downloadedSize += torrent.downloaded;
        stats.uploadedSize += torrent.uploaded;

        if (torrent.dlspeed > 0 || torrent.upspeed > 0) {
          stats.activeCount++;
        }

        if (torrent.progress >= 1) {
          stats.completedCount++;
        }
      });
    }
  });

  // Convert to TagStats array
  return Array.from(tagMap.entries())
    .map(([name, stats]) => ({
      name,
      count: stats.torrents.length,
      totalSize: stats.totalSize,
      downloadedSize: stats.downloadedSize,
      uploadedSize: stats.uploadedSize,
      averageProgress:
        stats.torrents.reduce((sum, t) => sum + t.progress, 0) / stats.torrents.length,
      activeCount: stats.activeCount,
      completedCount: stats.completedCount,
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateTorrentStatistics(torrents: Array<TorrentInfo>): TorrentStatistics {
  const categories = calculateCategoryStats(torrents);
  const tags = calculateTagStats(torrents);

  const totalSize = torrents.reduce((sum, t) => sum + t.size, 0);
  const totalDownloaded = torrents.reduce((sum, t) => sum + t.downloaded, 0);
  const totalUploaded = torrents.reduce((sum, t) => sum + t.uploaded, 0);
  const activeCount = torrents.filter((t) => t.dlspeed > 0 || t.upspeed > 0).length;
  const completedCount = torrents.filter((t) => t.progress >= 1).length;

  return {
    categories,
    tags,
    totalTorrents: torrents.length,
    totalSize,
    totalDownloaded,
    totalUploaded,
    activeCount,
    completedCount,
  };
}
