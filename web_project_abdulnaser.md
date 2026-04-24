# Social Media Platform — Parts 4 & 5
## Complete File Reference (JavaScript + Prisma + Next.js)

> **Stack:** Next.js 14 App Router · Prisma ORM · SQLite · Plain JavaScript (no TypeScript)
> **Database URL:** `file:./prisma/dev.db`
> **Before anything:** run `npx prisma generate` after placing `schema.prisma` in `/prisma/`

---

## Project Structure

```
your-project/
├── .env                                      ← DATABASE_URL lives here
├── prisma/
│   ├── schema.prisma                         ← provided by teammate
│   └── dev.db                               ← provided by teammate
│
├── lib/
│   ├── prisma.js                             ← singleton Prisma Client
│   └── repository/
│       ├── userRepository.js
│       ├── postRepository.js
│       ├── commentRepository.js
│       ├── likeRepository.js
│       ├── repostRepository.js
│       ├── followRepository.js
│       └── messageRepository.js
│
└── app/
    └── api/
        ├── users/
        │   ├── route.js                      ← GET /api/users, POST /api/users
        │   ├── search/
        │   │   └── route.js                  ← GET /api/users/search?q=...
        │   └── [id]/
        │       ├── route.js                  ← GET /api/users/:id, PATCH /api/users/:id
        │       ├── posts/
        │       │   └── route.js              ← GET /api/users/:id/posts
        │       ├── followers/
        │       │   └── route.js              ← GET /api/users/:id/followers
        │       └── following/
        │           └── route.js              ← GET /api/users/:id/following
        ├── posts/
        │   ├── route.js                      ← GET /api/posts, POST /api/posts
        │   └── [id]/
        │       ├── route.js                  ← GET /api/posts/:id, DELETE /api/posts/:id
        │       ├── like/
        │       │   └── route.js              ← GET/POST /api/posts/:id/like
        │       ├── repost/
        │       │   └── route.js              ← GET/POST /api/posts/:id/repost
        │       └── comments/
        │           └── route.js              ← GET/POST /api/posts/:id/comments
        ├── comments/
        │   └── [id]/
        │       ├── route.js                  ← DELETE /api/comments/:id
        │       └── like/
        │           └── route.js              ← POST /api/comments/:id/like
        ├── follows/
        │   └── route.js                      ← GET/POST /api/follows
        └── messages/
            ├── route.js                      ← GET/POST /api/messages
            └── read/
                └── route.js                  ← GET/PATCH /api/messages/read
```

---

## API Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Paginated list of all users |
| POST | `/api/users` | Create a new user |
| GET | `/api/users/search?q=` | Search users by name/username |
| GET | `/api/users/:id` | Get a single user by ID |
| PATCH | `/api/users/:id` | Update a user's profile |
| GET | `/api/users/:id/posts` | All posts by a user |
| GET | `/api/users/:id/followers` | List of followers |
| GET | `/api/users/:id/following` | List of people user follows |
| GET | `/api/posts` | Paginated feed (supports ?hashtag=) |
| POST | `/api/posts` | Create a new post |
| GET | `/api/posts/:id` | Get a single post |
| DELETE | `/api/posts/:id` | Delete a post (author only) |
| GET | `/api/posts/:id/like?userId=` | Check like status + count |
| POST | `/api/posts/:id/like` | Toggle like on a post |
| GET | `/api/posts/:id/repost?userId=` | Check repost status + count |
| POST | `/api/posts/:id/repost` | Toggle repost on a post |
| GET | `/api/posts/:id/comments` | Get all comments for a post |
| POST | `/api/posts/:id/comments` | Add a comment (or reply) |
| DELETE | `/api/comments/:id` | Delete a comment (author only) |
| POST | `/api/comments/:id/like` | Increment comment like count |
| GET | `/api/follows?followerId=&followingId=` | Check if A follows B |
| POST | `/api/follows` | Toggle follow between two users |
| GET | `/api/messages?userIdA=&userIdB=` | Get conversation between two users |
| POST | `/api/messages` | Send a direct message |
| GET | `/api/messages/read?userId=` | Get unread message count |
| PATCH | `/api/messages/read` | Mark messages as read |

---

## How to Call These APIs from Vanilla JS (Phase 1 Frontend)

Since Phase 1 is built in plain HTML/CSS/JavaScript (no React), your frontend
files will call these endpoints using the browser's native `fetch()` function.

