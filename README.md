# tarikdzinic.com

My personal blog about AI, philosophy, books & entrepreneurship.

## Quick Start - Adding New Posts

### Easy way (Windows):
```bash
# Create a new post
node new-post.js "Your Post Title"

# Write your content in the opened file

# Publish everything
publish.bat
```

### Manual way:
1. Create a new `.md` file in `posts/` folder
2. Add frontmatter and content:
```markdown
---
title: Your Post Title
date: 2024-01-01
tags: ai, philosophy
---

Your post content here...
```
3. Run `node generate.js` to build
4. Push to GitHub:
```bash
git add .
git commit -m "Add new post"
git push
```

## Project Structure
```
/
├── posts/          # Your markdown posts
├── build/          # Generated site (auto-deployed)
├── src/            # Templates and styles
├── generate.js     # Site generator
├── new-post.js     # Create new posts easily
└── publish.bat     # One-click publish (Windows)
```

## Features
- Zero dependencies
- Lightning fast
- GitHub Pages hosting
- Custom domain (tarikdzinic.com)
- Automatic deployment via GitHub Actions

## Writing Posts
Posts support:
- **Headers** with #, ##, ###
- **Bold** with **text**
- *Italic* with *text*
- `Code` with backticks
- [Links](url) with [text](url)
- > Blockquotes
- Code blocks with triple backticks

## Deployment
Site automatically deploys to tarikdzinic.com when you push to GitHub.