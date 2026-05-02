/**
 * for_you_data.js
 * API-connected data layer for Maseera — replaces localStorage with Next.js API calls.
 */

// ── In-memory state ────────────────────────────────────────────────────────
let _appData     = { users: [], posts: [] };
let _followSet   = new Set();   // IDs of users the current user follows
let _likedSet    = new Set();   // post IDs the current user has liked
let _currentUser = null;        // { id, username, displayName, avatar, verified, ... }

// ── Initialization ─────────────────────────────────────────────────────────
async function initializeApp() {
  try {
    const stored = sessionStorage.getItem('currentUser');
    if (stored) _currentUser = JSON.parse(stored);
  } catch {}

  // Stale sessionStorage (pre-API login) may have username but no id — resolve it
  if (_currentUser && !_currentUser.id && _currentUser.username) {
    try {
      const r = await fetch('/api/users/' + encodeURIComponent(_currentUser.username));
      if (r.ok) {
        const fresh = await r.json();
        _currentUser = { ..._currentUser, ...fresh };
        sessionStorage.setItem('currentUser', JSON.stringify(_currentUser));
      }
    } catch {}
  }

  const userId = _currentUser?.id;

  const [usersRes, postsRes, followingRes] = await Promise.all([
    fetch('/api/users'),
    fetch('/api/posts'),
    userId
      ? fetch('/api/users/' + encodeURIComponent(userId) + '/following')
      : Promise.resolve({ ok: false }),
  ]);

  const usersRaw     = usersRes.ok     ? await usersRes.json()     : [];
  const postsRaw     = postsRes.ok     ? await postsRes.json()     : [];
  const followingRaw = followingRes.ok ? await followingRes.json() : [];

  _appData.users = usersRaw.map(transformUser);
  _appData.posts = postsRaw.map(transformPost);
  _followSet     = new Set(followingRaw.map(f => f.following?.id).filter(Boolean));
}

function transformPost(p) {
  const hashtags = p.hashtags
    ? (typeof p.hashtags === 'string'
        ? p.hashtags.split(',').map(h => h.trim()).filter(Boolean)
        : p.hashtags)
    : [];
  return {
    id:        p.id,
    author:    p.authorId,
    type:      p.mediaType  || 'image',
    mediaPath: p.mediaPath  || '',
    audio:     p.audioPath  || '',
    caption:   p.caption    || '',
    hashtags,
    likes:     p._count?.likes    ?? 0,
    comments:  p._count?.comments ?? 0,
    timestamp: p.createdAt,
  };
}

function transformUser(u) {
  return {
    id:          u.id,
    username:    u.username,
    displayName: u.displayName,
    avatar:      u.avatar || u.displayName?.charAt(0) || '?',
    verified:    u.verified || false,
    following:   [],
    followers:   u._count?.followers ?? 0,
  };
}

// ── Synchronous accessors ──────────────────────────────────────────────────
function getData()        { return _appData; }
function getCurrentUser() { return _currentUser; }

function getForYouPosts() {
  return [..._appData.posts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function getFollowingPosts() {
  return getForYouPosts().filter(p => _followSet.has(p.author));
}

function getCommentsForPost(_postId) {
  return []; // comments are loaded lazily from API in openComments()
}

function isPostLiked(postId) { return _likedSet.has(postId); }
function isFollowing(userId)  { return _followSet.has(userId); }

// ── Mutating API calls ─────────────────────────────────────────────────────
async function togglePostLike(postId) {
  const userId = _currentUser?.id || JSON.parse(sessionStorage.getItem('currentUser') || '{}').id;
  if (!userId) return false;

  const res = await fetch(`/api/posts/${postId}/like`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ userId }),
  });
  if (!res.ok) return _likedSet.has(postId);

  const { liked } = await res.json();
  const post = _appData.posts.find(p => p.id === postId);
  if (post) post.likes = Math.max(0, post.likes + (liked ? 1 : -1));
  liked ? _likedSet.add(postId) : _likedSet.delete(postId);
  return liked;
}

async function addComment(postId, text) {
  const authorId = _currentUser?.id || JSON.parse(sessionStorage.getItem('currentUser') || '{}').id;
  if (!authorId || !text) return null;

  const res = await fetch(`/api/posts/${postId}/comments`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ authorId, content: text }),
  });
  if (!res.ok) return null;

  const comment = await res.json();
  const post = _appData.posts.find(p => p.id === postId);
  if (post) post.comments = (post.comments || 0) + 1;
  return comment;
}

