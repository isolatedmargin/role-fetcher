# 🔐 Discord Role Checker API - Integration Guide

A comprehensive guide on how to integrate the Discord Role Checker API for gated content, access control, and role-based features.

## 🚀 Live API Endpoints

- **Base URL**: https://discord-role-checker.vercel.app
- **Health Check**: `/health`
- **API Docs**: `/api`
- **OAuth2 Login**: `/login`
- **OAuth2 Callback**: `/callback`
- **Guild Info**: `/nads`, `/slmnd`, `/lamouch`

## 🎯 Use Cases

### 1. **Gated Content Websites**
- Restrict access based on Discord server membership
- Show different content for different role levels
- Premium features for specific Discord roles

### 2. **Access Control Systems**
- Discord-based authentication for web applications
- Role-based permissions and features
- Community-exclusive content

### 3. **Gaming & Community Platforms**
- Verify Discord server membership
- Unlock features based on Discord roles
- Community integration

## 📱 Integration Examples

### **HTML/JavaScript - Simple Button Integration**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Discord Role Checker Integration</title>
</head>
<body>
    <h1>🎯 My Gated Website</h1>
    
    <!-- Gate Screen -->
    <div id="gateScreen">
        <h2>🔒 Access Restricted</h2>
        <p>This content is only available to Discord users with specific roles.</p>
        <button onclick="checkDiscordAccess()">🔐 Connect Discord</button>
    </div>
    
    <!-- Main Content (Hidden until authenticated) -->
    <div id="mainContent" style="display: none;">
        <h2>🎉 Welcome!</h2>
        <p>You have access to the gated content.</p>
        <div id="roleStatus"></div>
        <button onclick="logout()">🚪 Logout</button>
    </div>

    <script>
        const API_BASE = 'https://discord-role-checker.vercel.app';
        
        function checkDiscordAccess() {
            // Redirect to Discord OAuth2
            window.location.href = `${API_BASE}/login`;
        }
        
        function logout() {
            localStorage.removeItem('discordRoleResults');
            document.getElementById('gateScreen').style.display = 'block';
            document.getElementById('mainContent').style.display = 'none';
        }
        
        // Check if user is already authenticated
        window.addEventListener('load', () => {
            const storedResults = localStorage.getItem('discordRoleResults');
            if (storedResults) {
                try {
                    const results = JSON.parse(storedResults);
                    if (results.success) {
                        showMainContent(results.results);
                    }
                } catch (error) {
                    console.error('Error parsing stored results:', error);
                }
            }
        });
        
        function showMainContent(userRoles) {
            document.getElementById('gateScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            
            // Display role status
            const roleStatusDiv = document.getElementById('roleStatus');
            roleStatusDiv.innerHTML = '<h3>Your Discord Roles:</h3>';
            
            Object.entries(userRoles).forEach(([guildName, result]) => {
                const status = result.hasRole ? '✅' : '❌';
                roleStatusDiv.innerHTML += `
                    <p>${status} ${guildName}: ${result.roleName}</p>
                `;
            });
        }
    </script>
</body>
</html>
```

### **React Component - Role-Based Access Control**

```jsx
import React, { useState, useEffect } from 'react';

const DiscordRoleGate = ({ children, requiredRoles = [] }) => {
    const [userRoles, setUserRoles] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    const API_BASE = 'https://discord-role-checker.vercel.app';

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = () => {
        const storedResults = localStorage.getItem('discordRoleResults');
        if (storedResults) {
            try {
                const results = JSON.parse(storedResults);
                if (results.success) {
                    setUserRoles(results.results);
                    checkAccess(results.results);
                }
            } catch (error) {
                console.error('Error parsing stored results:', error);
            }
        }
        setIsLoading(false);
    };

    const checkAccess = (roles) => {
        if (requiredRoles.length === 0) {
            setHasAccess(true);
            return;
        }

        const hasRequiredRole = requiredRoles.some(role => 
            roles[role]?.hasRole
        );
        setHasAccess(hasRequiredRole);
    };

    const authenticateWithDiscord = () => {
        window.location.href = `${API_BASE}/login`;
    };

    const logout = () => {
        localStorage.removeItem('discordRoleResults');
        setUserRoles(null);
        setHasAccess(false);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!hasAccess) {
        return (
            <div className="discord-gate">
                <h2>🔒 Access Restricted</h2>
                <p>This content requires Discord authentication.</p>
                <button onClick={authenticateWithDiscord}>
                    🔐 Connect Discord
                </button>
            </div>
        );
    }

    return (
        <div className="discord-content">
            {children}
            <button onClick={logout}>🚪 Logout</button>
        </div>
    );
};

// Usage Example
const App = () => {
    return (
        <div>
            <h1>My Website</h1>
            
            {/* Basic content - requires any Discord role */}
            <DiscordRoleGate>
                <h2>Basic Content</h2>
                <p>This is visible to authenticated Discord users.</p>
            </DiscordRoleGate>
            
            {/* Premium content - requires SLMND role */}
            <DiscordRoleGate requiredRoles={['SLMND']}>
                <h2>Premium Content</h2>
                <p>This is only visible to SLMND Riverborn members.</p>
            </DiscordRoleGate>
            
            {/* VIP content - requires LAMOUCH role */}
            <DiscordRoleGate requiredRoles={['LAMOUCH']}>
                <h2>VIP Content</h2>
                <p>This is only visible to LAMOUCH Mouch OG members.</p>
            </DiscordRoleGate>
        </div>
    );
};

export default App;
```

### **React Native - Mobile App Integration**

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';

const DiscordAuth = ({ onAuthenticated }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRoles, setUserRoles] = useState(null);

    const API_BASE = 'https://discord-role-checker.vercel.app';

    useEffect(() => {
        checkStoredAuth();
    }, []);

    const checkStoredAuth = () => {
        // Check AsyncStorage or other storage for authentication
        // This is a simplified example
        const stored = localStorage.getItem('discordRoleResults');
        if (stored) {
            try {
                const results = JSON.parse(stored);
                if (results.success) {
                    setUserRoles(results.results);
                    setIsAuthenticated(true);
                    onAuthenticated(results.results);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        }
    };

    const authenticateWithDiscord = async () => {
        try {
            const url = `${API_BASE}/login`;
            const supported = await Linking.canOpenURL(url);
            
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Cannot open Discord authentication');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to open Discord authentication');
        }
    };

    const logout = () => {
        localStorage.removeItem('discordRoleResults');
        setUserRoles(null);
        setIsAuthenticated(false);
        onAuthenticated(null);
    };

    if (isAuthenticated) {
        return (
            <View style={styles.authenticated}>
                <Text style={styles.title}>🎉 Authenticated!</Text>
                <Text>Your Discord roles:</Text>
                {userRoles && Object.entries(userRoles).map(([guild, role]) => (
                    <Text key={guild}>
                        {role.hasRole ? '✅' : '❌'} {guild}: {role.roleName}
                    </Text>
                ))}
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.gate}>
            <Text style={styles.title}>🔒 Access Restricted</Text>
            <Text>Connect your Discord account to continue</Text>
            <TouchableOpacity style={styles.authButton} onPress={authenticateWithDiscord}>
                <Text style={styles.buttonText}>🔐 Connect Discord</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = {
    gate: {
        padding: 20,
        alignItems: 'center',
    },
    authenticated: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    authButton: {
        backgroundColor: '#7289da',
        padding: 15,
        borderRadius: 25,
        marginTop: 20,
    },
    logoutButton: {
        backgroundColor: '#ff6b6b',
        padding: 15,
        borderRadius: 25,
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
};

export default DiscordAuth;
```

### **Node.js/Express - Backend Integration**

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
        // Check user's roles using the API
        const response = await axios.post(`${API_BASE}/check-role/nads`, {
            accessToken: discordToken
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
        const response = await axios.post(`${API_BASE}/check-role/slmnd`, {
            accessToken: discordToken
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

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

### **Python/Flask - Backend Integration**

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
            response = requests.post(f'{API_BASE}/check-role/nads', json={
                'accessToken': discord_token
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
        response = requests.post(f'{API_BASE}/check-role/slmnd', json={
            'accessToken': discord_token
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

if __name__ == '__main__':
    app.run(debug=True)
```

## 🔐 OAuth2 Flow Integration

### **Complete Flow:**

1. **User clicks button** → Redirect to `/login`
2. **Discord OAuth2** → User authorizes
3. **Callback** → Your app receives role results
4. **Store results** → Save in localStorage/session
5. **Check access** → Verify roles for protected content

### **Handling the Callback:**

```javascript
// In your callback handler
function handleOAuth2Callback(code) {
    // Exchange code for access token (handled by your API)
    // Then redirect back to your app with results
    
    // Example redirect:
    window.location.href = `yourapp://callback?hasRole=true&guild=NADS`;
}
```

## 🎯 Role-Based Access Control

### **Access Levels:**

- **Basic Access**: NADS role required
- **Premium Access**: SLMND Riverborn role required  
- **VIP Access**: LAMOUCH Mouch OG role required

### **Implementation:**

```javascript
function checkAccessLevel(userRoles) {
    const hasNADS = userRoles.NADS?.hasRole || false;
    const hasSLMND = userRoles.SLMND?.hasRole || false;
    const hasLAMOUCH = userRoles.LAMOUCH?.hasRole || false;

    if (hasLAMOUCH) return 'VIP';
    if (hasSLMND) return 'Premium';
    if (hasNADS) return 'Basic';
    return 'None';
}
```

## 🚀 Best Practices

1. **Store authentication state** in localStorage or secure session
2. **Handle token expiration** gracefully
3. **Implement proper error handling** for API failures
4. **Use HTTPS** in production
5. **Cache role results** to reduce API calls
6. **Implement logout functionality** to clear stored data

## 🔧 Testing

### **Test URLs:**

- **Gated Demo**: https://discord-role-checker.vercel.app/gated-demo.html
- **API Health**: https://discord-role-checker.vercel.app/health
- **API Docs**: https://discord-role-checker.vercel.app/api

### **Test with Mock Data:**

```javascript
// For development/testing
const mockUserRoles = {
    NADS: { hasRole: true, roleName: 'NADS Role' },
    SLMND: { hasRole: false, roleName: 'Riverborn' },
    LAMOUCH: { hasRole: true, roleName: 'Mouch OG' }
};
```

## 📚 Additional Resources

- **API Documentation**: [API.md](API.md)
- **Live Demo**: [Gated Demo](https://discord-role-checker.vercel.app/gated-demo.html)
- **Health Check**: [Health](https://discord-role-checker.vercel.app/health)

---

**Your Discord Role Checker API is ready for production use!** 🎉

Integrate it into your websites, apps, and platforms to create Discord-based access control systems.
