/**
 * FILE: app/api/follows/route.js
 *
 * ENDPOINTS:
 *   POST /api/follows  — Toggle follow between two users
 *   GET  /api/follows  — Check if user A follows user B
 *
 * ─────────────────────────────────────────────
 * POST /api/follows
 * ─────────────────────────────────────────────
 * Request body (JSON):
 *   { followerId: string, followingId: string }
 *
 *   followerId  = the user performing the action (Alice)
 *   followingId = the user being followed/unfollowed (Bob)
 *
 * Response 200:
 *   { following: true }   — Alice now follows Bob
 *   { following: false }  — Alice has unfollowed Bob
 *
 * Response 400:
 *   { error: "..." } — if fields are missing or user tries to follow themselves
 *
 * ─────────────────────────────────────────────
 * GET /api/follows
 * ─────────────────────────────────────────────
 * Query parameters:
 *   followerId  (required)
 *   followingId (required)
 *
 * Example: GET /api/follows?followerId=user_ahmed&followingId=user_omar
 *
 * Response 200:
 *   { following: boolean }
 */

import { NextResponse } from 'next/server';
import { toggleFollow, getFollow } from 'maseera/lib/repository/followRepository.js';

// ---------------------------------------------------------------------------
// GET /api/follows?followerId=...&followingId=...
// ---------------------------------------------------------------------------
export async function GET(request) {
  try {
    const params  = request.nextUrl.searchParams;
    const followerId  = params.get('followerId');
    const followingId = params.get('followingId');

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: 'followerId and followingId query parameters are required' },
        { status: 400 }
      );
    }

    const existing = await getFollow(followerId, followingId);
    return NextResponse.json({ following: !!existing }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/follows]', error);
    return NextResponse.json({ error: 'Failed to check follow status' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/follows
// ---------------------------------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();
    const { followerId, followingId } = body;

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: 'followerId and followingId are required' },
        { status: 400 }
      );
    }

    // Guard: a user cannot follow themselves — this would create nonsensical data
    if (followerId === followingId) {
      return NextResponse.json(
        { error: 'A user cannot follow themselves' },
        { status: 400 }
      );
    }

    const result = await toggleFollow(followerId, followingId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[POST /api/follows]', error);
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 });
  }
}