```javascript
// GET example — fetch the feed
fetch('/api/posts?page=0')
  .then(res => res.json())
  .then(posts => {
    // render posts to the DOM
  });

// POST example — create a post
fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ authorId: 'user_ahmed', caption: 'Hello!' })
})
  .then(res => res.json())
  .then(newPost => { /* update DOM */ });

// POST example — toggle like
fetch(`/api/posts/${postId}/like`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'user_ahmed' })
})
  .then(res => res.json())
  .then(({ liked }) => {
    // update heart icon based on liked true/false
  });
```

---

## Part 4 — Repository Files


---

## `lib/prisma.js`

```javascript
/**
 * FILE: lib/prisma.js
 *
 * PURPOSE:
 * Creates and exports a single shared instance of PrismaClient.
 * This is the only file in the entire project that instantiates PrismaClient.
 * Every repository file imports `prisma` from here — never creates its own.
 *
 * WHY A SINGLETON:
 * Next.js in development mode hot-reloads modules whenever you save a file.
 * If we did `new PrismaClient()` inside each repository, every hot-reload
 * would create a brand-new database connection, eventually exhausting SQLite's
 * connection limit and throwing errors.
 *
 * The fix: store the instance on `globalThis` (the global object). The global
 * object is NOT cleared on hot-reload, so the same instance is reused across
 * every module re-evaluation during development.
 *
 * In production there is no hot-reload, so we just create one instance
 * normally when the server starts.
 *
 * USAGE IN OTHER FILES:
 *   import { prisma } from '../prisma.js';          (from lib/repository/)
 *   import { prisma } from '../../lib/prisma.js';   (from app/api/...)
 */

import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  // Production: create a fresh instance once. No hot-reload concern.
  prisma = new PrismaClient();
} else {
  // Development: reuse the instance stored on the global object if it exists.
  // If it does not exist yet, create it and store it for future reloads.
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient();
  }
  prisma = globalThis.__prisma;
}

export { prisma };

```

---

## `lib/repository/userRepository.js`

```javascript
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

```

---

## `lib/repository/postRepository.js`

```javascript
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

```

---

## `lib/repository/commentRepository.js`

```javascript
/**
 * FILE: lib/repository/commentRepository.js
 *
 * PURPOSE:
 * All database read/write operations for the Comment model.
 *
 * SCHEMA REFERENCE (Comment model):
 *   id        String   — unique comment ID
 *   content   String   — text of the comment
 *   likes     Int      — like count stored directly on the comment (default 0)
 *   createdAt DateTime
 *   authorId  String   — FK → User.id
 *   postId    String   — FK → Post.id (which post this comment belongs to)
 *   parentId  String?  — FK → Comment.id (nullable — null means top-level comment)
 *
 * RELATIONS:
 *   author  — User      who wrote the comment
 *   post    — Post      which post it belongs to
 *   parent  — Comment?  the comment this is replying to (null if top-level)
 *   replies — Comment[] sub-comments that reply to this one
 *
 * NOTE ON parentId:
 * The schema supports nested comments (replies). A top-level comment has
 * parentId = null. A reply has parentId set to the parent comment's ID.
 * We expose separate functions for top-level comments vs replies.
 */

import { prisma } from '../prisma.js';

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------

/**
 * Returns all top-level comments for a post (no replies), oldest first.
 * Each comment includes its author info and its direct replies.
 *
 * "Top-level" means parentId IS NULL — this filter runs in the DB.
 *
 * @param {string} postId - ID of the post
 * @returns {Array} Array of comment objects with author and replies
 */
export async function getCommentsByPost(postId) {
  return prisma.comment.findMany({
    where: {
      postId,           // DB filter: only comments belonging to this post
      parentId: null    // DB filter: only top-level comments (not replies)
    },
    orderBy: { createdAt: 'asc' }, // oldest first — natural conversation order
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
      // Fetch replies and their authors in the same query (one DB round-trip)
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              verified: true
            }
          }
        }
      }
    }
  });
}

/**
 * Returns a single comment by its ID, including its author and replies.
 *
 * @param {string} commentId
 * @returns {Object|null}
 */
export async function getCommentById(commentId) {
  return prisma.comment.findUnique({
    where: { id: commentId },
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
      replies: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true
            }
          }
        }
      }
    }
  });
}

// ---------------------------------------------------------------------------
// WRITE
// ---------------------------------------------------------------------------

/**
 * Creates a new comment on a post.
 * If parentId is provided, the comment is a reply to another comment.
 * If parentId is omitted, it is a top-level comment.
 *
 * @param {string} postId    - The post being commented on
 * @param {string} authorId  - The user writing the comment
 * @param {string} content   - The comment text
 * @param {string} [parentId] - Optional: ID of the comment being replied to
 * @returns {Object} Newly created comment with author info
 */
export async function createComment(postId, authorId, content, parentId = null) {
  return prisma.comment.create({
    data: {
      postId,
      authorId,
      content,
      parentId  // null for top-level, comment ID for replies
    },
    include: {
      author: {
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
 * Deletes a comment.
 * Uses deleteMany with both ID and authorId so only the owner can delete.
 *
 * NOTE: Because of the schema's onDelete: NoAction on the self-relation,
 * deleting a parent comment does NOT automatically delete its replies.
 * If cascading delete of replies is needed, fetch and delete them first.
 *
 * @param {string} commentId
 * @param {string} userId    - Must match comment.authorId
 * @returns {{ count: number }}
 */
export async function deleteComment(commentId, userId) {
  return prisma.comment.deleteMany({
    where: {
      id: commentId,
      authorId: userId  // authorization guard
    }
  });
}

/**
 * Increments the likes count on a comment by 1.
 * The `likes` field on Comment is a plain integer in the schema
 * (unlike Post likes which are a separate table). We use `increment`
 * so the DB does the arithmetic — no read-then-write race condition.
 *
 * @param {string} commentId
 * @returns {Object} Updated comment
 */
export async function likeComment(commentId) {
  return prisma.comment.update({
    where: { id: commentId },
    data: {
      likes: { increment: 1 } // SQL: SET likes = likes + 1
    },
    select: { id: true, likes: true }
  });
}

```

