import { useEffect } from 'react';

import { SearchEngineList } from './components/search-engine-list';
import { SearchForm } from './components/search-form';
import { SearchHistoryPanel } from './components/search-history-panel';
import { SearchResults } from './components/search-results';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchStore } from '@/stores/search-store';


export default function SearchPage() {
  const { fetchEngines, engines, activeSearch, searchResults } =
    useSearchStore();

  useEffect(() => {
    // Initial data fetch
    fetchEngines();
  }, [fetchEngines]);

  return (
    <>
      <Header>
        <h2 className='text-2xl font-bold tracking-tight'>Search</h2>
      </Header>

      <Main>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <Tabs defaultValue='search' className='space-y-4'>
            <TabsList>
              <TabsTrigger value='search'>Search</TabsTrigger>
              <TabsTrigger value='engines'>
                Engines ({engines.filter((e) => e.enabled).length}/
                {engines.length})
              </TabsTrigger>
              <TabsTrigger value='history'>History</TabsTrigger>
            </TabsList>

            <TabsContent value='search' className='space-y-4'>
              <SearchForm />
              {(activeSearch || searchResults.length > 0) && <SearchResults />}
            </TabsContent>

            <TabsContent value='engines' className='space-y-4'>
              <SearchEngineList />
            </TabsContent>

            <TabsContent value='history' className='space-y-4'>
              <SearchHistoryPanel />
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  );
}
