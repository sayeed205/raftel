import { useEffect } from 'react';
import { Outlet } from '@tanstack/react-router';
import {
  AppWindowIcon,
  BoltIcon,
  CableIcon,
  CircleGaugeIcon,
  DownloadIcon,
  EarthIcon,
  GlobeIcon,
  PickaxeIcon,
  RssIcon,
  SlidersHorizontalIcon,
} from 'lucide-react';

import SidebarNav from './components/sidebar-nav';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import SearchSettings from '@/features/settings/components/search.tsx';
import { useSettings, useSettingsActions } from '@/stores/settings-store';

export default function Settings() {
  const { preferences, isLoading } = useSettings();

  const { fetchPreferences } = useSettingsActions();
  useEffect(() => {
    if (!preferences && !isLoading) {
      fetchPreferences().catch(console.error);
    }
  }, [preferences, isLoading, fetchPreferences]);
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <SearchSettings />
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Settings
          </h1>
          <p className='text-muted-foreground'>
            Manage your qBittorrent settings and preferences.
          </p>
        </div>
        <Separator className='my-4' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-4'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full overflow-y-hidden'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  );
}

const sidebarNavItems = [
  {
    title: 'Raftel',
    icon: <SlidersHorizontalIcon size={18} />,
    href: '/settings',
  },
  {
    title: 'Downloads',
    icon: <DownloadIcon size={18} />,
    href: '/settings/downloads',
  },
  {
    title: 'Connection',
    icon: <CableIcon size={18} />,
    href: '/settings/connection',
  },
  {
    title: 'Speed',
    icon: <CircleGaugeIcon size={18} />,
    href: '/settings/Speed',
  },
  {
    title: 'BitTorrent',
    icon: <AppWindowIcon size={18} />,
    href: '/settings/bit-torrent',
  },
  {
    title: 'RSS',
    icon: <RssIcon size={18} />,
    href: '/settings/rss',
  },
  {
    title: 'WebUI',
    icon: <GlobeIcon size={18} />,
    href: '/settings/web-ui',
  },
  {
    title: 'Advanced',
    icon: <BoltIcon size={18} />,
    href: '/settings/advanced',
  },
];
