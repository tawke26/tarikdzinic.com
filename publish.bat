@echo off
echo 🚀 Publishing your blog...
echo.

REM Generate the site
echo 📦 Building site...
node generate.js
echo.

REM Add all changes
echo 📤 Pushing to GitHub...
git add .
git commit -m "Update blog content"
git push origin master

echo.
echo ✅ Blog published successfully!
echo 🌐 Your changes will be live at tarikdzinic.com in a few minutes
pause