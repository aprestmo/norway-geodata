# 📦 Publishing Guide

## 🔄 Updating the Data

Two things in the package come straight from official sources and are rebuilt by one command:

```bash
npm run build:history   # python3 scripts/build-history.py (Python 3, standard library only)
```

| File | Source |
| --- | --- |
| `data/postal-codes-2026.json` (today's postal codes, read by the main entry point) | Posten's postal code register |
| `data/history/*.json` (postal codes, municipalities and counties over time) | Posten's change log from 2003-10-01, Statistics Norway Klass 131 and 104 |

The script fetches everything on every run and writes the same files when nothing has changed,
so `git diff data` shows exactly what Posten or Statistics Norway changed.

**When.** The workflow `Update Data` runs the script on the 2nd of every month and opens a pull
request when the data has changed. It can also be started by hand (Actions → Update Data → Run
workflow). Posten changes postal codes a few times a year, mostly on 1 October; municipalities and
counties change on 1 January.

**What to look at in the pull request.**

- A handful of added, removed or renamed postal codes is normal.
- Hundreds of changed municipality IDs means a municipal reform. Then also update what the script
  does not: `data/municipalities-2025.json` and `data/counties-2025.json` (population, area, URLs,
  the postal codes listed per municipality) are maintained by hand, and
  `scripts/test-history.js` checks facts that a reform can change.
- The script prints how many events in Posten's log «did not fit the state they met» (71 in
  November 2026). A jump in that number means the format of the log has changed.

**Not rebuilt by the script.** `data/municipalities-2025.json` and `data/counties-2025.json`.
The postal codes listed inside each municipality there can therefore lag behind
`data/postal-codes-2026.json`.

## 🚢 Releasing a Data Update

1. Merge the pull request to `main` and pull.
2. `npm run version:minor` (new data or features) or `npm run version:patch` (fixes).
3. Commit the version: `git commit -am "chore: release v$(node -p "require('./package.json').version")"`.
4. `npm run publish:npm` (needs `npm login` as an owner of the package). It validates, builds and
   tests first, and refuses a version that is already published.
5. `git tag v$(node -p "require('./package.json').version") && git push && git push --tags`.

Commit before you publish. Version 0.1.5 was published from changes that were never committed, so
the repository was behind npm until 0.2.0.

Projects that use the package get the new data with `npm update @aprestmo/norway-geodata`
(or the pnpm/yarn equivalent) and a new deploy. Nothing reaches them before that.

## 🎯 Manual Publishing (Recommended)

This project uses manual publishing instead of auto-publish for better control over releases.

## 📋 Publishing Scripts

### Version Management
```bash
# Check current version status
npm run version-status

# Check for version conflicts
npm run check-conflicts

# Bump version (without publishing)
npm run version:patch    # 0.1.0 → 0.1.1
npm run version:minor    # 0.1.0 → 0.2.0  
npm run version:major    # 0.1.0 → 1.0.0
npm run version:prerelease # 0.1.0 → 0.1.1-0
```

### Publishing Options
```bash
# Test publish (dry run)
npm run publish:npm-dry

# Publish to npm only
npm run publish:npm

# Publish to GitHub Packages only  
npm run publish:github

# Publish to both npm and GitHub Packages
npm run publish:both
```

### One-Command Releases
```bash
# Version bump + publish in one command
npm run release:patch    # Bump patch version and publish
npm run release:minor    # Bump minor version and publish  
npm run release:major    # Bump major version and publish
```

## 🚀 Recommended Workflow

### 1. Pre-Release Checks
```bash
# Check current status
npm run version-status

# Verify no conflicts
npm run check-conflicts

# Test the package
npm run validate
npm run build
npm test

# Dry run to verify package contents
npm run publish:npm-dry
```

### 2. Release Process

#### Option A: Step-by-Step
```bash
# 1. Bump version
npm run version:patch  # or minor/major

# 2. Commit version change
git add package.json
git commit -m "chore: bump version to $(node -p require('./package.json').version)"

# 3. Publish
npm run publish:npm

# 4. Push changes and create tag
git tag v$(node -p "require('./package.json').version")
git push && git push --tags
```

#### Option B: One Command
```bash
# Version bump + publish in one step
npm run release:patch

# Then commit and tag
git add package.json
git commit -m "chore: release v$(node -p require('./package.json').version)"
git tag v$(node -p "require('./package.json').version")
git push && git push --tags
```

## 🔧 What Each Script Does

### `prepublishOnly`
Runs automatically before publishing:
1. ✅ Validates data files
2. ✅ Builds TypeScript
3. ✅ Runs tests

### `publish:npm`
1. ✅ Checks for version conflicts
2. ✅ Runs prepublishOnly
3. ✅ Publishes to npm with public access

### `publish:github`
1. ✅ Runs prepublishOnly 
2. ✅ Publishes to GitHub Packages

### `release:*`
1. ✅ Bumps version
2. ✅ Publishes to npm

## 📊 Package Contents Verification

```bash
# See exactly what will be published
npm pack --dry-run

# Create actual tarball for inspection
npm pack
tar -tzf *.tgz
```

## 🆘 Troubleshooting

### Version Conflicts
```bash
# If version already exists
npm run version:patch  # Bump to next version
```

### NPM Authentication
```bash
# Make sure you're logged in
npm whoami
npm login  # If not logged in
```

### GitHub Packages Authentication
```bash
# Create .npmrc with GitHub token
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
```

### Build Issues
```bash
# Clean and rebuild
npm run clean
npm run build
npm test
```

## 🏷️ Version Strategy

- **Patch** (0.1.0 → 0.1.1): Bug fixes, documentation updates
- **Minor** (0.1.0 → 0.2.0): New features, data updates  
- **Major** (0.1.0 → 1.0.0): Breaking changes, API changes

## 🔐 Required Permissions

- **npm**: Member of `@aprestmo` organization or package collaborator
- **GitHub**: Write access to repository + packages

## ✅ Pre-Publish Checklist

- [ ] All tests passing
- [ ] Data validation successful
- [ ] TypeScript compilation clean
- [ ] Version conflicts checked
- [ ] Changelog updated (if applicable)
- [ ] Documentation up to date

## 🚨 Emergency Publishing

If you need to quickly publish a fix:

```bash
# Quick patch release
npm run release:patch

# Then commit the version change
git add package.json
git commit -m "chore: emergency release v$(node -p require('./package.json').version)"
git push
```

This ensures you maintain control over when and how packages are published! 🎯

