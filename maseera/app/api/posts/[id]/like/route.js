/**
 * FILE: app/api/posts/[id]/like/route.js
 *
 * ENDPOINTS:
 *   POST /api/posts/:id/like  — Toggle like on a post
 *   GET  /api/posts/:id/like  — Check if a user has liked a post + get count
 *
 * ─────────────────────────────────────────────
 * POST /api/posts/:id/like
 * ─────────────────────────────────────────────
 * Request body (JSON):
 *   { userId: string }
 *
 * Response 200:
 *   { liked: true }   — user now likes the post
 *   { liked: false }  — user has unliked the post
 *
 * ─────────────────────────────────────────────
 * GET /api/posts/:id/like
 * ─────────────────────────────────────────────
 * Query parameters:
 *   userId (required) — whose like status to check
 *
 * Example: GET /api/posts/post_1/like?userId=user_ahmed
 *
 * Response 200:
 *   { liked: boolean, count: number }
 */

import { NextResponse } from 'next/server';
import { toggleLike, getLike, getLikeCount } from 'maseera/lib/repository/likeRepository.js';

// ---------------------------------------------------------------------------
// GET /api/posts/:id/like?userId=...
// ---------------------------------------------------------------------------
export async function GET(request, { params }) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
    }

    // Run both DB queries in parallel using Promise.all — faster than sequential
    const [existing, count] = await Promise.all([
      getLike(params.id, userId),
      getLikeCount(params.id)
    ]);

    return NextResponse.json({ liked: !!existing, count }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/posts/:id/like]', error);
    return NextResponse.json({ error: 'Failed to get like status' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/posts/:id/like
// ---------------------------------------------------------------------------
export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const result = await toggleLike(params.id, userId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[POST /api/posts/:id/like]', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}