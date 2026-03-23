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
      ],
      post5: [
        {
          id: 'cmt_p5_1',
          userId: 'sarah_travels',
          displayName: 'Sarah Travels',
          avatar: 'S',
          text: 'Your photography is absolutely stunning! 😍',
          likes: 342,
          timestamp: '2026-03-17T17:00:00Z',
          pinned: false
        },
        {
          id: 'cmt_p5_2',
          userId: 'techguru_dan',
          displayName: 'Tech Guru Dan',
          avatar: 'T',
          text: 'What camera did you use for this? The colors are incredible!',
          likes: 215,
          timestamp: '2026-03-17T16:45:00Z',
          pinned: false
        },
        {
          id: 'cmt_p5_3',
          userId: 'alexdancer',
          displayName: 'Alex Dancer',
          avatar: 'A',
          text: 'This photo made my day! 🌟',
          likes: 189,
          timestamp: '2026-03-17T16:30:00Z',
          pinned: false
        },
        {
          id: 'cmt_p5_4',
          userId: 'kara_designs',
          displayName: 'Kara Designs',
          avatar: 'K',
          text: 'The lighting in this shot is absolutely perfect!',
          likes: 156,
          timestamp: '2026-03-17T16:15:00Z',
          pinned: false
        },
        {
          id: 'cmt_p5_5',
          userId: 'mike_runner',
          displayName: 'Mike Runner',
          avatar: 'M',
          text: "Can't stop looking at this! 🔥",
          likes: 134,
          timestamp: '2026-03-17T16:00:00Z',
          pinned: false
        },
        {
          id: 'cmt_p5_6',
          userId: 'jordanlee',
          displayName: 'Jordan Lee',
          avatar: 'J',
          text: 'This deserves way more likes. Incredible work!',
          likes: 98,
          timestamp: '2026-03-17T15:45:00Z',
          pinned: false
        }
      ]
    },

    likes: {
      post1: ['jordanlee', 'sarah_travels', 'mike_runner'],
      post2: ['jordanlee'],
      post3: ['jordanlee', 'alexdancer']
    },

    currentUser: 'ahmed_hassan'
  };

  localStorage.setItem('maseera_data', JSON.stringify(defaultData));
  return defaultData;
}

// ========== DATA ACCESS FUNCTIONS ==========

