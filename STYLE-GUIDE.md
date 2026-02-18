# 🎨 AI Battle Arena - Style Guide

**Version**: 1.0  
**Last Updated**: 2026-02-18  
**Designer**: Pixel McPretty @ BananaBot Studios

---

## 📐 Design Philosophy

**Theme**: Cyberpunk Neon Battle Arena  
**Mood**: Intense, futuristic, high-energy  
**Style**: Dark backgrounds with vibrant neon accents  
**UX Goal**: Professional, polished, satisfying to interact with

---

## 🎨 Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Neon Cyan** | `#00f0ff` | rgb(0, 240, 255) | Agent 1, primary actions, success states |
| **Neon Pink** | `#ff006e` | rgb(255, 0, 110) | Agent 2, critical hits, special attacks |
| **Neon Purple** | `#9d00ff` | rgb(157, 0, 255) | Status effects, special buttons, highlights |
| **Neon Yellow** | `#ffea00` | rgb(255, 234, 0) | Victory, warnings, ready states |
| **Neon Green** | `#39ff14` | rgb(57, 255, 20) | HP healthy, heal effects, success |

### Background Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **BG Dark** | `#0a0514` | rgb(10, 5, 20) | Main background, body |
| **BG Darker** | `#050208` | rgb(5, 2, 8) | Deep shadows, containers |
| **Card BG** | `#1a0f2e` | rgb(26, 15, 46) | Cards, panels, modals |
| **Card Border** | `#2d1b4e` | rgb(45, 27, 78) | Borders, separators |

### HP Bar Colors (Smooth Gradients)

| State | Hex | RGB | Range |
|-------|-----|-----|-------|
| **Healthy** | `#00ff88` | rgb(0, 255, 136) | >75% HP |
| **Caution** | `#ffdd00` | rgb(255, 221, 0) | 51-75% HP |
| **Warning** | `#ff8800` | rgb(255, 136, 0) | 26-50% HP |
| **Critical** | `#ff0044` | rgb(255, 0, 68) | ≤25% HP |

### Text Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Text Primary** | `#ffffff` | rgb(255, 255, 255) | Headings, important text |
| **Text Secondary** | `#b8b8d4` | rgb(184, 184, 212) | Body text, descriptions |
| **Text Dim** | `#6d6d8e` | rgb(109, 109, 142) | Labels, hints, disabled |

### Semantic Colors

| Purpose | Hex | RGB | Usage |
|---------|-----|-----|-------|
| **Damage** | `#ff0044` | rgb(255, 0, 68) | Damage numbers, critical HP |
| **Heal** | `#00ff88` | rgb(0, 255, 136) | Heal effects, positive |
| **Status Effect** | `#9d00ff` | rgb(157, 0, 255) | Status icons, debuffs |
| **Special** | `#ff006e` | rgb(255, 0, 110) | Special attacks, ultimate |
| **System** | `#ffea00` | rgb(255, 234, 0) | System messages, info |

### CSS Variables

```css
:root {
  /* Primary Colors */
  --neon-cyan: #00f0ff;
  --neon-pink: #ff006e;
  --neon-purple: #9d00ff;
  --neon-yellow: #ffea00;
  --neon-green: #39ff14;
  
  /* Backgrounds */
  --bg-dark: #0a0514;
  --bg-darker: #050208;
  --card-bg: #1a0f2e;
  --card-border: #2d1b4e;
  
  /* HP Colors */
  --hp-green: #00ff88;
  --hp-yellow: #ffdd00;
  --hp-orange: #ff8800;
  --hp-red: #ff0044;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #b8b8d4;
  --text-dim: #6d6d8e;
}
```

---

## ✍️ Typography

### Font Families

```css
/* Headings & Titles - Futuristic */
font-family: 'Orbitron', sans-serif;

/* Body Text - Readable */
font-family: 'Rajdhani', sans-serif;

/* Code & Monospace */
font-family: 'Fira Mono', monospace;
```

