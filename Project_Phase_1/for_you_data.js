/**
 * for_you_data.js
 * Centralized data management for Maseera For You page
 * Handles localStorage persistence, data initialization, and CRUD operations
 */

// ========== INITIALIZATION ==========

// Initialize the data store if empty
function initializeDataStore() {
  if (localStorage.getItem('maseera_data')) return JSON.parse(localStorage.getItem('maseera_data'));

  // Default data structure
  const defaultData = {
    users: [
      {
        id: 'ahmed_hassan',
        username: 'ahmed_hassan',
        displayName: 'أحمد حسن',
        avatar: 'أ',
        verified: false,
        following: ['omar_salim', 'lina_ahmad'],
        followers: 1200
      },
      {
        id: 'mohamed_ali',
        username: 'mohamed_ali',
        displayName: 'محمد علي',
        avatar: 'م',
        verified: true,
        following: [],
        followers: 5400
      },
      {
        id: 'youssef_khaled',
        username: 'youssef_khaled',
        displayName: 'يوسف خالد',
        avatar: 'ي',
        verified: false,
        following: [],
        followers: 2300
      },
      {
        id: 'omar_salim',
        username: 'omar_salim',
        displayName: 'عمر سليم',
        avatar: 'ع',
        verified: false,
        following: [],
        followers: 1800
      },
      {
        id: 'lina_ahmad',
        username: 'lina_ahmad',
        displayName: 'لينا أحمد',
        avatar: 'ل',
        verified: true,
        following: [],
        followers: 3200
      }
    ],

    posts: [
      {
        id: 'post1',
        author: 'ahmed_hassan',
        type: 'video',
        mediaPath: './media/videos/Video_1.mp4',
        audio: './media/audio/Video_1.mp3',
        caption: 'مرحبا رمضان',
        hashtags: ['egypt', 'travel'],
        likes: 1200,
        comments: 200,
        timestamp: '2026-03-18T14:30:00Z'
      },

      {
        id: 'post2',
        author: 'mohamed_ali',
        type: 'image',
        mediaPath: './media/images/Post_1.png',
        caption: 'لحظة مميزة',
        hashtags: ['photo'],
        likes: 600,
        comments: 80,
        timestamp: '2026-03-18T10:00:00Z'
      },

      {
        id: 'post3',
        author: 'omar_salim',
        type: 'video',
        mediaPath: './media/videos/Video_2.mp4',
        audio: './media/audio/Video_2.mp3',
        caption: ' الاسكندرية',
        hashtags: ['syria', 'history'],
        likes: 980,
        comments: 150,
        timestamp: '2026-03-18T12:00:00Z'
      },

      {
        id: 'post4',
        author: 'youssef_khaled',
        type: 'image',
        mediaPath: './media/images/Post_2.png',
        audio: './media/audio/post_audio.mp3',
        caption: 'يوم جميل في تركيا',
        hashtags: ['life'],
        likes: 430,
        comments: 50,
        timestamp: '2026-03-17T18:00:00Z'
      },

      {
        id: 'post5',
        author: 'lina_ahmad',
        type: 'image',
        mediaPath: './media/images/Post_3.png',
        caption: 'تصويري الخاص',
        hashtags: ['art'],
        likes: 720,
        comments: 120,
        timestamp: '2026-03-17T16:00:00Z'
      }
    ],

    comments: {
      post1: [
        {
          id: 'cmt1',
          userId: 'sarah_travels',
          text: 'I\'ve been watching this on repeat. How is this even possible?!',
          likes: 2800,
          timestamp: '2026-03-18T13:45:00Z',
          pinned: false
        },
        {
          id: 'cmt2',
          userId: 'techguru_dan',
          text: 'Thanks for all the love! Tutorial coming next week 🔥',
          likes: 1100,
          timestamp: '2026-03-18T13:30:00Z',
          pinned: true
        },
        {
          id: 'cmt3',
          userId: 'kara_designs',
          text: 'The song choice is everything! What song is this?',
          likes: 987,
          timestamp: '2026-03-18T12:45:00Z',
          pinned: false
        },
        {
          id: 'cmt4',
          userId: 'alexdancer',
          text: 'Thanks everyone! Tutorial dropping next week 🙏',
          likes: 3200,
          timestamp: '2026-03-18T16:15:00Z',
          pinned: false
        }
      ],
      post2: [
        {
          id: 'cmt5',
          userId: 'jordanlee',
          text: 'This is insane! The timing is perfect!',
          likes: 234,
          timestamp: '2026-03-18T12:30:00Z',
          pinned: false
        }
      ],
      post3: [
        {
          id: 'cmt6',
          userId: 'jordanlee',
          text: 'How is this even possible?! Amazing!',
          likes: 567,
          timestamp: '2026-03-18T10:15:00Z',
          pinned: false
        }
      ]
    },

    likes: {
      post1: ['jordanlee', 'sarah_travels', 'mike_runner'],
      post2: ['jordanlee'],
      post3: ['jordanlee', 'alexdancer']
    },

    currentUser: 'jordanlee'
  };

  localStorage.setItem('maseera_data', JSON.stringify(defaultData));
  return defaultData;
}

