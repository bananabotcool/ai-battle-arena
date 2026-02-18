# 🎨 AI Battle Arena - Style Guide

## Overview
This document defines the visual language and design system for AI Battle Arena. All UI elements should follow these guidelines to maintain consistency and professional polish.

---

## 🎨 Color Palette

### Primary Colors (Cyberpunk/Neon Theme)

#### Core Neon Colors
```css
--neon-cyan: #00f0ff      /* Primary accent, UI highlights */
--neon-pink: #ff006e      /* Secondary accent, warnings */
--neon-purple: #9d00ff    /* Tertiary accent, special effects */
--neon-yellow: #ffea00    /* Success states, critical hits */
--neon-green: #00ff88     /* Health, positive actions */
```

#### Background & Surface Colors
```css
--bg-primary: #0a0514     /* Main background (dark purple) */
--bg-secondary: #1a0f2e   /* Card backgrounds */
--card-bg: rgba(26, 15, 46, 0.6)   /* Semi-transparent cards */
--card-border: #2d1b4e    /* Card borders */
```

#### Status Colors
```css
--hp-critical: #ff0044    /* HP < 25% */
--hp-warning: #ff8800     /* HP 25-50% */
--hp-caution: #ffdd00     /* HP 50-75% */
--hp-healthy: #00ff88     /* HP > 75% */
```

#### Text Colors
```css
--text-primary: #ffffff   /* Primary text */
--text-secondary: #b8b8d4 /* Secondary text */
--text-muted: #888888     /* Disabled/muted text */
```

#### Action Colors
```css
--damage-normal: #ff6b6b  /* Regular damage */
--damage-crit: #ffd93d    /* Critical hit damage */
--heal: #4ade80           /* Healing effects */
--status-effect: #a0a0a0  /* Status damage */
```

---

## 📝 Typography

### Font Families
```css
/* Primary (Headers, UI) */
font-family: 'Orbitron', sans-serif;
/* Weights: 400 (regular), 700 (bold), 900 (black) */

/* Secondary (Body, Stats) */
font-family: 'Rajdhani', sans-serif;
/* Weights: 400 (regular), 600 (semibold), 700 (bold) */

/* Monospace (Code, Technical) */
font-family: 'Courier New', monospace;
```

### Font Scale
```css
/* Headers */
h1: 3rem (48px)           /* Page titles */
h2: 1.8rem (28.8px)       /* Section headers */
h3: 1.4rem (22.4px)       /* Subsection headers */

/* Body */
body: 16px (base)         /* Standard text */
small: 0.9rem (14.4px)    /* Helper text */
tiny: 0.75rem (12px)      /* Captions, labels */

/* Special */
damage-number: 2rem (32px)        /* Normal damage */
damage-crit: 2.5rem (40px)        /* Critical damage */
critical-text: 4rem (64px)        /* "CRITICAL!" overlay */
```

### Text Styles
```css
/* Headers */
.title {
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* Body Text */
.body-text {
  font-family: 'Rajdhani', sans-serif;
  font-weight: 400;
  line-height: 1.6;
}

/* Stats */
.stat-value {
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
}

/* Labels */
.label {
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}
```

---

## 🔘 Button Styles

### Action Buttons (Primary UI Controls)
```css
.action-btn {
  /* Base */
  padding: 12px 24px;
  border-radius: 8px;
  border: 2px solid;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  
  /* Animation */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Button states */
.action-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.15);
}

.action-btn:active {
  transform: translateY(0);
  transition-duration: 0.1s;
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  filter: grayscale(0.8);
}
```

### Button Variants
```css
/* Attack Button */
.attack-btn {
  background: linear-gradient(135deg, #ff0044, #ff4466);
  border-color: #ff0044;
  color: #fff;
  box-shadow: 0 0 20px rgba(255, 0, 68, 0.4);
}

/* Defend Button */
.defend-btn {
  background: linear-gradient(135deg, #0088ff, #00aaff);
  border-color: #0088ff;
  color: #fff;
  box-shadow: 0 0 20px rgba(0, 136, 255, 0.4);
}

/* Special Button */
.special-btn {
  background: linear-gradient(135deg, #9d00ff, #cc00ff);
  border-color: #9d00ff;
  color: #fff;
  box-shadow: 0 0 20px rgba(157, 0, 255, 0.4);
}

/* Auto Button */
.auto-btn {
  background: linear-gradient(135deg, #00ff88, #00dd66);
  border-color: #00ff88;
  color: #000;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
}

/* Primary Button (CTAs) */
.btn-primary {
  background: linear-gradient(135deg, #00f0ff, #0088ff);
  border-color: #00f0ff;
  color: #000;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
}

/* Secondary Button */
.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid #888;
  color: #fff;
  box-shadow: none;
}

/* Ghost Button (Links) */
.btn-ghost {
  background: transparent;
  border: 2px solid #555;
  color: #aaa;
  box-shadow: none;
}
```

---

## 📏 Spacing Standards

