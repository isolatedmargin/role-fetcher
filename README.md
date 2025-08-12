# 🔐 Discord Role Checker API

A production-ready API service that allows you to check Discord user roles across multiple guilds using OAuth2 authentication. Perfect for gating content, access control, and role-based features in your applications.

## 🚀 Live API

**Base URL**: `https://discord-role-checker.vercel.app`

## ✨ Features

- **Multi-Guild Support**: Check roles across multiple Discord servers
- **OAuth2 Authentication**: Secure Discord user authentication
- **Role Verification**: Verify specific roles in specific guilds
- **Clean API Responses**: Simple boolean responses for easy integration
- **Production Ready**: Deployed on Vercel with proper error handling
- **Rate Limit Handling**: Graceful handling of Discord API rate limits

## 🎯 Use Cases

- **Gated Content**: Restrict access based on Discord server membership
- **Access Control**: Role-based permissions and features
- **Community Platforms**: Verify Discord server membership
- **Gaming Platforms**: Unlock features based on Discord roles
- **Premium Services**: Different access levels for different roles

## 🔧 API Endpoints

### **Authentication**
- `GET /login` - Redirect to Discord OAuth2
- `GET /callback` - OAuth2 callback (returns role results)

### **Role Checking**
- `GET /nads` - Check NADS role (Guild: 1036357772826120242, Role: 1051562453495971941)
- `GET /slmnd` - Check SLMND Riverborn role (Guild: 1325852385054031902, Role: 1329565499335381033)
- `GET /lamouch` - Check LAMOUCH Mouch OG role (Guild: 1329166769566388264, Role: 1337881787409371372)

### **Utility**
- `GET /health` - API health check
- `GET /api` - API documentation

## 📱 Quick Start

### **1. Basic Role Check**

```javascript
// Check if user has NADS role
const response = await fetch('https://discord-role-checker.vercel.app/nads', {
    headers: {
        'Authorization': 'Bearer USER_ACCESS_TOKEN'
    }
});

const result = await response.json();
console.log(result.hasRole); // true/false
```

### **2. OAuth2 Flow Integration**

```javascript
// Step 1: Redirect user to Discord OAuth2
function authenticateWithDiscord() {
    window.location.href = 'https://discord-role-checker.vercel.app/login';
}

// Step 2: Handle callback (user will be redirected back with role results)
// The callback will return comprehensive role information
```

## 🔐 OAuth2 Integration

### **Complete Flow Example**

```javascript
class DiscordRoleChecker {
    constructor() {
        this.apiBase = 'https://discord-role-checker.vercel.app';
    }

    // Start Discord authentication
    authenticate() {
        window.location.href = `${this.apiBase}/login`;
    }

    // Handle callback results (called when user returns from Discord)
    async handleCallback(code) {
        try {
            const response = await fetch(`${this.apiBase}/callback?code=${code}`);
            const results = await response.json();
            
            if (results.success) {
                // Check specific roles
                const hasNADS = results.results.NADS?.hasRole || false;
                const hasSLMND = results.results.SLMND?.hasRole || false;
                const hasLAMOUCH = results.results.LAMOUCH?.hasRole || false;
                
                return { hasNADS, hasSLMND, hasLAMOUCH };
            }
        } catch (error) {
            console.error('Authentication failed:', error);
        }
    }
}
```

## 🎨 Frontend Integration Examples

### **React Component**

```jsx
import React, { useState, useEffect } from 'react';

const DiscordRoleGate = ({ children, requiredRoles = [] }) => {
    const [userRoles, setUserRoles] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = () => {
        // Check if user is returning from Discord OAuth2
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            handleOAuth2Callback(code);
        } else {
            setIsLoading(false);
        }
    };

    const handleOAuth2Callback = async (code) => {
        try {
            const response = await fetch(`https://discord-role-checker.vercel.app/callback?code=${code}`);
            const results = await response.json();
            
            if (results.success) {
                setUserRoles(results.results);
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (error) {
            console.error('Authentication failed:', error);
        }
        setIsLoading(false);
    };

    const authenticateWithDiscord = () => {
        window.location.href = 'https://discord-role-checker.vercel.app/login';
    };

    if (isLoading) return <div>Loading...</div>;

    if (!userRoles) {
        return (
            <div>
                <h2>🔒 Access Restricted</h2>
                <p>Connect your Discord account to continue</p>
                <button onClick={authenticateWithDiscord}>
                    🔐 Connect Discord
                </button>
            </div>
        );
    }

    // Check if user has required roles
    const hasRequiredRole = requiredRoles.length === 0 || 
        requiredRoles.some(role => userRoles[role]?.hasRole);

    if (!hasRequiredRole) {
        return (
            <div>
                <h2>❌ Access Denied</h2>
                <p>You don't have the required Discord roles</p>
            </div>
        );
    }

    return <div>{children}</div>;
};