// ========== DATA ACCESS FUNCTIONS ==========

// Get the entire data store
function getData() {
  return JSON.parse(localStorage.getItem('maseera_data')) || initializeDataStore();
}

// Save data back to localStorage
function saveData(data) {
  localStorage.setItem('maseera_data', JSON.stringify(data));
}

// Get current user
function getCurrentUser() {
  const data = getData();
  return data.users.find(u => u.id === data.currentUser);
}

// Get posts for For You feed (all posts)
function getForYouPosts() {
  const data = getData();
  return data.posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Get posts for Following feed (posts from users current user follows)
function getFollowingPosts() {
  const data = getData();
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.following) return [];

  return data.posts
    .filter(post => currentUser.following.includes(post.author))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Get comments for a specific post
function getCommentsForPost(postId) {
  const data = getData();
  return data.comments[postId] || [];
}

// Check if current user liked a post
function isPostLiked(postId) {
  const data = getData();
  return data.likes[postId]?.includes(data.currentUser) || false;
}

// Toggle like on a post
function togglePostLike(postId) {
  const data = getData();
  const userId = data.currentUser;

  if (!data.likes[postId]) {
    data.likes[postId] = [];
  }

  const post = data.posts.find(p => p.id === postId);
  if (!post) return false;

  const likedIndex = data.likes[postId].indexOf(userId);

  if (likedIndex === -1) {
    // Like the post
    data.likes[postId].push(userId);
    post.likes = (post.likes || 0) + 1;
  } else {
    // Unlike the post
    data.likes[postId].splice(likedIndex, 1);
    post.likes = Math.max(0, (post.likes || 0) - 1);
  }

  saveData(data);
  return likedIndex === -1; // Returns true if liked, false if unliked
}

// Add a comment to a post
function addComment(postId, text) {
  const data = getData();
  const currentUser = getCurrentUser();

  if (!currentUser) return null;

  if (!data.comments[postId]) {
    data.comments[postId] = [];
  }

  const newComment = {
    id: 'cmt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    userId: currentUser.id,
    text: text,
    likes: 0,
    timestamp: new Date().toISOString(),
    pinned: false
  };

  data.comments[postId].unshift(newComment); // Add to top

  // Update comment count on post
  const post = data.posts.find(p => p.id === postId);
  if (post) {
    post.comments = (post.comments || 0) + 1;
  }

  saveData(data);
  return newComment;
}

// Toggle follow on a user
function toggleFollow(userIdToFollow) {
  const data = getData();
  const currentUser = getCurrentUser();

  if (!currentUser || currentUser.id === userIdToFollow) return false;

  const followIndex = currentUser.following.indexOf(userIdToFollow);

  if (followIndex === -1) {
    // Follow
    currentUser.following.push(userIdToFollow);

    // Increment followers count on the followed user
    const followedUser = data.users.find(u => u.id === userIdToFollow);
    if (followedUser) {
      followedUser.followers = (followedUser.followers || 0) + 1;
    }
  } else {
    // Unfollow
    currentUser.following.splice(followIndex, 1);

    // Decrement followers count
    const followedUser = data.users.find(u => u.id === userIdToFollow);
    if (followedUser) {
      followedUser.followers = Math.max(0, (followedUser.followers || 0) - 1);
    }
  }

  // Update user in users array
  const userIndex = data.users.findIndex(u => u.id === currentUser.id);
  if (userIndex !== -1) {
    data.users[userIndex] = currentUser;
  }

  saveData(data);
  return followIndex === -1; // Returns true if followed, false if unfollowed
}

// Toggle like on a comment
function toggleCommentLike(postId, commentId) {
  const data = getData();
  const userId = data.currentUser;

  if (!data.comments[postId]) return false;

  const comment = data.comments[postId].find(c => c.id === commentId);
  if (!comment) return false;

  // This is simplified - in a real app you'd track which users liked which comments
  // For now we'll just increment/decrement
  const liked = false; // You'd check if user liked it

  if (!liked) {
    comment.likes = (comment.likes || 0) + 1;
  } else {
    comment.likes = Math.max(0, (comment.likes || 0) - 1);
  }

  saveData(data);
  return !liked;
}

// ========== RENDERING FUNCTIONS ==========

// Render all posts in the feed
function renderFeed(containerId, postType = 'for-you') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const posts = postType === 'for-you' ? getForYouPosts() : getFollowingPosts();
  const currentUser = getCurrentUser();
  const data = getData();

  if (posts.length === 0) {
    // Show empty state
    container.innerHTML = getEmptyStateHTML(postType);
    return;
  }

  container.innerHTML = ''; // Clear container

  posts.forEach(post => {
    const author = data.users.find(u => u.id === post.author);
    if (!author) return;

    const isLiked = isPostLiked(post.id);
    const comments = getCommentsForPost(post.id);

    const postElement = createPostElement(post, author, isLiked, comments.length);
    container.appendChild(postElement);
  });

  // Attach event listeners to the new elements
  attachPostEventListeners();
  setTimeout(() => {
    if (videoController) {
      videoController.destroy();
    }
    videoController = new VideoController();
    attachVideoControls();
  }, 100);
}

