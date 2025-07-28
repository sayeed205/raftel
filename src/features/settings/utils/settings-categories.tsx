import {
  Download,
  Gauge,
  Globe,
  Monitor,
  Settings,
  Share2,
} from 'lucide-react';

import type { SettingsCategory } from '@/features/settings';
import {
  AdvancedSettings,
  BitTorrentSettings,
  ConnectionSettings,
  DownloadSettings,
  SpeedSettings,
  WebUISettings,
} from '@/features/settings';

export const settingsCategories: Array<SettingsCategory> = [
  {
    id: 'core',
    title: 'Core Settings',
    description: 'Essential qBittorrent configuration',
    sections: [
      {
        id: 'downloads',
        title: 'Downloads',
        description: 'Download paths, behavior, and file management',
        icon: Download,
        component: DownloadSettings,
        keywords: [
          'download',
          'path',
          'save',
          'folder',
          'directory',
          'temp',
          'temporary',
          'incomplete',
          'finished',
          'auto',
          'management',
          'tmm',
          'category',
          'subfolder',
          'paused',
          'delete',
          'torrent',
          'files',
          'preallocate',
          'extension',
        ],
      },
      {
        id: 'connection',
        title: 'Connection',
        description: 'Network settings, ports, and proxy configuration',
        icon: Globe,
        component: ConnectionSettings,
        keywords: [
          'connection',
          'network',
          'port',
          'listen',
          'upnp',
          'nat',
          'pmp',
          'random',
          'proxy',
          'socks',
          'http',
          'authentication',
          'username',
          'password',
          'peer',
          'rss',
          'hostname',
          'lookup',
          'firewall',
          'router',
        ],
      },
      {
        id: 'speed',
        title: 'Speed',
        description: 'Speed limits, scheduling, and bandwidth management',
        icon: Gauge,
        component: SpeedSettings,
        keywords: [
          'speed',
          'limit',
          'bandwidth',
          'download',
          'upload',
          'alternative',
          'scheduler',
          'schedule',
          'time',
          'hour',
          'minute',
          'days',
          'weekday',
          'weekend',
          'global',
          'rate',
          'throttle',
        ],
      },
    ],
  },
  {
    id: 'protocol',
    title: 'Protocol Settings',
    description: 'BitTorrent protocol and advanced networking',
    sections: [
      {
        id: 'bittorrent',
        title: 'BitTorrent',
        description: 'BitTorrent protocol settings and peer management',
        icon: Share2,
        component: BitTorrentSettings,
        keywords: [
          'bittorrent',
          'protocol',
          'dht',
          'pex',
          'peer',
          'exchange',
          'lsd',
          'local',
          'discovery',
          'encryption',
          'active',
          'downloads',
          'uploads',
          'torrents',
          'slow',
          'threshold',
          'ratio',
          'seeding',
          'time',
          'share',
          'limit',
          'action',
          'pause',
          'remove',
          'choking',
          'algorithm',
          'slots',
          'utp',
          'tcp',
          'mixed',
          'mode',
        ],
      },
    ],
  },
  {
    id: 'interface',
    title: 'Interface Settings',
    description: 'Web UI customization and user preferences',
    sections: [
      {
        id: 'webui',
        title: 'Web UI',
        description: 'Web interface settings and customization',
        icon: Monitor,
        component: WebUISettings,
        keywords: [
          'webui',
          'web',
          'ui',
          'interface',
          'theme',
          'dark',
          'light',
          'language',
          'compact',
          'mode',
          'columns',
          'table',
          'sort',
          'refresh',
          'interval',
          'notifications',
          'sound',
          'desktop',
          'confirm',
          'deletion',
          'advanced',
          'settings',
        ],
      },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Settings',
    description: 'Expert configuration and system settings',
    sections: [
      {
        id: 'advanced',
        title: 'Advanced',
        description: 'Advanced qBittorrent configuration for experts',
        icon: Settings,
        component: AdvancedSettings,
        keywords: [
          'advanced',
          'expert',
          'resume',
          'data',
          'storage',
          'queueing',
          'checking',
          'disk',
          'cache',
          'ttl',
          'io',
          'mode',
          'type',
          'os',
          'coalesce',
          'reads',
          'writes',
          'piece',
          'extent',
          'affinity',
          'upload',
          'suggestions',
          'buffer',
          'watermark',
          'factor',
          'connection',
          'speed',
          'socket',
          'backlog',
          'outgoing',
          'ports',
          'min',
          'max',
          'utp',
          'rate',
          'limited',
          'embedded',
          'tracker',
          'updates',
          'icon',
          'theme',
          'logging',
          'log',
          'level',
          'file',
          'backup',
          'size',
          'delete',
          'old',
          'age',
          'performance',
          'warning',
          'behavior',
          'confirm',
          'torrent',
          'deletion',
          'recheck',
          'remove',
          'tags',
          'ipv6',
          'announce',
          'trackers',
          'tier',
          'tiers',
          'ip',
          'stop',
          'condition',
          'merge',
          'scan',
          'directories',
          'export',
          'directory',
          'mail',
          'notification',
          'email',
          'sender',
          'smtp',
          'ssl',
          'auth',
          'autorun',
          'external',
          'program',
          'completion',
        ],
      },
    ],
  },
];

// Utility function to search settings
export function searchSettings(query: string): Array<{
  section: any;
  category: any;
  matchType: 'title' | 'description' | 'keyword';
  matchText: string;
}> {
  const results: Array<{
    section: any;
    category: any;
    matchType: 'title' | 'description' | 'keyword';
    matchText: string;
  }> = [];

  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return results;

  settingsCategories.forEach((category) => {
    category.sections.forEach((section) => {
      // Check title match
      if (section.title.toLowerCase().includes(searchTerm)) {
        results.push({
          section,
          category,
          matchType: 'title',
          matchText: section.title,
        });
      }

      // Check description match
      else if (section.description.toLowerCase().includes(searchTerm)) {
        results.push({
          section,
          category,
          matchType: 'description',
          matchText: section.description,
        });
      }

      // Check keyword match
      else {
        const matchingKeyword = section.keywords.find((keyword) =>
          keyword.toLowerCase().includes(searchTerm),
        );
        if (matchingKeyword) {
          results.push({
            section,
            category,
            matchType: 'keyword',
            matchText: matchingKeyword,
          });
        }
      }
    });
  });

  return results;
}
