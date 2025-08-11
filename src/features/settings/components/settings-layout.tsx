import { useNavigate } from '@tanstack/react-router';
import {
  AlertCircle,
  Download,
  RotateCcw,
  Save,
  Search,
  Upload,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import {
  searchSettings,
  settingsCategories,
} from '../utils/settings-categories';
import { SettingsExportDialog } from './settings-export-dialog';
import { SettingsImportDialog } from './settings-import-dialog';
import { SettingsNavigation } from './settings-navigation';
import { SettingsResetDialog } from './settings-reset-dialog';
import { SettingsSearch } from './settings-search';
import { SettingsValidationDisplay } from './settings-validation-display';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import { useSettings, useSettingsActions } from '@/stores/settings-store';

interface SettingsLayoutProps {
  children?: React.ReactNode;
  currentSection?: string;
}

export function SettingsLayout({
  children,
  currentSection,
}: SettingsLayoutProps) {
  const navigate = useNavigate();

  const {
    preferences,
    webUISettings,
    isLoading,
    isSaving,
    isDirty,
    error,
    validationErrors,
    pendingChanges,
  } = useSettings();

  const {
    fetchPreferences,
    saveChanges,
    discardChanges,
    importSettings,
    resetToDefaults,
    resetPreferences,
    clearError,
  } = useSettingsActions();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    if (!preferences && !isLoading) {
      fetchPreferences().catch(console.error);
    }
  }, [preferences, isLoading, fetchPreferences]);

  // Handle search
  const searchResults = searchQuery ? searchSettings(searchQuery) : [];

  // Handle save changes
  const handleSave = async () => {
    try {
      await saveChanges();
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // Handle discard changes
  const handleDiscard = () => {
    discardChanges();
  };

  // Handle export settings
  const handleExport = () => {
    setShowExportDialog(true);
  };

  // Handle import settings
  const handleImport = () => {
    setShowImportDialog(true);
  };

  // Handle import with options
  const handleImportWithOptions = async (data: any, options: any) => {
    try {
      // Create filtered import data based on options
      const filteredData: any = {};

      if (options.importPreferences && data.preferences) {
        filteredData.preferences = data.preferences;
      }

      if (options.importWebUISettings && data.webUISettings) {
        filteredData.webUISettings = data.webUISettings;
      }

      const jsonString = JSON.stringify(filteredData);
      await importSettings(jsonString);
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw error;
    }
  };

  // Handle reset to defaults
  const handleReset = () => {
    setShowResetDialog(true);
  };

  // Handle reset with options
  const handleResetWithOptions = async (options: any) => {
    try {
      if (options.resetPreferences && options.resetWebUISettings) {
        await resetToDefaults();
      } else if (options.resetPreferences) {
        await resetPreferences();
      } else if (options.resetWebUISettings) {
        // Reset WebUI settings only - we need to get the action from the store
        const store = useSettingsActions();
        store.resetWebUISettings();
      }
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (sectionId: string) => {
    setShowSearch(false);
    setSearchQuery('');
    navigate({ to: `/settings/${sectionId}` });
  };

  // Get current section info
  const getCurrentSection = () => {
    for (const category of settingsCategories) {
      const section = category.sections.find((s) => s.id === currentSection);
      if (section) {
        return { section, category };
      }
    }
    return null;
  };

  const currentSectionInfo = getCurrentSection();

  return (
    <>
      <div className='flex h-full'>
        {/* Sidebar Navigation */}
        <div className='bg-muted/10 w-64 border-r p-4'>
          {/* Search */}
          <div className='relative mb-4'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search settings...'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearch(e.target.value.length > 0);
              }}
              className='pl-9'
            />
            {showSearch && searchQuery && (
              <SettingsSearch
                query={searchQuery}
                results={searchResults}
                onSelect={handleSearchResultSelect}
                onClose={() => setShowSearch(false)}
              />
            )}
          </div>

          {/* Navigation */}
          <SettingsNavigation currentSection={currentSection} />
        </div>

        {/* Main Content */}
        <div className='flex flex-1 flex-col'>
          {/* Header */}
          <div className='border-b p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold'>Settings</h1>
                {currentSectionInfo && (
                  <div className='mt-1 flex items-center gap-2'>
                    <Badge variant='secondary'>
                      {currentSectionInfo.category.title}
                    </Badge>
                    <span className='text-muted-foreground text-sm'>
                      {currentSectionInfo.section.title}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className='flex items-center gap-2'>
                {/* Import/Export */}
                <div className='flex items-center gap-1'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleImport}
                    disabled={isLoading || isSaving}
                  >
                    <Upload className='mr-1 h-4 w-4' />
                    Import
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleExport}
                    disabled={isLoading}
                  >
                    <Download className='mr-1 h-4 w-4' />
                    Export
                  </Button>
                </div>

                <Separator orientation='vertical' className='h-6' />

                {/* Save/Discard */}
                {isDirty && (
                  <>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleDiscard}
                      disabled={isSaving}
                    >
                      <RotateCcw className='mr-1 h-4 w-4' />
                      Discard
                    </Button>
                    <Button
                      size='sm'
                      onClick={handleSave}
                      disabled={isSaving || validationErrors.length > 0}
                    >
                      <Save className='mr-1 h-4 w-4' />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                )}

                {/* Reset */}
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={handleReset}
                  disabled={isLoading || isSaving}
                >
                  <RotateCcw className='mr-1 h-4 w-4' />
                  Reset All
                </Button>
              </div>
            </div>

            {/* Pending Changes Indicator */}
            {isDirty && Object.keys(pendingChanges).length > 0 && (
              <div className='mt-2'>
                <Badge variant='outline' className='text-xs'>
                  {Object.keys(pendingChanges).length} unsaved change
                  {Object.keys(pendingChanges).length !== 1 ? 's' : ''}
                </Badge>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className='p-4'>
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription className='flex items-center justify-between'>
                  {error}
                  <Button variant='ghost' size='sm' onClick={clearError}>
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className='p-4'>
              <SettingsValidationDisplay errors={validationErrors} />
            </div>
          )}

          {/* Content */}
          <div className='flex-1 overflow-auto'>
            {isLoading ? (
              <div className='space-y-4 p-6'>
                <Skeleton className='h-8 w-64' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
                <div className='space-y-2'>
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-2/3' />
                </div>
              </div>
            ) : preferences ? (
              <div className='p-6'>
                {children || (
                  <Card>
                    <CardHeader>
                      <CardTitle>Welcome to Settings</CardTitle>
                      <CardDescription>
                        Configure qBittorrent and customize your experience. Use
                        the navigation on the left to explore different settings
                        categories.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {settingsCategories.map((category) => (
                          <Card
                            key={category.id}
                            className='hover:bg-muted/50 cursor-pointer transition-colors'
                          >
                            <CardHeader className='pb-3'>
                              <CardTitle className='text-lg'>
                                {category.title}
                              </CardTitle>
                              <CardDescription>
                                {category.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className='space-y-1'>
                                {category.sections.map((section) => (
                                  <Button
                                    key={section.id}
                                    variant='ghost'
                                    size='sm'
                                    className='w-full justify-start'
                                    onClick={() =>
                                      navigate({
                                        to: `/settings/${section.id}`,
                                      })
                                    }
                                  >
                                    <section.icon className='mr-2 h-4 w-4' />
                                    {section.title}
                                  </Button>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className='p-6'>
                <Alert>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    Failed to load settings. Please try refreshing the page.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <SettingsExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        preferences={preferences}
        webUISettings={webUISettings}
      />

      <SettingsImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImportWithOptions}
        currentPreferences={preferences}
        currentWebUISettings={webUISettings}
      />

      <SettingsResetDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        onReset={handleResetWithOptions}
        preferences={preferences}
        webUISettings={webUISettings}
      />
    </>
  );
}
