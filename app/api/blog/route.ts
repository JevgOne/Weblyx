import { NextRequest, NextResponse } from 'next/server';
import {
  getAllBlogPosts,
  getPublishedBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '@/lib/turso/blog';
import type { CreateBlogPostData, UpdateBlogPostData } from '@/types/blog';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';

// GET /api/blog - Get all blog posts (or published only with ?published=true)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const publishedOnly = searchParams.get('published') === 'true';

    const posts = publishedOnly
      ? await getPublishedBlogPosts()
      : await getAllBlogPosts();

    // Convert to format expected by admin panel
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      author: post.authorName || 'Admin',
      published: post.published,
      featured: false, // Blog schema doesn't have featured field, set to false
      category: '', // Blog schema doesn't have category field
      tags: post.tags || [],
      imageUrl: post.featuredImage,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString(),
      views: post.views,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
    }));

    return NextResponse.json({
      success: true,
      data: formattedPosts,
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch blog posts',
      },
      { status: 500 }
    );
  }
}

// POST /api/blog - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    // Validate required fields
    if (!body.title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!body.slug?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      );
    }

    if (!body.content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // Prepare data for creation
    const createData: CreateBlogPostData = {
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt || undefined,
      authorName: body.author || 'Admin',
      featuredImage: body.imageUrl || undefined,
      published: body.published || false,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
      tags: body.tags || [],
      metaTitle: body.metaTitle || undefined,
      metaDescription: body.metaDescription || undefined,
    };

    const newPost = await createBlogPost(createData);

    return NextResponse.json({
      success: true,
      data: {
        id: newPost.id,
        title: newPost.title,
        slug: newPost.slug,
        excerpt: newPost.excerpt || '',
        content: newPost.content,
        author: newPost.authorName || 'Admin',
        published: newPost.published,
        featured: false,
        category: '',
        tags: newPost.tags || [],
        imageUrl: newPost.featuredImage,
        createdAt: newPost.createdAt,
        updatedAt: newPost.updatedAt,
        publishedAt: newPost.publishedAt,
        views: newPost.views,
        metaTitle: newPost.metaTitle,
        metaDescription: newPost.metaDescription,
      },
    });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create blog post',
      },
      { status: 500 }
    );
  }
}

// PUT /api/blog - Update an existing blog post
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if post exists
    const existingPost = await getBlogPostById(body.id);
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Prepare data for update
    const updateData: UpdateBlogPostData = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.author !== undefined) updateData.authorName = body.author;
    if (body.imageUrl !== undefined) updateData.featuredImage = body.imageUrl;
    if (body.published !== undefined) updateData.published = body.published;
    if (body.publishedAt !== undefined) {
      updateData.publishedAt = new Date(body.publishedAt);
    }
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) {
      updateData.metaDescription = body.metaDescription;
    }

    const updatedPost = await updateBlogPost(body.id, updateData);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedPost.id,
        title: updatedPost.title,
        slug: updatedPost.slug,
        excerpt: updatedPost.excerpt || '',
        content: updatedPost.content,
        author: updatedPost.authorName || 'Admin',
        published: updatedPost.published,
        featured: false,
        category: '',
        tags: updatedPost.tags || [],
        imageUrl: updatedPost.featuredImage,
        createdAt: updatedPost.createdAt,
        updatedAt: updatedPost.updatedAt,
        publishedAt: updatedPost.publishedAt,
        views: updatedPost.views,
        metaTitle: updatedPost.metaTitle,
        metaDescription: updatedPost.metaDescription,
      },
    });
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update blog post',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/blog?id={id} - Delete a blog post
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if post exists
    const existingPost = await getBlogPostById(id);
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    await deleteBlogPost(id);

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete blog post',
      },
      { status: 500 }
    );
  }
}
