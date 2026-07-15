import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogs } from '@/lib/db/schema/blogs';
import { createClient } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service';
import { eq, ne, and } from 'drizzle-orm';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to manage blogs' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const {
      title,
      slug,
      category,
      excerpt,
      thumbnailUrl, // Map to coverImage
      content,      // Map to body
      status,       // "Published" or "Draft"
      author,
      metaTitle,
      metaDescription,
      keywords,
      tags, // array of strings
    } = body;

    const dbStatus = status === 'Published' ? 'published' : 'draft';

    if (dbStatus === 'published' && (!title || !thumbnailUrl || !content || !excerpt || !category)) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Missing required fields for publishing' } },
        { status: 400 }
      );
    }

    if (dbStatus === 'draft' && !title) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Title is required to save a draft' } },
        { status: 400 }
      );
    }

    // Fetch existing blog to check publishedAt status
    const existing = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Blog post not found' } },
        { status: 404 }
      );
    }

    let publishedAt = existing[0].publishedAt;
    if (dbStatus === 'published' && !publishedAt) {
      publishedAt = new Date();
    } else if (dbStatus === 'draft') {
      publishedAt = null;
    }

    let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    
    // Auto-resolve unique slug constraints excluding current post
    let slugExists = true;
    let counter = 0;
    let tempSlug = finalSlug;
    while (slugExists) {
      const existingWithSlug = await db
        .select()
        .from(blogs)
        .where(and(eq(blogs.slug, tempSlug), ne(blogs.id, id)))
        .limit(1);
      
      if (existingWithSlug.length === 0) {
        finalSlug = tempSlug;
        slugExists = false;
      } else {
        counter++;
        tempSlug = `${finalSlug}-${counter}`;
      }
    }

    const [updatedBlog] = await db
      .update(blogs)
      .set({
        title,
        slug: finalSlug,
        category: category || 'Draft',
        excerpt: excerpt || '',
        coverImage: thumbnailUrl || '',
        body: content || '',
        status: dbStatus,
        publishedAt,
        author: author || '',
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || '',
        keywords: keywords || '',
        tags: tags || [],
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, id))
      .returning();

    return NextResponse.json({
      data: {
        id: updatedBlog.id,
        title: updatedBlog.title,
        slug: updatedBlog.slug,
        category: updatedBlog.category,
        excerpt: updatedBlog.excerpt,
        thumbnailUrl: updatedBlog.coverImage,
        content: updatedBlog.body,
        status: updatedBlog.status === 'published' ? 'Published' : 'Draft',
        author: updatedBlog.author || '',
        metaTitle: updatedBlog.metaTitle || updatedBlog.title,
        metaDescription: updatedBlog.metaDescription || updatedBlog.excerpt,
        keywords: updatedBlog.keywords || '',
        tags: updatedBlog.tags || [],
        date: updatedBlog.publishedAt ? updatedBlog.publishedAt.toISOString().split('T')[0] : updatedBlog.createdAt.toISOString().split('T')[0],
        createdAt: updatedBlog.createdAt.toISOString(),
        publishedAt: updatedBlog.publishedAt ? updatedBlog.publishedAt.toISOString() : null,
      },
    });
  } catch (err: any) {
    console.error('Failed to update blog:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to update blog' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to manage blogs' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const [deletedBlog] = await db
      .delete(blogs)
      .where(eq(blogs.id, id))
      .returning();

    if (!deletedBlog) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Blog post not found' } },
        { status: 404 }
      );
    }

    // Helper to delete files from Supabase Storage 'media' bucket
    const deleteFromStorage = async (filePath: string) => {
      try {
        if (!filePath) return;
        
        let relativePath = filePath;
        // Extract relative path if it is a full Supabase URL
        if (filePath.includes('/public/media/')) {
          relativePath = filePath.split('/public/media/')[1];
        }
        
        console.log('Attempting to delete file from media storage:', relativePath);
        const { error } = await supabaseService.storage
          .from('media')
          .remove([relativePath]);
          
        if (error) {
          console.error('Failed to delete file from storage:', relativePath, error);
        } else {
          console.log('Successfully deleted file from storage:', relativePath);
        }
      } catch (e) {
        console.error('Error during file deletion:', e);
      }
    };

    // 1. Delete cover image
    if (deletedBlog.coverImage) {
      await deleteFromStorage(deletedBlog.coverImage);
    }

    // 2. Extract and delete any inline images in the blog body
    if (deletedBlog.body) {
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
      let match;
      while ((match = imgRegex.exec(deletedBlog.body)) !== null) {
        const imgSrc = match[1];
        if (imgSrc.includes('/public/media/') || !imgSrc.startsWith('http')) {
          await deleteFromStorage(imgSrc);
        }
      }
    }

    return NextResponse.json({
      message: 'Blog post deleted successfully',
      id: deletedBlog.id,
    });
  } catch (err: any) {
    console.error('Failed to delete blog:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to delete blog' } },
      { status: 500 }
    );
  }
}
