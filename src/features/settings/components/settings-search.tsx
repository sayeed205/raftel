import React from 'react';

import { Search, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SearchResult {
  section: {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  category: {
    id: string;
    title: string;
  };
  matchType: 'title' | 'description' | 'keyword';
  matchText: string;
}

interface SettingsSearchProps {
  query: string;
  results: Array<SearchResult>;
  onSelect: (sectionId: string) => void;
  onClose: () => void;
}

export function SettingsSearch({ query, results, onSelect, onClose }: SettingsSearchProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          event.preventDefault();
          if (results[selectedIndex]) {
            onSelect(results[selectedIndex].section.id);
          }
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex, onSelect, onClose]);

  // Reset selected index when results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  if (!query || results.length === 0) {
    return (
      <Card className='absolute top-full right-0 left-0 z-50 mt-1'>
        <CardContent className='p-4'>
          <div className='text-muted-foreground flex items-center justify-center'>
            <Search className='mr-2 h-4 w-4' />
            {query ? 'No settings found' : 'Start typing to search settings...'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='absolute top-full right-0 left-0 z-50 mt-1 max-h-96 overflow-auto'>
      <CardContent className='p-2'>
        <div className='mb-2 flex items-center justify-between px-2'>
          <span className='text-muted-foreground text-sm'>
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </span>
          <Button variant='ghost' size='sm' onClick={onClose} className='h-6 w-6 p-0'>
            <X className='h-4 w-4' />
          </Button>
        </div>

        <Separator className='mb-2' />

        <div className='space-y-1'>
          {results.map((result, index) => {
            const Icon = result.section.icon;
            const isSelected = index === selectedIndex;

            return (
              <Button
                key={`${result.section.id}-${index}`}
                variant='ghost'
                className={cn('h-auto w-full justify-start p-2', isSelected && 'bg-muted')}
                onClick={() => onSelect(result.section.id)}
              >
                <div className='flex w-full items-start gap-3'>
                  <Icon className='mt-0.5 h-4 w-4 flex-shrink-0' />
                  <div className='flex-1 text-left'>
                    <div className='mb-1 flex items-center gap-2'>
                      <span className='font-medium'>{result.section.title}</span>
                      <Badge variant='secondary' className='text-xs'>
                        {result.category.title}
                      </Badge>
                    </div>
                    <p className='text-muted-foreground line-clamp-2 text-sm'>
                      {result.section.description}
                    </p>
                    {result.matchType === 'keyword' && (
                      <div className='mt-1'>
                        <Badge variant='outline' className='text-xs'>
                          Keyword: {result.matchText}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        <Separator className='my-2' />

        <div className='text-muted-foreground px-2 text-xs'>
          Use ↑↓ to navigate, Enter to select, Esc to close
        </div>
      </CardContent>
    </Card>
  );
}
