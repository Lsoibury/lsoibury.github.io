// ===================================================
//  post.js  —  文章页交互逻辑
// ===================================================

(function () {
  'use strict';

  /* ----------------------------------------
     1. 加载文章内容
  ---------------------------------------- */
  const params = new URLSearchParams(location.search);
  const postId = parseInt(params.get('id')) || 1;
  const post = POSTS.find(p => p.id === postId) || POSTS[0];

  // 更新标题
  document.title = post.title + ' · 我的博客';

  // 填充元信息
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('postCat', post.tag);
  setEl('postDate', post.date);
  setEl('readTime', post.readMin + ' min read');
  setEl('postTitle', post.title);
  setEl('postSummary', post.summary);

  // 注入正文
  const bodyEl = document.getElementById('postBody');
  if (bodyEl && post.content) bodyEl.innerHTML = post.content;

  /* ----------------------------------------
     2. 生成目录
  ---------------------------------------- */
  const tocNav = document.getElementById('tocNav');
  if (tocNav && bodyEl) {
    const headings = bodyEl.querySelectorAll('h2, h3');
    headings.forEach((h, i) => {
      const id = 'heading-' + i;
      h.id = id;
      const link = document.createElement('a');
      link.className = 'toc-item ' + (h.tagName === 'H3' ? 'h3' : '');
      link.href = '#' + id;
      link.textContent = h.textContent;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      tocNav.appendChild(link);
    });

    // 目录高亮（IntersectionObserver）
    const tocObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = tocNav.querySelector(`[href="#${id}"]`);
        if (entry.isIntersecting) {
          tocNav.querySelectorAll('.toc-item').forEach(l => l.classList.remove('active'));
          link?.classList.add('active');
        }
      });
    }, { rootMargin: '-80px 0px -60% 0px' });

    headings.forEach(h => tocObserver.observe(h));
  }

  /* ----------------------------------------
     3. 阅读进度条
  ---------------------------------------- */
  const progressBar = document.getElementById('readProgress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
  }

  /* ----------------------------------------
     4. 点赞按钮
  ---------------------------------------- */
  const likeBtn = document.getElementById('likeBtn');
  const likeCount = document.getElementById('likeCount');
  const likeKey = 'blog-like-' + postId;

  let liked = localStorage.getItem(likeKey) === '1';
  let count = parseInt(localStorage.getItem(likeKey + '-count')) || (post.id * 7 + 17); // 初始假数据

  if (likeBtn) {
    updateLikeUI();
    likeBtn.addEventListener('click', () => {
      liked = !liked;
      count += liked ? 1 : -1;
      localStorage.setItem(likeKey, liked ? '1' : '0');
      localStorage.setItem(likeKey + '-count', count);
      updateLikeUI();
      if (liked) {
        likeBtn.style.transform = 'scale(1.3)';
        setTimeout(() => likeBtn.style.transform = '', 200);
        showToast('感谢喜欢！❤️');
      }
    });
  }

  function updateLikeUI() {
    if (likeBtn) likeBtn.classList.toggle('liked', liked);
    if (likeCount) likeCount.textContent = count;
  }

  /* ----------------------------------------
     5. 上一篇 / 下一篇导航
  ---------------------------------------- */
  const postNavEl = document.getElementById('postNav');
  if (postNavEl) {
    const idx = POSTS.findIndex(p => p.id === postId);
    const prev = idx > 0 ? POSTS[idx - 1] : null;
    const next = idx < POSTS.length - 1 ? POSTS[idx + 1] : null;

    postNavEl.innerHTML = `
      <div>
        ${prev ? `
          <a href="post.html?id=${prev.id}" class="post-nav-item">
            <span class="post-nav-dir">← 上一篇</span>
            <span class="post-nav-title">${prev.title}</span>
          </a>` : '<div></div>'}
      </div>
      <div style="text-align:right">
        ${next ? `
          <a href="post.html?id=${next.id}" class="post-nav-item" style="text-align:right">
            <span class="post-nav-dir">下一篇 →</span>
            <span class="post-nav-title">${next.title}</span>
          </a>` : '<div></div>'}
      </div>
    `;
  }

  /* ----------------------------------------
     6. 评论系统（本地存储）
  ---------------------------------------- */
  const commentKey = 'blog-comments-' + postId;
  const commentsList = document.getElementById('commentsList');
  const commentCount = document.getElementById('commentCount');
  const cName = document.getElementById('cName');
  const cEmail = document.getElementById('cEmail');
  const cContent = document.getElementById('cContent');
  const charCount = document.getElementById('charCount');
  const submitComment = document.getElementById('submitComment');

  // 字数统计
  cContent?.addEventListener('input', () => {
    if (charCount) charCount.textContent = cContent.value.length + ' / 500';
  });

  // 加载已有评论
  function loadComments() {
    const comments = JSON.parse(localStorage.getItem(commentKey) || '[]');
    if (commentCount) commentCount.textContent = comments.length;
    if (commentsList) {
      if (!comments.length) {
        commentsList.innerHTML = '<div class="no-comments">还没有评论，来发表第一条吧！</div>';
        return;
      }
      commentsList.innerHTML = comments.map(c => `
        <div class="comment-item">
          <div class="comment-avatar">${c.name.charAt(0).toUpperCase()}</div>
          <div class="comment-main">
            <div class="comment-header">
              <span class="comment-name">${escHtml(c.name)}</span>
              <span class="comment-time">${formatTime(c.time)}</span>
            </div>
            <div class="comment-text">${escHtml(c.content)}</div>
            <div class="comment-actions">
              <button class="comment-like-btn" onclick="this.textContent='❤ ' + (parseInt(this.textContent) || 0 + 1)">
                ♡ ${c.likes || 0}
              </button>
              <button class="comment-reply-btn">回复</button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  // 提交评论
  submitComment?.addEventListener('click', () => {
    const name = cName?.value.trim();
    const content = cContent?.value.trim();
    if (!name) { showToast('请输入昵称'); cName?.focus(); return; }
    if (!content) { showToast('评论内容不能为空'); cContent?.focus(); return; }

    const comments = JSON.parse(localStorage.getItem(commentKey) || '[]');
    comments.push({
      name, content,
      time: Date.now(),
      likes: 0,
    });
    localStorage.setItem(commentKey, JSON.stringify(comments));

    if (cName) cName.value = '';
    if (cEmail) cEmail.value = '';
    if (cContent) cContent.value = '';
    if (charCount) charCount.textContent = '0 / 500';

    loadComments();
    showToast('评论已发布！');

    // 滚动到评论列表
    document.querySelector('.comments-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // 工具函数
  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function formatTime(ts) {
    const d = new Date(ts);
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0') + ' ' +
      String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0');
  }

  loadComments();

  /* ----------------------------------------
     7. 入场动画
  ---------------------------------------- */
  setTimeout(() => {
    document.querySelectorAll('.fade-up').forEach((el, i) => {
      el.style.transitionDelay = (i * 0.08) + 's';
      el.classList.add('visible');
    });
  }, 50);

})();
