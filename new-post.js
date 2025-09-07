const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Get post title from command line
const title = process.argv.slice(2).join(' ');

if (!title) {
    console.log('❌ Please provide a title for your post');
    console.log('Usage: node new-post.js "Your Post Title"');
    process.exit(1);
}

// Create filename from title
const filename = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const filepath = path.join(__dirname, 'posts', `${filename}.md`);

// Check if file already exists
if (fs.existsSync(filepath)) {
    console.log(`❌ Post "${filename}.md" already exists`);
    process.exit(1);
}

// Create post content with frontmatter
const content = `---
title: ${title}
date: ${new Date().toISOString().split('T')[0]}
tags: draft
---

# ${title}

Write your content here...

## Section 1

Your content...

## Section 2

More content...
`;

// Write the file
fs.writeFileSync(filepath, content);
console.log(`✅ Created new post: posts/${filename}.md`);

// Ask if user wants to open the file
console.log('\n📝 Opening in VS Code...');
exec(`code "${filepath}"`, (error) => {
    if (error) {
        console.log('💡 Open the file in your favorite editor to start writing!');
    }
});