import React from 'react';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

import { ProfileDropdown } from '../profile-dropdown';
import { ThemeToggle } from '../theme-toggle';

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export const Header = ({
  className,
  fixed,
  children,
  ...props
}: HeaderProps) => {
  return (
    <header
      className={cn(
        'bg-background flex h-16 items-center gap-3 p-2 sm:gap-4',
        fixed && 'header-fixed peer/header fixed z-50 w-[inherit] rounded-md',
        className
      )}
      {...props}
    >
      <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
      <Separator orientation="vertical" className="h-6" />
      {children}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <ProfileDropdown />
      </div>
    </header>
  );
};

Header.displayName = 'Header';
