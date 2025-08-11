# Discord Role Checker API Documentation

A lightweight, RESTful API for checking Discord role membership using OAuth2 authentication.

## 🚀 Quick Start

### Base URL
```
http://localhost:3000
```

### Configuration
- **Guild ID**: `1036357772826120242`
- **Role ID**: `1051562453495971941`
- **Client ID**: `1404438843112820756`

## 📋 API Endpoints

### 1. Health Check
**GET** `/health`

Check if the API is running and get configuration information.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-08-11T12:25:41.317Z",
  "guildId": "1036357772826120242",
  "roleId": "1051562453495971941",
  "clientId": "1404438843112820756"
}
```

### 2. API Documentation
**GET** `/api`

Get complete API endpoint information and configuration.

**Response:**
```json
{
  "name": "Discord Role Checker API",
  "version": "1.0.0",
  "description": "Lightweight API to check Discord role membership",
  "endpoints": {
    "/health": "GET - Health check and configuration info",
    "/login": "GET - Redirect to Discord OAuth2",
    "/callback": "GET - OAuth2 callback and role check",
    "/check-role": "POST - Direct role check with access token",
    "/api": "GET - This API documentation"
  },
  "configuration": {
    "guildId": "1036357772826120242",
    "roleId": "1051562453495971941",
    "clientId": "1404438843112820756",
    "scopes": ["identify", "guilds.members.read"]
  }
}
```

### 3. OAuth2 Login
**GET** `/login`

Redirects user to Discord's OAuth2 authorization page.

**Flow:**
1. User visits `/login`
2. Redirected to Discord for authorization
3. User authorizes the application
4. Discord redirects to `/callback` with authorization code

**Scopes Required:**
- `identify` - Get user information
- `guilds.members.read` - Read guild member information

### 4. OAuth2 Callback
**GET** `/callback?code={authorization_code}`

Handles OAuth2 callback, exchanges code for access token, and checks role membership.

**Query Parameters:**
- `code` (required) - Authorization code from Discord

**Response (Success):**
```json
{
  "hasRole": true,
  "guildId": "1036357772826120242",
  "roleId": "1051562453495971941",
  "success": true
}
```

**Response (Error):**
```json
{
  "hasRole": false,
  "error": "User is not a member of this guild",
  "success": false
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - No authorization code provided
- `403` - Access denied (user not in guild or lacks permissions)
- `404` - User not a member of the guild
- `429` - Rate limited
- `500` - Internal server error

### 5. Direct Role Check
**POST** `/check-role`

Check role membership using an existing Discord access token.

**Request Body:**
```json
{
  "accessToken": "your_discord_access_token_here"
}
```

**Response:**
```json
{
  "hasRole": true,
  "guildId": "1036357772826120242",
  "roleId": "1051562453495971941",
  "success": true
}
```

## 🔐 Authentication Flow

### Complete OAuth2 Flow
```
1. User clicks button → GET /login
2. Redirect to Discord → Discord OAuth2 page
3. User authorizes → Discord redirects to /callback
4. Exchange code → Get access token
5. Check role → Query Discord API
6. Return result → JSON response
```

### Integration Examples

#### HTML/JavaScript
```html
<button onclick="checkDiscordRole()">Check Discord Role</button>

<script>
function checkDiscordRole() {
    window.location.href = 'http://localhost:3000/login';
}
</script>
```

#### React Native
```javascript
import { Linking } from 'react-native';

const checkDiscordRole = () => {
    Linking.openURL('http://localhost:3000/login');
};

<Button title="Check Discord Role" onPress={checkDiscordRole} />
```

#### cURL
```bash
# Health check
curl http://localhost:3000/health

# Direct role check
curl -X POST http://localhost:3000/check-role \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "your_token_here"}'
```

#### Python
```python
import requests

# Health check
response = requests.get('http://localhost:3000/health')
print(response.json())

# Direct role check
data = {'accessToken': 'your_token_here'}
response = requests.post('http://localhost:3000/check-role', json=data)
print(response.json())
```

## 🚨 Error Handling

### Common Error Responses

#### 403 - Access Denied
```json
{
  "hasRole": false,
  "error": "Access denied - user may not be in the guild or lacks permissions",
  "success": false
}
```

#### 404 - User Not in Guild
```json
{
  "hasRole": false,
  "error": "User is not a member of this guild",
  "success": false
}
```

#### 429 - Rate Limited
```json
{
  "hasRole": false,
  "error": "Rate limited - try again later",
  "success": false
}
```

### Error Codes
- **10004** - Unknown Guild (guild not found or user not a member)
- **50013** - Missing Permissions (bot lacks required permissions)
- **50001** - Missing Access (bot not in guild)

## 🔧 Configuration

### Environment Variables
```bash
CLIENT_ID=1404438843112820756
CLIENT_SECRET=your_client_secret_here
REDIRECT_URI=http://localhost:3000/callback
GUILD_ID=1036357772826120242
ROLE_ID=1051562453495971941
PORT=3000
SESSION_SECRET=your_session_secret
```

### Discord Application Settings
1. **OAuth2 Redirects**: Add `http://localhost:3000/callback`
2. **Scopes**: Ensure `identify` and `guilds.members.read` are available
3. **Bot Permissions**: Not required (OAuth2 only)

## 📊 Rate Limits

- **Discord API**: 50 requests/second per token
- **OAuth2 Tokens**: Valid for 7 days
- **Recommendation**: Cache results when possible

## 🚀 Deployment

### Local Development
```bash
npm run dev:api
```

### Production
```bash
npm run api
```

### Environment Setup
1. Copy `env.example` to `.env`
2. Fill in your Discord Client Secret
3. Update redirect URI for production

## 🔒 Security Considerations

- **HTTPS Required**: Use HTTPS in production
- **Client Secret**: Keep secret, never expose in client code
- **Token Storage**: Don't store access tokens permanently
- **CORS**: Configure CORS for your domain in production

## 📱 Testing

### Test Client
Open `test-client.html` in your browser to test all API endpoints.

### Manual Testing
1. Start the API: `npm run api`
2. Visit: `http://localhost:3000/health`
3. Test OAuth2: `http://localhost:3000/login`
4. Check API docs: `http://localhost:3000/api`

## 🤝 Support

For issues or questions:
1. Check the health endpoint for configuration
2. Verify Discord application settings
3. Ensure user is a member of the specified guild
4. Check Discord API status

---

**Note**: This API works without requiring a bot in the Discord server by using Discord's OAuth2 API with the `guilds.members.read` scope.
