import type * as React from 'react';

import type { LinkProps } from '@tanstack/react-router';

interface User {
  name: string;
}

interface BaseNavItem {
  title: string;
  badge?: string;
  icon?: React.ElementType;
}

type NavLink = BaseNavItem & {
  url: LinkProps['to'];
  items?: never;
};

type NavCollapsible = BaseNavItem & {
  items: Array<BaseNavItem & { url: LinkProps['to'] }>;
  url?: never;
};

type NavItem = NavCollapsible | NavLink;

interface NavGroup {
  title: string;
  items: Array<NavItem>;
}

interface SidebarData {
  user: User;
  navGroups: Array<NavGroup>;
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink };
