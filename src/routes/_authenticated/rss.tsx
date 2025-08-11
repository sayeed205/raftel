import RSSPage from '@/features/rss';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/rss')({
  component: RSSPage,
});