// Create a single post element
function createPostElement(post, author, isLiked, commentCount) {
  const article = document.createElement('article');
  article.className = 'video-post';
  article.dataset.videoId = post.id;
  article.dataset.author = author.id;

  const hashtagsHTML = post.hashtags.map(tag =>
    `<span class="hashtag" data-hashtag="${tag}">#${tag}</span>`
  ).join('');

  const postUrl = `post.html?post=${encodeURIComponent(post.id)}&author=${encodeURIComponent(author.id)}&caption=${encodeURIComponent(post.caption)}`;

  const mediaHTML = post.type === 'video'
    ? `<video 
        src="${post.mediaPath}" 
        class="video-player" 
        style="width:100%;height:100%;object-fit:cover;" 
        autoplay 
        loop 
        playsinline 
        muted
        data-video-id="${post.id}"
        onclick="handleVideoSound(this, '${post.audio || ''}')"
     ></video>`

    : `<img 
        src="${post.mediaPath}" 
        alt="Post by ${author.displayName}" 
        class="post-image"
        onclick="handleImageSound('${post.audio || ''}')"
     >`;
  article.innerHTML = `
    <div class="video-wrapper">
      <a href="${escapeHtml(postUrl)}" class="post-img-link">${mediaHTML}</a>

      <div class="video-overlay">

        <div class="video-actions">
          <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
            <img src="./media/icons/heart.svg" alt="Like"
              style="filter: ${isLiked ? 'invert(67%) sepia(80%) saturate(400%) hue-rotate(355deg) brightness(1.1)' : ''}">
            <span class="action-count" data-like-count>${formatCount(post.likes)}</span>
          </button>

          <button class="action-btn comment-btn" data-post-id="${post.id}" onclick="openComments('${post.id}')">
            <img src="./media/icons/comments.svg" alt="Comment">
            <span class="action-count" data-comment-count id="cc-${post.id}">
              ${formatCount(commentCount || post.comments)}
            </span>
          </button>

          <button class="action-btn share-btn" data-post-id="${post.id}"
            onclick="openShareModal('${post.id}','${author.id}','${post.mediaPath}')">
            <img src="./media/icons/share.svg" alt="Share">
          </button>
        </div>

        <div class="video-info">

          <div class="poster-info">
            <a href="profile.html?userId=${author.id}" class="poster-name">
              @${author.username}
            </a>

            ${author.verified ? '<span class="verified-badge">✓</span>' : ''}

            <button class="follow-btn ${isFollowing(author.id) ? 'following' : ''}" 
              data-follow-user="${author.id}" 
              onclick="handleFollowClick(event, '${author.id}')">
              ${isFollowing(author.id) ? 'Following' : '+ Follow'}
            </button>
          </div>

          <div class="video-caption">
            <p>${escapeHtml(post.caption)}</p>
            <div class="video-hashtags">${hashtagsHTML}</div>
          </div>

          <div class="video-sound">
            <img src="./media/icons/music.svg" alt="Sound">
            <span>
              🎵 ${post.audio ? post.audio.split('/').pop() : 'Original Sound'}
            </span>
            ${post.trending ? '<span class="trending-badge">trending</span>' : ''}
          </div>

        </div>

      </div>
    </div>
  `;

  setTimeout(() => {
    const video = article.querySelector('.video-player');
    if (video) {
      addVideoControls(video, article);

      if (video.muted) {
        addUnmuteButton(video);
      }
    }
  }, 10);

  return article;
}


