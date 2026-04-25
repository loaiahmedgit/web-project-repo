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