import { useTorrentStore } from '@/stores/torrent-store';
import { Download, Upload } from 'lucide-react';

import { formatBytes } from '@/lib/utils';
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

interface SpeedIndicatorProps {
  collapsed?: boolean;
}

export function SpeedIndicator({ collapsed = false }: SpeedIndicatorProps) {
  const { serverState } = useTorrentStore();

  if (!serverState) {
    return null;
  }

  const downloadSpeed = serverState.dl_info_speed || 0;
  const uploadSpeed = serverState.up_info_speed || 0;

  // Only show when there's activity or when expanded
  const hasActivity = downloadSpeed > 0 || uploadSpeed > 0;

  if (!hasActivity && !collapsed) {
    return (
      <SidebarFooter className="mt-auto border-t pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="text-muted-foreground flex items-center justify-center text-xs">
              No activity
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    );
  }

  if (collapsed) {
    // Vertical layout for collapsed sidebar
    return (
      <SidebarFooter className="mt-auto border-t pt-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-col items-center gap-1 p-1">
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground font-mono text-xs">
                {formatBytes(downloadSpeed + uploadSpeed)}/s
              </span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    );
  }

  // Horizontal layout for expanded sidebar
  return (
    <SidebarFooter className="mt-auto border-t pt-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-1">
              <Download className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground font-mono text-xs">
                {formatBytes(downloadSpeed)}/s
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Upload className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground font-mono text-xs">
                {formatBytes(uploadSpeed)}/s
              </span>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
