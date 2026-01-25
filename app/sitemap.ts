import { MetadataRoute } from 'next';
import { events } from '@/events.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://kfondo.cc';
  
  // Static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
  ];

  // Dynamic routes for each event
  const eventRoutes = events.map((event) => ({
    url: `${baseUrl}/${event.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...routes, ...eventRoutes];
}
