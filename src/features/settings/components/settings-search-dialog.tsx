import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import {
  searchSettings,
  type SearchResult,
} from '../utils/settings-categories';

export function SettingsSearchDialog() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<SearchResult>>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect OS to show correct keyboard shortcut
  const isMac =
    typeof window !== 'undefined' &&
    /Mac|iPod|iPhone|iPad/.test(window.navigator.userAgent);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Open dialog with Ctrl/Cmd + K
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
        setSearchQuery('');
        setSelectedIndex(0);
      }

      // Close dialog with Escape
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure dialog is fully rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select(); // Select all text for better UX
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Update search results when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchSettings(searchQuery);
      setSearchResults(results);
      setSelectedIndex(0);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Handle keyboard navigation within results
  const handleResultNavigation = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, searchResults.length - 1)
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (searchResults[selectedIndex]) {
          handleSelectResult(searchResults[selectedIndex].section.id);
        }
        break;
    }
  };

  const handleSelectResult = (sectionId: string) => {
    setIsOpen(false);
    setSearchQuery('');
    navigate({ to: `/settings/${sectionId}` });
  };

  return (
    <>
      {/* Add custom styles for highlighted text */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          mark {
            background-color: hsl(var(--primary) / 0.2);
            color: hsl(var(--primary));
            padding: 0 2px;
            border-radius: 2px;
          }
        `,
        }}
      />

      {/* Search trigger button - visible in header */}
      <Button
        variant="outline"
        size="sm"
        className="text-muted-foreground flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span>Search settings...</span>
        <div className="hidden items-center gap-0.5 text-xs md:flex">
          <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
            <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>K
          </kbd>
        </div>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogOverlay className="bg-black/30" />
        <DialogContent className="top-[20vh] max-w-2xl translate-y-0 p-0 sm:rounded-lg">
          <div className="p-4">
            <div className="relative mx-5 mt-5">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                ref={inputRef}
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleResultNavigation}
                className="pr-9 pl-9 text-base"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <Separator />

          <div className="max-h-96 overflow-y-auto">
            {searchQuery && searchResults.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="text-muted-foreground mx-auto h-12 w-12" />
                <h3 className="mt-4 font-medium">No results found</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  No settings match your search for "{searchQuery}"
                </p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-2">
                <div className="text-muted-foreground mb-2 px-2 text-sm">
                  {searchResults.length} result
                  {searchResults.length !== 1 ? 's' : ''} found
                </div>
                <div className="space-y-1">
                  {searchResults.map((result, index) => {
                    const Icon = result.section.icon;
                    const isSelected = index === selectedIndex;

                    return (
                      <Button
                        key={`${result.section.id}-${index}`}
                        variant="ghost"
                        className={`h-auto w-full justify-start p-3 ${isSelected ? 'bg-muted' : ''}`}
                        onClick={() => handleSelectResult(result.section.id)}
                      >
                        <div className="flex w-full items-start gap-3">
                          <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                          <div className="flex-1 text-left">
                            <div className="mb-1 flex items-center gap-2">
                              <span
                                className="font-medium"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    result.highlightedText &&
                                    result.matchType === 'title'
                                      ? result.highlightedText
                                      : result.section.title,
                                }}
                              />
                              <Badge variant="secondary" className="text-xs">
                                {result.category.title}
                              </Badge>
                            </div>
                            <p
                              className="text-muted-foreground line-clamp-2 text-sm"
                              dangerouslySetInnerHTML={{
                                __html:
                                  result.highlightedText &&
                                  result.matchType === 'description'
                                    ? result.highlightedText
                                    : result.section.description,
                              }}
                            />
                            {result.matchType === 'keyword' && (
                              <div className="mt-1">
                                <Badge variant="outline" className="text-xs">
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
              </div>
            ) : (
              <div className="p-8">
                <div className="text-center">
                  <Search className="text-muted-foreground mx-auto h-12 w-12" />
                  <h3 className="mt-4 font-medium">Search settings</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Find settings by name, description, or keywords
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="mb-3 text-sm font-medium">Quick actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-12 justify-start"
                      onClick={() => {
                        setSearchQuery('downloads');
                      }}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Downloads
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-12 justify-start"
                      onClick={() => {
                        setSearchQuery('connection');
                      }}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Connection
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-12 justify-start"
                      onClick={() => {
                        setSearchQuery('speed');
                      }}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Speed
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-12 justify-start"
                      onClick={() => {
                        setSearchQuery('webui');
                      }}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Web UI
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="text-muted-foreground flex items-center justify-between p-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="bg-muted rounded px-1.5 py-0.5">↑</kbd>
                <kbd className="bg-muted rounded px-1.5 py-0.5">↓</kbd>
                <span>to navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-muted rounded px-1.5 py-0.5">↵</kbd>
                <span>to select</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="bg-muted rounded px-1.5 py-0.5">ESC</kbd>
              <span>to close</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
