import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { SearchIcon, StopCircleIcon, XIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSearchStore } from '@/stores/search-store';

const searchSchema = z.object({
  pattern: z.string().min(1, 'Search query is required'),
  category: z.string().optional(),
  plugins: z.array(z.string()).optional(),
  minSeeds: z.number().min(0).optional(),
  maxSize: z.number().min(0).optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

export function SearchForm() {
  const { engines, searchStatus, isSearching, error, startSearch, stopSearch, clearError } =
    useSearchStore();

  const [selectedEngines, setSelectedEngines] = useState<Array<string>>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      pattern: '',
      category: 'all',
      minSeeds: 0,
    },
  });

  const enabledEngines = engines.filter((e) => e.enabled);
  const watchedPattern = watch('pattern');

  const onSubmit = async (data: SearchFormData) => {
    setFormError(null);
    clearError();

    if (enabledEngines.length === 0) {
      setFormError('No search engines are enabled. Please enable at least one search engine.');
      return;
    }

    try {
      const searchQuery = {
        pattern: data.pattern,
        category: data.category || 'all',
        plugins: selectedEngines.length > 0 ? selectedEngines : enabledEngines.map((e) => e.name),
        minSeeds: data.minSeeds,
        maxSize: data.maxSize,
      };

      await startSearch(searchQuery);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start search';
      setFormError(message);
    }
  };

  const handleStopSearch = async () => {
    try {
      await stopSearch();
    } catch (error) {
      console.error('Failed to stop search:', error);
    }
  };

  const toggleEngine = (engineName: string) => {
    setSelectedEngines((prev) =>
      prev.includes(engineName)
        ? prev.filter((name) => name !== engineName)
        : [...prev, engineName],
    );
  };

  const selectAllEngines = () => {
    setSelectedEngines(enabledEngines.map((e) => e.name));
  };

  const clearEngineSelection = () => {
    setSelectedEngines([]);
  };

  // Get available categories from enabled engines
  const availableCategories = Array.from(
    new Set(enabledEngines.flatMap((engine) => engine.categories || [])),
  )
    .filter((cat) => cat && typeof cat === 'string' && cat !== 'all')
    .sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Search Torrents</span>
          {searchStatus && (
            <Badge variant={searchStatus.status === 'Running' ? 'default' : 'secondary'}>
              {searchStatus.status} - {searchStatus.total} results
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {(error || formError) && (
            <Alert variant='destructive'>
              <AlertDescription>{error || formError}</AlertDescription>
            </Alert>
          )}

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='pattern'>Search Query</Label>
              <Input
                id='pattern'
                placeholder='Enter search terms...'
                {...register('pattern')}
                disabled={isSearching}
              />
              {errors.pattern && (
                <p className='text-destructive text-sm'>{errors.pattern.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='category'>Category</Label>
              <Select
                defaultValue='all'
                onValueChange={(value) => setValue('category', value)}
                disabled={isSearching}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select category' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Categories</SelectItem>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='minSeeds'>Minimum Seeds</Label>
              <Input
                id='minSeeds'
                type='number'
                min='0'
                placeholder='0'
                {...register('minSeeds', { valueAsNumber: true })}
                disabled={isSearching}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='maxSize'>Maximum Size (MB)</Label>
              <Input
                id='maxSize'
                type='number'
                min='0'
                placeholder='No limit'
                {...register('maxSize', { valueAsNumber: true })}
                disabled={isSearching}
              />
            </div>
          </div>

          {enabledEngines.length > 0 && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label>
                  Search Engines ({selectedEngines.length || enabledEngines.length} selected)
                </Label>
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={selectAllEngines}
                    disabled={isSearching}
                  >
                    Select All
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={clearEngineSelection}
                    disabled={isSearching}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                {enabledEngines.map((engine) => (
                  <Badge
                    key={engine.id}
                    variant={
                      selectedEngines.length === 0 || selectedEngines.includes(engine.name)
                        ? 'default'
                        : 'outline'
                    }
                    className='cursor-pointer'
                    onClick={() => !isSearching && toggleEngine(engine.name)}
                  >
                    {engine.fullName || engine.name}
                    {selectedEngines.includes(engine.name) && selectedEngines.length > 0 && (
                      <XIcon className='ml-1 h-3 w-3' />
                    )}
                  </Badge>
                ))}
              </div>
              {selectedEngines.length === 0 && (
                <p className='text-muted-foreground text-sm'>All enabled engines will be used</p>
              )}
            </div>
          )}

          <div className='flex gap-2'>
            {!isSearching ? (
              <Button
                type='submit'
                disabled={!watchedPattern?.trim() || enabledEngines.length === 0}
              >
                <SearchIcon className='mr-2 h-4 w-4' />
                Search
              </Button>
            ) : (
              <Button type='button' variant='destructive' onClick={handleStopSearch}>
                <StopCircleIcon className='mr-2 h-4 w-4' />
                Stop Search
              </Button>
            )}

            {enabledEngines.length === 0 && (
              <p className='text-muted-foreground flex items-center text-sm'>
                No search engines enabled. Go to the Engines tab to enable some.
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
