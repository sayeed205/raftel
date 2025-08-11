import type { LucideIcon } from 'lucide-react';

export interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  component: React.ComponentType;
  keywords: Array<string>;
}

export interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  sections: Array<SettingsSection>;
}

export interface SettingsSearchResult {
  section: SettingsSection;
  category: SettingsCategory;
  matchType: 'title' | 'description' | 'keyword';
  matchText: string;
}