// Helper function to check if current user follows an author
function isFollowing(authorId) {
  const currentUser = getCurrentUser();
  return currentUser?.following?.includes(authorId) || false;
}

// Format count (e.g., 18300 -> 18.3K)
function formatCount(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(text || '')));
  return div.innerHTML;
}

// Get empty state HTML based on tab
function getEmptyStateHTML(tab) {
  if (tab === 'following') {
    return `
        <div class="feed-empty-state" id="feedEmptyState" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100vh - 56px);gap:16px;text-align:center;padding:24px;">
          <div style="font-size:64px;opacity:.4;">&#x1F464;</div>
          <h3 style="font-size:22px;font-weight:700;color:#B0B0B0;">No posts yet</h3>
          <p style="font-size:15px;color:#808080;">You haven't followed anyone yet, or they haven't posted.</p>
          <a href="#" onclick="switchTab('for-you', document.querySelector('[data-tab=\\'for-you\\']')); return false;" style="color:#F5A623;text-decoration:none;font-weight:600;border:1px solid #F5A623;padding:10px 24px;border-radius:30px;transition:all .2s;">Back to For You &#x2192;</a>
        </div>
      `;
  } else if (tab === 'live') {
    return `
        <div class="feed-empty-state" id="feedEmptyState" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100vh - 56px);gap:16px;text-align:center;padding:24px;">
          <div style="font-size:64px;opacity:.4;">&#x1F4FA;</div>
          <h3 style="font-size:22px;font-weight:700;color:#B0B0B0;">No live streams</h3>
          <p style="font-size:15px;color:#808080;">No one is live right now. Check back later!</p>
        </div>
      `;
  } else {
    return `
        <div id="forYouEmptyState" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100vh - 56px);gap:16px;text-align:center;padding:24px;">
          <div style="font-size:64px;opacity:.4;">&#x1F4F8;</div>
          <h3 style="font-size:22px;font-weight:700;color:#B0B0B0;">No posts yet</h3>
          <p style="font-size:15px;color:#808080;">You haven't created any posts yet.</p>
          <a href="create.html" style="color:#F5A623;text-decoration:none;font-weight:600;border:1px solid #F5A623;padding:10px 24px;border-radius:30px;transition:all .2s;">Create your first post &#x2192;</a>
        </div>
      `;
  }
}

// Attach event listeners to post elements
function attachPostEventListeners() {
  // Like buttons
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.removeEventListener('click', handleLikeClick);
    btn.addEventListener('click', handleLikeClick);
  });

  // Follow buttons
  document.querySelectorAll('[data-follow-user]').forEach(btn => {
    btn.removeEventListener('click', handleFollowClick);
    btn.addEventListener('click', handleFollowClick);
  });

  // Hashtag clicks
  document.querySelectorAll('.hashtag[data-hashtag]').forEach(tag => {
    tag.removeEventListener('click', handleHashtagClick);
    tag.addEventListener('click', handleHashtagClick);
  });
}