---

## `lib/repository/likeRepository.js`

```javascript
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

```

---

## `lib/repository/repostRepository.js`

```javascript
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

```

---

## `lib/repository/followRepository.js`

```javascript
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

```

---

## `lib/repository/messageRepository.js`

```javascript
/**
 * FILE: lib/repository/messageRepository.js
 *
 * PURPOSE:
 * All database operations for the Message model (direct messages between users).
 *
 * SCHEMA REFERENCE (Message model):
 *   id         String   — unique message ID
 *   content    String   — the text of the message
 *   read       Boolean  — whether the recipient has read it (default false)
 *   createdAt  DateTime
 *   senderId   String   — FK → User.id with relation "SentMessages"
 *   receiverId String   — FK → User.id with relation "ReceivedMessages"
 *
 * RELATIONS (on Message):
 *   sender   User @relation("SentMessages")
 *   receiver User @relation("ReceivedMessages")
 *
 * CONVERSATIONS:
 * There is no separate Conversation model in the schema. A conversation
 * between two users is derived by fetching all messages where
 * (senderId = A AND receiverId = B) OR (senderId = B AND receiverId = A).
 */

import { prisma } from '../prisma.js';

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------

/**
 * Returns the full message history between two users, oldest first.
 * This reconstructs the conversation by fetching messages in both directions.
 *
 * The OR condition is evaluated in the DB:
 *   WHERE (senderId = A AND receiverId = B)
 *      OR (senderId = B AND receiverId = A)
 *
 * @param {string} userIdA - One participant's ID
 * @param {string} userIdB - The other participant's ID
 * @returns {Array} Messages sorted oldest-first (chronological chat order)
 */
export async function getConversation(userIdA, userIdB) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userIdA, receiverId: userIdB },
        { senderId: userIdB, receiverId: userIdA }
      ]
    },
    orderBy: { createdAt: 'asc' }, // oldest first for chat display
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true
        }
      }
    }
  });
}

/**
 * Returns all messages received by a user that have not been read yet.
 * Used to show an unread message count / notification badge.
 *
 * @param {string} userId - The recipient
 * @returns {Array} Unread message records
 */
export async function getUnreadMessages(userId) {
  return prisma.message.findMany({
    where: {
      receiverId: userId, // DB filter: only this user's received messages
      read: false         // DB filter: only unread ones
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true
        }
      }
    }
  });
}

/**
 * Returns a count of unread messages for a user.
 * Uses count() so no message rows are transferred — just the number.
 *
 * @param {string} userId
 * @returns {number} Number of unread messages
 */
export async function getUnreadCount(userId) {
  return prisma.message.count({
    where: { receiverId: userId, read: false }
  });
}

/**
 * Returns all unique users that a given user has had a conversation with.
 * Used to build a "conversations" inbox list.
 *
 * Because there is no Conversation model, we derive this by fetching all
 * messages involving the user, then extracting unique conversation partners.
 * The deduplication happens here in JS because SQLite/Prisma does not support
 * SELECT DISTINCT on joined fields in a simple way.
 *
 * @param {string} userId
 * @returns {Array} Array of user objects representing conversation partners
 */
export async function getConversationList(userId) {
  // Fetch all messages where the user is either sender or receiver
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sender:   { select: { id: true, username: true, displayName: true, avatar: true } },
      receiver: { select: { id: true, username: true, displayName: true, avatar: true } }
    }
  });

  // Extract unique conversation partners (not the user themselves)
  const seen = new Set();
  const partners = [];
  for (const msg of messages) {
    const partner = msg.senderId === userId ? msg.receiver : msg.sender;
    if (!seen.has(partner.id)) {
      seen.add(partner.id);
      partners.push(partner);
    }
  }
  return partners;
}

// ---------------------------------------------------------------------------
// WRITE
// ---------------------------------------------------------------------------

/**
 * Sends a new direct message from one user to another.
 *
 * @param {string} senderId
 * @param {string} receiverId
 * @param {string} content
 * @returns {Object} The created message with sender info
 */
export async function sendMessage(senderId, receiverId, content) {
  return prisma.message.create({
    data: { senderId, receiverId, content },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true
        }
      }
    }
  });
}

/**
 * Marks all messages in a conversation as read.
 * Called when a user opens their chat with someone.
 *
 * Uses `updateMany` to update all matching rows in a single SQL statement:
 *   UPDATE Message SET read = true
 *   WHERE receiverId = ? AND senderId = ? AND read = false
 *
 * @param {string} receiverId - The user reading the messages
 * @param {string} senderId   - The sender whose messages we're marking as read
 * @returns {{ count: number }} How many messages were updated
 */
export async function markMessagesAsRead(receiverId, senderId) {
  return prisma.message.updateMany({
    where: {
      receiverId,
      senderId,
      read: false // only update the ones that are still unread
    },
    data: { read: true }
  });
}

```

