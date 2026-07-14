import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const p = path.resolve(process.cwd(), file);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      content.split('\n').forEach((line) => {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
          if (key && !process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    }
  }
}
loadEnv();

async function main() {
  const { db } = await import('../src/lib/db');
  const { blogs, galleryAlbums, galleryPhotos } = await import('../src/lib/db/schema');

  try {
    const allBlogs = await db.select().from(blogs);
    console.log('--- BLOGS ---');
    console.log('Count:', allBlogs.length);
    console.log(allBlogs);

    const allAlbums = await db.select().from(galleryAlbums);
    console.log('--- GALLERY ALBUMS ---');
    console.log('Count:', allAlbums.length);
    console.log(allAlbums);

    const allPhotos = await db.select().from(galleryPhotos);
    console.log('--- GALLERY PHOTOS ---');
    console.log('Count:', allPhotos.length);
    console.log(allPhotos);
  } catch (err) {
    console.error('Error querying DB:', err);
  }
}

main();