// Usage
const App = () => (
    <div>
        <h1>My Website</h1>
        
        {/* Basic content - requires any Discord role */}
        <DiscordRoleGate>
            <h2>Basic Content</h2>
            <p>Visible to authenticated Discord users</p>
        </DiscordRoleGate>
        
        {/* Premium content - requires SLMND role */}
        <DiscordRoleGate requiredRoles={['SLMND']}>
            <h2>Premium Content</h2>
            <p>Only visible to SLMND Riverborn members</p>
        </DiscordRoleGate>
    </div>
);
```

### **Vue.js Component**

```vue
<template>
  <div>
    <div v-if="!userRoles">
      <h2>🔒 Access Restricted</h2>
      <p>Connect your Discord account to continue</p>
      <button @click="authenticateWithDiscord">
        🔐 Connect Discord
      </button>
    </div>
    
    <div v-else-if="!hasRequiredRole">
      <h2>❌ Access Denied</h2>
      <p>You don't have the required Discord roles</p>
    </div>
    
    <div v-else>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiscordRoleGate',
  props: {
    requiredRoles: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      userRoles: null
    }
  },
  computed: {
    hasRequiredRole() {
      if (this.requiredRoles.length === 0) return true;
      return this.requiredRoles.some(role => 
        this.userRoles[role]?.hasRole
      );
    }
  },
  mounted() {
    this.checkAuthentication();
  },
  methods: {
    checkAuthentication() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        this.handleOAuth2Callback(code);
      }
    },
    
    async handleOAuth2Callback(code) {
      try {
        const response = await fetch(
          `https://discord-role-checker.vercel.app/callback?code=${code}`
        );
        const results = await response.json();
        
        if (results.success) {
          this.userRoles = results.results;
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        console.error('Authentication failed:', error);
      }
    },
    
    authenticateWithDiscord() {
      window.location.href = 'https://discord-role-checker.vercel.app/login';
    }
  }
}
</script>
```

### **Vanilla JavaScript**

```javascript
class DiscordRoleChecker {
    constructor() {
        this.apiBase = 'https://discord-role-checker.vercel.app';
        this.userRoles = null;
        this.init();
    }

