# Contributing to Norway Geodata

Thank you for your interest in contributing to Norway Geodata! This document outlines the process for contributing to this project.

## 🔒 Branch Protection

This repository has **branch protection** enabled on the `main` branch to ensure code quality and stability:

- ✅ **Pull requests required** - Direct pushes to `main` are blocked
- ✅ **Status checks required** - All CI checks must pass before merge
- ✅ **Up-to-date branches** - PRs must be current with main
- ✅ **Automated validation** - PR validation workflow ensures quality

## 🚀 Development Workflow

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/norway-geodata.git
cd norway-geodata

# Add upstream remote
git remote add upstream https://github.com/aprestmo/norway-geodata.git
```

### 2. Create a Feature Branch

```bash
# Make sure you're on main and up to date
git checkout main
git pull upstream main

# Create a new branch with conventional naming for auto-PR creation
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b docs/your-documentation-update
```

**🎯 Branch Naming Convention** (for automatic PR creation):
- `feat/` - New features
- `fix/` - Bug fixes  
- `docs/` - Documentation
- `chore/` - Maintenance
- `refactor/` - Code refactoring
- `test/` - Testing
- `perf/` - Performance
- `ci/` - CI/CD changes
- `build/` - Build system
- `style/` - Code style

### 3. Make Your Changes

```bash
# Install dependencies
npm install

# Make your changes
# ... edit files ...

# Test your changes
npm run build
npm test
npm run validate
```

### 4. Commit Your Changes

Use **conventional commit** format:

```bash
git add .
git commit -m "feat: add new municipality search function"
# or
git commit -m "fix: correct postal code validation"
# or
git commit -m "docs: update API documentation"
```

**Commit message format:**
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements
- `ci:` - CI/CD changes
- `build:` - Build system changes

### 5. Push and Auto-Create Pull Request

```bash
# Push your branch - PR will be created automatically!
git push origin feature/your-feature-name
```

🤖 **Automatic PR Creation**: When you push a branch with conventional naming (`feat/`, `fix/`, `docs/`, etc.), a pull request is automatically created with:
- ✅ **Smart title generation** from branch name
- ✅ **Pre-filled template** based on change type  
- ✅ **Appropriate labels** automatically applied
- ✅ **Commit history** included in description

**Manual PR Creation** (if needed):
```bash
# Only needed if automatic creation fails or for custom branches
gh pr create --title "feat: add new municipality search function" --body "Description of your changes"
```

**Skip Auto-PR**: Add `[skip-pr]` to your commit message to prevent automatic PR creation.

## 📋 Pull Request Process

### What Happens When You Create a PR:

1. **Automated Validation** runs:
   - ✅ JSON file validation
   - ✅ TypeScript compilation
   - ✅ Type checking
   - ✅ API export validation
   - ✅ Breaking change detection
   - ✅ Commit message format check
   - ✅ Package size impact analysis

2. **Automated Merge**:
   - All automated checks must pass
   - PR must be up-to-date with main branch
   - Ready to merge once validation completes

3. **After Merge**:
   - Automatic version bump based on changes
   - Automatic publishing to npm and GitHub Packages
   - Automatic GitHub release creation
   - Git tag creation

## 🧪 Testing Your Changes

Before creating a PR, ensure all tests pass:

```bash
# Full test suite
npm run build        # TypeScript compilation
npm run test:types   # Type checking
npm run validate     # JSON validation
npm test             # API validation

# Development workflow
npm run dev          # Watch mode for development
```

## 📁 Types of Contributions

### Data Updates
- Municipality changes (`data/municipalities-2025.json`)
- County changes (`data/counties-2025.json`)
- **Impact**: Minor version bump (automatic)

### Code Changes
- New functions in `src/`
- Bug fixes
- Performance improvements
- **Impact**: Patch or minor version bump

### Breaking Changes
- API changes
- Type definition changes
- **Impact**: Major version bump
- **Requirement**: Must be clearly documented in PR

### Documentation
- README updates
- Code comments
- API documentation
- **Impact**: Patch version bump

## 🔍 Code Review Guidelines

### For Contributors:
- Follow the PR template checklist
- Provide clear description of changes
- Include tests for new functionality
- Update documentation as needed
- Ensure conventional commit format

### For Reviewers:
- Check code quality and consistency
- Verify tests cover new functionality
- Ensure documentation is updated
- Validate breaking change impact
- Test changes locally if needed

## 🚫 What's Not Allowed

- Direct pushes to `main` branch
- Merging without required reviews
- Bypassing status checks
- Force pushing to shared branches
- Committing sensitive data or secrets

## 🆘 Getting Help

If you need help:

1. **Check existing issues** on GitHub
2. **Create a new issue** for bugs or feature requests
3. **Start a discussion** for questions or ideas
4. **Review the documentation** in the README

## 📦 Release Process

Releases are **fully automated**:

1. **PR merged** → Triggers automatic workflow
2. **Version calculated** based on changes:
   - Data changes → Minor bump
   - Code changes → Patch bump
   - Breaking changes → Major bump
3. **Published** to npm and GitHub Packages
4. **Release created** with changelog
5. **Git tagged** with new version

## 🏷️ Versioning Strategy

This project uses **Semantic Versioning**:

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, data updates
- **Patch** (0.0.X): Bug fixes, documentation
- **Prerelease** (0.0.0-alpha.X): Testing versions

## 🔐 Security

If you discover a security vulnerability:

1. **Do NOT** create a public issue
2. **Email** the maintainers privately
3. **Provide** detailed information about the vulnerability
4. **Wait** for a response before public disclosure

---

Thank you for contributing to Norway Geodata! 🇳🇴