---

## Part 5 — API Route Files


---

## `app/api/users/route.js`

```javascript
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
import { getAllUsers, createUser } from '../../../lib/repository/userRepository.js';

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

```

---

## `app/api/users/search/route.js`

```javascript
/**
 * FILE: app/api/users/search/route.js
 *
 * ENDPOINT:
 *   GET /api/users/search?q=...
 *
 * Searches for users whose username or displayName contains the query string.
 * The search is performed entirely inside the DB using Prisma's `contains` filter.
 * We never fetch all users and filter in JavaScript.
 *
 * Query parameters:
 *   q (required) — the search term, e.g. "ahmed"
 *
 * Example: GET /api/users/search?q=ahmed
 *
 * Response 200:
 *   [
 *     { id, username, displayName, avatar, verified },
 *     ...
 *   ]
 *   Maximum 20 results returned.
 *
 * Response 400:
 *   { error: "..." } — if q is missing or empty
 */

import { NextResponse } from 'next/server';
import { searchUsers } from '../../../../lib/repository/userRepository.js';

export async function GET(request) {
  try {
    const q = request.nextUrl.searchParams.get('q');

    if (!q || q.trim() === '') {
      return NextResponse.json(
        { error: 'q query parameter is required' },
        { status: 400 }
      );
    }

    const users = await searchUsers(q.trim());
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('[GET /api/users/search]', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}

```

---

## `app/api/users/[id]/route.js`

```javascript
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
import { getUserById, updateUser } from '../../../../lib/repository/userRepository.js';

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

```

---

## `app/api/users/[id]/posts/route.js`

```javascript
/**
 * FILE: app/api/users/[id]/posts/route.js
 *
 * ENDPOINT:
 *   GET /api/users/:id/posts
 *
 * Returns all posts authored by the user identified by :id.
 * Posts are sorted newest first.
 *
 * Response 200:
 *   [
 *     {
 *       id, caption, mediaPath, mediaType, audioPath, hashtags, createdAt, authorId,
 *       author: { id, username, displayName, avatar, verified },
 *       _count: { likes, comments, reposts }
 *     },
 *     ...
 *   ]
 */

import { NextResponse } from 'next/server';
import { getPostsByUser } from '../../../../../lib/repository/postRepository.js';

export async function GET(request, { params }) {
  try {
    const posts = await getPostsByUser(params.id);
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('[GET /api/users/:id/posts]', error);
    return NextResponse.json({ error: 'Failed to fetch user posts' }, { status: 500 });
  }
}

```

