import HomePage from './HomePage';
import { db } from '@/lib/db';
import { events, galleryAlbums, galleryPhotos, blogs } from '@/lib/db/schema';
import { getTestimonialsAction } from '@/app/actions/testimonials';
import { desc, asc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let fetchedEvents = [];
  let galleryEntries = [];
  let fetchedBlogs = [];
  let fetchedTestimonials = [];

  try {
    // 1. Fetch Events
    const rawEvents = await db.select().from(events).orderBy(desc(events.scheduledDate));
    fetchedEvents = rawEvents.map((event) => ({
      id: String(event.id),
      title: event.title,
      scheduledDate: event.scheduledDate,
      venue: event.venue,
      status: event.status,
      tags: event.tags || [],
      thumbnail: event.thumbnailUrl || '',
      date: event.scheduledDate
        ? new Date(event.scheduledDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : '',
    }));

    // 2. Fetch Gallery Albums and Photos
    const rawAlbums = await db.select().from(galleryAlbums).orderBy(desc(galleryAlbums.eventDate));
    const rawPhotos = await db.select().from(galleryPhotos).orderBy(asc(galleryPhotos.displayOrder));

    galleryEntries = rawAlbums.map((album) => {
      const albumPhotos = rawPhotos
        .filter((photo) => photo.albumId === album.id)
        .map((photo) => photo.imageUrl);

      return {
        id: String(album.id),
        title: album.title,
        description: album.description || '',
        coverPhoto: album.coverPhoto,
        date: album.eventDate
          ? new Date(album.eventDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '',
        photos: albumPhotos,
        tags: [],
      };
    });

    // 3. Fetch Blogs
    const rawBlogs = await db
      .select()
      .from(blogs)
      .where(eq(blogs.status, 'published'))
      .orderBy(desc(blogs.publishedAt), desc(blogs.createdAt));

    fetchedBlogs = rawBlogs.map((post) => ({
      id: String(post.id),
      slug: post.slug,
      title: post.title,
      category: post.category,
      excerpt: post.excerpt,
      cover: post.coverImage,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      date: post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : new Date(post.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
      readTime: Math.ceil((post.body?.split(' ').length || 0) / 200) + ' min read',
    }));

    // 4. Fetch Active Testimonials
    fetchedTestimonials = await getTestimonialsAction({ publicOnly: true });

  } catch (error) {
    console.error('Error loading homepage data from Database via Drizzle:', error);
  }

  return (
    <HomePage
      events={fetchedEvents}
      galleryEntries={galleryEntries}
      blogs={fetchedBlogs}
      testimonials={fetchedTestimonials}
    />
  );
}
