// ═══════════════════════════════════════════════════════════════════
// UNIFIED NAVIGATION - Inject nav menu into all pages
// ═══════════════════════════════════════════════════════════════════

function injectNavigation() {
  const navHTML = `
    <style>
      .global-nav {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
      }

      .nav-toggle {
        background: linear-gradient(135deg, #00ffff, #ff00ff);
        border: none;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        font-size: 28px;
        cursor: pointer;
        box-shadow: 0 5px 20px rgba(0,0,0,0.5);
        transition: all 0.3s;
      }

      .nav-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 0 30px rgba(0,255,255,0.8);
      }

      .nav-menu {
        position: absolute;
        top: 70px;
        right: 0;
        background: rgba(20, 20, 30, 0.98);
        border: 2px solid #00ffff;
        border-radius: 10px;
        padding: 15px;
        min-width: 250px;
        display: none;
        box-shadow: 0 10px 40px rgba(0,0,0,0.8);
      }

      .nav-menu.show {
        display: block;
        animation: slideIn 0.3s ease;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .nav-link {
        display: block;
        padding: 12px 15px;
        color: #fff;
        text-decoration: none;
        border-radius: 5px;
        margin-bottom: 5px;
        transition: all 0.3s;
        font-weight: bold;
      }

      .nav-link:hover {
        background: rgba(0, 255, 255, 0.2);
        padding-left: 25px;
      }

      .nav-link.active {
        background: rgba(0, 255, 255, 0.3);
        border-left: 3px solid #00ffff;
      }

      .nav-section {
        color: #00ffff;
        font-size: 12px;
        font-weight: bold;
        margin: 10px 0 5px 0;
        text-transform: uppercase;
      }
    </style>

    <div class="global-nav">
      <button class="nav-toggle" onclick="toggleNav()">☰</button>
      <div class="nav-menu" id="navMenu">
        <div class="nav-section">🎮 Battle Modes</div>
        <a href="index.html" class="nav-link">⚔️ Standard Battle</a>
        <a href="tournament.html" class="nav-link">🏆 Tournament</a>
        <a href="ai-vs-ai.html" class="nav-link">🤖 AI vs AI</a>
        <a href="survival.html" class="nav-link">💀 Survival Mode</a>

        <div class="nav-section">📊 Stats & Progress</div>
        <a href="leaderboard.html" class="nav-link">🏆 Leaderboard</a>
        <a href="achievements.html" class="nav-link">🏅 Achievements</a>

        <div class="nav-section">✨ Create</div>
        <a href="demo.html" class="nav-link">🎨 Custom Fighter</a>

        <div class="nav-section">ℹ️ Info</div>
        <a href="api-docs.html" class="nav-link">🔌 API Docs</a>
        <a href="status.html" class="nav-link">📊 System Status</a>
        <a href="docs.html" class="nav-link">📚 Documentation</a>
        <a href="about.html" class="nav-link">ℹ️ About</a>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', navHTML);

  // Highlight current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
}

function toggleNav() {
  const menu = document.getElementById('navMenu');
  menu.classList.toggle('show');
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.global-nav')) {
    const menu = document.getElementById('navMenu');
    if (menu) menu.classList.remove('show');
  }
});

// Auto-inject on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectNavigation);
} else {
  injectNavigation();
}
