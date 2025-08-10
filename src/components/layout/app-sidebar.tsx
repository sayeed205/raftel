import { Magnet } from 'lucide-react';
import * as React from 'react';

import { sidebarData } from './data/sidebar-data';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavGroup } from '@/components/layout/nav-group';
import { NavUser } from '@/components/layout/nav-user';
import { useSidebar } from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        {isCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '48px' }}>
            <Magnet size={24} strokeWidth={1.5} />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', height: '48px', paddingLeft: 12 }}>
            <Magnet size={28} strokeWidth={1.5} />
            <span style={{ marginLeft: 12, fontWeight: 600, fontSize: '1.25rem', letterSpacing: '0.02em' }}>Raftel</span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((p) => (
          <NavGroup key={p.title} {...p} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