async function toggleFollow(userIdToFollow) {
  const followerId = _currentUser?.id || JSON.parse(sessionStorage.getItem('currentUser') || '{}').id;
  if (!followerId || followerId === userIdToFollow) return false;

  const res = await fetch('/api/follows', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ followerId, followingId: userIdToFollow }),
  });
  if (!res.ok) return _followSet.has(userIdToFollow);

  const { following } = await res.json();
  following ? _followSet.add(userIdToFollow) : _followSet.delete(userIdToFollow);
  return following;
}

function toggleCommentLike(_postId, _commentId) { return false; }

// ── Rendering helpers ──────────────────────────────────────────────────────
function formatCount(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000)    return (num / 1000).toFixed(1) + 'K';
  return String(num);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(text || '')));
  return div.innerHTML;
}

function getEmptyStateHTML(tab) {
  if (tab === 'following') {
    return `<div class="feed-empty-state" id="feedEmptyState" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100vh - 56px);gap:16px;text-align:center;padding:24px;">
      <div style="font-size:64px;opacity:.4;">&#x1F464;</div>
      <h3 style="font-size:22px;font-weight:700;color:#B0B0B0;">No posts yet</h3>
      <p style="font-size:15px;color:#808080;">You haven't followed anyone yet.</p>
      <a href="#" onclick="switchTab('for-you', document.querySelector('[data-tab=\\'for-you\\']')); return false;" style="color:#F5A623;text-decoration:none;font-weight:600;border:1px solid #F5A623;padding:10px 24px;border-radius:30px;">Back to For You &#x2192;</a>
    </div>`;
  }
  return `<div id="forYouEmptyState" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100vh - 56px);gap:16px;text-align:center;padding:24px;">
    <div style="font-size:64px;opacity:.4;">&#x1F4F8;</div>
    <h3 style="font-size:22px;font-weight:700;color:#B0B0B0;">No posts yet</h3>
  </div>`;
}

function attachPostEventListeners() {
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.removeEventListener('click', handleLikeClick);
    btn.addEventListener('click', handleLikeClick);
  });
  document.querySelectorAll('[data-follow-user]').forEach(btn => {
    btn.removeEventListener('click', handleFollowClick);
    btn.addEventListener('click', handleFollowClick);
  });
  document.querySelectorAll('.hashtag[data-hashtag]').forEach(tag => {
    tag.removeEventListener('click', handleHashtagClick);
    tag.addEventListener('click', handleHashtagClick);
  });
}

function handleLikeClick(e) {
  e.stopPropagation();
  e.preventDefault();
  const btn    = e.currentTarget;
  const postId = btn.dataset.postId;
  if (!postId) return;

  togglePostLike(postId).then(liked => {
    btn.classList.toggle('liked', liked);
    const img = btn.querySelector('img');
    if (img) img.style.filter = liked
      ? 'brightness(0) saturate(100%) invert(21%) sepia(96%) saturate(1946%) hue-rotate(336deg)' : '';
    const countEl = btn.querySelector('[data-like-count]');
    const post    = _appData.posts.find(p => p.id === postId);
    if (countEl && post) countEl.textContent = formatCount(post.likes);
  });
}

function handleFollowClick(e, userId) {
  e.stopPropagation();
  e.preventDefault();
  const btn            = e.currentTarget;
  const userIdToFollow = userId || btn.dataset.followUser;
  if (!userIdToFollow) return;

  toggleFollow(userIdToFollow).then(followed => {
    btn.textContent            = followed ? 'Following' : '+ Follow';
    btn.classList.toggle('following', followed);
    btn.style.background       = followed ? 'linear-gradient(135deg,#8A1538,#F5A623)' : 'transparent';
    btn.style.borderColor      = followed ? 'transparent' : '#F5A623';
    btn.style.color            = followed ? '#fff' : '#F5A623';

    // If on the Following tab and just unfollowed, refresh so their posts disappear
    if (!followed) {
      const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
      if (activeTab === 'following' && typeof window.renderFeedWithMedia === 'function') {
        window.renderFeedWithMedia('postsContainer', 'following');
      }
    }
  });
}

function handleHashtagClick(e) {
  e.stopPropagation();
  e.preventDefault();
  const hashtag = e.currentTarget.dataset.hashtag;
  if (hashtag) alert(`Filtering by #${hashtag}`);
}

function renderFeed(containerId, postType = 'for-you') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const posts = postType === 'for-you' ? getForYouPosts() : getFollowingPosts();
  if (!posts.length) { container.innerHTML = getEmptyStateHTML(postType); return; }
  container.innerHTML = '';
  posts.forEach(post => {
    const author = _appData.users.find(u => u.id === post.author);
    if (!author) return;
    const el = createPostElement(post, author, isPostLiked(post.id), 0);
    container.appendChild(el);
  });
  attachPostEventListeners();
  setTimeout(() => {
    if (videoController) videoController.destroy();
    videoController = new VideoController();
    attachVideoControls();
  }, 100);
}