---

## `app/api/users/[id]/followers/route.js`

```javascript
/**
 * FILE: app/api/users/[id]/followers/route.js
 *
 * ENDPOINT:
 *   GET /api/users/:id/followers
 *
 * Returns the list of users who follow the user identified by :id.
 *
 * Response 200:
 *   [
 *     {
 *       id, createdAt,
 *       follower: { id, username, displayName, avatar, verified }
 *     },
 *     ...
 *   ]
 *
 * The `follower` nested object is the person doing the following.
 * The :id in the URL is the person being followed.
 */

import { NextResponse } from 'next/server';
import { getFollowers } from '../../../../../lib/repository/followRepository.js';

export async function GET(request, { params }) {
  try {
    const followers = await getFollowers(params.id);
    return NextResponse.json(followers, { status: 200 });
  } catch (error) {
    console.error('[GET /api/users/:id/followers]', error);
    return NextResponse.json({ error: 'Failed to fetch followers' }, { status: 500 });
  }
}

```

---

## `app/api/users/[id]/following/route.js`

```javascript
/**
 * FILE: app/api/users/[id]/following/route.js
 *
 * ENDPOINT:
 *   GET /api/users/:id/following
 *
 * Returns the list of users that the user identified by :id is following.
 *
 * Response 200:
 *   [
 *     {
 *       id, createdAt,
 *       following: { id, username, displayName, avatar, verified }
 *     },
 *     ...
 *   ]
 *
 * The `following` nested object is the person being followed.
 * The :id in the URL is the person doing the following.
 */

import { NextResponse } from 'next/server';
import { getFollowing } from '../../../../../lib/repository/followRepository.js';

export async function GET(request, { params }) {
  try {
    const following = await getFollowing(params.id);
    return NextResponse.json(following, { status: 200 });
  } catch (error) {
    console.error('[GET /api/users/:id/following]', error);
    return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 });
  }
}

```

---

## `app/api/posts/route.js`

```javascript
/**
 * FILE: app/api/posts/route.js
 *
 * ENDPOINTS:
 *   GET  /api/posts  — Paginated feed of all posts (newest first)
 *   POST /api/posts  — Create a new post
 *
 * ─────────────────────────────────────────────
 * GET /api/posts
 * ─────────────────────────────────────────────
 * Query parameters:
 *   page     (optional, default 0)   — which page of results
 *   hashtag  (optional)              — filter posts by hashtag
 *
 * Example: GET /api/posts?page=0
 * Example: GET /api/posts?hashtag=egypt
 *
 * Response 200:
 *   [
 *     {
 *       id, caption, mediaPath, mediaType, audioPath, hashtags, createdAt, authorId,
 *       author: { id, username, displayName, avatar, verified },
 *       _count: { likes, comments, reposts }
 *     },
 *     ...
 *   ]
 *
 * ─────────────────────────────────────────────
 * POST /api/posts
 * ─────────────────────────────────────────────
 * Request body (JSON):
 *   {
 *     authorId: string,        — required
 *     caption:  string,        — required
 *     mediaPath?: string,      — optional
 *     mediaType?: string,      — optional ("image" | "video")
 *     audioPath?: string,      — optional
 *     hashtags?:  string       — optional, comma-separated e.g. "egypt,travel"
 *   }
 *
 * Response 201:
 *   The newly created post object with author info
 *
 * Response 400:
 *   { error: "..." } — if authorId or caption are missing
 */

import { NextResponse } from 'next/server';
import { getFeedPosts, getPostsByHashtag, createPost } from '../../../lib/repository/postRepository.js';

// ---------------------------------------------------------------------------
// GET /api/posts
// ---------------------------------------------------------------------------
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page    = Number(searchParams.get('page')    ?? 0);
    const hashtag = searchParams.get('hashtag'); // null if not provided

    let posts;
    if (hashtag) {
      // Hashtag filter was provided — fetch only matching posts
      posts = await getPostsByHashtag(hashtag);
    } else {
      // No filter — return paginated feed
      posts = await getFeedPosts(page);
    }

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('[GET /api/posts]', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/posts
// ---------------------------------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();
    const { authorId, caption, mediaPath, mediaType, audioPath, hashtags } = body;

    // Validate the required fields
    if (!authorId || !caption) {
      return NextResponse.json(
        { error: 'authorId and caption are required' },
        { status: 400 }
      );
    }

    const post = await createPost(authorId, caption, {
      mediaPath, mediaType, audioPath, hashtags
    });

    // 201 Created
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('[POST /api/posts]', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

```

