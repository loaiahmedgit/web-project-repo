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
