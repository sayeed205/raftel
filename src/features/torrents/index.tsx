import { useEffect, useRef, useState } from 'react';

import { Header } from '@/components/layout/header.tsx';
import { Main } from '@/components/layout/main.tsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTorrentStore } from '@/stores/torrent-store';
import { Plus } from 'lucide-react';
import { AddTorrentModal } from './components/add-torrent-modal';
import { columns } from './components/table/columns';
import { DataTable } from './components/table/data-table';

const POLL_KEY = 'torrents_poll_interval';

export default function TorrentsPage() {
  const { torrents, fetchTorrents } = useTorrentStore();

  // Get initial poll interval from localStorage or default to 1000
  const [pollMs, setPollMs] = useState(() => {
    const stored = localStorage.getItem(POLL_KEY);
    const parsed = stored ? parseInt(stored, 10) : NaN;
    return !isNaN(parsed) && parsed > 0 ? parsed : 1000;
  });
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Keep pollMs in localStorage in sync
  useEffect(() => {
    localStorage.setItem(POLL_KEY, String(pollMs));
  }, [pollMs]);

  // Ref to keep latest pollMs for interval callback
  const pollMsRef = useRef(pollMs);
  useEffect(() => {
    pollMsRef.current = pollMs;
  }, [pollMs]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let isWindowFocused = true;

    const startPolling = () => {
      if (!interval) {
        fetchTorrents();
        interval = setInterval(() => {
          fetchTorrents();
        }, pollMsRef.current);
      }
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibilityChange = () => {
      isWindowFocused = !document.hidden;
      if (isWindowFocused && !interval) {
        startPolling();
      } else if (!isWindowFocused && interval) {
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling();

    // If pollMs changes, restart polling with new interval
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // pollMs is intentionally omitted from deps, see below
    // eslint-disable-next-line
  }, []);

  // Restart polling when pollMs changes
  useEffect(() => {
    // This effect will run whenever pollMs changes
    // So we clear and restart the polling interval
    let interval: NodeJS.Timeout | null = null;
    let stopped = false;

    const poll = () => {
      fetchTorrents();
      interval = setInterval(() => {
        fetchTorrents();
      }, pollMs);
    };

    poll();

    return () => {
      stopped = true;
      if (interval) clearInterval(interval);
    };
  }, [pollMs, fetchTorrents]);

  return (
    <>
      <Header>
        <div className='flex items-center gap-2'>
          <Label
            htmlFor='poll-interval'
            className='text-muted-foreground text-sm'
          >
            Polling interval (ms):
          </Label>
          <Input
            id='poll-interval'
            type='number'
            min={100}
            step={100}
            value={pollMs}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val > 0) setPollMs(val);
            }}
            className='w-24 rounded border px-2 py-1 text-sm'
          />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Torrents</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your torrents!
            </p>
          </div>
          {/* <TasksPrimaryButtons /> */}
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className='mx-auto mb-1 h-6 w-6' />
            <span>Add Torrent</span>
          </Button>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable data={torrents} columns={columns} />
        </div>
      </Main>
      <AddTorrentModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAdded={() => {
          setAddModalOpen(false);
          fetchTorrents();
        }}
      />
    </>
  );
}
