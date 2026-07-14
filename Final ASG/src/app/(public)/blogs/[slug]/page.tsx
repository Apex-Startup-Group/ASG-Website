import BlogDetail from '../BlogDetail';
import { db } from '@/lib/db';
import { blogs } from '@/lib/db/schema/blogs';
import { eq, ne, desc, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function BlogDetailPage({ params }) {
  const slug = params.slug;
  let blog = null;
  let relatedBlogs = [];

  try {
    const rawBlogs = await db
      .select()
      .from(blogs)
      .where(and(eq(blogs.slug, slug), eq(blogs.status, 'published')))
      .limit(1);

    if (rawBlogs.length > 0) {
      const blogData = rawBlogs[0];
      blog = {
        id: blogData.id,
        title: blogData.title,
        slug: blogData.slug,
        category: blogData.category,
        excerpt: blogData.excerpt,
        coverImage: blogData.coverImage,
        body: blogData.body,
        publishedAt: blogData.publishedAt,
        createdAt: blogData.createdAt,
        updatedAt: blogData.updatedAt,
        author: blogData.author || 'ASG Editor',
      };

      const rawRelated = await db
        .select()
        .from(blogs)
        .where(
          and(
            eq(blogs.category, blogData.category),
            ne(blogs.id, blogData.id),
            eq(blogs.status, 'published')
          )
        )
        .orderBy(desc(blogs.publishedAt), desc(blogs.createdAt))
        .limit(3);

      relatedBlogs = rawRelated.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        readTime: Math.ceil((post.body?.split(' ').length || 0) / 200) + ' min read',
      }));
    }
  } catch (error) {
    console.error('Error loading blog detail from Database via Drizzle:', error);
  }

  return <BlogDetail blog={blog} relatedBlogs={relatedBlogs} />;
}