### Layout Spacing
```css
/* Container padding */
--spacing-xs: 8px
--spacing-sm: 12px
--spacing-md: 20px
--spacing-lg: 30px
--spacing-xl: 40px

/* Component gaps */
--gap-sm: 10px
--gap-md: 15px
--gap-lg: 20px
```

### Grid Systems
```css
/* Card grids */
.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

/* Stats grids */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}
```

### Component Spacing
```css
/* Card padding */
.card {
  padding: 20px;
  margin-bottom: 20px;
}

/* Section spacing */
.section {
  margin-bottom: 40px;
}

/* Element gaps */
.element-group {
  gap: 15px;
}
```

---

## ✨ Animation Guidelines

### Standard Timing Functions
```css
/* Default (most UI) */
cubic-bezier(0.4, 0, 0.2, 1)    /* Material Design standard */

/* Bouncy (special effects) */
cubic-bezier(0.68, -0.55, 0.265, 1.55)   /* Back easing */

/* Smooth ease-out */
cubic-bezier(0.25, 0.46, 0.45, 0.94)     /* Smooth deceleration */
```

### Animation Durations
```css
--duration-instant: 0.1s     /* Button presses */
--duration-fast: 0.3s        /* Hovers, simple transitions */
--duration-normal: 0.4s      /* Card animations, fades */
--duration-slow: 0.6s        /* HP bars, important effects */
--duration-dramatic: 1.2s    /* Critical hits, victories */
```

### Common Animations

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Duration: 0.3s */
```

#### Slide In
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Duration: 0.4s */
```

#### Pulse (Status Effects)
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
/* Duration: 2s infinite */
```

#### Screen Shake
```css
@keyframes screenShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}
/* Duration: 0.3s */
```

### Animation Best Practices
1. **Always use `will-change`** for animated properties
2. **Use `transform` instead of `position`** for better performance
3. **Add `transform: translateZ(0)`** to force GPU acceleration
4. **Maximum animation duration: 2s** (except infinite loops)
5. **Respect `prefers-reduced-motion`** for accessibility

---

## 🎴 Card Styles

### Standard Card
```css
.card {
  background: rgba(26, 15, 46, 0.9);
  border: 2px solid #2d1b4e;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 240, 255, 0.3);
}
```

### Agent Card
```css
.agent-card {
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}
```

### Fighter Card (Tournament)
```css
.fighter-card {
  background: rgba(20, 20, 30, 0.9);
  border: 2px solid #00ffff;
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s ease;
}

.fighter-card.winner {
  border-color: #ffea00;
  box-shadow: 0 0 30px rgba(255, 234, 0, 0.8);
}
```

---

## 📊 HP Bar Standards

### HP Bar Structure
```html
<div class="hp-section">
  <div class="hp-label">
    <span>HP</span>
    <span class="hp-value">100 / 100</span>
  </div>
  <div class="hp-bar-container">
    <div class="hp-bar healthy" style="width: 100%"></div>
    <div class="hp-bar-shine"></div>
  </div>
