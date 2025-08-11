#!/bin/bash

echo "🚀 Setting up GitHub repository for Discord Role Checker API"
echo ""

echo "📋 Steps to complete:"
echo "1. Go to https://github.com/new"
echo "2. Repository name: discord-role-checker"
echo "3. Description: Multi-guild Discord role checker API with OAuth2"
echo "4. Make it Public or Private (your choice)"
echo "5. Don't initialize with README (we already have one)"
echo "6. Click 'Create repository'"
echo ""

echo "🔗 After creating the repository, run these commands:"
echo "git remote add origin https://github.com/YOUR_USERNAME/discord-role-checker.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""

echo "📱 Your production URLs:"
echo "   API Base: https://discord-role-checker.vercel.app"
echo "   Demo: https://discord-role-checker.vercel.app/multi-guild-demo.html"
echo "   Health: https://discord-role-checker.vercel.app/health"
echo ""

echo "🔐 Don't forget to:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Update Discord OAuth2 redirect to: https://discord-role-checker.vercel.app/callback"
echo ""

read -p "Press Enter when you've created the GitHub repository..."
