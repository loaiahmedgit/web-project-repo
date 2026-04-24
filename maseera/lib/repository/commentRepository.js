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