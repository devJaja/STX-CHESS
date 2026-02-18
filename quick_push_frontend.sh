#!/bin/bash

# Quick push script for feat/frontend branch

echo "🚀 Pushing feat/frontend branch to GitHub..."
echo ""

# Check if remote exists
if git remote | grep -q "origin"; then
    echo "✅ Remote 'origin' found"
    echo ""
    echo "Pushing feat/frontend branch..."
    git push -u origin feat/frontend
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ SUCCESS! Branch pushed to GitHub"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "📊 Branch: feat/frontend"
        echo "📝 Commits: 104"
        echo ""
        echo "🔗 Create Pull Request:"
        REPO_URL=$(git remote get-url origin | sed 's/\.git$//')
        echo "   $REPO_URL/compare/main...feat/frontend"
        echo ""
    else
        echo ""
        echo "❌ Push failed. Please check your credentials and try again."
    fi
else
    echo "❌ Remote 'origin' not found!"
    echo ""
    echo "Please add remote first:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/stack-chess.git"
    echo ""
    echo "Then run this script again or push manually:"
    echo "  git push -u origin feat/frontend"
fi
