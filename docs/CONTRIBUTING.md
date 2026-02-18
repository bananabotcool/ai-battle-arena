# 🤝 Contributing to AI Battle Arena

Thank you for your interest in contributing! This guide will help you get started.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, experience level, nationality, personal appearance, race, religion, or sexual identity.

### Our Standards

**✅ Examples of positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**❌ Unacceptable behavior:**
- Trolling, insulting/derogatory comments, personal or political attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## 🚀 Getting Started

### Ways to Contribute

1. **🐛 Report Bugs** - Found a bug? [Open an issue](https://github.com/bananabotcool/ai-battle-arena/issues/new)
2. **💡 Suggest Features** - Have an idea? [Start a discussion](https://github.com/bananabotcool/ai-battle-arena/discussions)
3. **📝 Improve Docs** - Fix typos, clarify instructions
4. **🎨 Design** - UI/UX improvements, new animations
5. **⚔️ Add Content** - New fighters, abilities, status effects
6. **🔧 Code** - Bug fixes, features, optimizations

### Good First Issues

Look for issues labeled:
- `good first issue` - Perfect for newcomers
- `help wanted` - We need your expertise
- `documentation` - Low-risk, high-impact

---

## 💻 Development Setup

### Prerequisites

- **Node.js** >= 18.0.0
- **Git** >= 2.0
- **Code Editor** (VS Code recommended)

### Fork & Clone

```bash
# Fork the repository on GitHub
# Then clone your fork:
git clone https://github.com/YOUR_USERNAME/ai-battle-arena.git
cd ai-battle-arena

# Add upstream remote
git remote add upstream https://github.com/bananabotcool/ai-battle-arena.git
```

### Install Dependencies

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env and add your OPENCLAW_GATEWAY_TOKEN
```

### Run Development Server

```bash
npm start
# Open http://localhost:3000
```

### Verify Setup

```bash
# Run tests
npm test

# Check code style
npm run lint

# Build for production
npm run build
```

---

## 📁 Project Structure

```
ai-battle-arena/
├── public/              # Frontend (vanilla JS)
│   ├── index.html      # Main arena
│   ├── tournament.html # Tournament mode
│   ├── agents.js       # Agent system
│   ├── arena.js        # Battle controller
│   ├── animator.js     # Visual effects
│   ├── creator.js      # Fighter creator
│   └── styles.css      # All styles
├── server/              # Backend (Node/Express)
│   ├── server.js       # Express server
│   ├── battle-engine.js # Combat logic
│   └── god-narrator.js  # AI narrator
├── data/                # JSON storage
├── tests/               # Test suite
└── docs/                # Documentation
```

---

## 🎨 Coding Standards

### JavaScript Style

**We use:**
- ES6+ features (arrow functions, destructuring, template literals)
- No semicolons (consistent omission)
- 2-space indentation
- Single quotes for strings
- Trailing commas in objects/arrays

**Example:**
```javascript
const calculateDamage = (attacker, defender, isSpecial) => {
  const baseDamage = attacker.atk
  const multiplier = isSpecial ? 2.0 : (Math.random() * 0.4 + 0.8)
  const defense = defender.defending ? defender.def * 0.5 : defender.def * 0.2
  return Math.max(5, Math.floor(baseDamage * multiplier - defense))
}
```

### CSS Style

**Guidelines:**
- Use CSS variables (defined in `:root`)
- Group related properties
- Use `rem` for spacing, `px` for borders
- BEM-like naming (`.block__element--modifier`)

**Example:**
```css
.battle-card {
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 300ms ease;
}

.battle-card:hover {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 20px var(--neon-cyan);
}
```

### HTML Style

**Guidelines:**
- Semantic HTML5 elements
- Accessible (ARIA labels, alt text)
- Kebab-case for classes
- Data attributes for JS hooks

**Example:**
```html
<button 
  class="action-btn attack-btn" 
  data-action="attack" 
  data-agent="1"
  aria-label="Attack opponent">
  ⚔️ Attack
</button>
```

---

## 💬 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style (formatting, no logic change)
- `refactor` - Code refactor
- `perf` - Performance improvement
- `test` - Add/update tests
- `chore` - Build/tooling changes

### Examples

```bash
feat(creator): add randomize button for quick fighter generation

fix(arena): HP bar color transition now smooth at all percentages

docs(api): document new tournament endpoints

style(tournament): improve bracket spacing on mobile

refactor(battle): extract damage calculation to separate function

perf(agents): cache agent emoji lookups

test(arena): add unit tests for damage calculation

chore(deps): update express to 4.18.2
```

### Commit Best Practices

- ✅ Write in present tense ("add feature" not "added feature")
- ✅ Use imperative mood ("move cursor" not "moves cursor")
- ✅ Keep first line under 72 characters
- ✅ Reference issues/PRs when relevant (`fixes #123`)
- ❌ Don't use vague messages ("fix stuff", "update code")

---

## 🔀 Pull Request Process

### Before Creating a PR

1. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** (follow coding standards)

3. **Test thoroughly**
   ```bash
   npm test
   npm run lint
   ```

4. **Commit** (follow commit guidelines)

5. **Update docs** (if needed)

6. **Rebase on main** (if main has moved)
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### Creating the PR

1. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

2. **Open PR** on GitHub

3. **Fill out PR template:**
   ```markdown
   ## Description
   Brief summary of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tested locally
   - [ ] Added unit tests
   - [ ] Tested on mobile

   ## Screenshots
   (if UI changes)

   ## Related Issues
   Closes #123
   ```

4. **Request review** from maintainers

### Review Process

- **Maintainers will review** within 48 hours
- **Address feedback** by pushing new commits
- **Squash commits** before merge (if requested)
- **Celebrate!** 🎉 Your contribution is live

### PR Checklist

Before submitting, ensure:

- [ ] Code follows style guidelines
- [ ] All tests pass (`npm test`)
- [ ] No console errors or warnings
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow guidelines
- [ ] Branch is up to date with main
- [ ] PR description is clear and complete

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- battle.test.js

# Run with coverage
npm test -- --coverage

# Watch mode (re-run on changes)
npm test -- --watch
```

### Writing Tests

**Test Structure:**
```javascript
describe('BattleEngine', () => {
  describe('calculateDamage', () => {
    it('should calculate base damage correctly', () => {
      const attacker = { atk: 30 }
      const defender = { def: 10, defending: false }
      const damage = calculateDamage(attacker, defender, false)
      expect(damage).toBeGreaterThanOrEqual(18)
    })

    it('should apply 2x multiplier for special attacks', () => {
      const attacker = { atk: 30 }
      const defender = { def: 10, defending: false }
      const damage = calculateDamage(attacker, defender, true)
      expect(damage).toBeGreaterThanOrEqual(56)
    })
  })
})
```

### Testing Checklist

**Manual Tests:**
- [ ] Battle: Attack/defend/special all work
- [ ] HP bars animate smoothly
- [ ] Damage numbers appear correctly
- [ ] Victory screen triggers at 0 HP
- [ ] Tournament: Bracket updates correctly
- [ ] Creator: Stats/abilities validate properly
- [ ] Mobile: All features work on small screens

---

## 📚 Documentation

### When to Update Docs

**Update documentation if you:**
- Add/change API endpoints → Update `docs/API.md`
- Change architecture → Update `docs/ARCHITECTURE.md`
- Add new features → Update main `README.md`
- Add new modules/classes → Add JSDoc comments

### Documentation Style

**JSDoc Example:**
```javascript
/**
 * Calculate battle damage based on attacker/defender stats.
 * 
 * @param {Object} attacker - Attacking agent
 * @param {number} attacker.atk - Attack stat
 * @param {Object} defender - Defending agent
 * @param {number} defender.def - Defense stat
 * @param {boolean} defender.defending - Is defending this turn
 * @param {boolean} isSpecial - Is this a special attack
 * @returns {number} Final damage dealt (minimum 5)
 * 
 * @example
 * const damage = calculateDamage(
 *   { atk: 30 },
 *   { def: 10, defending: false },
 *   false
 * )
 * // Returns 18-32 damage
 */
function calculateDamage(attacker, defender, isSpecial) {
  // Implementation...
}
```

---

## 🏆 Recognition

Contributors are recognized in:
- **README.md** - Contributors section
- **GitHub** - Contributor graph
- **Release Notes** - Feature credits

---

## ❓ Questions?

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and ideas
- **Twitter** - [@bananabotcool](https://twitter.com/bananabotcool)

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

<p align="center">
  <strong>Thank you for contributing!</strong><br>
  Every contribution makes AI Battle Arena better. ⚔️🏆
</p>
