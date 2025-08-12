# 🔗 Discord Role Checker API Integration Guide

A comprehensive guide showing how to integrate the Discord Role Checker API into your applications, websites, and platforms.

## 🚀 Quick Start

**API Base URL**: `https://discord-role-checker.vercel.app`

**Basic Flow**:
1. User clicks "Connect Discord" → Redirect to `/login`
2. User authorizes on Discord → Returns to your app with role data
3. Check roles and grant/deny access accordingly

## 🌐 Web Integration

### **Vanilla JavaScript**

#### **Basic Integration**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Discord Role Checker Demo</title>
</head>
<body>
    <div id="auth-section">
        <h2>🔒 Connect Discord to Continue</h2>
        <button onclick="connectDiscord()">🔐 Connect Discord</button>
    </div>
    
    <div id="content-section" style="display: none;">
        <h2>🎉 Welcome!</h2>
        <div id="role-info"></div>
    </div>

    <script>
        const API_BASE = 'https://discord-role-checker.vercel.app';
        
        // Check if user is returning from Discord OAuth2
        window.addEventListener('load', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            
            if (code) {
                handleOAuth2Callback(code);
            }
        });
        
        function connectDiscord() {
            window.location.href = `${API_BASE}/login`;
        }
        
        async function handleOAuth2Callback(code) {
            try {
                const response = await fetch(`${API_BASE}/callback?code=${code}`);
                const results = await response.json();
                
                if (results.success) {
                    displayUserRoles(results.results);
                    // Clear URL parameters
                    window.history.replaceState({}, document.title, window.location.pathname);
                } else {
                    alert('Authentication failed: ' + results.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Authentication failed. Please try again.');
            }
        }
        
        function displayUserRoles(userRoles) {
            const authSection = document.getElementById('auth-section');
            const contentSection = document.getElementById('content-section');
            const roleInfo = document.getElementById('role-info');
            
            authSection.style.display = 'none';
            contentSection.style.display = 'block';
            
            let roleHtml = '<h3>Your Discord Roles:</h3><ul>';
            
            Object.entries(userRoles).forEach(([guild, data]) => {
                const status = data.hasRole ? '✅' : '❌';
                roleHtml += `<li>${status} ${data.guildName}: ${data.roleName}</li>`;
            });
            
            roleHtml += '</ul>';
            roleInfo.innerHTML = roleHtml;
        }
    </script>
</body>
</html>
```

#### **Advanced Integration with Role Gating**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Role-Based Content Demo</title>
    <style>
        .gated-content { display: none; }
        .role-required { color: #ff6b6b; font-weight: bold; }
    </style>
</head>
<body>
    <div id="auth-section">
        <h2>🔒 Authentication Required</h2>
        <p>Connect your Discord account to access content based on your server roles.</p>
        <button onclick="connectDiscord()">🔐 Connect Discord</button>
    </div>
    
    <div id="content-section" style="display: none;">
        <h1>🎭 Role-Based Content</h1>
        
        <!-- Basic content - requires any Discord role -->
        <div class="gated-content" data-required-roles="any">
            <h2>🌟 Basic Access</h2>
            <p>This content is visible to anyone with a Discord account.</p>
        </div>
        
        <!-- NADS role required -->
        <div class="gated-content" data-required-roles="NADS">
            <h2>🎯 NADS Community</h2>
            <p>Exclusive content for NADS community members!</p>
            <div class="role-required">Requires: NADS Role</div>
        </div>
        
        <!-- SLMND role required -->
        <div class="gated-content" data-required-roles="SLMND">
            <h2>🌊 SLMND Riverborn</h2>
            <p>Premium content for SLMND Riverborn members!</p>
            <div class="role-required">Requires: SLMND Riverborn Role</div>
        </div>
        
        <!-- LAMOUCH role required -->
        <div class="gated-content" data-required-roles="LAMOUCH">
            <h2>🔥 LAMOUCH Mouch OG</h2>
            <p>VIP content for LAMOUCH Mouch OG members!</p>
            <div class="role-required">Requires: LAMOUCH Mouch OG Role</div>
        </div>
        
        <!-- Multiple roles required -->
        <div class="gated-content" data-required-roles="NADS,SLMND">
            <h2>🏆 Elite Access</h2>
            <p>Ultra-exclusive content for members with both NADS and SLMND roles!</p>
            <div class="role-required">Requires: NADS Role + SLMND Riverborn Role</div>
        </div>
    </div>

    <script>
        const API_BASE = 'https://discord-role-checker.vercel.app';
        let userRoles = null;
        
        window.addEventListener('load', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            
            if (code) {
                handleOAuth2Callback(code);
            }
        });
        
        function connectDiscord() {
            window.location.href = `${API_BASE}/login`;
        }
        
        async function handleOAuth2Callback(code) {
            try {
                const response = await fetch(`${API_BASE}/callback?code=${code}`);
                const results = await response.json();
                
                if (results.success) {
                    userRoles = results.results;
                    showContentBasedOnRoles();
                    // Clear URL parameters
                    window.history.replaceState({}, document.title, window.location.pathname);
                } else {
                    alert('Authentication failed: ' + results.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Authentication failed. Please try again.');
            }
        }
        
        function showContentBasedOnRoles() {
            const authSection = document.getElementById('auth-section');
            const contentSection = document.getElementById('content-section');
            
            authSection.style.display = 'none';
            contentSection.style.display = 'block';
            
            // Show content based on roles
            const gatedElements = document.querySelectorAll('.gated-content');
            
            gatedElements.forEach(element => {
                const requiredRoles = element.getAttribute('data-required-roles');
                
                if (requiredRoles === 'any') {
                    // Show for any authenticated user
                    element.style.display = 'block';
                } else if (requiredRoles.includes(',')) {
                    // Multiple roles required (AND logic)
                    const roles = requiredRoles.split(',').map(r => r.trim());
                    const hasAllRoles = roles.every(role => userRoles[role]?.hasRole);
                    element.style.display = hasAllRoles ? 'block' : 'none';
                } else {
                    // Single role required
                    const hasRole = userRoles[requiredRoles]?.hasRole;
                    element.style.display = hasRole ? 'block' : 'none';
                }
            });
        }
    </script>
</body>
</html>
```

### **React Integration**

#### **Discord Role Gate Component**

```jsx
import React, { useState, useEffect } from 'react';

const DiscordRoleGate = ({ 
    children, 
    requiredRoles = [], 
    fallback = null,
    onRoleCheck = null 
}) => {
    const [userRoles, setUserRoles] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = () => {
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
            const response = await fetch(
                `https://discord-role-checker.vercel.app/callback?code=${code}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const results = await response.json();
            
            if (results.success) {
                setUserRoles(results.results);
                
                // Call callback if provided
                if (onRoleCheck) {
                    onRoleCheck(results.results);
                }
                
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                setError(results.error || 'Authentication failed');
            }
        } catch (error) {
            console.error('Authentication failed:', error);
            setError('Authentication failed. Please try again.');
        }
        setIsLoading(false);
    };

    const authenticateWithDiscord = () => {
        window.location.href = 'https://discord-role-checker.vercel.app/login';
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <div>
                <h2>❌ Authentication Error</h2>
                <p>{error}</p>
                <button onClick={authenticateWithDiscord}>
                    🔐 Try Again
                </button>
            </div>
        );
    }

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
        return fallback || (
            <div>
                <h2>❌ Access Denied</h2>
                <p>You don't have the required Discord roles</p>
                <p>Required: {requiredRoles.join(', ')}</p>
            </div>
        );
    }

    return <div>{children}</div>;
};

