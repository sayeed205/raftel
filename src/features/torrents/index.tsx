import { useEffect } from 'react';

import { Header } from '@/components/layout/header.tsx';
import { Main } from '@/components/layout/main.tsx';
import { useTorrentStore } from '@/stores/torrent-store';
import { columns } from './components/table/columns';
import { DataTable } from './components/table/data-table';

const POLL_KEY = 'torrents_poll_interval';

export default function TorrentsPage() {
  const { torrents, fetchTorrents } = useTorrentStore();

  const stored = localStorage.getItem(POLL_KEY);
  const parsed = stored ? parseInt(stored, 10) : NaN;
  const pollMs = !isNaN(parsed) && parsed > 0 ? parsed : 1000;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let isWindowFocused = true;

    const handleVisibilityChange = () => {
      isWindowFocused = !document.hidden;
      if (isWindowFocused && !interval) {
        startPolling();
      } else if (!isWindowFocused && interval) {
        stopPolling();
      }
    };

    const startPolling = () => {
      if (!interval) {
        fetchTorrents();
        interval = setInterval(() => {
          fetchTorrents();
        }, pollMs); // Poll every 4s when focused
      }
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pollMs]); // Remove fetchTorrents from dependencies to prevent infinite loop

  return (
    <>
      <Header>
        <h2 className='text-2xl font-bold tracking-tight'>Torrents</h2>
      </Header>

      <Main>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable data={torrents} columns={columns} />
        </div>
      </Main>
    </>
  );
}
