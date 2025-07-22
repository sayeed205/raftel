import { formatDistance } from 'date-fns';

import type { TorrentInfo, TorrentProperties } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { formatDuration, formatTimeSec } from '@/lib/helpers/datetime';
import {
  formatBytes,
  formatProgress,
  formatRatio,
  formatSpeed,
  formatTime,
  getStateColor,
  getStateText,
} from '@/lib/utils';

interface TorrentGeneralTabProps {
  torrent: TorrentInfo;
  properties: TorrentProperties | null;
}

export function TorrentGeneralTab({
  torrent,
  properties,
}: TorrentGeneralTabProps) {
  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className='flex items-center justify-between py-2'>
      <span className='text-muted-foreground text-sm font-medium'>{label}</span>
      <span className='font-mono text-sm'>{value}</span>
    </div>
  );

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
      {/* Transfer Information */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Transfer</CardTitle>
        </CardHeader>
        <CardContent className='space-y-1'>
          <InfoRow
            label='Status'
            value={
              <Badge
                variant='secondary'
                className={`${getStateColor(torrent.state)} text-background`}
              >
                {getStateText(torrent.state)}
              </Badge>
            }
          />
          <Separator />

          <InfoRow
            label='Progress'
            value={
              <div className='flex min-w-[200px] items-center space-x-2'>
                <Progress value={torrent.progress * 100} className='flex-1' />
                <span className='text-xs'>
                  {formatProgress(torrent.progress)}
                </span>
              </div>
            }
          />

          <InfoRow label='Downloaded' value={formatBytes(torrent.downloaded)} />
          <InfoRow label='Uploaded' value={formatBytes(torrent.uploaded)} />
          <InfoRow
            label='Seeds'
            value={`${torrent.num_seeds} (${torrent.num_complete} total)`}
          />
          <InfoRow
            label='Peers'
            value={`${torrent.num_leechs} (${torrent.num_incomplete} total)`}
          />
          <InfoRow label='Ratio' value={formatRatio(torrent.ratio)} />
          <InfoRow
            label='Download Speed'
            value={formatSpeed(torrent.dlspeed)}
          />
          <InfoRow label='Upload Speed' value={formatSpeed(torrent.upspeed)} />
          <InfoRow label='ETA' value={formatTime(torrent.eta)} />
          <InfoRow
            label='Time Active'
            value={formatDuration(torrent.time_active)}
          />
          <InfoRow
            label='Seeding Time'
            value={formatDuration(torrent.seeding_time)}
          />
        </CardContent>
      </Card>

      {/* Torrent Information */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-1'>
          <InfoRow label='Size' value={formatBytes(torrent.size)} />
          <InfoRow label='Total Size' value={formatBytes(torrent.total_size)} />
          <InfoRow
            label='Hash'
            value={
              <span className='font-mono text-xs break-all'>
                {torrent.hash}
              </span>
            }
          />
          {properties?.infohash_v1 && (
            <InfoRow
              label='Hash v1'
              value={
                <span className='font-mono text-xs break-all'>
                  {properties.infohash_v1}
                </span>
              }
            />
          )}
          {properties?.infohash_v2 && (
            <InfoRow
              label='Hash v2'
              value={
                <span className='font-mono text-xs break-all'>
                  {properties.infohash_v2}
                </span>
              }
            />
          )}
          <Separator />

          <InfoRow
            label='Save Path'
            value={
              <span className='max-w-[300px] text-xs break-all'>
                {torrent.save_path}
              </span>
            }
          />
          {torrent.category && (
            <InfoRow
              label='Category'
              value={<Badge variant='outline'>{torrent.category}</Badge>}
            />
          )}
          {torrent.tags && (
            <InfoRow
              label='Tags'
              value={
                <div className='flex flex-wrap gap-1'>
                  {torrent.tags
                    .split(',')
                    .filter(Boolean)
                    .map((tag, index) => (
                      <Badge key={index} variant='outline' className='text-xs'>
                        {tag.trim()}
                      </Badge>
                    ))}
                </div>
              }
            />
          )}

          <Separator />

          <InfoRow
            label='Added On'
            value={
              formatDistance(new Date(torrent.added_on * 1000), new Date()) +
              ', ' +
              formatTimeSec(torrent.added_on)
            }
          />
          {torrent.completion_on > 0 && (
            <InfoRow
              label='Completed On'
              value={
                formatDistance(
                  new Date(torrent.completion_on * 1000),
                  new Date(),
                ) +
                ', ' +
                formatTimeSec(torrent.completion_on)
              }
            />
          )}
          {torrent.seen_complete > 0 && (
            <InfoRow
              label='Last Seen Complete'
              value={
                formatDistance(
                  new Date(torrent.seen_complete * 1000),
                  new Date(),
                ) +
                ', ' +
                formatTimeSec(torrent.seen_complete)
              }
            />
          )}
          {torrent.last_activity > 0 && (
            <InfoRow
              label='Last Activity'
              value={
                formatDistance(
                  new Date(torrent.last_activity * 1000),
                  new Date(),
                  { addSuffix: true },
                ) +
                ', ' +
                formatTimeSec(torrent.last_activity)
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Advanced Properties */}
      {properties && (
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='text-lg'>Advanced Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-x-8 gap-y-1 md:grid-cols-2 lg:grid-cols-3'>
              {properties.comment && (
                <InfoRow
                  label='Comment'
                  value={
                    <span className='max-w-[200px] text-xs break-words'>
                      {properties.comment}
                    </span>
                  }
                />
              )}
              {properties.created_by && (
                <InfoRow label='Created By' value={properties.created_by} />
              )}
              {properties.creation_date > 0 && (
                <InfoRow
                  label='Creation Date'
                  value={formatTimeSec(properties.creation_date)}
                />
              )}

              <InfoRow
                label='Piece Size'
                value={formatBytes(properties.piece_size)}
              />
              <InfoRow
                label='Pieces'
                value={`${properties.pieces_have} / ${properties.pieces_num}`}
              />
              <InfoRow
                label='Availability'
                value={`${(torrent.availability * 100).toFixed(1)}%`}
              />

              <InfoRow
                label='Connections'
                value={`${properties.nb_connections} / ${properties.nb_connections_limit}`}
              />
              <InfoRow
                label='Download Limit'
                value={
                  torrent.dl_limit > 0
                    ? formatSpeed(torrent.dl_limit)
                    : 'Unlimited'
                }
              />
              <InfoRow
                label='Upload Limit'
                value={
                  torrent.up_limit > 0
                    ? formatSpeed(torrent.up_limit)
                    : 'Unlimited'
                }
              />

              <InfoRow
                label='Priority'
                value={
                  torrent.priority >= 0 ? torrent.priority.toString() : 'N/A'
                }
              />
              <InfoRow
                label='Auto TMM'
                value={torrent.auto_tmm ? 'Yes' : 'No'}
              />
              <InfoRow
                label='Sequential Download'
                value={torrent.seq_dl ? 'Yes' : 'No'}
              />
              <InfoRow
                label='First/Last Piece Priority'
                value={torrent.f_l_piece_prio ? 'Yes' : 'No'}
              />
              <InfoRow
                label='Super Seeding'
                value={torrent.super_seeding ? 'Yes' : 'No'}
              />
              <InfoRow
                label='Force Start'
                value={torrent.force_start ? 'Yes' : 'No'}
              />

              <InfoRow
                label='Total Downloaded'
                value={formatBytes(properties.total_downloaded)}
              />
              <InfoRow
                label='Total Uploaded'
                value={formatBytes(properties.total_uploaded)}
              />
              <InfoRow
                label='Total Wasted'
                value={formatBytes(properties.total_wasted)}
              />

              <InfoRow
                label='Session Downloaded'
                value={formatBytes(torrent.downloaded_session)}
              />
              <InfoRow
                label='Session Uploaded'
                value={formatBytes(torrent.uploaded_session)}
              />

              <InfoRow
                label='Average Download Speed'
                value={formatSpeed(properties.dl_speed_avg)}
              />
              <InfoRow
                label='Average Upload Speed'
                value={formatSpeed(properties.up_speed_avg)}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
