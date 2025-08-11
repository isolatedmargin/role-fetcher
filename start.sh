#!/bin/bash

echo "🚀 Starting Discord Role Checker Bot..."
echo "📱 Make sure you've updated config.js with your Client Secret!"
echo ""

# Check if config.js has been updated
if grep -q "YOUR_CLIENT_SECRET_HERE" config.js; then
    echo "⚠️  WARNING: You still need to update config.js with your Discord Client Secret!"
    echo "   Edit config.js and replace 'YOUR_CLIENT_SECRET_HERE' with your actual secret"
    echo ""
    echo "   To get your Client Secret:"
    echo "   1. Go to https://discord.com/developers/applications"
    echo "   2. Select your application (ID: 1404438843112820756)"
    echo "   3. Go to OAuth2 tab"
    echo "   4. Copy the Client Secret"
    echo ""
    read -p "Press Enter to continue anyway, or Ctrl+C to stop and update config.js..."
fi

echo "🔧 Starting the bot..."
npm start