    init() {
        // Check if user is returning from Discord OAuth2
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            this.handleOAuth2Callback(code);
        }
    }

    async handleOAuth2Callback(code) {
        try {
            const response = await fetch(`${this.apiBase}/callback?code=${code}`);
            const results = await response.json();
            
            if (results.success) {
                this.userRoles = results.results;
                this.onAuthenticationSuccess();
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (error) {
            console.error('Authentication failed:', error);
            this.onAuthenticationError(error);
        }
    }

    authenticate() {
        window.location.href = `${this.apiBase}/login`;
    }

    hasRole(guildName) {
        return this.userRoles?.[guildName]?.hasRole || false;
    }

    hasAnyRole(roleNames) {
        return roleNames.some(role => this.hasRole(role));
    }

    hasAllRoles(roleNames) {
        return roleNames.every(role => this.hasRole(role));
    }

    onAuthenticationSuccess() {
        // Override this method to handle successful authentication
        console.log('Discord authentication successful:', this.userRoles);
    }

    onAuthenticationError(error) {
        // Override this method to handle authentication errors
        console.error('Discord authentication failed:', error);
    }
}

// Usage
const roleChecker = new DiscordRoleChecker();

// Check specific roles
if (roleChecker.hasRole('NADS')) {
    console.log('User has NADS role');
}

if (roleChecker.hasAnyRole(['SLMND', 'LAMOUCH'])) {
    console.log('User has at least one premium role');
}

if (roleChecker.hasAllRoles(['NADS', 'SLMND'])) {
    console.log('User has both NADS and SLMND roles');
}
```

## 🔧 Backend Integration

### **Node.js/Express**

```javascript
const express = require('express');
const axios = require('axios');

const app = express();
const API_BASE = 'https://discord-role-checker.vercel.app';

// Middleware to check Discord authentication
const requireDiscordAuth = async (req, res, next) => {
    const { discordToken } = req.headers;
    
    if (!discordToken) {
        return res.status(401).json({ error: 'Discord token required' });
    }

    try {
        // Check user's NADS role
        const response = await axios.get(`${API_BASE}/nads`, {
            headers: {
                Authorization: `Bearer ${discordToken}`
            }
        });

        if (response.data.hasRole) {
            req.userRoles = response.data;
            next();
        } else {
            res.status(403).json({ error: 'Access denied - NADS role required' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify Discord role' });
    }
};

// Protected route - requires NADS role
app.get('/protected-content', requireDiscordAuth, (req, res) => {
    res.json({
        message: 'Access granted to protected content',
        userRoles: req.userRoles
    });
});

// Premium route - requires SLMND role
app.get('/premium-content', async (req, res) => {
    const { discordToken } = req.headers;
    
    try {
        const response = await axios.get(`${API_BASE}/slmnd`, {
            headers: {
                Authorization: `Bearer ${discordToken}`
            }
        });

        if (response.data.hasRole) {
            res.json({
                message: 'Access granted to premium content',
                userRoles: response.data
            });
        } else {
            res.status(403).json({ error: 'Access denied - SLMND role required' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify Discord role' });
    }
});
```

### **Python/Flask**

```python
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)
API_BASE = 'https://discord-role-checker.vercel.app'

def require_discord_auth(f):
    def decorated_function(*args, **kwargs):
        discord_token = request.headers.get('Discord-Token')
        
        if not discord_token:
            return jsonify({'error': 'Discord token required'}), 401
        
        try:
            # Check user's NADS role
            response = requests.get(f'{API_BASE}/nads', headers={
                'Authorization': f'Bearer {discord_token}'
            })
            
            if response.status_code == 200 and response.json().get('hasRole'):
                return f(*args, **kwargs)
            else:
                return jsonify({'error': 'Access denied - NADS role required'}), 403
                
        except Exception as e:
            return jsonify({'error': 'Failed to verify Discord role'}), 500
    
    decorated_function.__name__ = f.__name__
    return decorated_function

@app.route('/protected-content')
@require_discord_auth
def protected_content():
    return jsonify({
        'message': 'Access granted to protected content',
        'status': 'authenticated'
    })

@app.route('/premium-content')
def premium_content():
    discord_token = request.headers.get('Discord-Token')
    
    if not discord_token:
        return jsonify({'error': 'Discord token required'}), 401
    
    try:
        # Check SLMND role
        response = requests.get(f'{API_BASE}/slmnd', headers={
            'Authorization': f'Bearer {discord_token}'
        })
        
        if response.status_code == 200 and response.json().get('hasRole'):
            return jsonify({
                'message': 'Access granted to premium content',
                'status': 'premium'
            })
        else:
            return jsonify({'error': 'Access denied - SLMND role required'}), 403
            
    except Exception as e:
        return jsonify({'error': 'Failed to verify Discord role'}), 500
```

## 📊 API Response Format

### **Role Check Response**

```json
{
  "guildId": "1036357772826120242",
  "guildName": "NADS",
  "roleId": "1051562453495971941",
  "roleName": "NADS Role",
  "hasRole": true,
  "success": true
}
```

### **OAuth2 Callback Response**

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

## 🚀 Deployment

### **Vercel (Recommended)**

1. **Fork this repository**
2. **Connect to Vercel**
3. **Set environment variables**:
   - `CLIENT_ID` - Your Discord application client ID
   - `CLIENT_SECRET` - Your Discord application client secret
   - `REDIRECT_URI` - Your callback URL
4. **Deploy**

### **Environment Variables**

```bash
CLIENT_ID=your_discord_client_id
CLIENT_SECRET=your_discord_client_secret
REDIRECT_URI=https://yourdomain.com/callback
```

## 🔒 Security Considerations

- **HTTPS Only**: Always use HTTPS in production
- **Token Storage**: Store access tokens securely
- **Rate Limiting**: Respect Discord API rate limits
- **Error Handling**: Implement proper error handling
- **User Consent**: Ensure users understand what data you're accessing

## 📚 Additional Resources

- **Discord Developer Portal**: https://discord.com/developers/applications
- **Discord OAuth2 Documentation**: https://discord.com/developers/docs/topics/oauth2
- **API Health Check**: https://discord-role-checker.vercel.app/health
- **API Documentation**: https://discord-role-checker.vercel.app/api

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you need help integrating this API:

1. Check the [API documentation](https://discord-role-checker.vercel.app/api)
2. Review the examples above
3. Open an issue on GitHub
4. Check the health endpoint: https://discord-role-checker.vercel.app/health

---

**Ready to integrate Discord role checking into your application? Start with the examples above and customize them for your needs!** 🚀
