const fs = require('fs');
const path = require('path');

// Simple markdown parser - zero dependencies!
function parseMarkdown(content) {
    return content
        // Headers
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        
        // Bold and italic
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        
        // Code blocks
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        
        // Blockquotes
        .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
        
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        
        // Paragraphs (split by double newlines)
        .split('\n\n')
        .map(para => {
            para = para.trim();
            if (!para) return '';
            if (para.startsWith('<h') || para.startsWith('<pre') || para.startsWith('<blockquote')) {
                return para;
            }
            return `<p>${para.replace(/\n/g, '<br>')}</p>`;
        })
        .join('\n');
}

// Parse frontmatter
function parseFrontmatter(content) {
    const frontmatterRegex = /^---\s*\r?\n([\s\S]*?)\n---\s*\r?\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
        console.log('No frontmatter match found');
        return { metadata: {}, content };
    }
    
    const [, frontmatter, body] = match;
    const metadata = {};
    
    frontmatter.split(/\r?\n/).forEach(line => {
        line = line.trim();
        if (line) {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();
                
                metadata[key] = value;
                
                // Parse tags
                if (key === 'tags') {
                    metadata.tags = value.split(',').map(tag => tag.trim());
                }
            }
        }
    });
    
    return { metadata, content: body.trim() };
}

// Generate excerpt from content
function generateExcerpt(content, maxLength = 200) {
    const text = content
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/\n/g, ' ')
        .trim();
    
    if (text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return truncated.substring(0, lastSpace) + '...';
}

// Create slug from title
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}


// Load template
function loadTemplate() {
    return fs.readFileSync('./src/template.html', 'utf8');
}

// Generate individual post page
function generatePostPage(post, template) {
    const content = `
        <header>
            <h1>Blog</h1>
            <div class="subtitle">thoughts on ai, philosophy, books & entrepreneurship</div>
            <nav class="nav">
                <a href="../index.html">← home</a>
            </nav>
        </header>
        
        <article>
            <h1>${post.metadata.title}</h1>
            <div class="post-meta">${formatDate(post.metadata.date)}</div>
            ${post.metadata.tags ? `<div class="tags">${post.metadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
            <div style="margin-top: 2rem;">
                ${post.html}
            </div>
        </article>
        
        <div class="back-link">
            <a href="../index.html">← back to all posts</a>
        </div>
        
        <footer class="footer">
            <p>
                <a href="mailto:contact@tarikdzinic.com">contact@tarikdzinic.com</a>
                <a href="https://www.linkedin.com/in/tarikdz/" target="_blank">linkedin</a>
                <a href="https://x.com/eraswrite" target="_blank">x</a>
            </p>
        </footer>
    `;
    
    return template
        .replace('{{TITLE}}', `${post.metadata.title} | Blog`)
        .replace('{{CONTENT}}', content);
}

// Generate index page
function generateIndexPage(posts, template) {
    const postsHtml = posts.map(post => `
        <li class="post-item">
            <h3 class="post-title">
                <a href="posts/${post.slug}.html">${post.metadata.title}</a>
            </h3>
            <div class="post-meta">${formatDate(post.metadata.date)}</div>
            <div class="post-excerpt">${post.excerpt}</div>
            ${post.metadata.tags ? `<div class="tags">${post.metadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
        </li>
    `).join('');
    
    const content = `
        <header>
            <h1>Blog</h1>
            <div class="subtitle">thoughts on ai, philosophy, books & entrepreneurship</div>
        </header>
        
        <main>
            <ul class="posts">
                ${postsHtml}
            </ul>
        </main>
        
        <footer class="footer">
            <p>
                <a href="mailto:contact@tarikdzinic.com">contact@tarikdzinic.com</a>
                <a href="https://www.linkedin.com/in/tarikdz/" target="_blank">linkedin</a>
                <a href="https://x.com/eraswrite" target="_blank">x</a>
            </p>
        </footer>
    `;
    
    return template
        .replace('{{TITLE}}', 'Blog')
        .replace('{{CONTENT}}', content);
}

// Main generator function
function generateSite() {
    console.log('🚀 Generating site...');
    
    // Ensure build directories exist
    if (!fs.existsSync('./build')) fs.mkdirSync('./build');
    if (!fs.existsSync('./build/posts')) fs.mkdirSync('./build/posts');
    
    // Load template
    const template = loadTemplate();
    
    // Read all markdown files
    const postsDir = './posts';
    const postFiles = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
    
    if (postFiles.length === 0) {
        console.log('❌ No posts found in ./posts directory');
        return;
    }
    
    // Process posts
    const posts = postFiles.map(file => {
        const filePath = path.join(postsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const { metadata, content: body } = parseFrontmatter(content);
        
        // Always use filename as title: capitalize first letter only
        const filenameTitle = file.replace('.md', '');
        metadata.title = filenameTitle.charAt(0).toUpperCase() + filenameTitle.slice(1);
        
        if (!metadata.date) {
            metadata.date = new Date().toISOString().split('T')[0];
        }
        
        const html = parseMarkdown(body);
        const excerpt = generateExcerpt(body);
        // Use filename as slug base instead of title to avoid issues
        const slug = createSlug(file.replace('.md', ''));
        
        return { metadata, html, excerpt, slug, filename: file };
    });
    
    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.metadata.date) - new Date(a.metadata.date));
    
    // Generate individual post pages
    posts.forEach(post => {
        const postHtml = generatePostPage(post, template);
        fs.writeFileSync(`./build/posts/${post.slug}.html`, postHtml);
        console.log(`✅ Generated: ${post.slug}.html`);
    });
    
    // Generate index page
    const indexHtml = generateIndexPage(posts, template);
    fs.writeFileSync('./build/index.html', indexHtml);
    console.log('✅ Generated: index.html');
    
    // Copy CNAME if it exists
    const cnamePath = path.join(__dirname, 'src', 'CNAME');
    if (fs.existsSync(cnamePath)) {
        fs.copyFileSync(cnamePath, path.join(__dirname, 'build', 'CNAME'));
        console.log('✅ Copied: CNAME');
    }
    
    console.log(`\n🎉 Site generated successfully!`);
    console.log(`📄 ${posts.length} posts processed`);
    console.log(`📁 Files created in ./build/`);
    console.log('\n📝 To add new posts:');
    console.log('1. Create .md files in ./posts/');
    console.log('2. Run: node generate.js');
    console.log('3. Deploy ./build/ to your host');
}

// Run the generator
if (require.main === module) {
    generateSite();
}

module.exports = { generateSite };