---

## `app/api/posts/[id]/route.js`

```javascript
/**
 * FILE: app/api/posts/[id]/route.js
 *
 * ENDPOINTS:
 *   GET    /api/posts/:id  — Get a single post by ID
 *   DELETE /api/posts/:id  — Delete a post (only the author can do this)
 *
 * ─────────────────────────────────────────────
 * GET /api/posts/:id
 * ─────────────────────────────────────────────
 * Response 200:
 *   {
 *     id, caption, mediaPath, mediaType, audioPath, hashtags, createdAt, authorId,
 *     author: { id, username, displayName, avatar, verified },
 *     _count: { likes, comments, reposts }
 *   }
 *
 * Response 404:
 *   { error: "Post not found" }
 *
 * ─────────────────────────────────────────────
 * DELETE /api/posts/:id
 * ─────────────────────────────────────────────
 * Request body (JSON):
 *   { userId: string }  — must be the post's author, otherwise nothing is deleted
 *
 * Response 200:
 *   { success: true, deleted: 1 }  — if post was deleted
 *   { success: true, deleted: 0 }  — if post was not found or user is not the author
 */

import { NextResponse } from 'next/server';
import { getPostById, deletePost } from '../../../../lib/repository/postRepository.js';

// ---------------------------------------------------------------------------
// GET /api/posts/:id
// ---------------------------------------------------------------------------
export async function GET(request, { params }) {
  try {
    const post = await getPostById(params.id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error('[GET /api/posts/:id]', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/posts/:id
// ---------------------------------------------------------------------------
export async function DELETE(request, { params }) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // deletePost uses deleteMany with authorId check — if the user is not
    // the author, 0 rows are deleted and no error is thrown.
    const result = await deletePost(params.id, userId);

    return NextResponse.json({ success: true, deleted: result.count }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/posts/:id]', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

```

---

## `app/api/posts/[id]/like/route.js`

```javascript
/**
 * FILE: app/api/posts/[id]/like/route.js
 *
 * ENDPOINTS:
 *   POST /api/posts/:id/like  — Toggle like on a post
 *   GET  /api/posts/:id/like  — Check if a user has liked a post + get count
 *
 * ─────────────────────────────────────────────
 * POST /api/posts/:id/like
 * ─────────────────────────────────────────────
 * Request body (JSON):
 *   { userId: string }
 *
 * Response 200:
 *   { liked: true }   — user now likes the post
 *   { liked: false }  — user has unliked the post
 *
 * ─────────────────────────────────────────────
 * GET /api/posts/:id/like
 * ─────────────────────────────────────────────
 * Query parameters:
 *   userId (required) — whose like status to check
 *
 * Example: GET /api/posts/post_1/like?userId=user_ahmed
 *
 * Response 200:
 *   { liked: boolean, count: number }
 */

import { NextResponse } from 'next/server';
import { toggleLike, getLike, getLikeCount } from '../../../../../lib/repository/likeRepository.js';

// ---------------------------------------------------------------------------
// GET /api/posts/:id/like?userId=...
// ---------------------------------------------------------------------------
export async function GET(request, { params }) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
    }

    // Run both DB queries in parallel using Promise.all — faster than sequential
    const [existing, count] = await Promise.all([
      getLike(params.id, userId),
      getLikeCount(params.id)
    ]);

    return NextResponse.json({ liked: !!existing, count }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/posts/:id/like]', error);
    return NextResponse.json({ error: 'Failed to get like status' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/posts/:id/like
// ---------------------------------------------------------------------------
export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const result = await toggleLike(params.id, userId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[POST /api/posts/:id/like]', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}

```

---

## `app/api/posts/[id]/repost/route.js`

