<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { getAllPosts, createPost } from '@/lib/repository';

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  } catch (error) {
=======
/**
 * FILE: app/api/posts/route.js
 *
 * ENDPOINTS:
 *   GET  /api/posts  — Paginated feed of all posts (newest first)
 *   POST /api/posts  — Create a new post
 *
 * ─────────────────────────────────────────────
 * GET /api/posts
 * ─────────────────────────────────────────────
 * Query parameters:
 *   page     (optional, default 0)   — which page of results
 *   hashtag  (optional)              — filter posts by hashtag
 *
 * Example: GET /api/posts?page=0
 * Example: GET /api/posts?hashtag=egypt
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
 *
 * ─────────────────────────────────────────────
 * POST /api/posts
 * ─────────────────────────────────────────────
 * Request body (JSON):
 *   {
 *     authorId: string,        — required
 *     caption:  string,        — required
 *     mediaPath?: string,      — optional
 *     mediaType?: string,      — optional ("image" | "video")
 *     audioPath?: string,      — optional
 *     hashtags?:  string       — optional, comma-separated e.g. "egypt,travel"
 *   }
 *
 * Response 201:
 *   The newly created post object with author info
 *
 * Response 400:
 *   { error: "..." } — if authorId or caption are missing
 */

import { NextResponse } from 'next/server';
import { getFeedPosts, getPostsByHashtag, createPost } from 'maseera/lib/repository/postRepository.js';

// ---------------------------------------------------------------------------
// GET /api/posts
// ---------------------------------------------------------------------------
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page    = Number(searchParams.get('page')    ?? 0);
    const hashtag = searchParams.get('hashtag'); // null if not provided

    let posts;
    if (hashtag) {
      // Hashtag filter was provided — fetch only matching posts
      posts = await getPostsByHashtag(hashtag);
    } else {
      // No filter — return paginated feed
      posts = await getFeedPosts(page);
    }

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('[GET /api/posts]', error);
>>>>>>> b8405eb27e29f708080b467f854e2c121b679ef0
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

<<<<<<< HEAD
export async function POST(req) {
  try {
    const body = await req.json();
    const post = await createPost(body);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
=======
// ---------------------------------------------------------------------------
// POST /api/posts
// ---------------------------------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();
    const { authorId, caption, mediaPath, mediaType, audioPath, hashtags } = body;

    // Validate the required fields
    if (!authorId || !caption) {
      return NextResponse.json(
        { error: 'authorId and caption are required' },
        { status: 400 }
      );
    }

    const post = await createPost(authorId, caption, {
      mediaPath, mediaType, audioPath, hashtags
    });

    // 201 Created
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('[POST /api/posts]', error);
>>>>>>> b8405eb27e29f708080b467f854e2c121b679ef0
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}