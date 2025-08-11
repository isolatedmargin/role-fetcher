const express = require('express');
const axios = require('axios');
const cors = require('cors');
const config = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    guildId: config.GUILD_ID,
    roleId: config.ROLE_ID,
    clientId: config.CLIENT_ID
  });
});

// Login endpoint - redirects to Discord OAuth2
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

// OAuth2 callback - exchanges code for token and checks role
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ 
      error: 'No authorization code provided',
      hasRole: false 
    });
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

    const { access_token } = tokenResponse.data;
    
    // Get user's member info from the specific guild
    const memberResponse = await axios.get(
      `${config.DISCORD_API}/users/@me/guilds/${config.GUILD_ID}/member`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    );

    const memberData = memberResponse.data;
    const hasRole = memberData.roles.includes(config.ROLE_ID);
    
    // Return simple JSON response
    res.json({
      hasRole: hasRole,
      guildId: config.GUILD_ID,
      roleId: config.ROLE_ID,
      success: true
    });

  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    
    let errorMessage = 'Failed to check role';
    let statusCode = 500;
    
    if (error.response?.status === 403) {
      errorMessage = 'Access denied - user may not be in the guild or lacks permissions';
      statusCode = 403;
    } else if (error.response?.status === 404) {
      errorMessage = 'User is not a member of this guild';
      statusCode = 404;
    } else if (error.response?.status === 429) {
      errorMessage = 'Rate limited - try again later';
      statusCode = 429;
    }
    
    res.status(statusCode).json({ 
      hasRole: false,
      error: errorMessage,
      success: false
    });
  }
});

// Direct role check endpoint (if you want to check without OAuth2 flow)
app.post('/check-role', async (req, res) => {
  const { accessToken } = req.body;
  
  if (!accessToken) {
    return res.status(400).json({ 
      error: 'Access token required',
      hasRole: false 
    });
  }

  try {
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
      hasRole: hasRole,
      guildId: config.GUILD_ID,
      roleId: config.ROLE_ID,
      success: true
    });

  } catch (error) {
    console.error('Role check error:', error.response?.data || error.message);
    
    let errorMessage = 'Failed to check role';
    let statusCode = 500;
    
    if (error.response?.status === 403) {
      errorMessage = 'Access denied';
      statusCode = 403;
    } else if (error.response?.status === 404) {
      errorMessage = 'User not in guild';
      statusCode = 404;
    }
    
    res.status(statusCode).json({ 
      hasRole: false,
      error: errorMessage,
      success: false
    });
  }
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Discord Role Checker API',
    version: '1.0.0',
    description: 'Lightweight API to check Discord role membership',
    endpoints: {
      '/health': 'GET - Health check and configuration info',
      '/login': 'GET - Redirect to Discord OAuth2',
      '/callback': 'GET - OAuth2 callback and role check',
      '/check-role': 'POST - Direct role check with access token',
      '/api': 'GET - This API documentation'
    },
    configuration: {
      guildId: config.GUILD_ID,
      roleId: config.ROLE_ID,
      clientId: config.CLIENT_ID,
      scopes: config.SCOPES
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    hasRole: false,
    success: false
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    hasRole: false,
    success: false
  });
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Discord Role Checker API running on port ${PORT}`);
  console.log(`📱 Login URL: http://localhost:${PORT}/login`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api`);
  console.log(`🔍 Checking for role ${config.ROLE_ID} in guild ${config.GUILD_ID}`);
});

module.exports = app;
