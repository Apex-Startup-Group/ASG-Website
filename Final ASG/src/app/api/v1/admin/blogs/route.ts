import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogs } from '@/lib/db/schema/blogs';
import { createClient } from '@/lib/supabase/server';
import { desc, eq } from 'drizzle-orm';
import { adminUsers } from '@/lib/db/schema/admin_users';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to access admin blogs' } },
        { status: 401 }
      );
    }

    const allBlogs = await db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        adminId: blogs.adminId,
        category: blogs.category,
        excerpt: blogs.excerpt,
        coverImage: blogs.coverImage,
        body: blogs.body,
        status: blogs.status,
        publishedAt: blogs.publishedAt,
        createdAt: blogs.createdAt,
        authorName: adminUsers.name,
        author: blogs.author,
        metaTitle: blogs.metaTitle,
        metaDescription: blogs.metaDescription,
        keywords: blogs.keywords,
        tags: blogs.tags,
      })
      .from(blogs)
      .leftJoin(adminUsers, eq(blogs.adminId, adminUsers.id))
      .orderBy(desc(blogs.createdAt));

    const getFullStorageUrl = (coverPath: string) => {
      if (!coverPath) return '';
      if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) return coverPath;
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${coverPath}`;
    };

    // Map database fields to the frontend CMS compatibility structure
    const mappedBlogs = allBlogs.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      adminId: b.adminId,
      author: b.author || b.authorName || 'ASG Editor',
      category: b.category,
      excerpt: b.excerpt,
      thumbnailUrl: getFullStorageUrl(b.coverImage),
      content: b.body,
      status: b.status === 'published' ? 'Published' : 'Draft',
      date: b.publishedAt ? b.publishedAt.toISOString().split('T')[0] : b.createdAt.toISOString().split('T')[0],
      createdAt: b.createdAt.toISOString(),
      publishedAt: b.publishedAt ? b.publishedAt.toISOString() : null,
      readTime: '1 min read',
      tags: b.tags || [],
      metaTitle: b.metaTitle || b.title,
      metaDescription: b.metaDescription || b.excerpt,
      keywords: b.keywords || '',
    }));

    // Recalculate read time
    mappedBlogs.forEach((b) => {
      const cleanText = b.content.replace(/<[^>]*>/g, '');
      const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
      const minutes = Math.max(1, Math.ceil(words / 200));
      b.readTime = `${minutes} min read`;
    });

    return NextResponse.json({
      data: mappedBlogs,
    });
  } catch (err: any) {
    console.error('Failed to fetch admin blogs:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch admin blogs' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to manage blogs' } },
        { status: 401 }
      );
    }

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

    const publishedAt = dbStatus === 'published' ? new Date() : null;

    let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    
    // Auto-resolve unique slug constraints
    let slugExists = true;
    let counter = 0;
    let tempSlug = finalSlug;
    while (slugExists) {
      const existing = await db
        .select()
        .from(blogs)
        .where(eq(blogs.slug, tempSlug))
        .limit(1);
      
      if (existing.length === 0) {
        finalSlug = tempSlug;
        slugExists = false;
      } else {
        counter++;
        tempSlug = `${finalSlug}-${counter}`;
      }
    }

    const [newBlog] = await db
      .insert(blogs)
      .values({
        title,
        slug: finalSlug,
        adminId: user.id,
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
      })
      .returning();

    return NextResponse.json({
      data: {
        id: newBlog.id,
        title: newBlog.title,
        slug: newBlog.slug,
        category: newBlog.category,
        excerpt: newBlog.excerpt,
        thumbnailUrl: newBlog.coverImage,
        content: newBlog.body,
        status: newBlog.status === 'published' ? 'Published' : 'Draft',
        author: newBlog.author || '',
        metaTitle: newBlog.metaTitle || newBlog.title,
        metaDescription: newBlog.metaDescription || newBlog.excerpt,
        keywords: newBlog.keywords || '',
        tags: newBlog.tags || [],
        date: newBlog.publishedAt ? newBlog.publishedAt.toISOString().split('T')[0] : newBlog.createdAt.toISOString().split('T')[0],
        createdAt: newBlog.createdAt.toISOString(),
        publishedAt: newBlog.publishedAt ? newBlog.publishedAt.toISOString() : null,
      },
    });
  } catch (err: any) {
    console.error('Failed to create blog:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to create blog' } },
      { status: 500 }
    );
  }
}
