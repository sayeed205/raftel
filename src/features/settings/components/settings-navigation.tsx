import { useNavigate } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

import { settingsCategories } from '../utils/settings-categories';

interface SettingsNavigationProps {
  currentSection?: string;
}

export function SettingsNavigation({
  currentSection,
}: SettingsNavigationProps) {
  const navigate = useNavigate();
  const [openCategories, setOpenCategories] = React.useState<Set<string>>(
    new Set(['core']),
  );

  // Find which category contains the current section
  const getCurrentCategory = () => {
    for (const category of settingsCategories) {
      if (category.sections.some((section) => section.id === currentSection)) {
        return category.id;
      }
    }
    return null;
  };

  const currentCategoryId = getCurrentCategory();

  // Ensure current category is open
  React.useEffect(() => {
    if (currentCategoryId) {
      setOpenCategories((prev) => new Set([...prev, currentCategoryId]));
    }
  }, [currentCategoryId]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSectionClick = (sectionId: string) => {
    navigate({ to: `/settings/${sectionId}` });
  };

  return (
    <nav className='space-y-2'>
      {settingsCategories.map((category) => {
        const isOpen = openCategories.has(category.id);
        const isCurrentCategory = category.id === currentCategoryId;

        return (
          <Collapsible
            key={category.id}
            open={isOpen}
            onOpenChange={() => toggleCategory(category.id)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant='ghost'
                className={cn(
                  'w-full justify-between text-sm font-medium',
                  isCurrentCategory && 'bg-muted',
                )}
              >
                <span>{category.title}</span>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isOpen && 'rotate-90',
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className='space-y-1 pl-4'>
              {category.sections.map((section) => {
                const isCurrentSection = section.id === currentSection;

                return (
                  <Button
                    key={section.id}
                    variant='ghost'
                    size='sm'
                    className={cn(
                      'w-full justify-start text-sm',
                      isCurrentSection && 'bg-primary text-primary-foreground',
                    )}
                    onClick={() => handleSectionClick(section.id)}
                  >
                    <section.icon className='mr-2 h-4 w-4' />
                    {section.title}
                  </Button>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </nav>
  );
}
