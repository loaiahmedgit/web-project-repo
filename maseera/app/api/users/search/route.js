/**
 * FILE: app/api/users/search/route.js
 *
 * ENDPOINT:
 *   GET /api/users/search?q=...
 *
 * Searches for users whose username or displayName contains the query string.
 * The search is performed entirely inside the DB using Prisma's `contains` filter.
 * We never fetch all users and filter in JavaScript.
 *
 * Query parameters:
 *   q (required) — the search term, e.g. "ahmed"
 *
 * Example: GET /api/users/search?q=ahmed
 *
 * Response 200:
 *   [
 *     { id, username, displayName, avatar, verified },
 *     ...
 *   ]
 *   Maximum 20 results returned.
 *
 * Response 400:
 *   { error: "..." } — if q is missing or empty
 */

import { NextResponse } from 'next/server';
import { searchUsers } from 'maseera/lib/repository/userRepository.js';

export async function GET(request) {
  try {
    const q = request.nextUrl.searchParams.get('q');

    if (!q || q.trim() === '') {
      return NextResponse.json(
        { error: 'q query parameter is required' },
        { status: 400 }
      );
    }

    const users = await searchUsers(q.trim());
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('[GET /api/users/search]', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}