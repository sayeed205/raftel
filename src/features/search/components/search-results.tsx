import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FilterIcon,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSearchStore } from '@/stores/search-store';
import { formatBytes } from '@/utils/format';

export function SearchResults() {
  const {
    searchResults,
    isSearching,
    searchStatus,
    engines,
    sortBy,
    sortOrder,
    filterEngine,
    currentPage,
    resultsPerPage,
    setSortBy,
    setFilterEngine,
    setPage,
    downloadFromResult,
    copyMagnetLink,
    getFilteredResults,
  } = useSearchStore();

  const [showFilters, setShowFilters] = useState(false);

  const filteredResults = getFilteredResults();

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const paginatedResults = filteredResults.slice(
    startIndex,
    startIndex + resultsPerPage,
  );

  const handleSort = (column: typeof sortBy) => {
    setSortBy(column);
  };

  const handleDownload = async (result: any) => {
    try {
      await downloadFromResult(result);
    } catch (error) {
      console.error('Failed to download torrent:', error);
    }
  };

  const handleCopyMagnet = (result: any) => {
    copyMagnetLink(result);
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className='ml-1 h-4 w-4' />
    ) : (
      <ArrowDownIcon className='ml-1 h-4 w-4' />
    );
  };

  const formatSeeds = (seeds: number) => {
    if (seeds < 0) return 'N/A';
    return seeds.toString();
  };

  const formatPeers = (peers: number) => {
    if (peers < 0) return 'N/A';
    return peers.toString();
  };

  const getEngineDisplayName = (engineUrl: string) => {
    const engine = engines.find((e) => e.url === engineUrl);
    return engine?.fullName || engine?.name || engineUrl;
  };

  if (isSearching && searchResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Searching...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center space-x-4'>
                <Skeleton className='h-4 w-1/2' />
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-16' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSearching && searchResults.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>
            Search Results ({filteredResults.length} of {searchResults.length})
            {searchStatus && searchStatus.status === 'Running' && (
              <Badge variant='secondary' className='ml-2'>
                Searching...
              </Badge>
            )}
          </CardTitle>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon className='mr-2 h-4 w-4' />
              Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className='mb-4 grid gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <Label>Filter by Engine</Label>
              <Select
                value={filterEngine || 'all'}
                onValueChange={(value) =>
                  setFilterEngine(value === 'all' ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Engines</SelectItem>
                  {Array.from(
                    new Set(searchResults.map((r) => r.engineName ?? '')),
                  ).map((engine) => (
                    <SelectItem key={engine} value={engine}>
                      {getEngineDisplayName(engine)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className='hover:bg-muted/50 cursor-pointer'
                  onClick={() => handleSort('name')}
                >
                  <div className='flex items-center'>
                    Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead
                  className='hover:bg-muted/50 w-24 cursor-pointer'
                  onClick={() => handleSort('size')}
                >
                  <div className='flex items-center'>
                    Size
                    {getSortIcon('size')}
                  </div>
                </TableHead>
                <TableHead
                  className='hover:bg-muted/50 w-20 cursor-pointer'
                  onClick={() => handleSort('seeds')}
                >
                  <div className='flex items-center'>
                    Seeds
                    {getSortIcon('seeds')}
                  </div>
                </TableHead>
                <TableHead
                  className='hover:bg-muted/50 w-20 cursor-pointer'
                  onClick={() => handleSort('peers')}
                >
                  <div className='flex items-center'>
                    Peers
                    {getSortIcon('peers')}
                  </div>
                </TableHead>
                <TableHead
                  className='hover:bg-muted/50 w-32 cursor-pointer'
                  onClick={() => handleSort('engine')}
                >
                  <div className='flex items-center'>
                    Engine
                    {getSortIcon('engine')}
                  </div>
                </TableHead>
                <TableHead className='w-32'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResults.map((result, index) => (
                <TableRow key={`${result.fileName}-${index}`}>
                  <TableCell className='font-medium'>
                    <div className='max-w-md'>
                      <div className='truncate' title={result.fileName}>
                        {result.fileName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {result.fileSize > 0 ? formatBytes(result.fileSize) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={result.nbSeeders > 0 ? 'default' : 'secondary'}
                    >
                      {formatSeeds(result.nbSeeders)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>
                      {formatPeers(result.nbLeechers)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {result.engineName && (
                      <div
                        className='truncate text-sm'
                        title={getEngineDisplayName(result.engineName)}
                      >
                        {getEngineDisplayName(result.engineName)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDownload(result)}
                        title='Download torrent'
                      >
                        <DownloadIcon className='h-4 w-4' />
                      </Button>
                      {result.fileUrl &&
                        result.fileUrl.startsWith('magnet:') && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleCopyMagnet(result)}
                            title='Copy magnet link'
                          >
                            <CopyIcon className='h-4 w-4' />
                          </Button>
                        )}
                      {result.descrLink && (
                        <Button
                          variant='ghost'
                          size='sm'
                          asChild
                          title='View details'
                        >
                          <a
                            href={result.descrLink}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <ExternalLinkIcon className='h-4 w-4' />
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className='mt-4 flex items-center justify-between'>
            <div className='text-muted-foreground text-sm'>
              Showing {startIndex + 1} to{' '}
              {Math.min(startIndex + resultsPerPage, filteredResults.length)} of{' '}
              {filteredResults.length} results
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className='text-sm'>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
