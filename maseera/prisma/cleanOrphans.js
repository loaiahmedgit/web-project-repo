/**
 * One-time cleanup: removes comments, likes, and reposts that reference
 * posts which no longer exist (left behind by previously failed cascades).
 * Run once with: node prisma/cleanOrphans.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete reply comments whose parent comment no longer exists
  const orphanReplies = await prisma.$executeRaw`
    DELETE FROM "Comment"
    WHERE "parentId" IS NOT NULL
      AND "parentId" NOT IN (SELECT id FROM "Comment")
  `;

  // Delete comments whose post no longer exists
  const orphanComments = await prisma.$executeRaw`
    DELETE FROM "Comment"
    WHERE "postId" NOT IN (SELECT id FROM "Post")
  `;

  // Delete likes whose post no longer exists
  const orphanLikes = await prisma.$executeRaw`
    DELETE FROM "Like"
    WHERE "postId" NOT IN (SELECT id FROM "Post")
  `;

  // Delete reposts whose post no longer exists
  const orphanReposts = await prisma.$executeRaw`
    DELETE FROM "Repost"
    WHERE "postId" NOT IN (SELECT id FROM "Post")
  `;

  console.log(`Cleaned up:`);
  console.log(`  ${orphanReplies}  orphaned reply comments`);
  console.log(`  ${orphanComments}  orphaned comments`);
  console.log(`  ${orphanLikes}  orphaned likes`);
  console.log(`  ${orphanReposts}  orphaned reposts`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
