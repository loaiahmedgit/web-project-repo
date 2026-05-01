import {
  BarChart3, Users, FileText, MessageCircle, BadgeCheck,
  Trophy, Star, MessageSquare, Heart, Hash, TrendingUp,
  Activity, ArrowUpRight,
} from 'lucide-react';
import { getPlatformStats } from '@/lib/repository';
import styles from './page.module.css';

export const metadata = {
  title: 'Platform Statistics — Maseera',
  description: 'Live analytics dashboard for the Maseera social media platform.',
};

export default async function StatsPage() {
  const stats = await getPlatformStats();

  const maxHashtag = stats.topHashtags[0]?.count ?? 1;

  return (
    <div className={styles.container}>

      {/* ── Header ──────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerTitle}>
            <div className={styles.logo}>
              <BarChart3 size={24} strokeWidth={2} />
            </div>
            <div>
              <h1>Maseera Analytics</h1>
              <p>Platform Statistics Dashboard</p>
            </div>
          </div>
          <span className={styles.headerBadge}>
            <Activity size={12} />
            Live Data
          </span>
        </div>
      </header>

      {/* ── Summary strip ───────────────────────────────────── */}
      <div className={styles.summaryStrip}>
        <div className={styles.summaryInner}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{stats.totalUsers}</div>
            <div className={styles.summaryLabel}>Users</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{stats.totalPosts}</div>
            <div className={styles.summaryLabel}>Posts</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{stats.totalLikes}</div>
            <div className={styles.summaryLabel}>Likes</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryValue}>{stats.totalComments}</div>
            <div className={styles.summaryLabel}>Comments</div>
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────── */}
      <main className={styles.content}>

        {/* Section 1 — Average stats */}
        <p className={styles.sectionTitle}>Platform Averages</p>
        <div className={styles.statsGrid}>

          <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <div className={`${styles.statIcon} ${styles.accentBlue}`}>
                <Users size={20} />
              </div>
              <ArrowUpRight size={16} className={styles.trendIcon} />
            </div>
            <div className={styles.statNumber}>{stats.avgFollowers.toFixed(1)}</div>
            <div className={styles.statLabel}>Avg. Followers per User</div>
            <div className={styles.statDesc}>
              On average, each user on the platform is followed by {stats.avgFollowers.toFixed(1)} other users.
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <div className={`${styles.statIcon} ${styles.accentGreen}`}>
                <FileText size={20} />
              </div>
              <ArrowUpRight size={16} className={styles.trendIcon} />
            </div>
            <div className={styles.statNumber}>{stats.avgPostsPerUser.toFixed(1)}</div>
            <div className={styles.statLabel}>Avg. Posts per User</div>
            <div className={styles.statDesc}>
              Each user has published an average of {stats.avgPostsPerUser.toFixed(1)} posts since joining.
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <div className={`${styles.statIcon} ${styles.accentPurple}`}>
                <MessageCircle size={20} />
              </div>
              <ArrowUpRight size={16} className={styles.trendIcon} />
            </div>
            <div className={styles.statNumber}>{stats.avgMessagesPerUser.toFixed(1)}</div>
            <div className={styles.statLabel}>Avg. Messages per User</div>
            <div className={styles.statDesc}>
              On average, each user has sent {stats.avgMessagesPerUser.toFixed(1)} direct messages on the platform.
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <div className={`${styles.statIcon} ${styles.accentTeal}`}>
                <BadgeCheck size={20} />
              </div>
              <ArrowUpRight size={16} className={styles.trendIcon} />
            </div>
            <div className={styles.statNumber}>{stats.verifiedCount}</div>
            <div className={styles.statLabel}>Verified Users</div>
            <div className={styles.statDesc}>
              {stats.verifiedCount} out of {stats.totalUsers} users are verified
              ({Math.round((stats.verifiedCount / stats.totalUsers) * 100)}% of the platform).
            </div>
          </div>

        </div>

        {/* Section 2 — Top users */}
        <p className={styles.sectionTitle}>Top Users</p>
        <div className={styles.featureGrid}>

          {stats.leaderboard.length > 0 && (
            <div className={styles.featureCard}>
              <div className={styles.featureCardHeader}>
                <div className={`${styles.statIcon} ${styles.accentOrange}`}>
                  <Trophy size={20} />
                </div>
                <div>
                  <h3>Most Active User</h3>
                  <span>Last 3 months · by post count</span>
                </div>
              </div>
              <div className={styles.userRow}>
                <div className={styles.avatar}>{stats.leaderboard[0].avatar ?? '?'}</div>
                <div className={styles.userInfo}>
                  <h4>
                    {stats.leaderboard[0].displayName}
                    {stats.leaderboard[0].verified && (
                      <span className={styles.verifiedBadge}>
                        <BadgeCheck size={10} /> Verified
                      </span>
                    )}
                  </h4>
                  <p>@{stats.leaderboard[0].username}</p>
                </div>
              </div>
              <div className={styles.statMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaValue}>{stats.leaderboard[0].postCount}</span>
                  <span className={styles.metaLabel}>Posts (3 mo.)</span>
                </div>
              </div>
            </div>
          )}

          {stats.mostFollowedUser && (
            <div className={styles.featureCard}>
              <div className={styles.featureCardHeader}>
                <div className={`${styles.statIcon} ${styles.accentPink}`}>
                  <Star size={20} />
                </div>
                <div>
                  <h3>Most Followed User</h3>
                  <span>Highest follower count on the platform</span>
                </div>
              </div>
              <div className={styles.userRow}>
                <div className={styles.avatar}>{stats.mostFollowedUser.avatar ?? '?'}</div>
                <div className={styles.userInfo}>
                  <h4>
                    {stats.mostFollowedUser.displayName}
                    {stats.mostFollowedUser.verified && (
                      <span className={styles.verifiedBadge}>
                        <BadgeCheck size={10} /> Verified
                      </span>
                    )}
                  </h4>
                  <p>@{stats.mostFollowedUser.username}</p>
                </div>
              </div>
              <div className={styles.statMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaValue}>{stats.mostFollowedUser._count.followers}</span>
                  <span className={styles.metaLabel}>Followers</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaValue}>{stats.mostFollowedUser._count.following}</span>
                  <span className={styles.metaLabel}>Following</span>
                </div>
              </div>
            </div>
          )}

          {stats.mostActiveCommenter && (
            <div className={styles.featureCard}>
              <div className={styles.featureCardHeader}>
                <div className={`${styles.statIcon} ${styles.accentAmber}`}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3>Most Active Commenter</h3>
                  <span>User with most comments posted</span>
                </div>
              </div>
              <div className={styles.userRow}>
                <div className={styles.avatar}>{stats.mostActiveCommenter.avatar ?? '?'}</div>
                <div className={styles.userInfo}>
                  <h4>
                    {stats.mostActiveCommenter.displayName}
                    {stats.mostActiveCommenter.verified && (
                      <span className={styles.verifiedBadge}>
                        <BadgeCheck size={10} /> Verified
                      </span>
                    )}
                  </h4>
                  <p>@{stats.mostActiveCommenter.username}</p>
                </div>
              </div>
              <div className={styles.statMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaValue}>{stats.mostActiveCommenter.commentCount}</span>
                  <span className={styles.metaLabel}>Comments</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Section 3 — Content insights */}
        <p className={styles.sectionTitle}>Content Insights</p>
        <div className={styles.featureGrid}>

          {stats.mostLikedPost && (
            <div className={styles.featureCard}>
              <div className={styles.featureCardHeader}>
                <div className={`${styles.statIcon} ${styles.accentRed}`}>
                  <Heart size={20} />
                </div>
                <div>
                  <h3>Most Liked Post</h3>
                  <span>Top post by total likes</span>
                </div>
              </div>
              <p className={styles.postContent}>{stats.mostLikedPost.caption}</p>
              <p className={styles.postMeta}>
                by @{stats.mostLikedPost.author.username} ·{' '}
                {new Date(stats.mostLikedPost.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
              <div className={styles.statMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaValue}>{stats.mostLikedPost._count.likes}</span>
                  <span className={styles.metaLabel}>Likes</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaValue}>{stats.mostLikedPost._count.comments}</span>
                  <span className={styles.metaLabel}>Comments</span>
                </div>
              </div>
            </div>
          )}

          {stats.topHashtags.length > 0 && (
            <div className={styles.featureCard}>
              <div className={styles.featureCardHeader}>
                <div className={`${styles.statIcon} ${styles.accentBlue}`}>
                  <Hash size={20} />
                </div>
                <div>
                  <h3>Top Hashtags</h3>
                  <span>Most used tags across all posts</span>
                </div>
              </div>
              <div className={styles.hashtagList}>
                {stats.topHashtags.map(({ tag, count }) => (
                  <div key={tag} className={styles.hashtagRow}>
                    <span className={styles.hashtagName}>#{tag}</span>
                    <div className={styles.hashtagBar}>
                      <div
                        className={styles.hashtagFill}
                        style={{ width: `${(count / maxHashtag) * 100}%` }}
                      />
                    </div>
                    <span className={styles.hashtagCount}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Section 4 — Leaderboard */}
        {stats.leaderboard.length > 1 && (
          <>
            <p className={styles.sectionTitle}>Most Active Users — Last 3 Months</p>
            <div className={styles.featureGrid}>
              <div className={styles.featureCard}>
                <div className={styles.leaderboard}>
                  {stats.leaderboard.map((user, i) => (
                    <div key={user.username} className={styles.leaderboardRow}>
                      <div className={`${styles.rank} ${
                        i === 0 ? styles.rank1 : i === 1 ? styles.rank2 : i === 2 ? styles.rank3 : styles.rankOther
                      }`}>
                        {i === 0 ? <Trophy size={12} /> : i + 1}
                      </div>
                      <div className={styles.avatar} style={{ width: 36, height: 36, fontSize: 14 }}>
                        {user.avatar ?? '?'}
                      </div>
                      <div className={styles.leaderboardName}>
                        <strong>{user.displayName}</strong>
                        <span>@{user.username}</span>
                      </div>
                      <span className={styles.leaderboardCount}>
                        <TrendingUp size={12} style={{ marginRight: 4 }} />
                        {user.postCount} posts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