export default DiscordRoleGate;
```

#### **Usage in React App**

```jsx
import React, { useState } from 'react';
import DiscordRoleGate from './DiscordRoleGate';

const App = () => {
    const [userRoles, setUserRoles] = useState(null);

    const handleRoleCheck = (roles) => {
        setUserRoles(roles);
        console.log('User roles:', roles);
    };

    return (
        <div className="App">
            <h1>🎭 Discord Role-Based Website</h1>
            
            {/* Basic content - requires any Discord role */}
            <DiscordRoleGate onRoleCheck={handleRoleCheck}>
                <div className="content-section">
                    <h2>🌟 Welcome!</h2>
                    <p>This content is visible to authenticated Discord users.</p>
                </div>
            </DiscordRoleGate>
            
            {/* NADS role required */}
            <DiscordRoleGate requiredRoles={['NADS']}>
                <div className="content-section">
                    <h2>🎯 NADS Community</h2>
                    <p>Exclusive content for NADS community members!</p>
                    <ul>
                        <li>Community events</li>
                        <li>Exclusive channels</li>
                        <li>Special perks</li>
                    </ul>
                </div>
            </DiscordRoleGate>
            
            {/* SLMND role required */}
            <DiscordRoleGate requiredRoles={['SLMND']}>
                <div className="content-section">
                    <h2>🌊 SLMND Riverborn</h2>
                    <p>Premium content for SLMND Riverborn members!</p>
                    <ul>
                        <li>Premium features</li>
                        <li>Early access</li>
                        <li>VIP support</li>
                    </ul>
                </div>
            </DiscordRoleGate>
            
            {/* Multiple roles required */}
            <DiscordRoleGate requiredRoles={['NADS', 'SLMND']}>
                <div className="content-section">
                    <h2>🏆 Elite Access</h2>
                    <p>Ultra-exclusive content for elite members!</p>
                    <ul>
                        <li>Beta testing</li>
                        <li>Direct developer access</li>
                        <li>Custom features</li>
                    </ul>
                </div>
            </DiscordRoleGate>
            
            {/* Custom fallback */}
            <DiscordRoleGate 
                requiredRoles={['LAMOUCH']}
                fallback={
                    <div>
                        <h2>🔥 LAMOUCH Access</h2>
                        <p>This content requires the LAMOUCH Mouch OG role.</p>
                        <p>Join the LAMOUCH community to unlock this content!</p>
                    </div>
                }
            >
                <div className="content-section">
                    <h2>🔥 LAMOUCH Mouch OG</h2>
                    <p>VIP content for LAMOUCH Mouch OG members!</p>
                </div>
            </DiscordRoleGate>
            
            {/* Display user roles */}
            {userRoles && (
                <div className="user-roles">
                    <h3>Your Discord Roles:</h3>
                    <div className="role-grid">
                        {Object.entries(userRoles).map(([guild, data]) => (
                            <div key={guild} className={`role-card ${data.hasRole ? 'has-role' : 'no-role'}`}>
                                <h4>{data.guildName}</h4>
                                <p>{data.roleName}</p>
                                <span className="status">
                                    {data.hasRole ? '✅' : '❌'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
```

### **Vue.js Integration**

#### **Discord Role Gate Component**

```vue
<template>
  <div>
    <div v-if="!userRoles && !isLoading && !error">
      <h2>🔒 Access Restricted</h2>
      <p>Connect your Discord account to continue</p>
      <button @click="authenticateWithDiscord">
        🔐 Connect Discord
      </button>
    </div>
    
    <div v-else-if="isLoading">
      <div>Loading...</div>
    </div>
    
    <div v-else-if="error">
      <h2>❌ Authentication Error</h2>
      <p>{{ error }}</p>
      <button @click="authenticateWithDiscord">
        🔐 Try Again
      </button>
    </div>
    
    <div v-else-if="!hasRequiredRole">
      <h2>❌ Access Denied</h2>
      <p>You don't have the required Discord roles</p>
      <p v-if="requiredRoles.length > 0">
        Required: {{ requiredRoles.join(', ') }}
      </p>
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
      userRoles: null,
      isLoading: true,
      error: null
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
      } else {
        this.isLoading = false;
      }
    },
    
    async handleOAuth2Callback(code) {
      try {
        const response = await fetch(
          `https://discord-role-checker.vercel.app/callback?code=${code}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const results = await response.json();
        
        if (results.success) {
          this.userRoles = results.results;
          
          // Emit event for parent component
          this.$emit('role-check', results.results);
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          this.error = results.error || 'Authentication failed';
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        this.error = 'Authentication failed. Please try again.';
      }
      this.isLoading = false;
    },
    
    authenticateWithDiscord() {
      window.location.href = 'https://discord-role-checker.vercel.app/login';
    }
  }
}
</script>
```

## 📱 Mobile Integration

### **React Native**

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Linking, Alert } from 'react-native';

const DiscordRoleChecker = ({ requiredRoles = [], children, fallback }) => {
    const [userRoles, setUserRoles] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const authenticateWithDiscord = async () => {
        try {
            const url = 'https://discord-role-checker.vercel.app/login';
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

    const checkUserRoles = async (accessToken) => {
        try {
            const response = await fetch(
                'https://discord-role-checker.vercel.app/callback',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ accessToken })
                }
            );
            
            const results = await response.json();
            
            if (results.success) {
                setUserRoles(results.results);
                return results.results;
            } else {
                throw new Error(results.error || 'Authentication failed');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to check user roles');
            return null;
        }
    };

    const hasRequiredRole = requiredRoles.length === 0 || 
        requiredRoles.some(role => userRoles?.[role]?.hasRole);

    if (!userRoles) {
        return (
            <View>
                <Text>🔒 Connect Discord to Continue</Text>
                <Button title="🔐 Connect Discord" onPress={authenticateWithDiscord} />
            </View>
        );
    }

    if (!hasRequiredRole) {
        return fallback || (
            <View>
                <Text>❌ Access Denied</Text>
                <Text>You don't have the required Discord roles</Text>
            </View>
        );
    }

    return children;
};

export default DiscordRoleChecker;
```

### **Flutter**

```dart
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class DiscordRoleChecker extends StatefulWidget {
  final List<String> requiredRoles;
  final Widget child;
  final Widget? fallback;

  const DiscordRoleChecker({
    Key? key,
    this.requiredRoles = const [],
    required this.child,
    this.fallback,
  }) : super(key: key);

  @override
  _DiscordRoleCheckerState createState() => _DiscordRoleCheckerState();
}

class _DiscordRoleCheckerState extends State<DiscordRoleChecker> {
  Map<String, dynamic>? userRoles;
  bool isLoading = false;

  Future<void> authenticateWithDiscord() async {
    const url = 'https://discord-role-checker.vercel.app/login';
    
    if (await canLaunch(url)) {
      await launch(url);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Cannot open Discord authentication')),
      );
    }
  }

  Future<void> checkUserRoles(String accessToken) async {
    try {
      final response = await http.post(
        Uri.parse('https://discord-role-checker.vercel.app/callback'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'accessToken': accessToken}),
      );

      if (response.statusCode == 200) {
        final results = json.decode(response.body);
        if (results['success'] == true) {
          setState(() {
            userRoles = results['results'];
          });
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to check user roles')),
      );
    }
  }

  bool get hasRequiredRole {
    if (widget.requiredRoles.isEmpty) return true;
    return widget.requiredRoles.any((role) => 
      userRoles?[role]?['hasRole'] == true
    );
  }

  @override
  Widget build(BuildContext context) {
    if (userRoles == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('🔒 Connect Discord to Continue'),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: authenticateWithDiscord,
              child: Text('🔐 Connect Discord'),
            ),
          ],
        ),
      );
    }

    if (!hasRequiredRole) {
      return widget.fallback ?? Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('❌ Access Denied'),
            Text('You don\'t have the required Discord roles'),
          ],
        ),
      );
    }

    return widget.child;
  }
}
```

## 🔧 Backend Integration

### **Node.js/Express**

```javascript
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

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
    
    if (!discordToken) {
        return res.status(401).json({ error: 'Discord token required' });
    }

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

