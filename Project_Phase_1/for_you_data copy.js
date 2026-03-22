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
          id: 'jordanlee',
          username: 'jordanlee',
          displayName: 'Jordan Lee',
          avatar: 'J',
          verified: false,
          following: ['alexdancer', 'mike_runner', 'sarah_travels', 'techguru_dan'],
          followers: 1240
        },
        {
          id: 'alexdancer',
          username: 'alexdancer',
          displayName: 'Alex Dancer',
          avatar: 'A',
          verified: true,
          following: [],
          followers: 18300
        },
        {
          id: 'mike_runner',
          username: 'mike_runner',
          displayName: 'Mike Runner',
          avatar: 'M',
          verified: false,
          following: [],
          followers: 4200
        },
        {
          id: 'sarah_travels',
          username: 'sarah_travels',
          displayName: 'Sarah Travels',
          avatar: 'S',
          verified: false,
          following: [],
          followers: 2800
        },
        {
          id: 'techguru_dan',
          username: 'techguru_dan',
          displayName: 'Tech Guru Dan',
          avatar: 'T',
          verified: true,
          following: [],
          followers: 1100
        },
        {
          id: 'kara_designs',
          username: 'kara_designs',
          displayName: 'Kara Designs',
          avatar: 'K',
          verified: false,
          following: [],
          followers: 987
        }
      ],
      
      posts: [
        {
          id: 'post1',
          author: 'alexdancer',
          type: 'video',
          mediaPath: './media/videos/Video_1.mp4',
          caption: 'POV: When you finally nail that transition ✨',
          hashtags: ['dance', 'viral', 'transition'],
          likes: 18300,
          comments: 5200,
          timestamp: '2026-03-18T14:30:00Z',
          audio: 'Original Sound - alexdancer',
          trending: true
        },
        {
          id: 'post2',
          author: 'mike_runner',
          type: 'video',
          mediaPath: './media/videos/run.mp4',
          caption: 'This is absolutely insane!! The timing is perfect 🏃‍♂️',
          hashtags: ['running', 'trick', 'insane'],
          likes: 4200,
          comments: 987,
          timestamp: '2026-03-18T12:15:00Z',
          audio: 'Original Sound - mike_runner'
        },
        {
          id: 'post3',
          author: 'sarah_travels',
          type: 'video',
          mediaPath: './media/videos/yandere.mp4',
          caption: 'I\'ve been watching this on repeat. How is this even possible?! 🌍',
          hashtags: ['travel', 'magic', 'wow'],
          likes: 94200,
          comments: 12400,
          timestamp: '2026-03-18T10:00:00Z',
          audio: 'Original Sound - sarah_travels',
          trending: true
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
      ? `<video src="${post.mediaPath}" style="width:100%;height:100%;object-fit:cover;" muted autoplay loop playsinline></video>`
      : `<img src="${post.mediaPath}" alt="Post by ${author.displayName}">`;
    
    article.innerHTML = `
      <div class="video-wrapper">
        <a href="${escapeHtml(postUrl)}" class="post-img-link">${mediaHTML}</a>
        <div class="video-overlay">
          <div class="video-actions">
            <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
              <img src="./media/icons/heart.svg" alt="Like" style="filter: ${isLiked ? 'invert(67%) sepia(80%) saturate(400%) hue-rotate(355deg) brightness(1.1)' : ''}">
              <span class="action-count" data-like-count>${formatCount(post.likes)}</span>
            </button>
            <button class="action-btn comment-btn" data-post-id="${post.id}" onclick="openComments('${post.id}')">
              <img src="./media/icons/comments.svg" alt="Comment">
              <span class="action-count" data-comment-count id="cc-${post.id}">${formatCount(commentCount || post.comments)}</span>
            </button>
            <button class="action-btn share-btn" data-post-id="${post.id}"
              onclick="openShareModal('${post.id}','${author.id}','${post.mediaPath}')">
              <img src="./media/icons/share.svg" alt="Share">
            </button>
          </div>
          <div class="video-info">
            <div class="poster-info">
              <a href="profile.html?user=${author.id}" class="poster-name">@${author.id}</a>
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
              <span>${post.audio || `Original Sound - ${author.id}`}</span>
              ${post.trending ? '<span class="trending-badge">trending</span>' : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    
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
    
    const liked = togglePostLike(postId);
    
    // Update UI
    btn.classList.toggle('liked', liked);
    
    const img = btn.querySelector('img');
    img.style.filter = liked 
      ? 'invert(67%) sepia(80%) saturate(400%) hue-rotate(355deg) brightness(1.1)' 
      : '';
    
    const countEl = btn.querySelector('[data-like-count]');
    const data = getData();
    const post = data.posts.find(p => p.id === postId);
    if (post) {
      countEl.textContent = formatCount(post.likes);
    }
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

  