function createPostElement(post, author, isLiked, commentCount) {
  const article = document.createElement('article');
  article.className      = 'video-post';
  article.dataset.videoId = post.id;
  article.dataset.author  = author.id;

  const hashtagsHTML = post.hashtags.map(tag =>
    `<span class="hashtag" data-hashtag="${tag}">#${tag}</span>`
  ).join('');

  const postUrl = `post.html?post=${encodeURIComponent(post.id)}&author=${encodeURIComponent(author.id)}&caption=${encodeURIComponent(post.caption)}`;

  const mediaHTML = post.type === 'video'
    ? `<video src="${post.mediaPath}" class="video-player" style="width:100%;height:100%;object-fit:cover;" autoplay loop playsinline muted data-video-id="${post.id}" onclick="handleVideoSound(this,'${post.audio||''}')"></video>`
    : `<img src="${post.mediaPath}" alt="Post by ${escapeHtml(author.displayName)}" class="post-image" onclick="handleImageSound('${post.audio||''}')">`;

  article.innerHTML = `
    <div class="video-wrapper">
      <a href="${escapeHtml(postUrl)}" class="post-img-link">${mediaHTML}</a>
      <div class="video-overlay">
        <div class="video-actions">
          <button class="action-btn like-btn ${isLiked?'liked':''}" data-post-id="${post.id}">
            <img src="./media/icons/heart.svg" alt="Like" style="filter:${isLiked?'invert(67%) sepia(80%) saturate(400%) hue-rotate(355deg) brightness(1.1)':''}">
            <span class="action-count" data-like-count>${formatCount(post.likes)}</span>
          </button>
          <button class="action-btn comment-btn" data-post-id="${post.id}" onclick="openComments('${post.id}')">
            <img src="./media/icons/comments.svg" alt="Comment">
            <span class="action-count" data-comment-count id="cc-${post.id}">${formatCount(commentCount||post.comments)}</span>
          </button>
          <button class="action-btn share-btn" data-post-id="${post.id}" onclick="openShareModal('${post.id}','${author.id}','${post.mediaPath}')">
            <img src="./media/icons/share.svg" alt="Share">
          </button>
        </div>
        <div class="video-info">
          <div class="poster-info">
            <a href="profile.html?userId=${author.id}" class="poster-name">@${author.username}</a>
            ${author.verified?'<span class="verified-badge">✓</span>':''}
            <button class="follow-btn ${isFollowing(author.id)?'following':''}" data-follow-user="${author.id}" onclick="handleFollowClick(event,'${author.id}')">${isFollowing(author.id)?'Following':'+ Follow'}</button>
          </div>
          <div class="video-caption">
            <p>${escapeHtml(post.caption)}</p>
            <div class="video-hashtags">${hashtagsHTML}</div>
          </div>
          <div class="video-sound">
            <img src="./media/icons/music.svg" alt="Sound">
            <span>🎵 ${post.audio?post.audio.split('/').pop():'Original Sound'}</span>
          </div>
        </div>
      </div>
    </div>`;

  setTimeout(() => {
    const video = article.querySelector('.video-player');
    if (video) {
      addVideoControls(video, article);
      if (video.muted) addUnmuteButton(video);
    }
  }, 10);

  return article;
}

// ═══════════════════════════════════════════════════════════════════════════
//  VIDEO PLAYBACK CONTROLLER  (unchanged from original)
// ═══════════════════════════════════════════════════════════════════════════

class VideoController {
  constructor() {
    this.currentVideo     = null;
    this.currentVideoId   = null;
    this.observer         = null;
    this.isUserPaused     = false;
    this.initialize();
  }

  initialize() {
    this.setupIntersectionObserver();
    this.setupScrollListener();
    window.addEventListener('resize', () => {
      setTimeout(() => this.checkVisibleVideos(), 100);
    });
  }

  setupIntersectionObserver() {
    this._ready = false;
    // Delay before auto-playing prevents all videos from blasting at once on load
    setTimeout(() => {
      this._ready = true;
      this.findAndPlayMostVisibleVideo();
    }, 500);

    this.observer = new IntersectionObserver((entries) => {
      if (!this._ready) return;
      entries.forEach(entry => {
        const videoPost = entry.target;
        const video     = videoPost.querySelector('.video-player');
        if (entry.isIntersecting && video && !this.isUserPaused) {
          this.playVideo(video, videoPost);
        } else if (!entry.isIntersecting && video) {
          this.pauseVideo(video);
        }
      });
    }, { threshold: 0.6 });

    this.observeAllVideos();
  }