// Get the entire data store
function getData() {
  const raw = localStorage.getItem('maseera_data');
  if (!raw) return initializeDataStore();
  const data = JSON.parse(raw);

  // Migration: add post5 comments if missing (fixes 0-comment bug for lina_ahmad)
  if (!data.comments) data.comments = {};
  if (!data.comments['post5'] || data.comments['post5'].length === 0) {
    data.comments['post5'] = [
      { id: 'cmt_p5_1', userId: 'sarah_travels', displayName: 'Sarah Travels', avatar: 'S', text: 'Your photography is absolutely stunning! 😍', likes: 342, timestamp: '2026-03-17T17:00:00Z', pinned: false },
      { id: 'cmt_p5_2', userId: 'techguru_dan', displayName: 'Tech Guru Dan', avatar: 'T', text: 'What camera did you use for this? The colors are incredible!', likes: 215, timestamp: '2026-03-17T16:45:00Z', pinned: false },
      { id: 'cmt_p5_3', userId: 'alexdancer', displayName: 'Alex Dancer', avatar: 'A', text: 'This photo made my day! 🌟', likes: 189, timestamp: '2026-03-17T16:30:00Z', pinned: false },
      { id: 'cmt_p5_4', userId: 'kara_designs', displayName: 'Kara Designs', avatar: 'K', text: 'The lighting in this shot is absolutely perfect!', likes: 156, timestamp: '2026-03-17T16:15:00Z', pinned: false },
      { id: 'cmt_p5_5', userId: 'mike_runner', displayName: 'Mike Runner', avatar: 'M', text: "Can't stop looking at this! 🔥", likes: 134, timestamp: '2026-03-17T16:00:00Z', pinned: false },
      { id: 'cmt_p5_6', userId: 'jordanlee', displayName: 'Jordan Lee', avatar: 'J', text: 'This deserves way more likes. Incredible work!', likes: 98, timestamp: '2026-03-17T15:45:00Z', pinned: false }
    ];
    localStorage.setItem('maseera_data', JSON.stringify(data));
  }

  return data;
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

// Get the id of the logged-in user (from login localStorage or maseera_data fallback)
function getLoggedInUserId() {
  const userData = JSON.parse(localStorage.getItem('user') || 'null');
  if (userData && userData.username) return userData.username;
  const data = getData();
  return data.currentUser;
}

// Get posts for For You feed (all posts)
function getForYouPosts() {
  const data = getData();
  const maseeraPosts = data.posts.map(p => ({ ...p, _source: 'maseera' }));

  // Also include posts created by users via create.html
  const rawUserPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
  const userPosts = rawUserPosts.map(p => ({
    id:        p.id,
    author:    p.author || 'unknown',
    type:      p.fileType || p.type || 'image',
    mediaPath: p.mediaURL || '',   // filled async via MediaStore if mediaKey exists
    mediaKey:  p.mediaKey  || '',
    audio:     p.audio     || '',
    caption:   p.caption   || '',
    hashtags:  Array.isArray(p.hashtags) ? p.hashtags : [],
    likes:     p.likes     || 0,
    comments:  p.comments  || 0,
    timestamp: p.timestamp || new Date().toISOString(),
    _source:   'userPost'
  }));

  return [...maseeraPosts, ...userPosts]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
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
  let currentUser = getCurrentUser();

  // Fall back to the logged-in user from login localStorage
  let userId, displayName, avatar;
  if (currentUser) {
    userId      = currentUser.id;
    displayName = currentUser.displayName;
    avatar      = currentUser.avatar;
  } else {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    userId      = userData ? (userData.username || 'guest') : 'guest';
    displayName = userData
      ? ((userData.firstName || '') + ' ' + (userData.lastName || '')).trim() || userId
      : userId;
    avatar = userId.charAt(0).toUpperCase();
  }

  if (!data.comments[postId]) {
    data.comments[postId] = [];
  }

  const newComment = {
    id: 'cmt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    userId:      userId,
    displayName: displayName,
    avatar:      avatar,
    text:        text,
    likes:       0,
    timestamp:   new Date().toISOString(),
    pinned:      false
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
  const data        = getData();
  const loggedInId  = getLoggedInUserId();

  if (!loggedInId || loggedInId === userIdToFollow) return false;

  // Find or create the current user in the data store
  let me = data.users.find(u => u.id === loggedInId || u.username === loggedInId);
  if (!me) {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    me = {
      id:          loggedInId,
      username:    loggedInId,
      displayName: userData
        ? ((userData.firstName || '') + ' ' + (userData.lastName || '')).trim() || loggedInId
        : loggedInId,
      avatar:      loggedInId.charAt(0).toUpperCase(),
      following:   [],
      followers:   0
    };
    data.users.push(me);
  }
  if (!me.following) me.following = [];

  const followIndex = me.following.indexOf(userIdToFollow);

  if (followIndex === -1) {
    me.following.push(userIdToFollow);
    const followed = data.users.find(u => u.id === userIdToFollow);
    if (followed) followed.followers = (followed.followers || 0) + 1;
  } else {
    me.following.splice(followIndex, 1);
    const followed = data.users.find(u => u.id === userIdToFollow);
    if (followed) followed.followers = Math.max(0, (followed.followers || 0) - 1);
  }

  const meIdx = data.users.findIndex(u => u.id === loggedInId || u.username === loggedInId);
  if (meIdx !== -1) data.users[meIdx] = me;

  saveData(data);
  return followIndex === -1;
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
    // Look up author in maseera users; fall back to logged-in user info for userPosts
    let author = data.users.find(u => u.id === post.author);
    if (!author) {
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      const handle   = post.author || (userData && userData.username) || 'you';
      const name     = userData
        ? ((userData.firstName || '') + ' ' + (userData.lastName || '')).trim() || handle
        : handle;
      author = {
        id:          handle,
        username:    handle,
        displayName: name,
        avatar:      handle.charAt(0).toUpperCase(),
        verified:    false,
        following:   []
      };
    }

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
    // Play only the first visible video on load
    setTimeout(() => videoController.findAndPlayMostVisibleVideo(), 300);
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
  const loggedInUserId = getLoggedInUserId();
  const isOwner = loggedInUserId && String(post.author) === String(loggedInUserId);

  // Inline SVG icons — no <img> needed, fully CSS-styleable
  const heartSVG = `<svg class="icon-svg heart-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>`;

  const commentSVG = `<svg class="icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>`;

  const shareSVG = `<svg class="icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>`;

  const trashSVG = `<svg class="icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>`;

  article.innerHTML = `
    <div class="video-wrapper">
      ${mediaHTML}

      <div class="video-overlay">

        <div class="video-actions">
          <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
            ${heartSVG}
            <span class="action-count" data-like-count>${formatCount(post.likes)}</span>
          </button>

          <button class="action-btn comment-btn" data-post-id="${post.id}" onclick="openComments('${post.id}')">
            ${commentSVG}
            <span class="action-count" data-comment-count id="cc-${post.id}">
              ${formatCount(commentCount || post.comments)}
            </span>
          </button>

          <button class="action-btn share-btn" data-post-id="${post.id}"
            onclick="openShareModal('${post.id}','${author.id}','${post.mediaPath}')">
            ${shareSVG}
          </button>

          ${isOwner ? `
          <button class="action-btn delete-btn" data-post-id="${post.id}"
            onclick="deletePostFromFeed('${post.id}', this)" title="Delete post">
            ${trashSVG}
          </button>` : ''}
        </div>

        <div class="video-info">

          <div class="poster-info">
            <a href="profile.html?user=${author.id}" class="poster-name">
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
            <span>
              🎵 ${post.audio ? post.audio.split('/').pop() : 'Original Sound'}
            </span>
            ${post.trending ? '<span class="trending-badge">trending</span>' : ''}
          </div>

        </div>

      </div>
    </div>
  `;

  // For userPosts stored in IndexedDB, load the media src asynchronously
  if (post._source === 'userPost' && post.mediaKey) {
    MediaStore.getURL(post.mediaKey).then(url => {
      if (!url) return;
      const mediaEl = article.querySelector('.video-player, .post-image');
      if (mediaEl) mediaEl.src = url;
    });
  }

  setTimeout(() => {
    const video = article.querySelector('.video-player');
    const wrapper = article.querySelector('.video-wrapper');

    if (video) {
      addVideoControls(video, article);
      if (video.muted) {
        addUnmuteButton(video, post.audio || '');
      }
    } else if (wrapper) {
      // Image post: add double-click to like
      wrapper.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const likeBtn = wrapper.querySelector('.like-btn');
        if (likeBtn) {
          likeBtn.click();
          const heart = document.createElement('div');
          heart.innerHTML = '❤️';
          heart.style.cssText = `
            position:absolute;top:50%;left:50%;
            transform:translate(-50%,-50%);
            font-size:80px;opacity:0;
            animation:heartPop 0.6s ease-out forwards;
            pointer-events:none;z-index:25;`;
          wrapper.appendChild(heart);
          setTimeout(() => heart.remove(), 600);
        }
      });
    }
  }, 10);

  return article;
}