// Handle like button click
function handleLikeClick(e) {
  e.stopPropagation();
  e.preventDefault();

  const btn = e.currentTarget;
  const postId = btn.dataset.postId;
  if (!postId) return;

  // Only handle built-in posts — user posts are handled by attachLikeButtons
  const post = getData().posts.find(p => p.id === postId);
  if (!post) return;

  const liked = togglePostLike(postId);
  btn.classList.toggle('liked', liked);

  const img = btn.querySelector('img');
  if (img) img.style.filter = liked ? 'brightness(0) saturate(100%) invert(21%) sepia(96%) saturate(1946%) hue-rotate(336deg)' : '';

  const countEl = btn.querySelector('[data-like-count]');
  const updated = getData().posts.find(p => p.id === postId);
  if (countEl && updated) countEl.textContent = formatCount(updated.likes);
}

// Handle follow button click
function handleFollowClick(e, userId) {
  e.stopPropagation();
  e.preventDefault();

  const btn = e.currentTarget;
  const userIdToFollow = userId || btn.dataset.followUser;

  if (!userIdToFollow) return;

  const followed = toggleFollow(userIdToFollow);

  // Update UI
  btn.textContent = followed ? 'Following' : '+ Follow';
  btn.classList.toggle('following', followed);
  btn.style.background = followed ? 'linear-gradient(135deg,#8A1538,#F5A623)' : 'transparent';
  btn.style.borderColor = followed ? 'transparent' : '#F5A623';
  btn.style.color = followed ? '#fff' : '#F5A623';
}

// Handle hashtag click
function handleHashtagClick(e) {
  e.stopPropagation();
  e.preventDefault();

  const hashtag = e.currentTarget.dataset.hashtag;
  if (!hashtag) return;

  // Filter posts by hashtag (simplified - just show alert for now)
  alert(`Filtering by #${hashtag} - This would show only posts with this hashtag`);
}



//more additions to fix playback and post to post management
// ========== VIDEO PLAYBACK CONTROLLER ==========
// Manages video playback, pause on scroll, and tap to pause functionality

class VideoController {
  constructor() {
    this.currentVideo = null;
    this.currentVideoId = null;
    this.observer = null;
    this.isUserPaused = false;
    this.initialize();
  }

  initialize() {
    // Set up intersection observer to detect which video is visible
    this.setupIntersectionObserver();

    // Add scroll event listener for better performance
    this.setupScrollListener();

    // Handle window resize
    window.addEventListener('resize', () => {
      setTimeout(() => this.checkVisibleVideos(), 100);
    });
  }

  setupIntersectionObserver() {
    // Create intersection observer to detect which video is in view
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const videoPost = entry.target;
        const video = videoPost.querySelector('.video-player');

        if (entry.isIntersecting && video && !this.isUserPaused) {
          // Video is visible - play it if not user-paused
          this.playVideo(video, videoPost);
        } else if (!entry.isIntersecting && video) {
          // Video is not visible - pause it
          this.pauseVideo(video);
        }
      });
    }, {
      threshold: 0.6 // Video is considered visible when 60% is in view
    });

    // Observe all video posts
    this.observeAllVideos();
  }

  observeAllVideos() {
    const videoPosts = document.querySelectorAll('.video-post');
    videoPosts.forEach(post => {
      this.observer.observe(post);
    });
  }

  setupScrollListener() {
    // Add scroll listener to handle active video
    let scrollTimeout;
    const feed = document.querySelector('.feed');

    if (feed) {
      feed.addEventListener('scroll', () => {
        // Clear previous timeout
        clearTimeout(scrollTimeout);

        // Find the most visible video after scrolling stops
        scrollTimeout = setTimeout(() => {
          this.findAndPlayMostVisibleVideo();
        }, 100);
      });
    }
  }

  findAndPlayMostVisibleVideo() {
    const videoPosts = document.querySelectorAll('.video-post');
    let maxVisibility = 0;
    let mostVisibleVideo = null;
    let mostVisiblePost = null;

    videoPosts.forEach(post => {
      const video = post.querySelector('.video-player');
      if (!video) return;

      const rect = post.getBoundingClientRect();
      const feedRect = document.querySelector('.feed').getBoundingClientRect();

      // Calculate visible area
      const visibleTop = Math.max(rect.top, feedRect.top);
      const visibleBottom = Math.min(rect.bottom, feedRect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibilityRatio = visibleHeight / rect.height;

      if (visibilityRatio > maxVisibility) {
        maxVisibility = visibilityRatio;
        mostVisibleVideo = video;
        mostVisiblePost = post;
      }
    });

    // Play the most visible video if it's not user-paused
    if (mostVisibleVideo && maxVisibility > 0.5 && !this.isUserPaused) {
      this.playVideo(mostVisibleVideo, mostVisiblePost);
    }
  }

  playVideo(video, videoPost) {
    // Don't play if user manually paused
    if (this.isUserPaused && this.currentVideo === video) {
      return;
    }

    // Pause current video if different
    if (this.currentVideo && this.currentVideo !== video) {
      this.pauseVideo(this.currentVideo);

      // 🔥 إيقاف الصوت القديم
      if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
      }

      // Remove active class
      if (this.currentVideoPost) {
        this.currentVideoPost.classList.remove('video-active');
      }
    }

    // Play new video
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.currentVideo = video;
        this.currentVideoPost = videoPost;

        if (videoPost) videoPost.classList.add('video-active');

        // Reset pause state
        if (this.currentVideoId !== videoPost?.dataset.videoId) {
          this.isUserPaused = false;
          this.currentVideoId = videoPost?.dataset.videoId;
        }

        // 🔥 تشغيل الصوت تلقائي
        const postId = videoPost?.dataset.videoId;
        const data = getData();
        const post = data.posts.find(p => p.id === postId);

        if (post && post.audio) {
          handleVideoSound(video, post.audio);
        }

      }).catch(error => {
        console.log('Playback failed:', error);
      });
    }
  }