  observeAllVideos() {
    document.querySelectorAll('.video-post').forEach(post => {
      this.observer.observe(post);
    });
  }

  setupScrollListener() {
    // IntersectionObserver handles play/pause — no redundant scroll listener needed
  }

  findAndPlayMostVisibleVideo() {
    const videoPosts  = document.querySelectorAll('.video-post');
    let maxVisibility = 0;
    let mostVisibleVideo = null;
    let mostVisiblePost  = null;

    videoPosts.forEach(post => {
      const video    = post.querySelector('.video-player');
      if (!video) return;
      const rect     = post.getBoundingClientRect();
      const feedRect = document.querySelector('.feed').getBoundingClientRect();
      const visibleTop    = Math.max(rect.top, feedRect.top);
      const visibleBottom = Math.min(rect.bottom, feedRect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const ratio         = visibleHeight / rect.height;
      if (ratio > maxVisibility) {
        maxVisibility    = ratio;
        mostVisibleVideo = video;
        mostVisiblePost  = post;
      }
    });

    if (mostVisibleVideo && maxVisibility > 0.5 && !this.isUserPaused) {
      this.playVideo(mostVisibleVideo, mostVisiblePost);
    }
  }

  playVideo(video, videoPost) {
    if (this.isUserPaused && this.currentVideo === video) return;

    // Stop any playing audio immediately before switching videos
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }

    if (this.currentVideo && this.currentVideo !== video) {
      this.pauseVideo(this.currentVideo);
      if (this.currentVideoPost) {
        this.currentVideoPost.classList.remove('video-active');
      }
    }

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.currentVideo     = video;
        this.currentVideoPost = videoPost;
        if (videoPost) videoPost.classList.add('video-active');
        if (soundOn) video.muted = false;
        if (this.currentVideoId !== videoPost?.dataset.videoId) {
          this.isUserPaused   = false;
          this.currentVideoId = videoPost?.dataset.videoId;
        }
        const postId = videoPost?.dataset.videoId;
        const post   = _appData.posts.find(p => p.id === postId);
        if (post && post.audio) handleVideoSound(video, post.audio);
      }).catch(() => {});
    }
  }

  pauseVideo(video) {
    if (video && !video.paused) video.pause();
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
  }

  togglePlayPause(video, videoPost) {
    if (video.paused) {
      this.isUserPaused = false;
      this.playVideo(video, videoPost);
    } else {
      video.pause();
      this.isUserPaused = true;
    }
  }

  refreshObservers() {
    this.observer.disconnect();
    this.observer = null;
    this.setupIntersectionObserver();
  }

  destroy() {
    if (this.observer) this.observer.disconnect();
  }
}

let videoController;

function addVideoControls(videoElement, videoPost) {
  const PAUSE_SVG = `<svg viewBox="0 0 24 24" width="26" height="26" fill="white" style="display:block"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`;
  const PLAY_SVG  = `<svg viewBox="0 0 24 24" width="26" height="26" fill="white" style="display:block"><polygon points="5,3 19,12 5,21"/></svg>`;

  const wrapper = videoElement.closest('.video-wrapper');
  if (!wrapper || wrapper.querySelector('.video-control-overlay')) return;

  const controlOverlay = document.createElement('div');
  controlOverlay.className = 'video-control-overlay';
  controlOverlay.innerHTML = `<div class="play-pause-icon">${PAUSE_SVG}</div>`;
  controlOverlay.style.cssText = `
    position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
    width:60px;height:60px;background:rgba(0,0,0,0.6);border-radius:50%;
    display:flex;align-items:center;justify-content:center;cursor:pointer;
    opacity:0;transition:opacity 0.3s ease;z-index:20;pointer-events:auto;`;

  const icon = controlOverlay.querySelector('.play-pause-icon');

  wrapper.addEventListener('mouseenter', () => { controlOverlay.style.opacity = '1'; });
  wrapper.addEventListener('mouseleave', () => { controlOverlay.style.opacity = '0'; });

  let hideTimeout;
  wrapper.addEventListener('click', (e) => {
    if (e.target.closest('.action-btn') || e.target.closest('.follow-btn')) return;
    e.stopPropagation();
    videoController.togglePlayPause(videoElement, videoPost);
    icon.innerHTML = videoElement.paused ? PLAY_SVG : PAUSE_SVG;
    controlOverlay.style.opacity = '1';
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => { controlOverlay.style.opacity = '0'; }, 1000);
  });

  wrapper.appendChild(controlOverlay);

  wrapper.addEventListener('dblclick', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const likeBtn = wrapper.querySelector('.like-btn');
    if (likeBtn) {
      if (!likeBtn.classList.contains('liked')) likeBtn.click();
      const heartAnimation = document.createElement('div');
      heartAnimation.innerHTML = '<img src="./media/icons/filledheart.svg" style="width:80px;height:80px;filter:brightness(0) saturate(100%) invert(21%) sepia(96%) saturate(1946%) hue-rotate(336deg);">';
      heartAnimation.style.cssText = `
        position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        opacity:0;animation:heartPop 0.6s ease-out forwards;pointer-events:none;z-index:25;`;
      wrapper.appendChild(heartAnimation);
      setTimeout(() => heartAnimation.remove(), 600);
    }
  });
}

