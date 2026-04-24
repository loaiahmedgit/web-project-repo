/**
 * FILE: app/api/messages/route.js
 *
 * ENDPOINTS:
 *   GET  /api/messages  — Get conversation between two users
 *   POST /api/messages  — Send a new direct message
 *
 * ─────────────────────────────────────────────
 * GET /api/messages
 * ─────────────────────────────────────────────
 * Query parameters:
 *   userIdA (required) — one participant
 *   userIdB (required) — the other participant
 *
 * Example: GET /api/messages?userIdA=user_ahmed&userIdB=user_lina
 *
 * Response 200:
 *   [
 *     {
 *       id, content, read, createdAt, senderId, receiverId,
 *       sender: { id, username, displayName, avatar }
 *     },
 *     ...
 *   ]
 *   Messages are sorted oldest-first (chronological chat order).
 *
 * ─────────────────────────────────────────────
 * POST /api/messages
 * ─────────────────────────────────────────────
 * Request body (JSON):
 *   { senderId: string, receiverId: string, content: string }
 *
 * Response 201:
 *   The newly created message with sender info
 *
 * Response 400:
 *   { error: "..." } — if required fields are missing or sender = receiver
 */

import { NextResponse } from 'next/server';
import {
  getConversation,
  sendMessage
} from 'maseera/lib/repository/messageRepository.js';

// ---------------------------------------------------------------------------
// GET /api/messages?userIdA=...&userIdB=...
// ---------------------------------------------------------------------------
export async function GET(request) {
  try {
    const params  = request.nextUrl.searchParams;
    const userIdA = params.get('userIdA');
    const userIdB = params.get('userIdB');

    if (!userIdA || !userIdB) {
      return NextResponse.json(
        { error: 'userIdA and userIdB query parameters are required' },
        { status: 400 }
      );
    }

    const messages = await getConversation(userIdA, userIdB);
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('[GET /api/messages]', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/messages
// ---------------------------------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();
    const { senderId, receiverId, content } = body;

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'senderId, receiverId, and content are required' },
        { status: 400 }
      );
    }

    // Guard: users should not message themselves
    if (senderId === receiverId) {
      return NextResponse.json(
        { error: 'A user cannot send a message to themselves' },
        { status: 400 }
      );
    }

    const message = await sendMessage(senderId, receiverId, content);
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('[POST /api/messages]', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}