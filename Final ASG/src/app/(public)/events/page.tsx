import React from 'react';
import EventsList from './EventsList';
import { db } from '@/lib/db';
import { events as dbEvents, galleryAlbums, galleryPhotos } from '@/lib/db/schema';
import { desc, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Server component: fetch events and gallery entries from Supabase
export default async function EventsPage() {
  let eventsList = [];
  let galleryEntries = [];

  try {
    const rawEvents = await db.select().from(dbEvents).orderBy(desc(dbEvents.scheduledDate));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    eventsList = rawEvents.map((e) => {
      let computedStatus = e.status || 'upcoming';
      if (e.scheduledDate) {
        const eventDate = new Date(e.scheduledDate);
        eventDate.setHours(0, 0, 0, 0);
        if (eventDate < today) {
          computedStatus = 'past';
        } else {
          computedStatus = 'upcoming';
        }
      }
      if (e.status === 'past') computedStatus = 'past';

      return {
        id: String(e.id),
        title: e.title,
        type: e.type || 'Meetup',
        status: computedStatus,
        date: e.scheduledDate ? new Date(e.scheduledDate).toISOString().slice(0, 10) : '',
        venue: e.venue || '',
        description: e.description || '',
        tags: e.tags || [],
        thumbnail: e.thumbnailUrl || '',
        registrationUrl: null,
        recapUrl: null,
      };
    });

    const rawAlbums = await db.select().from(galleryAlbums).orderBy(desc(galleryAlbums.eventDate));
    const rawPhotos = await db.select().from(galleryPhotos).orderBy(asc(galleryPhotos.displayOrder));

    galleryEntries = rawAlbums.map((album) => {
      const albumPhotos = rawPhotos
        .filter((photo) => photo.albumId === album.id)
        .map((photo) => photo.imageUrl);

      return {
        id: String(album.id),
        title: album.title,
        description: album.description,
        photos: albumPhotos,
        coverPhoto: album.coverPhoto,
        date: album.eventDate ? String(album.eventDate).slice(0, 10) : null,
        year: album.eventDate ? String(album.eventDate).slice(0, 4) : '2026',
        event_id: null
      };
    });
  } catch (e) {
    console.error('Error fetching events/gallery from Database via Drizzle:', e);
  }

  return <EventsList events={eventsList} galleryEntries={galleryEntries} />;
}
