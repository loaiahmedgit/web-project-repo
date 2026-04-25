/**
 * FILE: app/api/posts/[id]/comments/route.js
 *
 * ENDPOINTS:
 *   GET  /api/posts/:id/comments  — Get all top-level comments for a post
 *   POST /api/posts/:id/comments  — Add a new comment (or reply) to a post
 *
 * ─────────────────────────────────────────────
 * GET /api/posts/:id/comments
 * ─────────────────────────────────────────────
 * Response 200:
 *   [
 *     {
 *       id, content, likes, createdAt, authorId, postId, parentId,
 *       author: { id, username, displayName, avatar, verified },
 *       replies: [
 *         {
 *           id, content, likes, createdAt, authorId, postId, parentId,
 *           author: { id, username, displayName, avatar, verified }
 *         },
 *         ...
 *       ]
 *     },
 *     ...
 *   ]
 *
 * Only top-level comments are returned at the root level.
 * Each comment includes its direct replies nested inside it.
 *
 * ─────────────────────────────────────────────
 * POST /api/posts/:id/comments
 * ─────────────────────────────────────────────
 * Request body (JSON):
 *   {
 *     authorId: string,   — required
 *     content:  string,   — required
 *     parentId?: string   — optional: ID of comment being replied to
 *   }
 *
 * Response 201:
 *   The newly created comment object with author info
 *
 * Response 400:
 *   { error: "..." } — if required fields are missing
 */

import { NextResponse } from 'next/server';
import {
  getCommentsByPost,
  createComment
} from 'maseera/lib/repository/commentRepository.js';

// ---------------------------------------------------------------------------
// GET /api/posts/:id/comments
// ---------------------------------------------------------------------------
export async function GET(request, { params }) {
  try {
    const comments = await getCommentsByPost(params.id);
    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error('[GET /api/posts/:id/comments]', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/posts/:id/comments
// ---------------------------------------------------------------------------
export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { authorId, content, parentId } = body;

    // Both authorId and content are required to create a comment
    if (!authorId || !content) {
      return NextResponse.json(
        { error: 'authorId and content are required' },
        { status: 400 }
      );
    }

    // parentId is optional — if omitted, createComment defaults it to null
    // which makes this a top-level comment instead of a reply
    const comment = await createComment(params.id, authorId, content, parentId);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('[POST /api/posts/:id/comments]', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}