# Contributing to AI Battle Arena

Thank you for your interest in contributing! 🎮

## Ways to Contribute

- 🐛 Report bugs
- ✨ Suggest features
- 📝 Improve documentation
- 🎨 Design new agents
- 🔧 Submit pull requests

## Development Setup

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/ai-battle-arena.git
   cd ai-battle-arena
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```
5. **Start development server:**
   ```bash
   npm start
   ```

## Pull Request Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Write clear, commented code
   - Follow existing code style
   - Test your changes thoroughly

3. **Commit your changes:**
   ```bash
   git commit -m "Add amazing feature"
   ```

4. **Push to your fork:**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Include screenshots if UI changed

## Code Style

- **JavaScript:** Use ES6+ features
- **Indentation:** 2 spaces
- **Semicolons:** Optional but consistent
- **Comments:** Explain "why" not "what"
- **Naming:** camelCase for variables, PascalCase for classes

## Adding New Agents

1. Add to `server/server.js` AGENTS array:
```javascript
{
  id: 'unique-id',
  name: 'Agent Name',
  personality: 'Description',
  maxHp: 100,
  attack: 75,
  defense: 60,
  luck: 15,
  abilities: ['Ability 1', 'Ability 2', 'Ability 3']
}
```

2. Test in-game
3. Submit PR with agent description

## Adding New Game Modes

1. Create HTML file in `public/`
2. Create corresponding JS file
3. Update navigation in `navigation.js`
4. Document in DOCUMENTATION.md
5. Add to README.md

## Reporting Bugs

**Use GitHub Issues with:**
- Clear title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment (OS, browser, Node version)

## Feature Requests

**Open an issue with:**
- Clear description
- Use case / motivation
- Mockups or examples (if applicable)
- Implementation ideas (optional)

## Documentation

- Update README.md for major changes
- Keep DOCUMENTATION.md in sync
- Comment complex code
- Update CHANGELOG.md

## Testing

- Test all game modes
- Check mobile responsiveness
- Verify API endpoints
- Run performance tests

## Community

- Be respectful and inclusive
- Help others in discussions
- Share your creations
- Have fun! 🎮

## Questions?

Open a GitHub Discussion or reach out to the maintainers.

---

**Thank you for contributing!** 🙏

Built with ❤️ by the community
