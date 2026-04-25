import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// =============================================================================
// USERS
// =============================================================================

export async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true, username: true, displayName: true,
      avatar: true, bio: true, verified: true, createdAt: true,
      _count: { select: { posts: true, followers: true, following: true } },
    },
  });
}

export async function getUserByUsername(username) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true, username: true, displayName: true,
      avatar: true, bio: true, verified: true, createdAt: true,
      _count: { select: { posts: true, followers: true, following: true } },
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, caption: true, mediaPath: true,
          mediaType: true, hashtags: true, createdAt: true,
          _count: { select: { likes: true, comments: true } },
        },
      },
    },
  });
}

export async function getUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true, email: true, password: true,
      username: true, displayName: true, avatar: true, verified: true,
    },
  });
}

export async function createUser({ username, displayName, email, password, avatar }) {
  return prisma.user.create({
    data: { username, displayName, email, password, avatar },
    select: { id: true, username: true, displayName: true, avatar: true },
  });
}

export async function updateUserProfile(id, { displayName, bio, avatar }) {
  return prisma.user.update({
    where: { id },
    data: { displayName, bio, avatar },
    select: { id: true, username: true, displayName: true, bio: true, avatar: true },
  });
}

export async function searchUsers(query, take = 20) {
  return prisma.user.findMany({
    where: {
      OR: [
        { username:    { contains: query } },
        { displayName: { contains: query } },
      ],
    },
    select: {
      id: true, username: true, displayName: true,
      avatar: true, verified: true,
      _count: { select: { followers: true } },
    },
    orderBy: { username: 'asc' },
    take,
  });
}

// =============================================================================
// POSTS
// =============================================================================

export async function getFeedPosts(followingIds, skip = 0, take = 10) {
  return prisma.post.findMany({
    where: { authorId: { in: followingIds } },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    include: {
      author: {
        select: { id: true, username: true, displayName: true, avatar: true, verified: true },
      },
      _count: { select: { likes: true, comments: true, reposts: true } },
    },
  });
}

export async function getAllPosts(skip = 0, take = 10) {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    include: {
      author: {
        select: { id: true, username: true, displayName: true, avatar: true, verified: true },
      },
      _count: { select: { likes: true, comments: true, reposts: true } },
    },
  });
}

export async function getPostById(id) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, username: true, displayName: true, avatar: true, verified: true },
      },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, username: true, displayName: true, avatar: true } },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              author: { select: { id: true, username: true, displayName: true, avatar: true } },
            },
          },
        },
      },
      _count: { select: { likes: true, comments: true, reposts: true } },
    },
  });
}

export async function createPost({ authorId, caption, mediaPath, mediaType, audioPath, hashtags }) {
  return prisma.post.create({
    data: { authorId, caption, mediaPath, mediaType, audioPath, hashtags: hashtags ?? '' },
    select: { id: true, caption: true, mediaPath: true, mediaType: true, createdAt: true },
  });
}

export async function deletePost(id, authorId) {
  const result = await prisma.post.deleteMany({
    where: { id, authorId },
  });
  return result.count > 0;
}

export async function getPostsByUser(authorId, skip = 0, take = 10) {
  return prisma.post.findMany({
    where: { authorId },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    select: {
      id: true, caption: true, mediaPath: true,
      mediaType: true, hashtags: true, createdAt: true,
      _count: { select: { likes: true, comments: true } },
    },
  });
}

export async function getPostsByHashtag(tag, skip = 0, take = 10) {
  return prisma.post.findMany({
    where: { hashtags: { contains: tag } },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    include: {
      author: { select: { id: true, username: true, displayName: true, avatar: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
}

// =============================================================================
// LIKES
// =============================================================================

export async function toggleLike(userId, postId) {
  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
  } else {
    await prisma.like.create({ data: { userId, postId } });
  }

  const totalLikes = await prisma.like.count({ where: { postId } });
  return { liked: !existing, totalLikes };
}

export async function hasUserLikedPost(userId, postId) {
  const like = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
    select: { id: true },
  });
  return like !== null;
}

// =============================================================================
// COMMENTS
// =============================================================================

export async function addComment(postId, authorId, content, parentId = null) {
  return prisma.comment.create({
    data: { postId, authorId, content, parentId },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatar: true } },
    },
  });
}

export async function deleteComment(commentId, authorId) {
  const result = await prisma.comment.deleteMany({
    where: { id: commentId, authorId },
  });
  return result.count > 0;
}

export async function getCommentsByPost(postId, skip = 0, take = 20) {
  return prisma.comment.findMany({
    where: { postId, parentId: null },
    orderBy: { createdAt: 'asc' },
    skip,
    take,
    include: {
      author: { select: { id: true, username: true, displayName: true, avatar: true } },
      _count: { select: { replies: true } },
    },
  });
}

