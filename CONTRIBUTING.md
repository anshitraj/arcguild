# Contributing to ArcGuilds

Thank you for your interest in contributing to ArcGuilds! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/arcguild.git`
3. Install dependencies: `pnpm install`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## 📝 Development Workflow

### Code Style

- Use TypeScript for all new code
- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

Use clear, descriptive commit messages:

```
feat: Add wallet connection with RainbowKit
fix: Resolve contract deployment issue
docs: Update README with setup instructions
refactor: Simplify mission verification logic
test: Add tests for XP calculation
```

### Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Write or update tests as needed
3. Update documentation if necessary
4. Ensure all tests pass: `pnpm test`
5. Create a pull request with a clear description

## 🧪 Testing

Run tests before submitting:

```bash
# Contract tests
cd packages/contracts
pnpm test

# Type checking
pnpm type-check
```

## 📚 Project Structure

- `apps/web/` - Main Next.js application
- `apps/admin/` - Admin dashboard
- `apps/indexer/` - Blockchain event indexer
- `packages/contracts/` - Smart contracts
- `packages/database/` - Prisma schema and migrations
- `packages/sdk/` - TypeScript SDK

## 🐛 Reporting Bugs

When reporting bugs, please include:
- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, etc.)

## 💡 Feature Requests

We welcome feature requests! Please:
- Check if the feature already exists
- Describe the use case
- Explain how it would benefit users
- Consider implementation complexity

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to ArcGuilds! 🎉