```javascript
/**
 * FILE: app/api/posts/[id]/repost/route.js
 *
 * ENDPOINTS:
 *   POST /api/posts/:id/repost  — Toggle repost on a post
 *   GET  /api/posts/:id/repost  — Check if a user has reposted a post + get count
 *
 * ─────────────────────────────────────────────
 * POST /api/posts/:id/repost
 * ─────────────────────────────────────────────
 * Request body (JSON):
 *   { userId: string }
 *
 * Response 200:
 *   { reposted: true }   — user has now reposted the post
 *   { reposted: false }  — user has un-reposted the post
 *
 * ─────────────────────────────────────────────
 * GET /api/posts/:id/repost
 * ─────────────────────────────────────────────
 * Query parameters:
 *   userId (required) — whose repost status to check
 *
 * Example: GET /api/posts/post_1/repost?userId=user_ahmed
 *
 * Response 200:
 *   { reposted: boolean, count: number }
 */

import { NextResponse } from 'next/server';
import {
  toggleRepost,
  getRepost,
  getRepostCount
} from '../../../../../lib/repository/repostRepository.js';

// ---------------------------------------------------------------------------
// GET /api/posts/:id/repost?userId=...
// ---------------------------------------------------------------------------
export async function GET(request, { params }) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Run both DB queries in parallel — no need to wait for one before the other
    const [existing, count] = await Promise.all([
      getRepost(params.id, userId),
      getRepostCount(params.id)
    ]);

    return NextResponse.json({ reposted: !!existing, count }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/posts/:id/repost]', error);
    return NextResponse.json({ error: 'Failed to get repost status' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/posts/:id/repost
// ---------------------------------------------------------------------------
export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const result = await toggleRepost(params.id, userId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[POST /api/posts/:id/repost]', error);
    return NextResponse.json({ error: 'Failed to toggle repost' }, { status: 500 });
  }
}

```

---

## `app/api/posts/[id]/comments/route.js`

```javascript
/**
 * FILE: app/api/posts/[id]/comments/route.js
 *
 * ENDPOINTS:
 *   GET  /api/posts/:id/comments  — Get all top-level comments for a post
 *   POST /api/posts/:id/comments  — Add a new comment (or reply) to a post
 *
 * ─────────────────────────────────────────────
 * GET /api/posts/:id/comments
 * ─────────────────────────────────────────────
 * Response 200:
 *   [
 *     {
 *       id, content, likes, createdAt, authorId, postId, parentId,
 *       author: { id, username, displayName, avatar, verified },
 *       replies: [
 *         {
 *           id, content, likes, createdAt, authorId, postId, parentId,
 *           author: { id, username, displayName, avatar, verified }
 *         },
 *         ...
 *       ]
 *     },
 *     ...
 *   ]
 *
 * Only top-level comments are returned at the root level.
 * Each comment includes its direct replies nested inside it.
 *
 * ─────────────────────────────────────────────
 * POST /api/posts/:id/comments
 * ─────────────────────────────────────────────
 * Request body (JSON):
 *   {
 *     authorId: string,   — required
 *     content:  string,   — required
 *     parentId?: string   — optional: ID of comment being replied to
 *   }
 *
 * Response 201:
 *   The newly created comment object with author info
 *
 * Response 400:
 *   { error: "..." } — if required fields are missing
 */

import { NextResponse } from 'next/server';
import {
  getCommentsByPost,
  createComment
} from '../../../../../lib/repository/commentRepository.js';

// ---------------------------------------------------------------------------
// GET /api/posts/:id/comments
// ---------------------------------------------------------------------------
export async function GET(request, { params }) {
  try {
    const comments = await getCommentsByPost(params.id);
    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error('[GET /api/posts/:id/comments]', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/posts/:id/comments
// ---------------------------------------------------------------------------
export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { authorId, content, parentId } = body;

    // Both authorId and content are required to create a comment
    if (!authorId || !content) {
      return NextResponse.json(
        { error: 'authorId and content are required' },
        { status: 400 }
      );
    }

    // parentId is optional — if omitted, createComment defaults it to null
    // which makes this a top-level comment instead of a reply
    const comment = await createComment(params.id, authorId, content, parentId);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('[POST /api/posts/:id/comments]', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

```

---

## `app/api/comments/[id]/route.js`

```javascript
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
import { deleteComment } from '../../../../lib/repository/commentRepository.js';

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

```

---

## `app/api/comments/[id]/like/route.js`

