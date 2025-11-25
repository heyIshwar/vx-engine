# Contributing to VX Engine

Thank you for your interest in contributing to VX Engine! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/heyIshwar/vx-engine/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node.js version, OS, etc.)
   - Relevant logs or error messages

### Suggesting Features

1. Check existing issues and discussions
2. Open a new issue with:
   - Clear description of the feature
   - Use case and motivation
   - Proposed implementation (if you have ideas)

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/heyIshwar/vx-engine.git
   cd vx-engine
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes**
   - Follow the existing code style
   - Write clear, self-documenting code
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   - Ensure existing tests pass
   - Add tests for new features
   - Test manually if needed

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature" # or "fix: fix bug"
   ```
   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for formatting
   - `refactor:` for code refactoring
   - `test:` for tests
   - `chore:` for maintenance

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub with:
   - Clear title and description
   - Reference related issues
   - Screenshots (if UI changes)

## Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   ```bash
   docker-compose up -d
   ```

4. **Seed database**
   ```bash
   npm run seed
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

## Code Style Guidelines

- Use ES6+ syntax
- Use `const` and `let`, avoid `var`
- Use async/await over callbacks
- Follow existing code patterns
- Use meaningful variable names
- Keep functions focused and small
- Add JSDoc comments for complex functions

## Project Structure

- `modules/` - Feature modules (User, Admin, File, etc.)
- `models/` - Database models
- `middlewares/` - Express middlewares
- `loaders/` - Application loaders
- `lib/` - Core libraries
- `utils/` - Utility functions
- `scripts/` - Utility scripts
- `crons/` - Cron job definitions

## Adding a New Module

1. Create module directory in `modules/`
2. Follow the structure:
   - `controller.js` - Request handlers
   - `service.js` - Business logic
   - `model.js` - Database schema (if needed)
   - `router.js` - Route definitions
   - `validator.js` - Request validation

3. Register router in `loaders/express.js`

See `.cursor/MODULE_TEMPLATE.md` for a detailed template.

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Test edge cases and error scenarios

## Documentation

- Update README.md for user-facing changes
- Update API.md for API changes
- Add inline comments for complex logic
- Update this file if contributing process changes

## Questions?

- Open an issue for questions
- Check existing documentation in `docs/`
- Review existing code for patterns

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to VX Engine! 🚀

