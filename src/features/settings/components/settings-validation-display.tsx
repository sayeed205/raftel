import React from 'react';
import type { SettingsValidationError } from '@/stores/settings-store';
import { useSettingsActions } from '@/stores/settings-store';
import { AlertTriangle, X } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface SettingsValidationDisplayProps {
  errors: Array<SettingsValidationError>;
}

export function SettingsValidationDisplay({
  errors,
}: SettingsValidationDisplayProps) {
  const { clearValidationErrors } = useSettingsActions();
  const [isOpen, setIsOpen] = React.useState(true);

  if (errors.length === 0) {
    return null;
  }

  // Group errors by field for better display
  const errorsByField = errors.reduce(
    (acc, error) => {
      if (!acc[error.field]) {
        acc[error.field] = [];
      }
      acc[error.field].push(error);
      return acc;
    },
    {} as Record<string, Array<SettingsValidationError>>
  );

  const fieldCount = Object.keys(errorsByField).length;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">Validation Errors</span>
            <Badge variant="destructive" className="text-xs">
              {errors.length} error{errors.length !== 1 ? 's' : ''} in{' '}
              {fieldCount} field
              {fieldCount !== 1 ? 's' : ''}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearValidationErrors}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 font-normal"
            >
              {isOpen ? 'Hide details' : 'Show details'}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-2">
              {Object.entries(errorsByField).map(([field, fieldErrors]) => (
                <div key={field} className="border-destructive border-l-2 pl-3">
                  <div className="text-sm font-medium capitalize">
                    {field.replace(/_/g, ' ')}
                  </div>
                  <ul className="mt-1 space-y-1">
                    {fieldErrors.map((error, index) => (
                      <li key={index} className="text-muted-foreground text-sm">
                        • {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </AlertDescription>
    </Alert>
  );
}
