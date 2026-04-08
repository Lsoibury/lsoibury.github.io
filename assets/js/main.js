// ===================================================
//  main.js  —  全站公共交互逻辑
// ===================================================

(function () {
  'use strict';

  /* ----------------------------------------
     1. 主题切换（日 / 夜）
  ---------------------------------------- */
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  // 读取本地存储的主题
  const savedTheme = localStorage.getItem('blog-theme') || 'light';
  html.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('blog-theme', next);
      document.body.classList.add('theme-transitioning');
      setTimeout(() => document.body.classList.remove('theme-transitioning'), 300);
    });
  }

  /* ----------------------------------------
     2. 导航滚动效果
  ---------------------------------------- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');
  }, { passive: true });

  /* ----------------------------------------
     3. 汉堡菜单
  ---------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu?.classList.toggle('open');
  });

  /* ----------------------------------------
     4. 搜索
  ---------------------------------------- */
  const searchBtn = document.getElementById('searchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  searchBtn?.addEventListener('click', () => {
    searchOverlay?.classList.add('open');
    setTimeout(() => searchInput?.focus(), 100);
  });
  searchClose?.addEventListener('click', closeSearch);
  searchOverlay?.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearch();
  });

  function closeSearch() {
    searchOverlay?.classList.remove('open');
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
  }

  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q || q.length < 1) { searchResults.innerHTML = ''; return; }
    const hits = (typeof POSTS !== 'undefined' ? POSTS : []).filter(p =>
      p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q)
    );
    if (!hits.length) {
      searchResults.innerHTML = '<div class="search-no-result">没有找到相关文章</div>';
      return;
    }
    searchResults.innerHTML = hits.map(p => `
      <div class="search-result-item" onclick="location.href='post.html?id=${p.id}'">
        <span class="search-result-title">${highlight(p.title, q)}</span>
        <span class="search-result-summary">${highlight(p.summary.slice(0, 80), q)}</span>
      </div>
    `).join('');
  });

  function highlight(text, q) {
    return text.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>');
  }

  // ESC 关闭搜索
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeSearch(); closeBgPanel(); }
  });

  /* ----------------------------------------
     5. 背景设置
  ---------------------------------------- */
  const bgBtn = document.getElementById('bgBtn');
  const bgPanel = document.getElementById('bgPanel');
  const bgLayer = document.getElementById('bgLayer');
  const accentColor = document.getElementById('accentColor');

  // 读取已保存背景和强调色
  const savedBg = localStorage.getItem('blog-bg') || 'default';
  const savedAccent = localStorage.getItem('blog-accent') || '#e85d4a';
  applyBg(savedBg);
  applyAccent(savedAccent);
  if (accentColor) accentColor.value = savedAccent;

  bgBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    bgPanel?.classList.toggle('open');
  });

  function closeBgPanel() { bgPanel?.classList.remove('open'); }
  document.addEventListener('click', (e) => {
    if (bgPanel && !bgPanel.contains(e.target) && e.target !== bgBtn) {
      closeBgPanel();
    }
  });

  document.querySelectorAll('.bg-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const bg = btn.dataset.bg;
      applyBg(bg);
      localStorage.setItem('blog-bg', bg);
      document.querySelectorAll('.bg-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    if (btn.dataset.bg === savedBg) btn.classList.add('active');
  });

  accentColor?.addEventListener('input', () => {
    applyAccent(accentColor.value);
    localStorage.setItem('blog-accent', accentColor.value);
  });

  function applyBg(type) {
    if (!bgLayer) return;
    bgLayer.className = 'bg-layer';
    document.body.className = document.body.className.replace(/\bbg-\w+\b/g, '').trim();
    if (type === 'aurora') bgLayer.classList.add('aurora');
    else if (type === 'dots') document.body.classList.add('bg-dots');
    else if (type === 'waves') createWavesBg();
    else if (type === 'geo') document.body.classList.add('bg-geo');
  }

  function applyAccent(color) {
    document.documentElement.style.setProperty('--accent', color);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent-light', `rgba(${r},${g},${b},0.4)`);
  }

  function createWavesBg() {
    if (bgLayer) {
      bgLayer.innerHTML = `
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style="position:absolute;bottom:0;left:0;width:200%;height:auto;opacity:0.10;fill:var(--accent)">
          <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,186.7C960,213,1056,235,1152,224C1248,213,1344,171,1392,149.3L1440,128L1440,320L0,320Z"/>
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style="position:absolute;bottom:0;left:0;width:200%;height:auto;opacity:0.06;fill:var(--accent);animation:wave-move 20s linear infinite reverse">
          <path d="M0,192L60,181.3C120,171,240,149,360,154.7C480,160,600,192,720,197.3C840,203,960,181,1080,154.7C1200,128,1320,96,1380,80L1440,64L1440,320L0,320Z"/>
        </svg>
      `;
    }
  }

  /* ----------------------------------------
     6. 点击粒子特效
  ---------------------------------------- */
  const canvas = document.getElementById('click-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const particles = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    document.addEventListener('click', (e) => {
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e85d4a';
      for (let i = 0; i < 10; i++) {
        particles.push({
          x: e.clientX, y: e.clientY,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 - 2,
          r: Math.random() * 5 + 2,
          life: 1,
          color: randomColor(accent),
        });
      }
    });

    function randomColor(base) {
      const hues = [base, '#ffd700', '#ff9966', '#88d8ff'];
      return hues[Math.floor(Math.random() * hues.length)];
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.15; // 重力
        p.life -= 0.025;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* ----------------------------------------
     7. Ripple 按钮效果
  ---------------------------------------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.ripple-btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top:  ${e.clientY - rect.top  - size / 2}px;
    `;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });

  /* ----------------------------------------
     8. 卡片悬停光效
  ---------------------------------------- */
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.post-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });

  /* ----------------------------------------
     9. 回顶部
  ---------------------------------------- */
  const backTop = document.getElementById('backTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) backTop?.classList.add('visible');
    else backTop?.classList.remove('visible');
  }, { passive: true });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ----------------------------------------
     10. 入场动画（Intersection Observer）
  ---------------------------------------- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  /* ----------------------------------------
     11. 首页文章渲染
  ---------------------------------------- */
  if (document.getElementById('postsGrid')) {
    renderPosts('all');

    // 标签筛选
    document.querySelectorAll('.tag-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderPosts(btn.dataset.tag);
      });
    });

    // 加载更多
    let shown = 6;
    document.getElementById('loadMore')?.addEventListener('click', () => {
      shown += 3;
      const tag = document.querySelector('.tag-btn.active')?.dataset.tag || 'all';
      renderPosts(tag, shown);
    });
  }

  function renderPosts(tag, limit) {
    const grid = document.getElementById('postsGrid');
    if (!grid) return;
    const filtered = tag === 'all' ? POSTS : POSTS.filter(p => p.tag === tag);
    const toShow = filtered.slice(0, limit || 6);
    grid.innerHTML = toShow.map((p, i) => `
      <article class="post-card fade-up" onclick="location.href='post.html?id=${p.id}'"
               data-id="${p.id}" style="animation-delay:${i * 0.07}s">
        <div class="card-thumb">
          <div class="card-thumb-emoji">${p.emoji || '📝'}</div>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span class="card-tag">${p.tag}</span>
            <span class="card-date">${p.date}</span>
          </div>
          <h2 class="card-title">${p.title}</h2>
          <p class="card-summary">${p.summary}</p>
          <div class="card-footer">
            <span class="card-read">${p.readMin} min read</span>
            <span class="card-arrow">→</span>
          </div>
        </div>
      </article>
    `).join('');

    // 重新观察入场动画
    grid.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // 显隐"加载更多"
    const loadMoreBtn = document.getElementById('loadMore');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = (toShow.length < filtered.length) ? 'inline-block' : 'none';
    }

    // 预览 tooltip
    addCardPreview();
  }

  /* ----------------------------------------
     12. 卡片预览 Tooltip
  ---------------------------------------- */
  function addCardPreview() {
    let tooltip = document.getElementById('cardTooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'cardTooltip';
      tooltip.className = 'card-preview-tooltip';
      document.body.appendChild(tooltip);
    }

    let currentCard = null;
    let showTimer = null;

    document.addEventListener('mouseover', (e) => {
      const card = e.target.closest('.post-card');
      if (!card || card === currentCard) return;
      currentCard = card;
      clearTimeout(showTimer);
      showTimer = setTimeout(() => {
        const id = parseInt(card.dataset.id);
        const post = POSTS.find(p => p.id === id);
        if (!post) return;
        tooltip.innerHTML = `
          <div class="preview-title">${post.title}</div>
          <div class="preview-text">${post.summary}</div>
        `;
        positionTooltip(e);
        tooltip.classList.add('visible');
      }, 500);
    });

    document.addEventListener('mousemove', (e) => {
      if (tooltip.classList.contains('visible')) positionTooltip(e);
    });

    document.addEventListener('mouseout', (e) => {
      const card = e.target.closest('.post-card');
      if (card) {
        clearTimeout(showTimer);
        currentCard = null;
        tooltip.classList.remove('visible');
      }
    });

    function positionTooltip(e) {
      const gap = 16;
      const tw = 300, th = 100;
      let x = e.clientX + gap;
      let y = e.clientY + gap;
      if (x + tw > window.innerWidth) x = e.clientX - tw - gap;
      if (y + th > window.innerHeight) y = e.clientY - th - gap;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    }
  }

  /* ----------------------------------------
     13. Toast 提示
  ---------------------------------------- */
  window.showToast = function (msg, duration = 2500) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  };

})();