pauseVideo(video) {
  if (video && !video.paused) {
    video.pause();
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

  togglePlayPause(video, videoPost) {
    if (video.paused) {
      // Resume playing
      this.isUserPaused = false;
      this.playVideo(video, videoPost);
    } else {
      // Pause video
      video.pause();
      this.isUserPaused = true;
    }
  }

  // Call this when new videos are added to the feed
  refreshObservers() {
    this.observer.disconnect();
    this.observer = null;
    this.setupIntersectionObserver();
  }

  // Clean up when needed
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize video controller
let videoController;

// Function to add tap-to-pause overlay to videos
function addVideoControls(videoElement, videoPost) {
  const wrapper = videoElement.closest('.video-wrapper');
  if (!wrapper) return;

  // Check if controls already added
  if (wrapper.querySelector('.video-control-overlay')) return;

  // Create play/pause overlay button
  const controlOverlay = document.createElement('div');
  controlOverlay.className = 'video-control-overlay';
  controlOverlay.innerHTML = `
      <div class="play-pause-icon">⏸</div>
    `;

  // Style the overlay
  controlOverlay.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60px;
      height: 60px;
      background: rgba(0,0,0,0.6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 20;
      pointer-events: auto;
    `;

  const icon = controlOverlay.querySelector('.play-pause-icon');
  icon.style.cssText = `
      font-size: 30px;
      color: white;
    `;

  // Show overlay on hover (desktop) or tap (mobile)
  wrapper.addEventListener('mouseenter', () => {
    controlOverlay.style.opacity = '1';
  });

  wrapper.addEventListener('mouseleave', () => {
    controlOverlay.style.opacity = '0';
  });

  // For mobile: show on tap, hide after 2 seconds
  let hideTimeout;
  wrapper.addEventListener('click', (e) => {
    // Don't trigger if clicking on other buttons
    if (e.target.closest('.action-btn') || e.target.closest('.follow-btn')) {
      return;
    }

    e.stopPropagation();

    // Toggle play/pause
    videoController.togglePlayPause(videoElement, videoPost);

    // Update icon
    if (videoElement.paused) {
      icon.textContent = '▶';
      icon.style.fontSize = '28px';
    } else {
      icon.textContent = '⏸';
      icon.style.fontSize = '30px';
    }

    // Show overlay briefly
    controlOverlay.style.opacity = '1';
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      controlOverlay.style.opacity = '0';
    }, 1000);
  });

  wrapper.appendChild(controlOverlay);

  // Also add double-tap to like functionality (bonus)
  let lastTap = 0;
  wrapper.addEventListener('dblclick', (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Find the like button for this post
    const likeBtn = wrapper.querySelector('.like-btn');
    if (likeBtn) {
      likeBtn.click();

      // Show heart animation
      const heartAnimation = document.createElement('div');
      heartAnimation.innerHTML = '❤️';
      heartAnimation.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 80px;
          color: var(--orange);
          opacity: 0;
          animation: heartPop 0.6s ease-out forwards;
          pointer-events: none;
          z-index: 25;
        `;
      wrapper.appendChild(heartAnimation);
      setTimeout(() => heartAnimation.remove(), 600);
    }
  });
}

