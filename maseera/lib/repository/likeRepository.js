/**
 * FILE: lib/repository/likeRepository.js
 *
 * PURPOSE:
 * All database operations for post likes (the Like model).
 * Note: comment likes are a plain integer on the Comment model and are
 * handled in commentRepository.js — this file only deals with post likes.
 *
 * SCHEMA REFERENCE (Like model):
 *   id        String   — unique like ID
 *   createdAt DateTime
 *   userId    String   — FK → User.id (who liked)
 *   postId    String   — FK → Post.id (what was liked)
 *
 *   @@unique([userId, postId])  — a user can only like a post once.
 *   The DB enforces this constraint, so we do not need to check manually
 *   before inserting — a duplicate will throw a unique constraint error.
 *
 * TOGGLE PATTERN:
 * Social media like buttons work as toggles: clicking like when already
 * liked should unlike. We implement this by checking for an existing Like
 * record and either deleting it (unlike) or creating it (like).
 */

import { prisma } from '../prisma.js';

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------

/**
 * Checks whether a specific user has already liked a specific post.
 * Used to decide whether to show a filled or empty heart icon in the UI.
 *
 * `findFirst` returns the first match or null — we only ever expect 0 or 1
 * because of the @@unique([userId, postId]) constraint.
 *
 * @param {string} postId
 * @param {string} userId
 * @returns {Object|null} The Like record if it exists, null otherwise
 */
export async function getLike(postId, userId) {
  return prisma.like.findFirst({
    where: { postId, userId } // DB filter: WHERE postId = ? AND userId = ?
  });
}

/**
 * Returns the total number of likes on a post.
 * `count` tells the DB to run SELECT COUNT(*) — no Like rows are transferred.
 *
 * @param {string} postId
 * @returns {number} Total like count
 */
export async function getLikeCount(postId) {
  return prisma.like.count({
    where: { postId }
  });
}

/**
 * Returns all users who liked a post (for a "liked by" list).
 * Sorted by most recent first.
 *
 * @param {string} postId
 * @returns {Array} Like records with user info
 */
export async function getLikesByPost(postId) {
  return prisma.like.findMany({
    where: { postId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          verified: true
        }
      }
    }
  });
}

// ---------------------------------------------------------------------------
// TOGGLE
// ---------------------------------------------------------------------------

/**
 * Toggles a like on a post for a given user.
 *
 * Flow:
 *   1. Check if a Like record exists for this (userId, postId) pair
 *   2a. If it EXISTS  → delete it (unlike) → return { liked: false }
 *   2b. If it DOESN'T → create it (like)   → return { liked: true }
 *
 * This is a two-step operation (read then write). For a production app you
 * would wrap this in a transaction, but for this project the sequential
 * approach is clear and sufficient.
 *
 * @param {string} postId
 * @param {string} userId
 * @returns {{ liked: boolean }} The resulting state after the toggle
 */
export async function toggleLike(postId, userId) {
  const existing = await getLike(postId, userId);

  if (existing) {
    // Like record found — remove it (unlike)
    await prisma.like.delete({
      where: { id: existing.id }
    });
    return { liked: false };
  } else {
    // No like record — create one
    await prisma.like.create({
      data: { postId, userId }
    });
    return { liked: true };
  }
}