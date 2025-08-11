import { useState } from 'react';
import { useSearchStore } from '@/stores/search-store';
import { formatRelativeTime } from '@/utils/format';
import {
  BookmarkIcon,
  ClockIcon,
  MoreHorizontalIcon,
  SearchIcon,
  TrashIcon,
} from 'lucide-react';

import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SearchHistoryPanel() {
  const {
    searchHistory,
    savedSearches,
    clearHistory,
    removeFromHistory,
    saveSearch,
    deleteSavedSearch,
    loadSavedSearch,
    startSearch,
  } = useSearchStore();

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [searchToSave, setSearchToSave] = useState<any>(null);
  const [saveName, setSaveName] = useState('');

  const { confirmDestructiveAction } = useConfirmationDialog();

  const handleSaveSearch = (historyItem: any) => {
    setSearchToSave(historyItem);
    setSaveName(`Search: ${historyItem.query.pattern}`);
    setIsSaveDialogOpen(true);
  };

  const handleConfirmSave = () => {
    if (searchToSave && saveName.trim()) {
      saveSearch(saveName.trim(), searchToSave.query);
      setIsSaveDialogOpen(false);
      setSearchToSave(null);
      setSaveName('');
    }
  };

  const handleLoadSavedSearch = async (savedSearchId: string) => {
    const query = loadSavedSearch(savedSearchId);
    if (query) {
      try {
        await startSearch(query);
      } catch (error) {
        console.error('Failed to start saved search:', error);
      }
    }
  };

  const handleRepeatSearch = async (historyItem: any) => {
    try {
      await startSearch(historyItem.query);
    } catch (error) {
      console.error('Failed to repeat search:', error);
    }
  };

  const handleDeleteSavedSearch = (savedSearchId: string, name: string) => {
    confirmDestructiveAction(
      'Delete Saved Search',
      `Are you sure you want to delete the saved search "${name}"?`,
      () => deleteSavedSearch(savedSearchId)
    );
  };

  const handleClearHistory = () => {
    confirmDestructiveAction(
      'Clear Search History',
      'Are you sure you want to clear all search history? This action cannot be undone.',
      () => clearHistory()
    );
  };

  const formatSearchQuery = (query: any) => {
    const parts = [query.pattern];
    if (query.category && query.category !== 'all') {
      parts.push(`Category: ${query.category}`);
    }
    if (query.minSeeds && query.minSeeds > 0) {
      parts.push(`Min seeds: ${query.minSeeds}`);
    }
    if (query.plugins && query.plugins.length > 0) {
      parts.push(`Engines: ${query.plugins.length}`);
    }
    return parts.join(' • ');
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">
            <ClockIcon className="mr-2 h-4 w-4" />
            History ({searchHistory.length})
          </TabsTrigger>
          <TabsTrigger value="saved">
            <BookmarkIcon className="mr-2 h-4 w-4" />
            Saved ({savedSearches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Search History</h3>
            {searchHistory.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearHistory}>
                <TrashIcon className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>

          {searchHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="space-y-2 text-center">
                  <ClockIcon className="text-muted-foreground mx-auto h-12 w-12" />
                  <h3 className="text-lg font-medium">No search history</h3>
                  <p className="text-muted-foreground">
                    Your search history will appear here after you perform
                    searches.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {searchHistory.map((item, index) => (
                <Card
                  key={index}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate font-medium">
                            {item.query.pattern}
                          </h4>
                          <Badge variant="secondary">
                            {item.resultsCount} results
                          </Badge>
                          {item.duration && (
                            <Badge variant="outline">
                              {(item.duration / 1000).toFixed(1)}s
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground truncate text-sm">
                          {formatSearchQuery(item.query)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatRelativeTime(item.timestamp)}
                        </p>
                      </div>
                      <div className="ml-2 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRepeatSearch(item)}
                          title="Repeat search"
                        >
                          <SearchIcon className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleSaveSearch(item)}
                            >
                              <BookmarkIcon className="mr-2 h-4 w-4" />
                              Save Search
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => removeFromHistory(index)}
                              className="text-destructive"
                            >
                              <TrashIcon className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Saved Searches</h3>
          </div>

          {savedSearches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="space-y-2 text-center">
                  <BookmarkIcon className="text-muted-foreground mx-auto h-12 w-12" />
                  <h3 className="text-lg font-medium">No saved searches</h3>
                  <p className="text-muted-foreground">
                    Save frequently used searches for quick access.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {savedSearches.map((saved) => (
                <Card
                  key={saved.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 space-y-2">
                        <h4 className="truncate font-medium">{saved.name}</h4>
                        <p className="text-muted-foreground truncate text-sm">
                          {formatSearchQuery(saved.query)}
                        </p>
                      </div>
                      <div className="ml-2 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoadSavedSearch(saved.id)}
                          title="Run search"
                        >
                          <SearchIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteSavedSearch(saved.id, saved.name)
                          }
                          title="Delete saved search"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
            <DialogDescription>
              Give this search a name so you can easily run it again later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="save-name">Search Name</Label>
              <Input
                id="save-name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter a name for this search"
              />
            </div>
            {searchToSave && (
              <div className="bg-muted rounded-md p-3">
                <p className="text-sm font-medium">Search Query:</p>
                <p className="text-muted-foreground text-sm">
                  {formatSearchQuery(searchToSave.query)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSave} disabled={!saveName.trim()}>
              <BookmarkIcon className="mr-2 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
