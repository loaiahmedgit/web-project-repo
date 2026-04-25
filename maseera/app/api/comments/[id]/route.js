/**
 * FILE: app/api/comments/[id]/route.js
 *
 * ENDPOINTS:
 *   DELETE /api/comments/:id  — Delete a comment (only the author can)
 *
 * ─────────────────────────────────────────────
 * DELETE /api/comments/:id
 * ─────────────────────────────────────────────
 * Request body (JSON):
 *   { userId: string }  — must match the comment's authorId
 *
 * Response 200:
 *   { success: true, deleted: 1 }  — comment was deleted
 *   { success: true, deleted: 0 }  — comment not found or user is not the author
 */

import { NextResponse } from 'next/server';
import { deleteComment } from 'maseera/lib/repository/commentRepository.js';

export async function DELETE(request, { params }) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const result = await deleteComment(params.id, userId);

    return NextResponse.json({ success: true, deleted: result.count }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/comments/:id]', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}