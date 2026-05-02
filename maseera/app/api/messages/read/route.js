/**
 * FILE: app/api/messages/read/route.js
 *
 * ENDPOINTS:
 *   PATCH /api/messages/read  — Mark all messages from a sender as read
 *   GET   /api/messages/read  — Get unread message count for a user
 *
 * ─────────────────────────────────────────────
 * PATCH /api/messages/read
 * ─────────────────────────────────────────────
 * Called when a user opens their conversation with someone.
 * Marks all unread messages from that sender as read.
 *
 * Request body (JSON):
 *   { receiverId: string, senderId: string }
 *
 * Response 200:
 *   { success: true, updated: number }  — how many messages were marked read
 *
 * ─────────────────────────────────────────────
 * GET /api/messages/read
 * ─────────────────────────────────────────────
 * Returns the total number of unread messages for a user.
 * Used for the notification badge in the nav bar.
 *
 * Query parameters:
 *   userId (required)
 *
 * Example: GET /api/messages/read?userId=user_ahmed
 *
 * Response 200:
 *   { unreadCount: number }
 */

import { NextResponse } from 'next/server';
import {
  markMessagesAsRead,
  getUnreadCount
} from 'maseera/lib/repository/messageRepository.js';

// ---------------------------------------------------------------------------
// GET /api/messages/read?userId=...
// ---------------------------------------------------------------------------
export async function GET(request) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    const unreadCount = await getUnreadCount(userId);
    return NextResponse.json({ unreadCount }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/messages/read]', error);
    return NextResponse.json({ error: 'Failed to get unread count' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/messages/read
// ---------------------------------------------------------------------------
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { receiverId, senderId } = body;

    if (!receiverId || !senderId) {
      return NextResponse.json(
        { error: 'receiverId and senderId are required' },
        { status: 400 }
      );
    }

    const result = await markMessagesAsRead(receiverId, senderId);
    return NextResponse.json({ success: true, updated: result.count }, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/messages/read]', error);
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
  }
}