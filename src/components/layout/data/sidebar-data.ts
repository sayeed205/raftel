import type { SidebarData } from '@/components/layout/types';
import { Download, LayoutDashboard, Rss, Search } from 'lucide-react';

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
          title: 'Search',
          icon: Search,
          url: '/search',
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
