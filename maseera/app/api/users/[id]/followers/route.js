/**
 * FILE: app/api/users/[id]/followers/route.js
 *
 * ENDPOINT:
 *   GET /api/users/:id/followers
 *
 * Returns the list of users who follow the user identified by :id.
 *
 * Response 200:
 *   [
 *     {
 *       id, createdAt,
 *       follower: { id, username, displayName, avatar, verified }
 *     },
 *     ...
 *   ]
 *
 * The `follower` nested object is the person doing the following.
 * The :id in the URL is the person being followed.
 */

import { NextResponse } from 'next/server';
import { getFollowers } from 'maseera/lib/repository/followRepository.js';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const followers = await getFollowers(id);
    return NextResponse.json(followers, { status: 200 });
  } catch (error) {
    console.error('[GET /api/users/:id/followers]', error);
    return NextResponse.json({ error: 'Failed to fetch followers' }, { status: 500 });
  }
}