// =============================================================================
// FOLLOWS
// =============================================================================

export async function toggleFollow(followerId, followingId) {
  if (followerId === followingId) return { following: false };

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return { following: false };
  }

  await prisma.follow.create({ data: { followerId, followingId } });
  return { following: true };
}

export async function isFollowing(followerId, followingId) {
  const edge = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { id: true },
  });
  return edge !== null;
}

export async function getFollowingIds(userId) {
  const rows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  return rows.map(r => r.followingId);
}

export async function getFollowers(userId, skip = 0, take = 20) {
  return prisma.follow.findMany({
    where: { followingId: userId },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    select: {
      follower: {
        select: { id: true, username: true, displayName: true, avatar: true, verified: true },
      },
    },
  });
}

export async function getFollowing(userId, skip = 0, take = 20) {
  return prisma.follow.findMany({
    where: { followerId: userId },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    select: {
      following: {
        select: { id: true, username: true, displayName: true, avatar: true, verified: true },
      },
    },
  });
}

// =============================================================================
// REPOSTS
// =============================================================================

export async function toggleRepost(userId, postId) {
  const existing = await prisma.repost.findUnique({
    where: { userId_postId: { userId, postId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.repost.delete({ where: { userId_postId: { userId, postId } } });
  } else {
    await prisma.repost.create({ data: { userId, postId } });
  }

  const totalReposts = await prisma.repost.count({ where: { postId } });
  return { reposted: !existing, totalReposts };
}

// =============================================================================
// MESSAGES
// =============================================================================

export async function getConversations(userId) {
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, content: true, createdAt: true, read: true,
      senderId: true, receiverId: true,
      sender:   { select: { id: true, username: true, displayName: true, avatar: true } },
      receiver: { select: { id: true, username: true, displayName: true, avatar: true } },
    },
  });

  const seen = new Set();
  return messages.filter(msg => {
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (seen.has(partnerId)) return false;
    seen.add(partnerId);
    return true;
  });
}

export async function getMessageThread(userAId, userBId, skip = 0, take = 50) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userAId, receiverId: userBId },
        { senderId: userBId, receiverId: userAId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    skip,
    take,
    select: {
      id: true, content: true, read: true, createdAt: true, senderId: true,
      sender: { select: { id: true, username: true, displayName: true, avatar: true } },
    },
  });
}

export async function sendMessage(senderId, receiverId, content) {
  return prisma.message.create({
    data: { senderId, receiverId, content },
    select: { id: true, content: true, createdAt: true, senderId: true },
  });
}

export async function markMessagesAsRead(senderId, receiverId) {
  return prisma.message.updateMany({
    where: { senderId, receiverId, read: false },
    data:  { read: true },
  });
}

// =============================================================================
// STATISTICS
// =============================================================================

export async function getPlatformStats() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const [
    totalUsers,
    totalPosts,
    totalComments,
    totalLikes,
    totalReposts,
    mostLikedPost,
    topPostersRaw,
    verifiedCount,
    avgPostsPerUser,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.like.count(),
    prisma.repost.count(),
    prisma.post.findFirst({
      orderBy: { likes: { _count: 'desc' } },
      select: {
        id: true, caption: true,
        author: { select: { username: true, displayName: true } },
        _count: { select: { likes: true } },
      },
    }),
    prisma.post.groupBy({
      by: ['authorId'],
      where: { createdAt: { gte: threeMonthsAgo } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    prisma.user.count({ where: { verified: true } }),
    prisma.$queryRaw`
      SELECT ROUND(CAST(COUNT(*) AS REAL) / NULLIF((SELECT COUNT(*) FROM "User"), 0), 2) AS avg_posts
      FROM "Post"
    `,
  ]);

  const leaderboard = await Promise.all(
    topPostersRaw.map(async row => {
      const user = await prisma.user.findUnique({
        where: { id: row.authorId },
        select: { username: true, displayName: true, avatar: true },
      });
      return { ...user, postCount: row._count.id };
    })
  );

  const avgFollowersResult = await prisma.$queryRaw`
    SELECT ROUND(CAST(COUNT(*) AS REAL) / NULLIF((SELECT COUNT(*) FROM "User"), 0), 2) AS avg_followers
    FROM "Follow"
  `;

  return {
    totalUsers,
    totalPosts,
    totalComments,
    totalLikes,
    totalReposts,
    mostLikedPost,
    leaderboard,
    verifiedCount,
    unverifiedCount: totalUsers - verifiedCount,
    avgPostsPerUser: Number(avgPostsPerUser[0]?.avg_posts ?? 0),
    avgFollowers:    Number(avgFollowersResult[0]?.avg_followers ?? 0),
  };
}