</div>
```

### HP Bar States
```css
/* Healthy (>75%) */
.hp-bar.healthy {
  background: linear-gradient(90deg, #00ff88, #00dd66);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
}

/* Caution (50-75%) */
.hp-bar.caution {
  background: linear-gradient(90deg, #ffdd00, #ffee00);
  box-shadow: 0 0 20px rgba(255, 221, 0, 0.6);
}

/* Warning (25-50%) */
.hp-bar.warning {
  background: linear-gradient(90deg, #ff8800, #ffaa00);
  box-shadow: 0 0 20px rgba(255, 136, 0, 0.6);
}

/* Critical (<25%) */
.hp-bar.critical {
  background: linear-gradient(90deg, #ff0044, #ff4466);
  box-shadow: 0 0 20px rgba(255, 0, 68, 0.8);
  animation: hpPulse 1s ease-in-out infinite;
}
```

---

## 🔥 Status Effects

### Status Icon Structure
```html
<div class="status-icon status-burn active" data-effect="burn">
  🔥
  <span class="stack-badge">x2</span>
</div>
```

### Status Effect Colors
```css
.status-burn {
  background: radial-gradient(circle, rgba(255, 100, 0, 0.3), rgba(255, 0, 0, 0.2));
  box-shadow: 0 0 15px rgba(255, 100, 0, 0.6);
}

.status-freeze {
  background: radial-gradient(circle, rgba(0, 200, 255, 0.3), rgba(100, 200, 255, 0.2));
  box-shadow: 0 0 15px rgba(0, 200, 255, 0.6);
}

.status-poison {
  background: radial-gradient(circle, rgba(150, 0, 255, 0.3), rgba(100, 0, 200, 0.2));
  box-shadow: 0 0 15px rgba(150, 0, 255, 0.6);
}

.status-stun {
  background: radial-gradient(circle, rgba(255, 255, 0, 0.3), rgba(255, 200, 0, 0.2));
  box-shadow: 0 0 15px rgba(255, 255, 0, 0.6);
}
```

---

## 📱 Responsive Breakpoints

### Device Sizes
```css
/* Extra Large Desktops */
@media (min-width: 1920px) { /* Ultra-wide monitors */ }

/* Large Desktops */
@media (min-width: 1440px) { /* Standard desktop */ }

/* Tablets & Small Laptops */
@media (max-width: 1024px) {
  /* Reduce font sizes 10-15% */
  /* Stack multi-column layouts */
}

/* Mobile Tablets */
@media (max-width: 768px) {
  /* Single column layouts */
  /* Larger touch targets (44px minimum) */
  /* Stack fighter cards vertically */
}

/* Small Phones */
@media (max-width: 375px) {
  /* Further font size reduction */
  /* Compact UI elements */
}

/* Landscape Mode */
@media (max-width: 896px) and (orientation: landscape) {
  /* Horizontal fighter layout */
  /* Reduced vertical spacing */
}
```

### Touch Targets
```css
/* Minimum touch target size */
button, .action-btn, .nav-link {
  min-height: 44px;
  min-width: 44px;
}
```

---

## 🎭 Modal Standards

### Modal Overlay
```css
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
}
```

### Modal Content
```css
.modal-content {
  background: rgba(10, 5, 20, 0.95);
  border: 3px solid #9d00ff;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 0 50px rgba(157, 0, 255, 0.6);
  max-width: 600px;
  margin: 50px auto;
}
```

---

## 🚀 Battle Log Standards

### Log Entry Structure
```html
<div class="log-entry damage">
  <span class="log-icon">⚔️</span>
  <span class="log-text">Attack dealt 25 damage!</span>
</div>
```

### Log Entry Types
```css
.log-entry.damage {
  border-left-color: #ff0044;
  background: linear-gradient(90deg, rgba(255, 0, 68, 0.12) 0%, transparent 100%);
}

.log-entry.heal {
  border-left-color: #00ff88;
  background: linear-gradient(90deg, rgba(0, 255, 136, 0.12) 0%, transparent 100%);
}

.log-entry.special {
  border-left-color: #ff006e;
  background: linear-gradient(90deg, rgba(255, 0, 110, 0.12) 0%, transparent 100%);
}

.log-entry.critical {
  border-left-color: #ffea00;
  background: linear-gradient(90deg, rgba(255, 234, 0, 0.15) 0%, transparent 100%);
}
```

---

## 🎯 Accessibility

### Focus States
```css
/* All interactive elements must have visible focus */
button:focus,
a:focus,
input:focus {
  outline: 2px solid #00f0ff;
  outline-offset: 2px;
}
```

### Reduced Motion
```css
/* Respect user preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast
- **Text on dark backgrounds:** Minimum 4.5:1 contrast ratio
- **Large text (>24px):** Minimum 3:1 contrast ratio
- **Interactive elements:** Must be distinguishable when colorblind

---

## 📦 Component Checklist

When creating new components, ensure:
- [ ] Follows color palette (no arbitrary colors)
- [ ] Uses standard typography scale
- [ ] Includes hover/active/disabled states
- [ ] Has smooth transitions (0.3s standard)
- [ ] Responsive on mobile (<768px)
- [ ] Accessible focus states
- [ ] Respects reduced motion preference
- [ ] Tested with keyboard navigation
- [ ] Touch targets ≥44px on mobile
- [ ] Consistent with existing components

---

## 🔗 Required Files on Every Page

### CSS Files (in order)
```html
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="animations-polish.css"> <!-- Optional -->
<link rel="stylesheet" href="mobile.css"> <!-- REQUIRED -->
```

### JavaScript Files
```html
<script src="navigation.js"></script> <!-- REQUIRED for nav menu -->
```

### Header Structure
```html
<header class="arena-header">
  <h1 class="title">
    <span class="title-icon">⚔️</span>
    PAGE TITLE
    <span class="title-icon">⚔️</span>
  </h1>
</header>
```

---

## 📝 Code Examples

### Creating a New Card
```html
<div class="stat-card">
  <h3>Stat Label</h3>
  <div class="stat-value">42</div>
</div>
```

### Creating an Action Button
```html
<button class="action-btn attack-btn">
  <span class="btn-icon">⚔️</span>
  <span class="btn-text">ATTACK</span>
</button>
```

### Adding Status Effect
```html
<div class="status-icons-container">
  <div class="status-icon status-burn active" data-effect="burn">
    🔥
    <span class="stack-badge">x1</span>
  </div>
</div>
```

---

## 🎨 Design Principles

1. **Cyberpunk Aesthetic:** Neon colors, dark backgrounds, glowing effects
2. **Performance First:** Use CSS transforms, avoid layout thrashing
3. **Smooth Transitions:** Everything should feel fluid (300ms standard)
4. **Clear Hierarchy:** Important elements stand out through size and color
5. **Responsive by Default:** Mobile-first design approach
6. **Accessibility Matters:** Keyboard nav, focus states, reduced motion
7. **Consistency:** Reuse existing patterns before creating new ones

---

## 🔄 Version History

- **v1.0** (2026-02-18): Initial style guide created
  - Documented color palette
  - Typography system
  - Button standards
  - Animation guidelines
  - Component patterns

---

**Questions or suggestions?** Update this guide when adding new patterns or discovering inconsistencies. This is a living document!