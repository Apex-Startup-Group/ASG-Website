import { Suspense } from 'react';
import GalleryPage from './GalleryPage';
import { db } from '@/lib/db';
import { galleryAlbums, galleryPhotos } from '@/lib/db/schema';
import { desc, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let entries = [];

  try {
    const rawAlbums = await db.select().from(galleryAlbums).orderBy(desc(galleryAlbums.eventDate));
    const rawPhotos = await db.select().from(galleryPhotos).orderBy(asc(galleryPhotos.displayOrder));

    entries = rawAlbums.map((album) => {
      const albumPhotos = rawPhotos
        .filter((photo) => photo.albumId === album.id)
        .map((photo) => photo.imageUrl);

      return {
        id: String(album.id),
        title: album.title,
        description: album.description || '',
        coverPhoto: album.coverPhoto,
        eventDate: album.eventDate ? String(album.eventDate).slice(0, 10) : '',
        tags: [],
        photos: albumPhotos,
      };
    });
  } catch (error) {
    console.error('Error loading gallery entries from Database via Drizzle:', error);
  }

  return (
    <Suspense fallback={<div>Loading Gallery...</div>}>
      <GalleryPage entries={entries} />
    </Suspense>
  );
}
