/**
 * FILE: app/api/users/route.js
 *
 * ENDPOINTS:
 *   GET  /api/users           — Paginated list of all users
 *   POST /api/users           — Create a new user account
 *
 * ─────────────────────────────────────────────
 * GET /api/users
 * ─────────────────────────────────────────────
 * Query parameters:
 *   page (optional, default 0) — which page of results
 *
 * Example: GET /api/users?page=1
 *
 * Response 200:
 *   [ { id, username, displayName, avatar, verified, _count: { followers, posts } }, ... ]
 *
 * ─────────────────────────────────────────────
 * POST /api/users
 * ─────────────────────────────────────────────
 * Request body (JSON):
 *   { username, displayName, email, password, avatar?, bio? }
 *
 * Response 201:
 *   { id, username, displayName, avatar, verified, createdAt }
 *
 * Response 400:
 *   { error: "..." } — if required fields are missing
 */

import { NextResponse } from 'next/server';
import { getAllUsers, createUser } from 'maseera/lib/repository/userRepository.js';

// ---------------------------------------------------------------------------
// GET /api/users
// ---------------------------------------------------------------------------
export async function GET(request) {
  try {
    // Read the ?page= query parameter from the URL.
    // `?? 0` means: if the param is missing or null, use 0 as default.
    const page = Number(request.nextUrl.searchParams.get('page') ?? 0);

    const users = await getAllUsers(page);

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('[GET /api/users]', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/users
// ---------------------------------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, displayName, email, password, avatar, bio } = body;

    // Validate required fields before touching the database
    if (!username || !displayName || !email || !password) {
      return NextResponse.json(
        { error: 'username, displayName, email, and password are required' },
        { status: 400 }
      );
    }

    // NOTE: In a real app you would hash the password here before saving.
    // e.g.: const hashed = await bcrypt.hash(password, 10);
    // For this project, we pass it as-is per the professor's scope.
    const user = await createUser({ username, displayName, email, password, avatar, bio });

    // 201 Created — a new resource was successfully created
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    // Prisma throws a specific error code when a unique constraint fails
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      );
    }
    console.error('[POST /api/users]', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}