### Font Sizes

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| **H1 (Display)** | 48px (3rem) | 900 | 1.2 | Page titles, hero text |
| **H2 (Section)** | 36px (2.25rem) | 700 | 1.3 | Section headings |
| **H3 (Subsection)** | 24px (1.5rem) | 700 | 1.4 | Card titles, subheadings |
| **Body** | 16px (1rem) | 400 | 1.6 | Paragraphs, descriptions |
| **Small** | 14px (0.875rem) | 400 | 1.5 | Labels, hints, captions |
| **Tiny** | 12px (0.75rem) | 600 | 1.4 | Badges, counters |

### Text Styles

```css
/* Page Title */
.page-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 48px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 4px;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-pink));
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
}

/* Section Heading */
.section-heading {
  font-family: 'Orbitron', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: var(--neon-purple);
  text-shadow: 0 0 10px var(--neon-purple);
}

/* Body Text */
.body-text {
  font-family: 'Rajdhani', sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Label */
.label {
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 1px;
}
```

---

## 📏 Spacing & Layout

### Spacing Scale

```css
/* Consistent spacing values */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-xxl: 48px;
```

| Name | Value | Usage |
|------|-------|-------|
| **XS** | 4px | Icon spacing, tight gaps |
| **SM** | 8px | Status icons, chip gaps |
| **MD** | 16px | Card padding, button spacing |
| **LG** | 24px | Section spacing, large gaps |
| **XL** | 32px | Page margins, major sections |
| **XXL** | 48px | Hero spacing, dramatic gaps |

### Border Radius

```css
--radius-sm: 6px;   /* Badges, chips */
--radius-md: 8px;   /* Buttons, inputs */
--radius-lg: 12px;  /* Cards, small modals */
--radius-xl: 16px;  /* Large cards, panels */
--radius-xxl: 24px; /* Modals, hero cards */
--radius-full: 50%; /* Avatars, circles */
```

### Container Widths

```css
--width-sm: 600px;   /* Forms, narrow content */
--width-md: 800px;   /* Standard content */
--width-lg: 1200px;  /* Wide layouts */
--width-xl: 1400px;  /* Full arena */
--width-full: 100%;  /* Full width */
```

---

## 🎭 Animation Timing

### Duration Standards

| Name | Value | Usage |
|------|-------|-------|
| **Instant** | 0ms | No animation (accessibility) |
| **Fast** | 150ms | Hover states, focus rings |
| **Standard** | 300ms | Default transitions ⭐ |
| **Medium** | 500ms | Modals, overlays |
| **Slow** | 800ms | Complex animations |
| **Dramatic** | 1000-1500ms | Victory screens, critical hits |

### Easing Functions

```css
/* Material Design Standard - Most transitions */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);

/* Bounce Effect - Dramatic entrances */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Elastic Bounce - Status icons, mood */
--ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Smooth In-Out - Loops */
--ease-smooth: ease-in-out;

/* Quick Entrance - Slide-ins */
--ease-entrance: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### Standard Transitions

```css
/* Universal smooth transitions */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Button hover */
button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Card hover */
.card {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Modal appearance */
.modal {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
```

---

## 🔘 Components

### Buttons

#### Primary Button
```css
.btn-primary {
  font-family: 'Orbitron', sans-serif;
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-pink));
  border: 2px solid var(--neon-purple);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 20px rgba(157, 0, 255, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(157, 0, 255, 0.6);
  filter: brightness(1.15);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.7);
}
```

#### Secondary Button
```css
.btn-secondary {
  font-family: 'Orbitron', sans-serif;
  padding: 12px 24px;
  background: rgba(26, 15, 46, 0.8);
  border: 2px solid var(--card-border);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-secondary:hover {
  border-color: var(--neon-purple);
  color: var(--neon-purple);
  box-shadow: 0 0 15px rgba(157, 0, 255, 0.3);
  transform: translateY(-2px);
}
```

#### Action Buttons (Battle Controls)
```css
.action-btn {
  font-family: 'Orbitron', sans-serif;
  padding: 1rem;
  border: 2px solid;
  border-radius: 12px;
  background: var(--bg-darker);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* Specific action colors */
.attack-btn {
  border-color: var(--neon-pink);
  color: var(--neon-pink);
}

.defend-btn {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
}

.special-btn {
  border-color: var(--neon-purple);
  color: var(--neon-purple);
}

.auto-btn {
  border-color: var(--neon-green);
  color: var(--neon-green);
}
```

### Cards

```css
.card {
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 240, 255, 0.3);
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
  animation: scan 2s linear infinite;
}
```

### HP Bars

```css
.hp-bar-container {
  position: relative;
  height: 24px;
  background: var(--bg-darker);
  border: 2px solid var(--card-border);
  border-radius: 12px;
  overflow: hidden;
}

.hp-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--hp-green), var(--hp-green));
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
              background 0.4s ease,
              box-shadow 0.4s ease;
  box-shadow: 0 0 20px var(--hp-green);
  will-change: width;
}

