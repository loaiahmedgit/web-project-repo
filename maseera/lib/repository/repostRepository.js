/**
 * FILE: lib/repository/repostRepository.js
 *
 * PURPOSE:
 * All database operations for the Repost model (what the schema calls reposts,
 * equivalent to "retweets" in Twitter terminology).
 *
 * SCHEMA REFERENCE (Repost model):
 *   id        String   — unique repost ID
 *   createdAt DateTime
 *   userId    String   — FK → User.id (who reposted)
 *   postId    String   — FK → Post.id (what was reposted)
 *
 *   @@unique([userId, postId])  — a user can only repost a post once.
 *
 * NOTE: The model is named `Repost` in the schema (not Retweet).
 * All Prisma Client calls use `prisma.repost`.
 * This file follows the same toggle pattern as likeRepository.js.
 */

import { prisma } from '../prisma.js';

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------

/**
 * Checks whether a user has already reposted a post.
 * Used to show an active/inactive repost button in the UI.
 *
 * @param {string} postId
 * @param {string} userId
 * @returns {Object|null} The Repost record or null
 */
export async function getRepost(postId, userId) {
  return prisma.repost.findFirst({
    where: { postId, userId }
  });
}

/**
 * Returns the total number of reposts on a post.
 *
 * @param {string} postId
 * @returns {number}
 */
export async function getRepostCount(postId) {
  return prisma.repost.count({
    where: { postId }
  });
}

/**
 * Returns all users who reposted a post.
 *
 * @param {string} postId
 * @returns {Array} Repost records with user info
 */
export async function getRepostsByPost(postId) {
  return prisma.repost.findMany({
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
 * Toggles a repost for a user on a post.
 * Same pattern as toggleLike: check → delete or create.
 *
 * @param {string} postId
 * @param {string} userId
 * @returns {{ reposted: boolean }} The resulting state after the toggle
 */
export async function toggleRepost(postId, userId) {
  const existing = await getRepost(postId, userId);

  if (existing) {
    // Already reposted — remove it
    await prisma.repost.delete({
      where: { id: existing.id }
    });
    return { reposted: false };
  } else {
    // Not yet reposted — create it
    await prisma.repost.create({
      data: { postId, userId }
    });
    return { reposted: true };
  }
}