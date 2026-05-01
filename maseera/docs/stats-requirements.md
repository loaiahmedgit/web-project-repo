# Statistics Page — Project Requirements

**Source:** project web dev phase2.pdf (CMPS 350, Phase 2)
**Deadline:** 2026-05-01 at 08:00 AM
**Weight:** Statistics use-case = 40% of total project grade

---

## Requirements

- Build a **statistics page** exclusively using **Next.js and React**
- Implement **at least six (6) different statistics**
- Each statistic must be computed via a **database query** — no client-side filtering, sorting, or aggregation
- Create a dedicated page (route) to display the results
- Statistics must be **relevant to the social media platform**

---

## Constraints

- All data filtering, sorting, and aggregation must happen **inside the Prisma query** (on the DB server), not in application code
- Must follow the established **Repository pattern**: add stat functions to `maseera/lib/repository.js`
- Must expose stats via **Next.js API route** (extend or reuse `maseera/app/api/stats/route.js`)
- Must use **Next.js App Router** (already the project standard)
- No JSON files, no localStorage — all data from the relational database

---

## Proposed Statistics (6 minimum)

| # | Statistic | Prisma operation |
|---|-----------|-----------------|
| 1 | Average number of followers per user | `_avg` on Follow count grouped |
| 2 | Average number of posts per user | `_avg` on Post count grouped |
| 3 | Most active user in the last 3 months (most posts + comments + likes) | `groupBy` + `_count` with `where: { createdAt: { gte: 3monthsAgo } }` |
| 4 | Most frequently used word in post content | Raw query or `findMany` + DB text aggregation |
| 5 | Most liked post (top post by like count) | `orderBy: { likes: { _count: 'desc' } }`, `take: 1` |
| 6 | Average post engagement rate (likes + comments + reposts per post) | Aggregated counts via `_count` |
| 7 | Most followed user | `orderBy` on follower count, `take: 1` |
| 8 | Total posts per day (last 30 days) | `groupBy: createdAt` with date truncation |

---

## Tasks

### Implementation
- [ ] Add 6+ stat query functions to `maseera/lib/repository.js`
- [ ] Update `maseera/app/api/stats/route.js` to serve all stats
- [ ] Create stats page at `maseera/app/stats/page.js`
- [ ] Build React components to display each stat (card, chart, table)
- [ ] Verify seed data has enough variety for stats to be meaningful

### Testing
- [ ] Test each API endpoint manually
- [ ] Take screenshots of working stats page for report

### Documentation (report)
- [ ] Copy each Prisma query into the Word report
- [ ] Add screenshots of stats page UI
- [ ] Add evidence of tests (Postman or browser screenshots)

---

## Dependencies

- `maseera/lib/repository.js` — add stat functions here
- `maseera/app/api/stats/route.js` — already exists, extend it
- `maseera/prisma/seed.js` — must have sufficient data rows (users, follows, posts, likes, comments, reposts, messages)
- Prisma schema must include: User, Post, Like, Comment, Follow, Repost, Message models

---

## Report Requirements

- **Format:** Word document
- Must include:
  - Data model diagram
  - All 6+ database queries (copy from `repository.js`)
  - UI screenshots with descriptions
  - Test evidence (screenshots or Postman)
  - Contribution of each team member

---

## Grading Breakdown

| Criteria | % |
|----------|---|
| Statistics use-case (Next.js) | **40%** |
| APIs & Repository implementation | 25% |
| Documentation | 20% |
| Data model design | 10% |
| DB seed (seed.js) | 5% |
| Bonus: cloud deployment | +5% |

**Grading note:** Working = 60% of assigned grade. Not working = lose 40%, remaining 60% based on code quality. Not done = 0.

**Code quality factors:** meaningful naming, no redundant code, efficient design, clean code, comments where necessary, proper indentation.
