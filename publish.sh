#!/bin/bash

# VoiceWatch AI - Quick Publish Script
# This script helps you publish to GitHub and optionally deploy

echo "🚀 VoiceWatch AI - Quick Publish"
echo "================================="
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository"
    echo "Please initialize git first: git init"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "📝 Found uncommitted changes"
    echo ""
    
    # Show status
    git status --short
    echo ""
    
    # Ask for commit message
    read -p "Enter commit message (or press Enter to skip commit): " commit_msg
    
    if [ -n "$commit_msg" ]; then
        echo "💾 Committing changes..."
        git add .
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    else
        echo "⏭️  Skipping commit"
    fi
else
    echo "✅ No uncommitted changes"
fi

echo ""
echo "📤 Pushing to GitHub..."

# Check if remote exists
if ! git remote | grep -q origin; then
    echo "⚠️  No remote 'origin' found"
    read -p "Enter GitHub repository URL: " repo_url
    git remote add origin "$repo_url"
fi

# Push to remote
if git push origin main; then
    echo "✅ Pushed to GitHub successfully"
else
    echo "⚠️  Push failed or branch doesn't exist"
    echo "Trying to set upstream..."
    git push --set-upstream origin main
fi

echo ""
echo "🎉 Code published to GitHub!"
echo ""
echo "Next steps:"
echo "1. Enable GitHub Pages in repository settings → Pages → Source: GitHub Actions"
echo "2. Or deploy to Vercel: npm install -g vercel && vercel"
echo "3. Or deploy to Netlify: drag 'dist' folder to netlify.com after running 'npm run build'"
echo ""
echo "📚 See DEPLOY.md for detailed deployment instructions"
