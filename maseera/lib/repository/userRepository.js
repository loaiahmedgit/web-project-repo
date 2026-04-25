/**
 * FILE: lib/repository/userRepository.js
 *
 * PURPOSE:
 * All database read/write operations that involve the User model.
 * No API route or frontend code should query users directly —
 * every user-related DB operation must go through a function in this file.
 *
 * SCHEMA REFERENCE (User model):
 *   id          String   — unique user ID (cuid format, e.g. "user_ahmed")
 *   username    String   — unique login handle (e.g. "ahmed_hassan")
 *   displayName String   — shown name in Arabic (e.g. "أحمد حسن")
 *   email       String   — unique email address
 *   password    String   — hashed password (NEVER returned to the client)
 *   avatar      String?  — avatar letter or URL, nullable
 *   bio         String?  — optional profile bio, nullable
 *   verified    Boolean  — whether the account is verified (default false)
 *   createdAt   DateTime — account creation timestamp
 *
 * RELATIONS (used in `include`):
 *   posts        — Post[]    posts authored by this user
 *   comments     — Comment[] comments authored by this user
 *   likes        — Like[]    likes made by this user
 *   reposts      — Repost[]  reposts made by this user
 *   followers    — Follow[]  @relation("FollowTarget") — people following this user
 *   following    — Follow[]  @relation("FollowSource") — people this user follows
 *   sentMessages — Message[] @relation("SentMessages")
 *   recvMessages — Message[] @relation("ReceivedMessages")
 */

import { prisma } from '../prisma.js';

// ---------------------------------------------------------------------------
// READ — single user
// ---------------------------------------------------------------------------

/**
 * Fetches one user by their unique ID.
 * Used when loading a profile page or resolving an author from a post.
 * Password is intentionally excluded — never send it to the client.
 *
 * @param {string} id - The user's cuid (e.g. "user_ahmed")
 * @returns {Object|null} User object without password, or null if not found
 */
export async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    // `select` controls exactly which fields come back from the DB.
    // Listing only what we need avoids transferring the password hash.
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      bio: true,
      verified: true,
      createdAt: true,
      // Count followers and following in the DB — no JS counting needed
      _count: {
        select: {
          followers: true,  // Follow records where followingId = this user
          following: true,  // Follow records where followerId = this user
          posts: true
        }
      }
    }
  });
}

/**
 * Fetches one user by their username.
 * Used for profile URL routing (e.g. visiting /profile/ahmed_hassan).
 *
 * @param {string} username - The user's unique username string
 * @returns {Object|null} User object without password, or null if not found
 */
export async function getUserByUsername(username) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      bio: true,
      verified: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true
        }
      }
    }
  });
}

/**
 * Fetches a user by email — used during login to find the account.
 * This is the ONE place where we also return the password hash, because
 * the login logic needs it to verify the submitted password.
 *
 * @param {string} email
 * @returns {Object|null} Full user object including password, or null
 */
export async function getUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email }
    // No `select` here — we deliberately need the password field for login
  });
}

// ---------------------------------------------------------------------------
// READ — multiple users
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of all users, sorted alphabetically by username.
 * Used for an "explore users" or "find people" page.
 *
 * Pagination uses `skip` (how many rows to skip = offset) and
 * `take` (how many rows to return = limit). This is done in the DB
 * so we never load all users into memory.
 *
 * @param {number} page     - Zero-indexed page number (0 = first page)
 * @param {number} pageSize - Users per page (default 20)
 * @returns {Array} Array of user objects
 */
export async function getAllUsers(page = 0, pageSize = 20) {
  return prisma.user.findMany({
    skip: page * pageSize,        // OFFSET: skip pages we already showed
    take: pageSize,               // LIMIT: return only this many rows
    orderBy: { username: 'asc' }, // DB sorts alphabetically, not JS
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      verified: true,
      _count: {
        select: { followers: true, posts: true }
      }
    }
  });
}

/**
 * Searches for users whose username or displayName contains the query string.
 * The `contains` filter runs inside the DB — we do not fetch all users first.
 *
 * @param {string} query - Search term (e.g. "ahmed")
 * @returns {Array} Matching user objects (max 20)
 */
export async function searchUsers(query) {
  return prisma.user.findMany({
    where: {
      // OR means: match if EITHER condition is true
      OR: [
        { username: { contains: query } },    // SQL: username LIKE '%ahmed%'
        { displayName: { contains: query } }  // SQL: displayName LIKE '%ahmed%'
      ]
    },
    take: 20, // cap results so the DB does not scan everything
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      verified: true
    }
  });
}

// ---------------------------------------------------------------------------
// WRITE
// ---------------------------------------------------------------------------

/**
 * Creates a new user account.
 * The password passed in should already be hashed by the caller
 * (hashing is not a DB concern — it belongs in the auth logic).
 *
 * @param {Object} data
 * @param {string} data.username
 * @param {string} data.displayName
 * @param {string} data.email
 * @param {string} data.password  - must be a hashed value
 * @param {string} [data.avatar]
 * @param {string} [data.bio]
 * @returns {Object} Newly created user (without password)
 */
export async function createUser({ username, displayName, email, password, avatar, bio }) {
  return prisma.user.create({
    data: { username, displayName, email, password, avatar, bio },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      verified: true,
      createdAt: true
    }
  });
}

/**
 * Updates mutable profile fields for a user.
 * Only the fields provided in `data` are changed — Prisma's `update`
 * only modifies what you pass, leaving all other fields untouched.
 *
 * @param {string} id   - The user's ID
 * @param {Object} data - Fields to update: { displayName?, bio?, avatar? }
 * @returns {Object} Updated user without password
 */
export async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      bio: true,
      verified: true
    }
  });
}