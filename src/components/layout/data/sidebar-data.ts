import type { SidebarData } from '@/components/layout/types';
import { Download, LayoutDashboard, Rss } from 'lucide-react';

export const sidebarData: SidebarData = {
  user: {
    name: 'sayeed', // todo)) add proper qbit username
  },
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          icon: LayoutDashboard,
          url: '/dashboard',
        },
        {
          title: 'Torrents',
          icon: Download,
          url: '/torrents',
        },
        {
          title: 'RSS',
          icon: Rss,
          url: '/rss',
        },
      ],
    },
  ],
};
