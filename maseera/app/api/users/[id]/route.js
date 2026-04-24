/**
 * FILE: app/api/users/[id]/route.js
 *
 * ENDPOINTS:
 *   GET   /api/users/:id  — Get a single user by ID
 *   PATCH /api/users/:id  — Update a user's profile fields
 *
 * The [id] folder name is a Next.js dynamic segment.
 * Next.js passes it as params.id to the handler function.
 * Example: GET /api/users/user_ahmed → params.id = "user_ahmed"
 *
 * ─────────────────────────────────────────────
 * GET /api/users/:id
 * ─────────────────────────────────────────────
 * Response 200:
 *   { id, username, displayName, avatar, bio, verified, createdAt,
 *     _count: { followers, following, posts } }
 *
 * Response 404:
 *   { error: "User not found" }
 *
 * ─────────────────────────────────────────────
 * PATCH /api/users/:id
 * ─────────────────────────────────────────────
 * Request body (JSON) — all fields optional, only provided ones are updated:
 *   { displayName?, bio?, avatar? }
 *
 * Response 200:
 *   { id, username, displayName, avatar, bio, verified }
 */

import { NextResponse } from 'next/server';
import { getUserById, updateUser } from 'maseera/lib/repository/userRepository.js';

// ---------------------------------------------------------------------------
// GET /api/users/:id
// ---------------------------------------------------------------------------
export async function GET(request, { params }) {
  try {
    const user = await getUserById(params.id);

    // getUserById returns null when no record matches — send 404
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('[GET /api/users/:id]', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/users/:id
// ---------------------------------------------------------------------------
export async function PATCH(request, { params }) {
  try {
    const body = await request.json();

    // Only pick the fields that are allowed to be updated.
    // We build the `data` object explicitly so callers cannot inject
    // arbitrary fields like `password` or `verified`.
    const allowedFields = ['displayName', 'bio', 'avatar'];
    const data = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided to update' },
        { status: 400 }
      );
    }

    const updated = await updateUser(params.id, data);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    // Prisma P2025 = record not found for update
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.error('[PATCH /api/users/:id]', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}