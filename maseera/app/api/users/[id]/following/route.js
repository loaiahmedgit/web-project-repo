/**
 * FILE: app/api/users/[id]/following/route.js
 *
 * ENDPOINT:
 *   GET /api/users/:id/following
 *
 * Returns the list of users that the user identified by :id is following.
 *
 * Response 200:
 *   [
 *     {
 *       id, createdAt,
 *       following: { id, username, displayName, avatar, verified }
 *     },
 *     ...
 *   ]
 *
 * The `following` nested object is the person being followed.
 * The :id in the URL is the person doing the following.
 */

import { NextResponse } from 'next/server';
import { getFollowing } from 'maseera/lib/repository/followRepository.js';

export async function GET(request, { params }) {
  try {
    const following = await getFollowing(params.id);
    return NextResponse.json(following, { status: 200 });
  } catch (error) {
    console.error('[GET /api/users/:id/following]', error);
    return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 });
  }
}