import { useEffect, useMemo, useState } from 'react';
import qbit from '@/services/qbit';
import { Save, Settings, TrendingDown, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

import type { TorrentInfo } from '@/types/api';
import type { TorrentProperties } from '@/types/qbit/torrent.ts';
import { formatBytes, formatSpeed } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface TorrentSpeedTabProps {
  torrent: TorrentInfo;
  properties: TorrentProperties | null;
  onRefresh: () => void;
}

interface SpeedDataPoint {
  timestamp: number;
  downloadSpeed: number;
  uploadSpeed: number;
}

export function TorrentSpeedTab({
  torrent,
  properties,
  onRefresh,
}: TorrentSpeedTabProps) {
  const [speedHistory, setSpeedHistory] = useState<Array<SpeedDataPoint>>([]);
  const [downloadLimit, setDownloadLimit] = useState<string>('');
  const [uploadLimit, setUploadLimit] = useState<string>('');
  const [isUnlimitedDownload, setIsUnlimitedDownload] = useState(false);
  const [isUnlimitedUpload, setIsUnlimitedUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize speed limits from torrent data
  useEffect(() => {
    setDownloadLimit(
      torrent.dl_limit > 0 ? (torrent.dl_limit / 1024).toString() : ''
    );
    setUploadLimit(
      torrent.up_limit > 0 ? (torrent.up_limit / 1024).toString() : ''
    );
    setIsUnlimitedDownload(torrent.dl_limit <= 0);
    setIsUnlimitedUpload(torrent.up_limit <= 0);
  }, [torrent]);

  // Collect speed data for the graph
  useEffect(() => {
    const addSpeedDataPoint = () => {
      const now = Date.now();
      setSpeedHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            timestamp: now,
            downloadSpeed: torrent.dlspeed,
            uploadSpeed: torrent.upspeed,
          },
        ];

        // Keep only last 60 data points (5 minutes at 5-second intervals)
        return newHistory.slice(-60);
      });
    };

    addSpeedDataPoint();
    const interval = setInterval(addSpeedDataPoint, 5000);

    return () => clearInterval(interval);
  }, [torrent.dlspeed, torrent.upspeed]);

  const handleSaveSpeedLimits = async () => {
    try {
      setIsLoading(true);

      const dlLimitBytes = isUnlimitedDownload
        ? 0
        : Math.max(0, parseInt(downloadLimit) * 1024);
      const upLimitBytes = isUnlimitedUpload
        ? 0
        : Math.max(0, parseInt(uploadLimit) * 1024);

      await Promise.all([
        qbit.setDownloadLimit([torrent.hash], dlLimitBytes),
        qbit.setUploadLimit([torrent.hash], upLimitBytes),
      ]);

      toast.success('Speed limits updated successfully');
      onRefresh();
    } catch (error) {
      console.error('Failed to update speed limits:', error);
      toast.error('Failed to update speed limits');
    } finally {
      setIsLoading(false);
    }
  };

  const speedStats = useMemo(() => {
    if (speedHistory.length === 0) return null;

    const downloadSpeeds = speedHistory.map((p) => p.downloadSpeed);
    const uploadSpeeds = speedHistory.map((p) => p.uploadSpeed);

    return {
      maxDownload: Math.max(...downloadSpeeds),
      avgDownload:
        downloadSpeeds.reduce((a, b) => a + b, 0) / downloadSpeeds.length,
      maxUpload: Math.max(...uploadSpeeds),
      avgUpload: uploadSpeeds.reduce((a, b) => a + b, 0) / uploadSpeeds.length,
    };
  }, [speedHistory]);

  // Simple ASCII-style speed graph
  const renderSpeedGraph = () => {
    if (speedHistory.length < 2) {
      return (
        <div className="text-muted-foreground flex h-32 items-center justify-center">
          Collecting speed data...
        </div>
      );
    }

    const maxSpeed = Math.max(
      ...speedHistory.map((p) => Math.max(p.downloadSpeed, p.uploadSpeed))
    );

    if (maxSpeed === 0) {
      return (
        <div className="text-muted-foreground flex h-32 items-center justify-center">
          No transfer activity
        </div>
      );
    }

    return (
      <div className="relative h-32">
        <div className="absolute inset-0 flex items-end justify-between">
          {speedHistory.slice(-20).map((point, index) => {
            const downloadHeight = (point.downloadSpeed / maxSpeed) * 100;
            const uploadHeight = (point.uploadSpeed / maxSpeed) * 100;

            return (
              <div
                key={index}
                className="flex flex-1 flex-col items-center space-y-1"
              >
                <div className="flex w-full flex-col items-center space-y-0.5">
                  {/* Upload bar */}
                  <div
                    className="w-2 bg-blue-500 transition-all duration-300"
                    style={{ height: `${uploadHeight}%` }}
                    title={`Upload: ${formatSpeed(point.uploadSpeed)}`}
                  />
                  {/* Download bar */}
                  <div
                    className="w-2 bg-green-500 transition-all duration-300"
                    style={{ height: `${downloadHeight}%` }}
                    title={`Download: ${formatSpeed(point.downloadSpeed)}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute top-0 right-0 flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded bg-green-500" />
            <span>Download</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded bg-blue-500" />
            <span>Upload</span>
          </div>
        </div>

        {/* Max speed indicator */}
        <div className="text-muted-foreground absolute top-0 left-0 text-xs">
          {formatSpeed(maxSpeed)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Speed Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {formatSpeed(torrent.dlspeed)}
                </p>
                <p className="text-muted-foreground text-xs">Download Speed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {formatSpeed(torrent.upspeed)}
                </p>
                <p className="text-muted-foreground text-xs">Upload Speed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {speedStats && (
          <>
            <Card>
              <CardContent className="p-4">
                <div>
                  <p className="text-lg font-bold">
                    {formatSpeed(speedStats.avgDownload)}
                  </p>
                  <p className="text-muted-foreground text-xs">Avg Download</p>
                  <p className="text-muted-foreground text-xs">
                    Max: {formatSpeed(speedStats.maxDownload)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div>
                  <p className="text-lg font-bold">
                    {formatSpeed(speedStats.avgUpload)}
                  </p>
                  <p className="text-muted-foreground text-xs">Avg Upload</p>
                  <p className="text-muted-foreground text-xs">
                    Max: {formatSpeed(speedStats.maxUpload)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Speed Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transfer Rate History</CardTitle>
        </CardHeader>
        <CardContent>{renderSpeedGraph()}</CardContent>
      </Card>

      {/* Speed Limits Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Settings className="mr-2 h-5 w-5" />
            Speed Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Download Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="download-limit" className="text-sm font-medium">
                Download Limit
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="unlimited-download"
                  checked={isUnlimitedDownload}
                  onCheckedChange={setIsUnlimitedDownload}
                />
                <Label htmlFor="unlimited-download" className="text-sm">
                  Unlimited
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Input
                id="download-limit"
                type="number"
                placeholder="0"
                value={downloadLimit}
                onChange={(e) => setDownloadLimit(e.target.value)}
                disabled={isUnlimitedDownload}
                className="flex-1"
              />
              <span className="text-muted-foreground text-sm">KB/s</span>
            </div>

            <div className="text-muted-foreground text-xs">
              Current:{' '}
              {torrent.dl_limit > 0
                ? formatSpeed(torrent.dl_limit)
                : 'Unlimited'}
            </div>
          </div>

          <Separator />

          {/* Upload Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="upload-limit" className="text-sm font-medium">
                Upload Limit
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="unlimited-upload"
                  checked={isUnlimitedUpload}
                  onCheckedChange={setIsUnlimitedUpload}
                />
                <Label htmlFor="unlimited-upload" className="text-sm">
                  Unlimited
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Input
                id="upload-limit"
                type="number"
                placeholder="0"
                value={uploadLimit}
                onChange={(e) => setUploadLimit(e.target.value)}
                disabled={isUnlimitedUpload}
                className="flex-1"
              />
              <span className="text-muted-foreground text-sm">KB/s</span>
            </div>

            <div className="text-muted-foreground text-xs">
              Current:{' '}
              {torrent.up_limit > 0
                ? formatSpeed(torrent.up_limit)
                : 'Unlimited'}
            </div>
          </div>

          <Separator />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSpeedLimits} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Limits'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Transfer Info */}
      {properties && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transfer Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Total Downloaded:
                  </span>
                  <span className="font-mono text-sm">
                    {formatBytes(properties.total_downloaded)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Session Downloaded:
                  </span>
                  <span className="font-mono text-sm">
                    {formatBytes(torrent.downloaded_session)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Average Download Speed:
                  </span>
                  <span className="font-mono text-sm">
                    {formatSpeed(properties.dl_speed_avg)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Total Uploaded:
                  </span>
                  <span className="font-mono text-sm">
                    {formatBytes(properties.total_uploaded)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Session Uploaded:
                  </span>
                  <span className="font-mono text-sm">
                    {formatBytes(torrent.uploaded_session)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Average Upload Speed:
                  </span>
                  <span className="font-mono text-sm">
                    {formatSpeed(properties.up_speed_avg)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