```javascript
/**
 * FILE: app/api/comments/[id]/like/route.js
 *
 * ENDPOINT:
 *   POST /api/comments/:id/like
 *
 * Increments the `likes` integer on a comment by 1.
 *
 * NOTE: Comment likes work differently from post likes.
 * Post likes are a separate table (Like model) supporting toggle.
 * Comment likes are a plain integer column on the Comment model.
 * The schema stores them as `likes Int @default(0)` — there is no
 * separate CommentLike table, so there is no unlike functionality.
 *
 * ─────────────────────────────────────────────
 * POST /api/comments/:id/like
 * ─────────────────────────────────────────────
 * No request body needed — just the comment ID in the URL.
 *
 * Response 200:
 *   { id: string, likes: number }  — updated like count
 */

import { NextResponse } from 'next/server';
import { likeComment } from '../../../../../lib/repository/commentRepository.js';

export async function POST(request, { params }) {
  try {
    const updated = await likeComment(params.id);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    // Prisma P2025 = record not found
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    console.error('[POST /api/comments/:id/like]', error);
    return NextResponse.json({ error: 'Failed to like comment' }, { status: 500 });
  }
}

```

---

## `app/api/follows/route.js`

```javascript
/**
 * FILE: app/api/follows/route.js
 *
 * ENDPOINTS:
 *   POST /api/follows  — Toggle follow between two users
 *   GET  /api/follows  — Check if user A follows user B
 *
 * ─────────────────────────────────────────────
 * POST /api/follows
 * ─────────────────────────────────────────────
 * Request body (JSON):
 *   { followerId: string, followingId: string }
 *
 *   followerId  = the user performing the action (Alice)
 *   followingId = the user being followed/unfollowed (Bob)
 *
 * Response 200:
 *   { following: true }   — Alice now follows Bob
 *   { following: false }  — Alice has unfollowed Bob
 *
 * Response 400:
 *   { error: "..." } — if fields are missing or user tries to follow themselves
 *
 * ─────────────────────────────────────────────
 * GET /api/follows
 * ─────────────────────────────────────────────
 * Query parameters:
 *   followerId  (required)
 *   followingId (required)
 *
 * Example: GET /api/follows?followerId=user_ahmed&followingId=user_omar
 *
 * Response 200:
 *   { following: boolean }
 */

import { NextResponse } from 'next/server';
import { toggleFollow, getFollow } from '../../../lib/repository/followRepository.js';

// ---------------------------------------------------------------------------
// GET /api/follows?followerId=...&followingId=...
// ---------------------------------------------------------------------------
export async function GET(request) {
  try {
    const params  = request.nextUrl.searchParams;
    const followerId  = params.get('followerId');
    const followingId = params.get('followingId');

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: 'followerId and followingId query parameters are required' },
        { status: 400 }
      );
    }

    const existing = await getFollow(followerId, followingId);
    return NextResponse.json({ following: !!existing }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/follows]', error);
    return NextResponse.json({ error: 'Failed to check follow status' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/follows
// ---------------------------------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();
    const { followerId, followingId } = body;

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: 'followerId and followingId are required' },
        { status: 400 }
      );
    }

    // Guard: a user cannot follow themselves — this would create nonsensical data
    if (followerId === followingId) {
      return NextResponse.json(
        { error: 'A user cannot follow themselves' },
        { status: 400 }
      );
    }

    const result = await toggleFollow(followerId, followingId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[POST /api/follows]', error);
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 });
  }
}

```

---

## `app/api/messages/route.js`

```javascript
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
} from '../../../lib/repository/messageRepository.js';

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

```

---

## `app/api/messages/read/route.js`

```javascript
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
} from '../../../../lib/repository/messageRepository.js';

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

```

---

## Setup Checklist

1. Place `schema.prisma` in `/prisma/schema.prisma`
2. Place `dev.db` in `/prisma/dev.db`
3. Create `.env` with:
   ```
   DATABASE_URL="file:./prisma/dev.db"
   ```
4. Run:
   ```bash
   npm install
   npx prisma generate
   npm run dev
   ```
5. Test in browser:
   - `http://localhost:3000/api/posts` → should return JSON array
   - `http://localhost:3000/api/users` → should return JSON array
   - `http://localhost:3000/api/users/user_ahmed` → should return single user

## Prisma Error Codes Reference

| Code | Meaning | When it appears |
|------|---------|-----------------|
| `P2002` | Unique constraint violation | Creating duplicate user/email, liking a post twice |
| `P2025` | Record not found | Updating/deleting a non-existent record |