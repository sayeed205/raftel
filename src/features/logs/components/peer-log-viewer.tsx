import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLogActions, usePeerLogs } from '@/stores/log-store';
import {
  Download,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { FixedSizeList as List } from 'react-window';

import type { PeerLog } from '@/types/logs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

interface PeerLogViewerProps {
  height?: number;
  showControls?: boolean;
  autoRefresh?: boolean;
}

interface PeerLogItemProps {
  index: number;
  style: React.CSSProperties;
  data: Array<PeerLog>;
}

function PeerLogItem({ index, style, data }: PeerLogItemProps) {
  const log = data[index];
  const timestamp = new Date(log.timestamp * 1000);

  return (
    <div
      style={style}
      className="border-border/50 hover:bg-muted/50 border-b px-4 py-2"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {log.blocked ? (
            <Shield className="h-4 w-4 text-red-500" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-green-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Badge
              variant={log.blocked ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {log.blocked ? 'BLOCKED' : 'ALLOWED'}
            </Badge>

            <span className="font-mono text-sm">{log.ip}</span>

            <span className="text-muted-foreground text-xs">
              {timestamp.toLocaleString()}
            </span>

            <span className="text-muted-foreground text-xs">ID: {log.id}</span>
          </div>

          <div className="text-muted-foreground text-sm">{log.reason}</div>
        </div>
      </div>
    </div>
  );
}

export function PeerLogViewer({
  height = 600,
  showControls = true,
  autoRefresh = false,
}: PeerLogViewerProps) {
  const { peerLogs, isLoading, error, getFilteredPeerLogs } = usePeerLogs();
  const { fetchPeerLogs, clearPeerLogs, exportPeerLogs } = useLogActions();

  const [searchQuery, setSearchQuery] = useState('');
  const [showBlocked, setShowBlocked] = useState(true);
  const [showAllowed, setShowAllowed] = useState(true);

  // Apply local filtering on top of store filtering
  const filteredPeerLogs = useMemo(() => {
    let result = getFilteredPeerLogs();

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (log) =>
          log.ip.toLowerCase().includes(query) ||
          log.reason.toLowerCase().includes(query)
      );
    }

    // Apply blocked/allowed filtering
    result = result.filter((log) => {
      if (log.blocked && !showBlocked) return false;
      if (!log.blocked && !showAllowed) return false;
      return true;
    });

    // Sort by timestamp (newest first)
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [getFilteredPeerLogs, searchQuery, showBlocked, showAllowed]);

  const handleRefresh = useCallback(() => {
    fetchPeerLogs();
  }, [fetchPeerLogs]);

  const handleClearLogs = useCallback(() => {
    clearPeerLogs();
  }, [clearPeerLogs]);

  const handleExport = useCallback(
    (format: 'json' | 'csv' | 'txt') => {
      const content = exportPeerLogs(format);
      const blob = new Blob([content], {
        type: format === 'json' ? 'application/json' : 'text/plain',
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `peer-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [exportPeerLogs]
  );

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setShowBlocked(true);
    setShowAllowed(true);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchPeerLogs();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchPeerLogs]);

  // Initial load
  useEffect(() => {
    fetchPeerLogs();
  }, [fetchPeerLogs]);

  const blockedCount = peerLogs.filter((log) => log.blocked).length;
  const allowedCount = peerLogs.filter((log) => !log.blocked).length;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Peer Logs
            <Badge variant="secondary" className="ml-2">
              {filteredPeerLogs.length} / {peerLogs.length}
            </Badge>
          </CardTitle>

          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleExport('json')}
                    >
                      Export as JSON
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleExport('csv')}
                    >
                      Export as CSV
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleExport('txt')}
                    >
                      Export as Text
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClearLogs}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          )}
        </div>

        {showControls && (
          <>
            <Separator className="my-3" />

            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search by IP address or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-blocked"
                    checked={showBlocked}
                    onCheckedChange={(checked) =>
                      setShowBlocked(checked === true)
                    }
                  />
                  <Label
                    htmlFor="show-blocked"
                    className="cursor-pointer text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      Blocked ({blockedCount})
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-allowed"
                    checked={showAllowed}
                    onCheckedChange={(checked) =>
                      setShowAllowed(checked === true)
                    }
                  />
                  <Label
                    htmlFor="show-allowed"
                    className="cursor-pointer text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      Allowed ({allowedCount})
                    </div>
                  </Label>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="ml-auto"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {error && (
          <div className="bg-destructive/10 border-destructive/20 border-b p-4">
            <div className="text-destructive flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {isLoading && peerLogs.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <div className="text-muted-foreground flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading peer logs...</span>
            </div>
          </div>
        ) : filteredPeerLogs.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <div className="text-muted-foreground text-center">
              <Users className="mx-auto mb-2 h-8 w-8" />
              <p>No peer logs found</p>
              {(searchQuery || !showBlocked || !showAllowed) && (
                <p className="mt-1 text-sm">Try adjusting your filters</p>
              )}
            </div>
          </div>
        ) : (
          <div className="border-t">
            <List
              height={height}
              width="100%"
              itemCount={filteredPeerLogs.length}
              itemSize={80}
              itemData={filteredPeerLogs}
              overscanCount={5}
            >
              {PeerLogItem}
            </List>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
