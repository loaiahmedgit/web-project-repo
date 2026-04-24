/**
 * FILE: lib/repository/followRepository.js
 *
 * PURPOSE:
 * All database operations for the Follow model.
 *
 * SCHEMA REFERENCE (Follow model):
 *   id          String   — unique follow ID
 *   createdAt   DateTime
 *   followerId  String   — FK → User.id with relation name "FollowSource"
 *                          This is the user who is DOING the following (the fan)
 *   followingId String   — FK → User.id with relation name "FollowTarget"
 *                          This is the user being FOLLOWED (the creator)
 *
 *   @@unique([followerId, followingId])  — can only follow once
 *
 * TERMINOLOGY (important — easy to mix up):
 *   follower  = the user who follows someone else (fan)
 *   following = the user being followed (creator)
 *
 * Example: Alice follows Bob
 *   followerId  = Alice's ID  (Alice is the follower)
 *   followingId = Bob's ID    (Bob is being followed)
 *
 * SCHEMA RELATION NAMES:
 *   On User model:
 *     followers  Follow[] @relation("FollowTarget") — people following THIS user
 *     following  Follow[] @relation("FollowSource") — people THIS user follows
 *
 *   On Follow model:
 *     follower  User @relation("FollowSource") — the fan
 *     following User @relation("FollowTarget") — the creator
 */

import { prisma } from '../prisma.js';

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------

/**
 * Returns all users that a given user is following.
 * i.e. "Who does userId follow?"
 *
 * We filter by followerId in the DB — no JS filtering.
 *
 * @param {string} userId - The user whose "following" list we want
 * @returns {Array} Follow records, each including the followed user's info
 */
export async function getFollowing(userId) {
  return prisma.follow.findMany({
    where: { followerId: userId },    // DB: WHERE followerId = ?
    orderBy: { createdAt: 'desc' },
    include: {
      // `following` is the relation name on Follow → User ("FollowTarget")
      // This gives us the user being followed (the creator, Bob)
      following: {
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

/**
 * Returns all users who follow a given user.
 * i.e. "Who follows userId?"
 *
 * @param {string} userId - The user whose followers we want
 * @returns {Array} Follow records, each including the follower's info
 */
export async function getFollowers(userId) {
  return prisma.follow.findMany({
    where: { followingId: userId },   // DB: WHERE followingId = ?
    orderBy: { createdAt: 'desc' },
    include: {
      // `follower` is the relation name on Follow → User ("FollowSource")
      // This gives us the user doing the following (the fan, Alice)
      follower: {
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

/**
 * Checks whether user A currently follows user B.
 * Used to show a "Follow" or "Unfollow" button on profile pages.
 *
 * @param {string} followerId  - The user who might be following (Alice)
 * @param {string} followingId - The user who might be followed (Bob)
 * @returns {Object|null} The Follow record if it exists, null otherwise
 */
export async function getFollow(followerId, followingId) {
  return prisma.follow.findFirst({
    where: { followerId, followingId }
  });
}

/**
 * Returns follower and following counts for a user.
 * Both counts are computed in the DB with a single query using _count.
 *
 * @param {string} userId
 * @returns {{ followers: number, following: number }}
 */
export async function getFollowCounts(userId) {
  const result = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      _count: {
        select: {
          followers: true,  // Follow records where followingId = userId
          following: true   // Follow records where followerId = userId
        }
      }
    }
  });
  // Flatten the nested _count object for easier use
  return result?._count ?? { followers: 0, following: 0 };
}

// ---------------------------------------------------------------------------
// TOGGLE
// ---------------------------------------------------------------------------

/**
 * Toggles a follow relationship between two users.
 *
 * Flow:
 *   1. Check if a Follow record exists for (followerId, followingId)
 *   2a. EXISTS  → delete it (unfollow) → return { following: false }
 *   2b. MISSING → create it (follow)   → return { following: true }
 *
 * @param {string} followerId  - The user performing the action
 * @param {string} followingId - The user being followed/unfollowed
 * @returns {{ following: boolean }}
 */
export async function toggleFollow(followerId, followingId) {
  const existing = await getFollow(followerId, followingId);

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return { following: false };
  } else {
    await prisma.follow.create({
      data: { followerId, followingId }
    });
    return { following: true };
  }
}