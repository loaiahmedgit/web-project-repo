/**
 * FILE: app/api/posts/[id]/route.js
 *
 * ENDPOINTS:
 *   GET    /api/posts/:id  — Get a single post by ID
 *   DELETE /api/posts/:id  — Delete a post (only the author can do this)
 *
 * ─────────────────────────────────────────────
 * GET /api/posts/:id
 * ─────────────────────────────────────────────
 * Response 200:
 *   {
 *     id, caption, mediaPath, mediaType, audioPath, hashtags, createdAt, authorId,
 *     author: { id, username, displayName, avatar, verified },
 *     _count: { likes, comments, reposts }
 *   }
 *
 * Response 404:
 *   { error: "Post not found" }
 *
 * ─────────────────────────────────────────────
 * DELETE /api/posts/:id
 * ─────────────────────────────────────────────
 * Request body (JSON):
 *   { userId: string }  — must be the post's author, otherwise nothing is deleted
 *
 * Response 200:
 *   { success: true, deleted: 1 }  — if post was deleted
 *   { success: true, deleted: 0 }  — if post was not found or user is not the author
 */

import { NextResponse } from 'next/server';
import { getPostById, deletePost } from 'maseera/lib/repository/postRepository.js';

// ---------------------------------------------------------------------------
// GET /api/posts/:id
// ---------------------------------------------------------------------------
export async function GET(request, { params }) {
  try {
    const post = await getPostById(params.id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error('[GET /api/posts/:id]', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/posts/:id
// ---------------------------------------------------------------------------
export async function DELETE(request, { params }) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // deletePost uses deleteMany with authorId check — if the user is not
    // the author, 0 rows are deleted and no error is thrown.
    const result = await deletePost(params.id, userId);

    return NextResponse.json({ success: true, deleted: result.count }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/posts/:id]', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}