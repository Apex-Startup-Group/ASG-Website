import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogs } from '@/lib/db/schema/blogs';
import { eq, desc } from 'drizzle-orm';
import { adminUsers } from '@/lib/db/schema/admin_users';

export async function GET() {
  try {
    const publishedBlogs = await db
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
      .where(eq(blogs.status, 'published'))
      .orderBy(desc(blogs.publishedAt), desc(blogs.createdAt));

    const getFullStorageUrl = (coverPath: string) => {
      if (!coverPath) return '';
      if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) return coverPath;
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${coverPath}`;
    };

    // Map database fields to the frontend compatibility structure
    const mappedBlogs = publishedBlogs.map((b) => ({
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
      readTime: '1 min read', // Will be recalculated/saved or we can estimate from body length
      tags: b.tags || [],
      metaTitle: b.metaTitle || b.title,
      metaDescription: b.metaDescription || b.excerpt,
      keywords: b.keywords || '',
    }));

    // Simple helper to calculate read time from body text length
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
    console.error('Failed to fetch blogs:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch blogs' } },
      { status: 500 }
    );
  }
}
