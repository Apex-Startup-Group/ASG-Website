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

  // 1. Fetch Events safely
  try {
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
  } catch (error) {
    console.error('Error fetching events for homepage:', error);
  }

  // 2. Fetch Gallery Albums and Photos safely
  try {
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
  } catch (error) {
    console.error('Error fetching gallery entries for homepage:', error);
  }

  // 3. Fetch Blogs safely
  try {
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
  } catch (error) {
    console.error('Error fetching blogs for homepage:', error);
  }

  // 4. Fetch Active Testimonials safely
  try {
    fetchedTestimonials = await getTestimonialsAction({ publicOnly: true });
  } catch (error) {
    console.error('Error fetching testimonials for homepage:', error);
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