// Add keyframe animation for double-tap like
const style = document.createElement('style');
style.textContent = `
    @keyframes heartPop {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(0.5);
      }
      50% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.2);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1.5);
      }
    }
    
    .video-active {
      position: relative;
    }
    
    .video-control-overlay {
      pointer-events: auto !important;
    }
    
    /* Mobile optimization for video controls */
    @media (max-width: 768px) {
      .video-control-overlay {
        width: 50px;
        height: 50px;
      }
      
      .play-pause-icon {
        font-size: 24px !important;
      }
    }
  `;
document.head.appendChild(style);

// Function to attach video controls to all videos
function attachVideoControls() {
  const videos = document.querySelectorAll('.video-player');
  videos.forEach(video => {
    const videoPost = video.closest('.video-post');
    if (videoPost && !video.hasAttribute('data-controls-attached')) {
      video.setAttribute('data-controls-attached', 'true');
      addVideoControls(video, videoPost);
      if (soundOn) {
        video.muted = false;
      } else {
        addUnmuteButton(video);
      }
    }
  });
}
function setupScrollVideoManagement() {
  const feed = document.querySelector('.feed');
  let scrollTimeout;
  let lastScrollPosition = 0;
  let isScrolling = false;

  if (!feed) return;

  feed.addEventListener('scroll', () => {
    isScrolling = true;

    // Clear previous timeout
    clearTimeout(scrollTimeout);

    // Pause all videos while scrolling (improves performance)
    if (videoController && videoController.currentVideo) {
      videoController.pauseVideo(videoController.currentVideo);
    }

    // After scrolling stops, play the visible video
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
      if (videoController) {
        videoController.findAndPlayMostVisibleVideo();
      }
    }, 150);
  });

  // Handle touch/mouse wheel events for smoother experience
  feed.addEventListener('wheel', () => {
    if (videoController && videoController.currentVideo && !videoController.currentVideo.paused) {
      // Optional: Reduce volume slightly while scrolling for smoother experience
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
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: rgba(0,0,0,0.7);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 30px;
      font-size: 12px;
      cursor: pointer;
      z-index: 15;
      font-weight: 600;
      backdrop-filter: blur(5px);
      transition: all 0.2s ease;
    `;

  unmuteBtn.onclick = (e) => {
    e.stopPropagation();
    unmuteAll();
  };

  wrapper.appendChild(unmuteBtn);
}

// When switching tabs, reinitialize video controller
window.switchTab = function (tab, el) {
  // ... existing tab switching code ...

  // Reinitialize video controller for new content
  setTimeout(() => {
    if (videoController) {
      videoController.destroy();
    }
    videoController = new VideoController();
    attachVideoControls();
  }, 100);
};

let currentAudio = null;
let soundOn = sessionStorage.getItem('soundOn') === 'true';

function unmuteAll() {
  soundOn = true;
  sessionStorage.setItem('soundOn', 'true');
  // Only unmute the video currently on screen
  if (videoController && videoController.currentVideo) {
    videoController.currentVideo.muted = false;
  }
  document.querySelectorAll('.unmute-btn').forEach(b => b.remove());
}

function handleVideoSound(video, audioPath) {
  if (!audioPath) return;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const audio = new Audio(audioPath);
  currentAudio = audio;

  audio.currentTime = video.currentTime;

  audio.play().catch(() => { });

  video.addEventListener('seeked', () => {
    audio.currentTime = video.currentTime;
  });

  video.addEventListener('pause', () => audio.pause());
  video.addEventListener('play', () => audio.play());
}

function handleImageSound(audioPath) {
  if (!audioPath) return;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const audio = new Audio(audioPath);
  currentAudio = audio;

  audio.play().catch(() => { });
}