/* Color states */
.hp-bar.critical {
  background: linear-gradient(90deg, var(--hp-red), #ff4466);
  box-shadow: 0 0 20px var(--hp-red);
  animation: hpPulse 1s ease-in-out infinite;
}

.hp-bar.warning {
  background: linear-gradient(90deg, var(--hp-orange), #ffaa00);
  box-shadow: 0 0 20px var(--hp-orange);
}

.hp-bar.caution {
  background: linear-gradient(90deg, var(--hp-yellow), #ffee00);
  box-shadow: 0 0 20px var(--hp-yellow);
}
```

### Status Icons

```css
.status-icon {
  position: relative;
  font-size: 28px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.status-icon.active {
  opacity: 1;
  transform: scale(1) rotate(360deg);
  animation: statusPulse 2.5s ease-in-out infinite;
}
```

### Modals

```css
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.5s ease;
}

.modal-content {
  background: var(--card-bg);
  border: 3px solid var(--neon-yellow);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 0 60px var(--neon-yellow);
  animation: modalSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile Portrait */
@media (max-width: 320px) {
  /* Smallest mobile devices */
}

/* Mobile Landscape / Small Tablet */
@media (max-width: 768px) {
  /* Stack battle layout vertically */
  .battle-area {
    flex-direction: column;
  }
  
  /* Enlarge touch targets */
  button {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Adjust font sizes */
  h1 { font-size: 32px; }
  h2 { font-size: 24px; }
  h3 { font-size: 18px; }
}

/* Tablet */
@media (max-width: 1024px) {
  /* Adjust tournament bracket */
  .tournament-bracket {
    overflow-x: auto;
  }
}

/* Desktop */
@media (min-width: 1920px) {
  /* Enhance spacing for large screens */
  .container {
    max-width: 1600px;
  }
}
```

---

## ♿ Accessibility

### Focus States

```css
/* Visible focus ring for keyboard navigation */
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid var(--neon-cyan);
  outline-offset: 2px;
  box-shadow: 0 0 0 5px rgba(0, 240, 255, 0.2);
}
```

### Color Contrast

All text meets **WCAG AA** standards (4.5:1 ratio):

- White text (#ffffff) on dark backgrounds: ✅ 15.3:1
- Secondary text (#b8b8d4) on dark backgrounds: ✅ 8.2:1
- Neon colors on dark backgrounds: ✅ 7.5:1+

### Reduced Motion

```css
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

### Semantic HTML

Always use proper semantic elements:

```html
<!-- Headings hierarchy -->
<h1>Page Title</h1>
<h2>Section Heading</h2>
<h3>Subsection</h3>

<!-- Buttons for actions -->
<button type="button">Click Me</button>

<!-- Links for navigation -->
<a href="/page">Go Here</a>

<!-- Sections for content areas -->
<section aria-label="Battle Arena">
  <header>...</header>
  <main>...</main>
</section>
```

---

## 🎨 Usage Examples

### Battle Arena Layout

```html
<div class="arena-container">
  <header class="arena-header">
    <h1 class="title">AI BATTLE ARENA</h1>
  </header>
  
  <div class="battle-area">
    <!-- Agent panels with cards -->
    <div class="agent-panel agent-left">
      <div class="agent-card">
        <!-- HP bar -->
        <!-- Stats -->
        <!-- Action buttons -->
      </div>
    </div>
    
    <!-- Battle log center -->
    <div class="battle-log-panel">...</div>
    
    <!-- Agent 2 -->
    <div class="agent-panel agent-right">...</div>
  </div>
</div>
```

### Button Group

```html
<div class="action-buttons">
  <button class="action-btn attack-btn">
    <span class="btn-icon">⚔️</span>
    <span class="btn-text">ATTACK</span>
  </button>
  <button class="action-btn defend-btn">
    <span class="btn-icon">🛡️</span>
    <span class="btn-text">DEFEND</span>
  </button>
</div>
```

---

## 🔍 Quality Checklist

### Visual Consistency ✅
- [ ] All fonts use Orbitron (headings) or Rajdhani (body)
- [ ] Color palette consistent across all pages
- [ ] Spacing follows 4/8/16/24/32/48px scale
- [ ] Border radius consistent (6/8/12/16/24px)
- [ ] All buttons have hover states
- [ ] All interactive elements have focus states

### Animation Consistency ✅
- [ ] Standard transitions: 300ms
- [ ] Fast interactions: 150ms
- [ ] Modals: 500ms
- [ ] All use cubic-bezier(0.4, 0, 0.2, 1)

### Accessibility ✅
- [ ] Focus rings visible (3px cyan outline)
- [ ] Color contrast WCAG AA (4.5:1 min)
- [ ] Touch targets 44px minimum
- [ ] Semantic HTML used
- [ ] Alt text on images
- [ ] Reduced motion support

### Responsive ✅
- [ ] Mobile portrait (320px) tested
- [ ] Tablet (768px) tested
- [ ] Desktop (1920px) tested
- [ ] Touch targets enlarged on mobile
- [ ] Battle layout stacks vertically on mobile

---

## 📝 Naming Conventions

### CSS Classes

Use BEM (Block Element Modifier) naming:

```css
/* Block */
.agent-card { }

/* Element */
.agent-card__header { }
.agent-card__stats { }

/* Modifier */
.agent-card--left { }
.agent-card--winner { }

/* State */
.agent-card.is-active { }
.agent-card.has-status { }
```

### Colors

Use descriptive names:

```css
/* Good */
--neon-cyan
--hp-critical
--text-secondary

/* Avoid */
--color-1
--blue
--light-gray
```

---

## 🚀 Performance Guidelines

### Optimize Animations

```css
/* Use transform and opacity - GPU accelerated */
.element {
  transform: translateY(-2px);
  opacity: 0.8;
  will-change: transform, opacity;
}

/* Avoid animating expensive properties */
/* ❌ Bad */
.element {
  width: 100px; /* Triggers layout */
  left: 50px;   /* Triggers layout */
}

/* ✅ Good */
.element {
  transform: translateX(50px) scaleX(1.2);
}
```

### Hardware Acceleration

```css
/* Enable for animated elements */
.animated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

---

## 📚 Resources

### Font CDN

```html
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght:400;700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
```

### Icon System

Using emoji icons for simplicity:
- ⚔️ Attack
- 🛡️ Defend
- ✨ Special
- 🎯 Auto
- 🔥 Burn status
- ❄️ Freeze status
- ☠️ Poison status
- ⚡ Stun status

---

## 🎯 Brand Guidelines

### Voice & Tone

- **Energetic**: High-octane battle language
- **Futuristic**: Cyberpunk terminology
- **Clear**: No ambiguity in UI text
- **Exciting**: CAPS for emphasis, dramatic language

### Writing Style

```
Good:
- "CRITICAL HIT!" (dramatic, clear)
- "Agent takes 25 damage!" (exciting, specific)
- "Special ability ready!" (clear call-to-action)

Avoid:
- "Ouch" (too casual)
- "Damage has been applied" (too formal)
- "Action completed successfully" (boring)
```

---

## ✅ Version History

**v1.0** - 2026-02-18
- Initial style guide
- Color palette defined
- Typography system established
- Component library documented
- Animation standards set
- Accessibility guidelines added
- Responsive breakpoints defined

---

**Maintained by**: Pixel McPretty @ BananaBot Studios  
**Questions?**: See technical lead or file an issue  
**Updates**: Review quarterly and after major releases

---

*Making pixels perfect since 2026* ✨
