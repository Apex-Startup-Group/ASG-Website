import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';
import { UPLOAD_CONFIGS } from '@/lib/constants/uploads';
import crypto from 'crypto';

// Helper to verify magic bytes of the image buffer
function isValidImageHeader(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  const isRiff =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46; // "RIFF"
  const isWebp =
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50; // "WEBP"
  if (isRiff && isWebp) {
    return true;
  }

  return false;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const fileEntry = formData.get('file');
    const bucket = formData.get('bucket') as string;
    const uploadType = formData.get('uploadType') as string;

    if (!fileEntry || !(fileEntry instanceof Blob)) {
      return NextResponse.json(
        { error: { code: 'INVALID_FILE', message: 'No file provided' } },
        { status: 400 }
      );
    }

    const config = UPLOAD_CONFIGS[uploadType];
    if (!config) {
      return NextResponse.json(
        { error: { code: 'INVALID_UPLOAD_TYPE', message: `Invalid upload type: ${uploadType}` } },
        { status: 400 }
      );
    }

    // Double check bucket validity matching the config
    if (config.bucket !== bucket) {
      return NextResponse.json(
        { error: { code: 'INVALID_BUCKET', message: 'Mismatch between upload configuration and bucket' } },
        { status: 400 }
      );
    }

    // 1. Verify File Size
    const buffer = Buffer.from(await fileEntry.arrayBuffer());
    if (buffer.length > config.maxSize) {
      return NextResponse.json(
        {
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File size exceeds the limit of ${config.maxSize / (1024 * 1024)} MB`,
          },
        },
        { status: 400 }
      );
    }

    // 2. Verify File Type (Magic Bytes)
    if (!isValidImageHeader(buffer)) {
      return NextResponse.json(
        { error: { code: 'INVALID_FILE_TYPE', message: 'File is not a valid image (.jpg, .jpeg, .png, .webp)' } },
        { status: 400 }
      );
    }

    // 3. Generate Folder Path and UUID Filename:
    // For 'media' bucket, structure as: {Category}/{year}/{uuid}.webp
    // For other buckets, structure as: {year}/{month}/{uuid}.webp
    const date = new Date();
    const year = date.getFullYear();
    const filename = `${crypto.randomUUID()}.webp`;
    
    let filePath = '';
    if (bucket === 'media') {
      let categoryFolder = 'general';
      if (uploadType === 'event_banner') categoryFolder = 'Event';
      else if (uploadType === 'gallery_photo') categoryFolder = 'gallery';
      else if (uploadType === 'blog_cover') categoryFolder = 'blogs';
      filePath = `${categoryFolder}/${year}/${filename}`;
    } else {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      filePath = `${year}/${month}/${filename}`;
    }

    // 4. Upload to Supabase Storage
    const { error: uploadError } = await supabaseService.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError);
      return NextResponse.json(
        { error: { code: 'STORAGE_ERROR', message: uploadError.message } },
        { status: 500 }
      );
    }

    // 5. Get Public URL
    const { data: { publicUrl } } = supabaseService.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      filename,
    });
  } catch (err: any) {
    console.error('Upload handler error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