const _vcStyle = document.createElement('style');
_vcStyle.textContent = `
  @keyframes heartPop {
    0%   { opacity:1; transform:translate(-50%,-50%) scale(0.5); }
    50%  { opacity:1; transform:translate(-50%,-50%) scale(1.2); }
    100% { opacity:0; transform:translate(-50%,-50%) scale(1.5); }
  }
  .video-active { position:relative; }
  .video-control-overlay { pointer-events:auto !important; }
  @media (max-width:768px) {
    .video-control-overlay { width:50px; height:50px; }
    .play-pause-icon       { font-size:24px !important; }
  }`;
document.head.appendChild(_vcStyle);

function attachVideoControls() {
  document.querySelectorAll('.video-player').forEach(video => {
    const videoPost = video.closest('.video-post');
    if (videoPost && !video.hasAttribute('data-controls-attached')) {
      video.setAttribute('data-controls-attached', 'true');
      addVideoControls(video, videoPost);
      // Always start muted; VideoController unmutes only the active video
      video.muted = true;
      if (!soundOn) addUnmuteButton(video);
    }
  });
}

function setupScrollVideoManagement() {
  const feed = document.querySelector('.feed');
  if (!feed) return;

  feed.addEventListener('wheel', () => {
    if (videoController && videoController.currentVideo && !videoController.currentVideo.paused) {
      if (videoController.currentVideo.volume > 0.3) {
        videoController.currentVideo.volume = 0.3;
        setTimeout(() => {
          if (videoController.currentVideo && !videoController.currentVideo.paused) {
            videoController.currentVideo.volume = 1;
          }
        }, 500);
      }
    }
  });
}

function addUnmuteButton(video) {
  const wrapper = video.closest('.video-wrapper');
  if (!wrapper || wrapper.querySelector('.unmute-btn')) return;

  const unmuteBtn = document.createElement('button');
  unmuteBtn.className = 'unmute-btn';
  unmuteBtn.innerHTML = '🔊 Tap to unmute';
  unmuteBtn.style.cssText = `
    position:absolute;bottom:20px;right:20px;background:rgba(0,0,0,0.7);
    color:white;border:none;padding:8px 16px;border-radius:30px;font-size:12px;
    cursor:pointer;z-index:15;font-weight:600;backdrop-filter:blur(5px);transition:all 0.2s ease;`;
  unmuteBtn.onclick = (e) => { e.stopPropagation(); unmuteAll(); };
  wrapper.appendChild(unmuteBtn);
}

window.switchTab = function (tab, el) {
  setTimeout(() => {
    if (videoController) videoController.destroy();
    videoController = new VideoController();
    attachVideoControls();
  }, 100);
};

let currentAudio = null;
let soundOn      = sessionStorage.getItem('soundOn') === 'true';

function unmuteAll() {
  soundOn = true;
  sessionStorage.setItem('soundOn', 'true');
  if (videoController && videoController.currentVideo) {
    videoController.currentVideo.muted = false;
  }
  document.querySelectorAll('.unmute-btn').forEach(b => b.remove());
}

function handleVideoSound(video, audioPath) {
  if (!audioPath) return;
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  const audio = new Audio(audioPath);
  currentAudio = audio;
  audio.currentTime = video.currentTime;
  audio.play().catch(() => {});
  video.addEventListener('seeked', () => { audio.currentTime = video.currentTime; });
  video.addEventListener('pause', () => audio.pause());
  video.addEventListener('play',  () => audio.play());
}

function handleImageSound(audioPath) {
  if (!audioPath) return;
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  const audio = new Audio(audioPath);
  currentAudio = audio;
  audio.play().catch(() => {});
}
