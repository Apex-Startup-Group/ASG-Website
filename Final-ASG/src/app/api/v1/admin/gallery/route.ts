import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { galleryAlbums, galleryPhotos } from '@/lib/db/schema';
import { desc, asc, eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { deleteStorageFile } from '@/lib/supabase/service';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawAlbums = await db.select().from(galleryAlbums).orderBy(desc(galleryAlbums.eventDate));
    const rawPhotos = await db.select().from(galleryPhotos).orderBy(asc(galleryPhotos.displayOrder));

    const data = rawAlbums.map((album) => {
      const albumPhotos = rawPhotos
        .filter((photo) => photo.albumId === album.id)
        .map((photo) => photo.imageUrl);

      return {
        id: album.id,
        title: album.title,
        description: album.description || '',
        coverPhoto: album.coverPhoto,
        date: album.eventDate ? new Date(album.eventDate).toISOString().slice(0, 10) : '',
        year: album.eventDate ? String(new Date(album.eventDate).getFullYear()) : '2026',
        photos: albumPhotos,
      };
    });

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Failed to fetch admin gallery:', err);
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, coverPhoto, date, photos } = body;

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
    }

    // 1. Insert album
    const [newAlbum] = await db.insert(galleryAlbums).values({
      title,
      description: description || '',
      coverPhoto: coverPhoto || (photos && photos[0]) || '',
      eventDate: date,
    }).returning();

    // 2. Insert photos
    if (photos && photos.length > 0) {
      const photoValues = photos.map((url: string, idx: number) => ({
        albumId: newAlbum.id,
        imageUrl: url,
        displayOrder: idx,
      }));
      await db.insert(galleryPhotos).values(photoValues);
    }

    return NextResponse.json({ success: true, data: { ...newAlbum, photos: photos || [] } }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create gallery album:', err);
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, description, coverPhoto, date, photos } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing gallery album ID' }, { status: 400 });
    }

    const updateFields: any = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (coverPhoto !== undefined) updateFields.coverPhoto = coverPhoto;
    if (date !== undefined) updateFields.eventDate = date;
    updateFields.updatedAt = new Date();

    // 1. Update album
    const [updatedAlbum] = await db
      .update(galleryAlbums)
      .set(updateFields)
      .where(eq(galleryAlbums.id, id))
      .returning();

    // 2. Replace photos if provided
    if (photos !== undefined) {
      // Delete old photos
      await db.delete(galleryPhotos).where(eq(galleryPhotos.albumId, id));

      // Insert new photos
      if (photos.length > 0) {
        const photoValues = photos.map((url: string, idx: number) => ({
          albumId: id,
          imageUrl: url,
          displayOrder: idx,
        }));
        await db.insert(galleryPhotos).values(photoValues);
      }
    }

    return NextResponse.json({ success: true, data: updatedAlbum });
  } catch (err: any) {
    console.error('Failed to update gallery album:', err);
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }

    // 1. Retrieve all photo URLs associated with this album
    const photosToDelete = await db
      .select({ imageUrl: galleryPhotos.imageUrl })
      .from(galleryPhotos)
      .where(eq(galleryPhotos.albumId, id));

    const albumRecord = await db
      .select({ coverPhoto: galleryAlbums.coverPhoto })
      .from(galleryAlbums)
      .where(eq(galleryAlbums.id, id));

    // 2. Delete each image file from 'media' storage bucket
    for (const p of photosToDelete) {
      if (p.imageUrl) {
        await deleteStorageFile(p.imageUrl, 'media');
      }
    }
    if (albumRecord.length > 0 && albumRecord[0].coverPhoto) {
      await deleteStorageFile(albumRecord[0].coverPhoto, 'media');
    }

    // 3. Delete database record (cascade deletes galleryPhotos)
    await db.delete(galleryAlbums).where(eq(galleryAlbums.id, id));

    return NextResponse.json({ success: true, message: 'Gallery album deleted successfully' });
  } catch (err: any) {
    console.error('Failed to delete gallery album:', err);
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 });
  }
}
