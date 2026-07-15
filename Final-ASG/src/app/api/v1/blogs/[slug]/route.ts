import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogs } from '@/lib/db/schema/blogs';
import { eq, and } from 'drizzle-orm';
import { adminUsers } from '@/lib/db/schema/admin_users';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const blogResult = await db
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
      .where(and(eq(blogs.slug, slug), eq(blogs.status, 'published')))
      .limit(1);

    if (blogResult.length === 0) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Blog post not found' } },
        { status: 404 }
      );
    }

    const b = blogResult[0];
    const cleanText = b.body.replace(/<[^>]*>/g, '');
    const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));

    const getFullStorageUrl = (coverPath: string) => {
      if (!coverPath) return '';
      if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) return coverPath;
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${coverPath}`;
    };

    const mappedBlog = {
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
      readTime: `${minutes} min read`,
      tags: b.tags || [],
      metaTitle: b.metaTitle || b.title,
      metaDescription: b.metaDescription || b.excerpt,
      keywords: b.keywords || '',
    };

    return NextResponse.json({
      data: mappedBlog,
    });
  } catch (err: any) {
    console.error('Failed to fetch blog detail:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch blog detail' } },
      { status: 500 }
    );
  }
}
