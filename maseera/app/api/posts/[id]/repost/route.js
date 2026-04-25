/**
 * FILE: app/api/posts/[id]/repost/route.js
 *
 * ENDPOINTS:
 *   POST /api/posts/:id/repost  — Toggle repost on a post
 *   GET  /api/posts/:id/repost  — Check if a user has reposted a post + get count
 *
 * ─────────────────────────────────────────────
 * POST /api/posts/:id/repost
 * ─────────────────────────────────────────────
 * Request body (JSON):
 *   { userId: string }
 *
 * Response 200:
 *   { reposted: true }   — user has now reposted the post
 *   { reposted: false }  — user has un-reposted the post
 *
 * ─────────────────────────────────────────────
 * GET /api/posts/:id/repost
 * ─────────────────────────────────────────────
 * Query parameters:
 *   userId (required) — whose repost status to check
 *
 * Example: GET /api/posts/post_1/repost?userId=user_ahmed
 *
 * Response 200:
 *   { reposted: boolean, count: number }
 */

import { NextResponse } from 'next/server';
import {
  toggleRepost,
  getRepost,
  getRepostCount
} from 'maseera/lib/repository/repostRepository.js';

// ---------------------------------------------------------------------------
// GET /api/posts/:id/repost?userId=...
// ---------------------------------------------------------------------------
export async function GET(request, { params }) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Run both DB queries in parallel — no need to wait for one before the other
    const [existing, count] = await Promise.all([
      getRepost(params.id, userId),
      getRepostCount(params.id)
    ]);

    return NextResponse.json({ reposted: !!existing, count }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/posts/:id/repost]', error);
    return NextResponse.json({ error: 'Failed to get repost status' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/posts/:id/repost
// ---------------------------------------------------------------------------
export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const result = await toggleRepost(params.id, userId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[POST /api/posts/:id/repost]', error);
    return NextResponse.json({ error: 'Failed to toggle repost' }, { status: 500 });
  }
}