// Helper function to check if current user follows an author
function isFollowing(authorId) {
  const data       = getData();
  const loggedInId = getLoggedInUserId();
  const me         = data.users.find(u => u.id === loggedInId || u.username === loggedInId);
  return me?.following?.includes(authorId) || false;
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
  // Like buttons (no inline onclick — needs addEventListener)
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.removeEventListener('click', handleLikeClick);
    btn.addEventListener('click', handleLikeClick);
  });

  // Follow buttons already use inline onclick="handleFollowClick(...)"
  // DO NOT add addEventListener here — it would fire twice and cancel itself out.

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

  const liked = togglePostLike(postId);

  // CSS class drives the visual (see .like-btn.liked img in CSS)
  btn.classList.toggle('liked', liked);

  // Clear any inline filter so the CSS class takes over cleanly
  const img = btn.querySelector('img');
  if (img) img.style.filter = '';

  const countEl = btn.querySelector('[data-like-count]');
  const data = getData();
  const post = data.posts.find(p => p.id === postId);
  if (post && countEl) countEl.textContent = formatCount(post.likes);
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
    let observerDebounce = null;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const videoPost = entry.target;
        const video = videoPost.querySelector('.video-player');
        // Only pause videos that scroll completely out of view
        if (!entry.isIntersecting && video) {
          this.pauseVideo(video);
        }
      });
      // Debounce: wait until the burst of initial intersection events settles
      clearTimeout(observerDebounce);
      observerDebounce = setTimeout(() => {
        this.findAndPlayMostVisibleVideo();
      }, 150);
    }, {
      threshold: [0, 0.5, 1.0]
    });

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
    const allPosts = document.querySelectorAll('.video-post');
    const feed = document.querySelector('.feed');
    if (!feed) return;

    const feedRect = feed.getBoundingClientRect();
    let maxVisibility = 0;
    let mostVisiblePost = null;

    // Find the most visible post — video OR image
    allPosts.forEach(post => {
      const rect = post.getBoundingClientRect();
      const visibleTop    = Math.max(rect.top, feedRect.top);
      const visibleBottom = Math.min(rect.bottom, feedRect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibilityRatio = visibleHeight / rect.height;

      if (visibilityRatio > maxVisibility) {
        maxVisibility     = visibilityRatio;
        mostVisiblePost   = post;
      }
    });

    if (!mostVisiblePost || maxVisibility <= 0.5) return;

    const video = mostVisiblePost.querySelector('.video-player');

    if (video && !this.isUserPaused) {
      // Video post — play it
      this.playVideo(video, mostVisiblePost);
    } else if (!video) {
      // Image post — stop any audio and video that were playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      if (this.currentVideo) {
        this.pauseVideo(this.currentVideo);
        this.currentVideo     = null;
        this.currentVideoPost = null;
      }
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

      // Stop previous audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
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

        // Auto-play audio; if user already chose to unmute, remove muted state
        const postId = videoPost?.dataset.videoId;
        const data = getData();
        const post = data.posts.find(p => p.id === postId);

        // Unmute only this one active video if the user has enabled sound
        if (isSoundOn()) {
          video.muted = false;
          const unmuteBtn = videoPost?.querySelector('.unmute-btn');
          if (unmuteBtn) unmuteBtn.remove();
        } else {
          video.muted = true;
        }

        // Find audio path from maseera_data or from userPosts
        let audioPath = post ? post.audio : null;
        if (!audioPath) {
          const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
          const userPost  = userPosts.find(p => String(p.id) === String(postId));
          audioPath = userPost ? userPost.audio : null;
        }

        if (audioPath) {
          handleVideoSound(video, audioPath);
        } else {
          // This post has no audio — stop whatever was playing before
          if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
          }
        }

      }).catch(error => {
        console.log('Playback failed:', error);
      });
    }
  }

pauseVideo(video) {
  if (video) {
    video.muted = true;   // re-mute so autoplay can't bring sound back
    if (!video.paused) video.pause();
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
// ── Sound preference helpers ──────────────────────────────────────────────
function isSoundOn() {
  return localStorage.getItem('maseera_sound_on') === 'true';
}
function setSoundOn() {
  localStorage.setItem('maseera_sound_on', 'true');
}

function addUnmuteButton(video, audioPath) {
  const wrapper = video.closest('.video-wrapper');
  if (!wrapper) return;

  // If sound is already on, no button needed — playVideo handles unmuting the active video
  if (isSoundOn()) return;

  if (wrapper.querySelector('.unmute-btn')) return;

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
    setSoundOn(); // remember the choice forever

    // Unmute every video currently in the feed
    document.querySelectorAll('.video-player').forEach(v => {
      v.muted = false;
      const otherBtn = v.closest('.video-wrapper')?.querySelector('.unmute-btn');
      if (otherBtn) otherBtn.remove();
    });

    video.play();
    if (audioPath) handleVideoSound(video, audioPath);
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