// Check multiple roles
app.get('/check-roles', async (req, res) => {
    const { discordToken } = req.headers;
    
    if (!discordToken) {
        return res.status(401).json({ error: 'Discord token required' });
    }

    try {
        const [nadsResponse, slmndResponse, lamouchResponse] = await Promise.all([
            axios.get(`${API_BASE}/nads`, {
                headers: { Authorization: `Bearer ${discordToken}` }
            }),
            axios.get(`${API_BASE}/slmnd`, {
                headers: { Authorization: `Bearer ${discordToken}` }
            }),
            axios.get(`${API_BASE}/lamouch`, {
                headers: { Authorization: `Bearer ${discordToken}` }
            })
        ]);

        const roles = {
            NADS: nadsResponse.data,
            SLMND: slmndResponse.data,
            LAMOUCH: lamouchResponse.data
        };

        res.json({
            success: true,
            roles,
            summary: {
                totalGuilds: 3,
                rolesHeld: Object.values(roles).filter(r => r.hasRole).length,
                totalRoles: 3
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check roles' });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
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

@app.route('/check-roles')
def check_roles():
    discord_token = request.headers.get('Discord-Token')
    
    if not discord_token:
        return jsonify({'error': 'Discord token required'}), 401
    
    try:
        # Check all roles
        nads_response = requests.get(f'{API_BASE}/nads', headers={
            'Authorization': f'Bearer {discord_token}'
        })
        
        slmnd_response = requests.get(f'{API_BASE}/slmnd', headers={
            'Authorization': f'Bearer {discord_token}'
        })
        
        lamouch_response = requests.get(f'{API_BASE}/lamouch', headers={
            'Authorization': f'Bearer {discord_token}'
        })
        
        roles = {
            'NADS': nads_response.json() if nads_response.status_code == 200 else None,
            'SLMND': slmnd_response.json() if slmnd_response.status_code == 200 else None,
            'LAMOUCH': lamouch_response.json() if lamouch_response.status_code == 200 else None
        }
        
        roles_held = sum(1 for role in roles.values() if role and role.get('hasRole'))
        
        return jsonify({
            'success': True,
            'roles': roles,
            'summary': {
                'totalGuilds': 3,
                'rolesHeld': roles_held,
                'totalRoles': 3
            }
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to check roles'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)
```

## 🎯 Use Case Examples

### **E-commerce Role-Based Pricing**

```javascript
class RoleBasedPricing {
    constructor() {
        this.pricing = {
            'NADS': { discount: 0.10, name: 'NADS Member' },
            'SLMND': { discount: 0.20, name: 'SLMND Riverborn' },
            'LAMOUCH': { discount: 0.30, name: 'LAMOUCH Mouch OG' }
        };
    }
    
    async checkUserDiscount(code) {
        const response = await fetch(
            `https://discord-role-checker.vercel.app/callback?code=${code}`
        );
        const results = await response.json();
        
        if (results.success) {
            return this.calculateDiscount(results.results);
        }
        return null;
    }
    
    calculateDiscount(userRoles) {
        let maxDiscount = 0;
        let discountName = '';
        
        Object.entries(userRoles).forEach(([guild, data]) => {
            if (data.hasRole && this.pricing[guild]) {
                if (this.pricing[guild].discount > maxDiscount) {
                    maxDiscount = this.pricing[guild].discount;
                    discountName = this.pricing[guild].name;
                }
            }
        });
        
        return {
            discount: maxDiscount,
            name: discountName,
            hasDiscount: maxDiscount > 0
        };
    }
    
    applyDiscount(price, discount) {
        return price * (1 - discount);
    }
}

// Usage
const pricing = new RoleBasedPricing();
const discount = await pricing.checkUserDiscount(code);

if (discount.hasDiscount) {
    const originalPrice = 100;
    const discountedPrice = pricing.applyDiscount(originalPrice, discount.discount);
    console.log(`${discount.name} discount applied: $${discountedPrice}`);
}
```

### **Gaming Platform Access Control**

```javascript
class GamingPlatformAccess {
    constructor() {
        this.accessLevels = {
            'NADS': ['basic-games', 'community-chat'],
            'SLMND': ['basic-games', 'community-chat', 'premium-games', 'beta-access'],
            'LAMOUCH': ['basic-games', 'community-chat', 'premium-games', 'beta-access', 'vip-lounge', 'custom-skins']
        };
    }
    
    async unlockUserFeatures(code) {
        const response = await fetch(
            `https://discord-role-checker.vercel.app/callback?code=${code}`
        );
        const results = await response.json();
        
        if (results.success) {
            return this.determineAccessLevel(results.results);
        }
        return null;
    }
    
    determineAccessLevel(userRoles) {
        const unlockedFeatures = new Set();
        
        Object.entries(userRoles).forEach(([guild, data]) => {
            if (data.hasRole && this.accessLevels[guild]) {
                this.accessLevels[guild].forEach(feature => {
                    unlockedFeatures.add(feature);
                });
            }
        });
        
        return {
            features: Array.from(unlockedFeatures),
            totalFeatures: unlockedFeatures.size,
            hasPremium: unlockedFeatures.has('premium-games'),
            hasVIP: unlockedFeatures.has('vip-lounge')
        };
    }
    
    unlockFeature(featureName) {
        const element = document.querySelector(`[data-feature="${featureName}"]`);
        if (element) {
            element.classList.remove('locked');
            element.classList.add('unlocked');
        }
    }
}
```

## 🔒 Security Best Practices

### **Token Storage**

```javascript
// ❌ Don't store tokens in localStorage
localStorage.setItem('discord_token', token);

// ✅ Use secure HTTP-only cookies or server-side storage
// Server-side example:
app.post('/store-token', (req, res) => {
    const { token } = req.body;
    // Store in database with user ID
    // Return session ID
});

// ✅ Use secure session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        httpOnly: true,
        sameSite: 'strict'
    }
}));
```

### **Role Validation**

```javascript
// Always validate roles server-side
const validateUserAccess = async (req, res, next) => {
    const { userId } = req.session;
    const { requiredRole } = req.params;
    
    try {
        // Get user's stored Discord token
        const user = await User.findById(userId);
        const discordToken = user.discordToken;
        
        // Validate with Discord API
        const response = await axios.get(
            `https://discord-role-checker.vercel.app/${requiredRole.toLowerCase()}`,
            {
                headers: { Authorization: `Bearer ${discordToken}` }
            }
        );
        
        if (response.data.hasRole) {
            next();
        } else {
            res.status(403).json({ error: 'Access denied' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Validation failed' });
    }
};
```

## 📊 Analytics & Monitoring

### **Track Role Usage**

```javascript
class RoleAnalytics {
    constructor() {
        this.events = [];
    }
    
    trackRoleCheck(userId, guildName, hasRole, timestamp) {
        this.events.push({
            userId,
            guildName,
            hasRole,
            timestamp,
            event: 'role_check'
        });
        
        // Send to analytics service
        this.sendToAnalytics({
            event: 'role_check',
            data: { userId, guildName, hasRole, timestamp }
        });
    }
    
    trackAccessGranted(userId, feature, requiredRoles) {
        this.events.push({
            userId,
            feature,
            requiredRoles,
            timestamp: new Date(),
            event: 'access_granted'
        });
    }
    
    getRoleStats() {
        const stats = {};
        
        this.events.forEach(event => {
            if (event.event === 'role_check') {
                if (!stats[event.guildName]) {
                    stats[event.guildName] = { total: 0, hasRole: 0 };
                }
                stats[event.guildName].total++;
                if (event.hasRole) {
                    stats[event.guildName].hasRole++;
                }
            }
        });
        
        return stats;
    }
}
```

## 🚀 Deployment Checklist

### **Production Setup**

- [ ] Use HTTPS for all API calls
- [ ] Implement proper error handling
- [ ] Add rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure CORS properly
- [ ] Use environment variables for sensitive data
- [ ] Implement token refresh logic
- [ ] Add health checks

### **Testing**

- [ ] Test OAuth2 flow end-to-end
- [ ] Test role checking with various users
- [ ] Test error scenarios
- [ ] Test rate limiting
- [ ] Test with different browsers/devices

---

**Ready to integrate? Choose the framework that fits your needs and start building!** 🚀

For more detailed API information, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).
