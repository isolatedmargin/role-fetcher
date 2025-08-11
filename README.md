# 🎯 Multi-Guild Discord Role Checker API

A powerful, production-ready API that checks Discord role membership across multiple guilds using OAuth2 authentication. No bot required in your Discord servers!

## 🚀 Live Demo

**Demo Website**: [Your Vercel URL]/multi-guild-demo.html

**API Base URL**: [Your Vercel URL]

## ✨ Features

- **🔐 Multi-Guild Support**: Check roles across multiple Discord servers
- **🚫 No Bot Required**: Works without adding bots to your Discord servers
- **🔒 OAuth2 Authentication**: Secure Discord login and role verification
- **📱 Real-time Results**: Instant role checking with comprehensive responses
- **🎨 Beautiful Demo UI**: Interactive website to test all API endpoints
- **⚡ Production Ready**: Deployed on Vercel with proper error handling

## 🎯 Supported Guilds & Roles

| Guild | Guild ID | Role ID | Role Name |
|-------|----------|----------|-----------|
| **NADS** | `1036357772826120242` | `1051562453495971941` | NADS Role |
| **SLMND** | `1325852385054031902` | `1329565499335381033` | Riverborn |
| **LAMOUCH** | `1329166769566388264` | `1337881787409371372` | Mouch OG |

## 📋 API Endpoints

### Core Endpoints

- **`GET /health`** - Health check and configuration info
- **`GET /api`** - Complete API documentation
- **`GET /login`** - Redirect to Discord OAuth2
- **`GET /callback`** - OAuth2 callback and role check for ALL guilds

### Individual Guild Endpoints

- **`GET /nads`** - NADS guild information
- **`GET /slmnd`** - SLMND guild information
- **`GET /lamouch`** - LAMOUCH guild information

### Role Checking

- **`POST /check-role/:guild`** - Check role for specific guild with access token

## 🔐 How It Works

1. **User clicks button** → Redirects to `/login`
2. **Discord OAuth2** → User authorizes with required scopes
3. **Callback** → Exchanges code for access token
4. **Role Check** → Queries Discord API for all guilds
5. **Results** → Returns comprehensive role status across all guilds

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/discord-role-checker.git
cd discord-role-checker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `env.example` to `.env` and fill in your Discord credentials:

```bash
cp env.example .env
# Edit .env with your Discord Client Secret
```

### 4. Run Locally

```bash
# Development mode
npm run dev:multi

# Production mode
npm run multi-guild
```

### 5. Test the API

Visit `http://localhost:3000/multi-guild-demo.html` to test all endpoints!

## 🌐 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit: Multi-guild Discord role checker API"
git push origin main
```

### 2. Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   - `CLIENT_ID`: `1404438843112820756`
   - `CLIENT_SECRET`: Your Discord Client Secret
   - `REDIRECT_URI`: `https://your-app.vercel.app/callback`
   - `SESSION_SECRET`: A secure random string

### 3. Update Discord OAuth2 Redirect

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application (`1404438843112820756`)
3. Go to **OAuth2** tab
4. Add redirect URL: `https://your-app.vercel.app/callback`
5. Save changes

## 📱 Integration Examples

### HTML/JavaScript

```html
<button onclick="checkDiscordRoles()">Check My Discord Roles</button>

<script>
function checkDiscordRoles() {
    window.location.href = 'https://your-app.vercel.app/login';
}
</script>
```

### React Native

```javascript
import { Linking } from 'react-native';

const checkDiscordRoles = () => {
    Linking.openURL('https://your-app.vercel.app/login');
};

<Button title="Check Discord Roles" onPress={checkDiscordRoles} />
```

### cURL

```bash
# Health check
curl https://your-app.vercel.app/health

# Check specific guild role
curl -X POST https://your-app.vercel.app/check-role/nads \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "your_token_here"}'
```

## 📊 API Response Examples

### Health Check Response

