import BlogsList from './BlogsList';
import { db } from '@/lib/db';
import { blogs } from '@/lib/db/schema/blogs';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function BlogsPage() {
  let blogPosts = [];

  try {
    const rawBlogs = await db
      .select()
      .from(blogs)
      .where(eq(blogs.status, 'published'))
      .orderBy(desc(blogs.publishedAt), desc(blogs.createdAt));

    blogPosts = rawBlogs.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      readTime: Math.ceil((post.body?.split(' ').length || 0) / 200) + ' min read',
    }));
  } catch (error) {
    console.error('Error loading blogs from Database via Drizzle:', error);
  }

  return <BlogsList posts={blogPosts} />;
}
