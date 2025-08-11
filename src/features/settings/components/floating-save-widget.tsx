import React from 'react';
import { useSettings, useSettingsActions } from '@/stores/settings-store';
import { RotateCcw, Save } from 'lucide-react';

import { cn } from '@/lib/utils';
import { torrentToast } from '@/lib/utils/toast';
import { Button } from '@/components/ui/button';

interface FloatingSaveWidgetProps {
  className?: string;
}

export function FloatingSaveWidget({ className }: FloatingSaveWidgetProps) {
  const { isDirty, isSaving, validationErrors } = useSettings();
  const { saveChanges, discardChanges } = useSettingsActions();

  const handleSave = async () => {
    try {
      await saveChanges();
      torrentToast.settingsSaved();
    } catch (error) {
      console.error('Failed to save settings:', error);
      torrentToast.settingsError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  const handleDiscard = () => {
    discardChanges();
  };

  if (!isDirty) {
    return null;
  }

  return (
    <div
      className={cn(
        'bg-background fixed right-6 bottom-6 z-50 flex gap-2 rounded-lg border p-3 shadow-lg',
        'transition-all duration-300 ease-in-out',
        'md:right-8 md:bottom-8',
        'lg:right-10 lg:bottom-10',
        className
      )}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handleDiscard}
        disabled={isSaving}
        className="h-8 px-3"
      >
        <RotateCcw className="mr-1 h-4 w-4" />
        <span className="hidden sm:inline">Discard</span>
      </Button>
      <Button
        size="sm"
        onClick={handleSave}
        disabled={isSaving || validationErrors.length > 0}
        className="h-8 px-3"
      >
        <Save className="mr-1 h-4 w-4" />
        <span className="hidden sm:inline">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </span>
      </Button>
    </div>
  );
}
