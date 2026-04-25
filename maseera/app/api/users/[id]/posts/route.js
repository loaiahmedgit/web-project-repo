/**
 * FILE: app/api/users/[id]/posts/route.js
 *
 * ENDPOINT:
 *   GET /api/users/:id/posts
 *
 * Returns all posts authored by the user identified by :id.
 * Posts are sorted newest first.
 *
 * Response 200:
 *   [
 *     {
 *       id, caption, mediaPath, mediaType, audioPath, hashtags, createdAt, authorId,
 *       author: { id, username, displayName, avatar, verified },
 *       _count: { likes, comments, reposts }
 *     },
 *     ...
 *   ]
 */

import { NextResponse } from 'next/server';
import { getPostsByUser } from 'maseera/lib/repository/postRepository.js';

export async function GET(request, { params }) {
  try {
    const posts = await getPostsByUser(params.id);
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('[GET /api/users/:id/posts]', error);
    return NextResponse.json({ error: 'Failed to fetch user posts' }, { status: 500 });
  }
}