import { createFileRoute } from '@tanstack/react-router';

import RSSPage from '@/features/rss';

export const Route = createFileRoute('/_authenticated/rss')({
  component: RSSPage,
});
