/**
 * FILE: lib/repository/postRepository.js
 *
 * PURPOSE:
 * All database read/write operations for the Post model.
 *
 * SCHEMA REFERENCE (Post model):
 *   id        String   — unique post ID
 *   caption   String   — the text content of the post
 *   mediaPath String?  — path to attached image/video, nullable
 *   mediaType String?  — "image" | "video" | null
 *   audioPath String?  — path to attached audio, nullable
 *   hashtags  String   — comma-separated hashtag string (e.g. "egypt,travel")
 *   createdAt DateTime — when the post was created
 *   authorId  String   — foreign key linking to User.id
 *
 * RELATIONS (used in `include`):
 *   author   — User     the user who wrote this post
 *   comments — Comment[]
 *   likes    — Like[]
 *   reposts  — Repost[]
 *
 * NOTE ON hashtags:
 * The schema stores hashtags as a plain comma-separated string, not a
 * separate table. Filtering by hashtag therefore uses `contains`.
 */

import { prisma } from '../prisma.js';

// ---------------------------------------------------------------------------
// READ — feed & lists
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of all posts, newest first.
 * This is the main feed — shown on the home page.
 *
 * Each post includes:
 *   - The author's basic public info (no password)
 *   - Counts of likes, comments, and reposts (computed in the DB with _count)
 *
 * @param {number} page     - Zero-indexed page number
 * @param {number} pageSize - Posts per page (default 10)
 * @returns {Array} Array of post objects with author and counts
 */
export async function getFeedPosts(page = 0, pageSize = 10) {
  return prisma.post.findMany({
    skip: page * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' }, // newest posts first — sorted in DB
    include: {
      // `include` performs a JOIN with the User table
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          verified: true
        }
      },
      // `_count` tells the DB to COUNT related rows and return the number.
      // This is equivalent to: SELECT COUNT(*) FROM Like WHERE postId = ?
      // We never load the actual Like rows — just their count.
      _count: {
        select: {
          likes: true,
          comments: true,
          reposts: true
        }
      }
    }
  });
}

/**
 * Returns all posts authored by a specific user, newest first.
 * Used on a user's profile page.
 *
 * The `where: { authorId }` filter is executed by the DB —
 * we do not fetch all posts and filter in JavaScript.
 *
 * @param {string} userId - The author's user ID
 * @returns {Array} Array of post objects
 */
export async function getPostsByUser(userId) {
  return prisma.post.findMany({
    where: { authorId: userId }, // DB-level filter: WHERE authorId = ?
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          verified: true
        }
      },
      _count: {
        select: { likes: true, comments: true, reposts: true }
      }
    }
  });
}

/**
 * Returns posts that contain a specific hashtag string.
 * Uses `contains` which becomes SQL LIKE '%hashtag%'.
 *
 * @param {string} hashtag - The hashtag to search for (e.g. "egypt")
 * @returns {Array} Matching posts
 */
export async function getPostsByHashtag(hashtag) {
  return prisma.post.findMany({
    where: {
      hashtags: { contains: hashtag } // SQL: hashtags LIKE '%egypt%'
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          verified: true
        }
      },
      _count: {
        select: { likes: true, comments: true, reposts: true }
      }
    }
  });
}

// ---------------------------------------------------------------------------
// READ — single post
// ---------------------------------------------------------------------------

/**
 * Returns a single post by its ID.
 * Includes full author info and engagement counts.
 * Returns null if the post does not exist.
 *
 * @param {string} postId
 * @returns {Object|null}
 */
export async function getPostById(postId) {
  return prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          verified: true
        }
      },
      _count: {
        select: { likes: true, comments: true, reposts: true }
      }
    }
  });
}

// ---------------------------------------------------------------------------
// WRITE
// ---------------------------------------------------------------------------

/**
 * Creates a new post in the database.
 *
 * @param {string} authorId   - ID of the user creating the post
 * @param {string} caption    - Text content of the post
 * @param {Object} [extras]   - Optional fields: mediaPath, mediaType, audioPath, hashtags
 * @returns {Object} The newly created post
 */
export async function createPost(authorId, caption, extras = {}) {
  return prisma.post.create({
    data: {
      authorId,
      caption,
      mediaPath: extras.mediaPath ?? null,
      mediaType: extras.mediaType ?? null,
      audioPath: extras.audioPath ?? null,
      hashtags:  extras.hashtags  ?? ''
    },
    // Return the post with author info so the UI can display it immediately
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          verified: true
        }
      },
      _count: {
        select: { likes: true, comments: true, reposts: true }
      }
    }
  });
}

/**
 * Deletes a post from the database.
 *
 * Uses `deleteMany` with BOTH the post ID and the authorId as conditions.
 * This means: only delete the post if it belongs to the requesting user.
 * If the user does not own the post, zero rows are deleted — no crash.
 * This pattern acts as a built-in authorization guard.
 *
 * @param {string} postId  - The post to delete
 * @param {string} userId  - Must match the post's authorId
 * @returns {{ count: number }} How many rows were deleted (0 or 1)
 */
export async function deletePost(postId, userId) {
  return prisma.post.deleteMany({
    where: {
      id: postId,
      authorId: userId  // authorization guard: only delete if user owns it
    }
  });
}