```json
{
  "status": "OK",
  "timestamp": "2025-08-11T12:47:23.005Z",
  "guilds": [
    {
      "name": "NADS",
      "guildId": "1036357772826120242",
      "roleId": "1051562453495971941",
      "roleName": "NADS Role"
    },
    {
      "name": "SLMND",
      "guildId": "1325852385054031902",
      "roleId": "1329565499335381033",
      "roleName": "Riverborn"
    },
    {
      "name": "LAMOUCH",
      "guildId": "1329166769566388264",
      "roleId": "1337881787409371372",
      "roleName": "Mouch OG"
    }
  ],
  "clientId": "1404438843112820756"
}
```

### OAuth2 Callback Response

```json
{
  "success": true,
  "results": {
    "NADS": {
      "guildId": "1036357772826120242",
      "guildName": "NADS",
      "roleId": "1051562453495971941",
      "roleName": "NADS Role",
      "hasRole": true,
      "success": true
    },
    "SLMND": {
      "guildId": "1325852385054031902",
      "guildName": "SLMND",
      "roleId": "1329565499335381033",
      "roleName": "Riverborn",
      "hasRole": false,
      "success": true
    },
    "LAMOUCH": {
      "guildId": "1329166769566388264",
      "guildName": "LAMOUCH",
      "roleId": "1337881787409371372",
      "roleName": "Mouch OG",
      "hasRole": true,
      "success": true
    }
  },
  "summary": {
    "totalGuilds": 3,
    "rolesHeld": 2,
    "totalRoles": 3
  }
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Discord Application
CLIENT_ID=1404438843112820756
CLIENT_SECRET=your_client_secret_here

# OAuth2
REDIRECT_URI=https://your-domain.com/callback

# Guilds (automatically configured)
GUILD_ID_NADS=1036357772826120242
ROLE_ID_NADS=1051562453495971941
GUILD_ID_SLMND=1325852385054031902
ROLE_ID_SLMND=1329565499335381033
GUILD_ID_LAMOUCH=1329166769566388264
ROLE_ID_LAMOUCH=1337881787409371372

# Server
PORT=3000
SESSION_SECRET=your_secure_session_secret
```

### Discord Application Settings

- **Application ID**: `1404438843112820756`
- **Required Scopes**: `identify`, `guilds.members.read`
- **Redirect URLs**: Your Vercel domain + `/callback`

## 🧪 Testing

### Local Testing

1. Start the API: `npm run multi-guild`
2. Open: `http://localhost:3000/multi-guild-demo.html`
3. Test all endpoints interactively

### Production Testing

1. Deploy to Vercel
2. Open: `https://your-app.vercel.app/multi-guild-demo.html`
3. Test OAuth2 flow with real Discord accounts

## 🚨 Error Handling

### Common Error Responses

- **403**: Access denied (user not in guild or lacks permissions)
- **404**: User not a member of the guild
- **429**: Rate limited (try again later)
- **500**: Internal server error

### Error Response Format

```json
{
  "hasRole": false,
  "error": "User not a member of this guild",
  "success": false
}
```

## 🔒 Security Features

- **OAuth2 Authentication**: Secure Discord login
- **Environment Variables**: Sensitive data protection
- **CORS Protection**: Configurable cross-origin requests
- **Rate Limiting**: Respects Discord API limits
- **Error Handling**: No information leakage

## 📈 Performance

- **Response Time**: < 500ms for role checks
- **Rate Limits**: 50 requests/second per Discord token
- **Caching**: Built-in token management
- **Scalability**: Serverless deployment on Vercel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/discord-role-checker/issues)
- **Discord**: Join our support server
- **Documentation**: [API.md](API.md)

## 🙏 Acknowledgments

- **Discord API** for OAuth2 and role checking
- **Vercel** for serverless hosting
- **Express.js** for the web framework

---

**Made with ❤️ for the Discord community**

*This API works without requiring bots in Discord servers by using Discord's OAuth2 API with the `guilds.members.read` scope.*
