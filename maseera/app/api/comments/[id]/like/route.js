/**
 * FILE: app/api/comments/[id]/like/route.js
 *
 * ENDPOINT:
 *   POST /api/comments/:id/like
 *
 * Increments the `likes` integer on a comment by 1.
 *
 * NOTE: Comment likes work differently from post likes.
 * Post likes are a separate table (Like model) supporting toggle.
 * Comment likes are a plain integer column on the Comment model.
 * The schema stores them as `likes Int @default(0)` — there is no
 * separate CommentLike table, so there is no unlike functionality.
 *
 * ─────────────────────────────────────────────
 * POST /api/comments/:id/like
 * ─────────────────────────────────────────────
 * No request body needed — just the comment ID in the URL.
 *
 * Response 200:
 *   { id: string, likes: number }  — updated like count
 */

import { NextResponse } from 'next/server';
import { likeComment } from 'maseera/lib/repository/commentRepository.js';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const updated = await likeComment(id);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    // Prisma P2025 = record not found
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    console.error('[POST /api/comments/:id/like]', error);
    return NextResponse.json({ error: 'Failed to like comment' }, { status: 500 });
  }
}