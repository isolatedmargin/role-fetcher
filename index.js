const express = require('express');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
const config = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes

// Home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Login route - redirects to Discord OAuth2
app.get('/login', (req, res) => {
  const params = new URLSearchParams({
    client_id: config.CLIENT_ID,
    redirect_uri: config.REDIRECT_URI,
    response_type: 'code',
    scope: config.SCOPES.join(' ')
  });
  
  const authUrl = `${config.OAUTH2_AUTHORIZE}?${params.toString()}`;
  res.redirect(authUrl);
});

// OAuth2 callback - exchanges code for access token
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(config.OAUTH2_TOKEN, new URLSearchParams({
      client_id: config.CLIENT_ID,
      client_secret: config.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: config.REDIRECT_URI
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Store tokens in session
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    req.session.tokenExpiry = Date.now() + (expires_in * 1000);
    
    // Get user info
    const userResponse = await axios.get(`${config.DISCORD_API}/users/@me`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    
    req.session.user = userResponse.data;
    
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('OAuth2 error:', error.response?.data || error.message);
    res.status(500).send('Authentication failed. Please try again.');
  }
});

// Dashboard - shows user info and role check
app.get('/dashboard', (req, res) => {
  if (!req.session.accessToken) {
    return res.redirect('/login');
  }
  
  res.sendFile(__dirname + '/public/dashboard.html');
});

// API endpoint to check if user has the specific role
app.get('/api/check-role', async (req, res) => {
  const { accessToken } = req.session;
  
  if (!accessToken) {
    return res.status(401).json({ 
      error: 'Not authenticated',
      message: 'Please login first'
    });
  }

  try {
    // Check if token is expired
    if (req.session.tokenExpiry && Date.now() > req.session.tokenExpiry) {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please login again'
      });
    }

    // Get user's member info from the specific guild
    const memberResponse = await axios.get(
      `${config.DISCORD_API}/users/@me/guilds/${config.GUILD_ID}/member`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const memberData = memberResponse.data;
    const hasRole = memberData.roles.includes(config.ROLE_ID);
    
    res.json({
      success: true,
      hasRole: hasRole,
      guildId: config.GUILD_ID,
      roleId: config.ROLE_ID,
      userRoles: memberData.roles,
      username: req.session.user?.username,
      guildName: memberData.guild_id ? 'Your Server' : 'Unknown'
    });

  } catch (error) {
    console.error('Error checking role:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      res.status(403).json({ 
        error: 'Access denied',
        message: 'Bot does not have permission to read this guild or user is not a member'
      });
    } else if (error.response?.status === 404) {
      res.status(404).json({ 
        error: 'Guild not found',
        message: 'User is not a member of this guild'
      });
    } else {
      res.status(500).json({ 
        error: 'Could not fetch roles',
        message: 'An error occurred while checking roles'
      });
    }
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    guildId: config.GUILD_ID,
    roleId: config.ROLE_ID
  });
});

// Start server
app.listen(config.PORT, () => {
  console.log(`🚀 Discord Role Checker Bot running on port ${config.PORT}`);
  console.log(`📱 Login URL: http://localhost:${config.PORT}/login`);
  console.log(`🏠 Home URL: http://localhost:${config.PORT}`);
  console.log(`🔍 Checking for role ${config.ROLE_ID} in guild ${config.GUILD_ID}`);
});
