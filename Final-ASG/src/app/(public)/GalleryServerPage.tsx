import GalleryPage from './gallery/GalleryPage';
import { createClient as createServerSupabase } from '@/lib/supabase/server';

export default async function GalleryServerPage() {
  let galleryEntries = [];

  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('gallery_albums')
      .select('id, title, description, cover_photo, event_date')
      .eq('status', 'published')
      .order('event_date', { ascending: false });

    if (!error && data) {
      galleryEntries = data.map((entry) => ({
        ...entry,
        coverPhoto: entry.cover_photo,
        eventDate: entry.event_date,
        photos: [],
      }));
    }
  } catch (err) {
    console.error('Error loading gallery from Supabase:', err);
  }

  return <GalleryPage entries={galleryEntries} />;
}
