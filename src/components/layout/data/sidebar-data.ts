import { Download, LayoutDashboard } from 'lucide-react';
import type { SidebarData } from '@/components/layout/types';

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
      ],
    },
  ],
};
