const express = require('express');
const axios = require('axios');
const cors = require('cors');
const config = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    guilds: Object.keys(config.GUILDS).map(key => ({
      name: key,
      guildId: config.GUILDS[key].id,
      roleId: config.GUILDS[key].roleId,
      roleName: config.GUILDS[key].roleName
    })),
    clientId: config.CLIENT_ID
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Multi-Guild Discord Role Checker API',
    version: '2.0.0',
    description: 'API to check Discord role membership across multiple guilds',
    endpoints: {
      '/health': 'GET - Health check and configuration info',
      '/api': 'GET - This API documentation',
      '/login': 'GET - Redirect to Discord OAuth2',
      '/callback': 'GET - OAuth2 callback and role check for all guilds',
      '/check-role/:guild': 'POST - Check role for specific guild with access token',
      '/nads': 'GET - Check NADS role (guild: 1036357772826120242, role: 1051562453495971941)',
      '/slmnd': 'GET - Check SLMND Riverborn role (guild: 1325852385054031902, role: 1329565499335381033)',
      '/lamouch': 'GET - Check LAMOUCH Mouch OG role (guild: 1329166769566388264, role: 1337881787409371372)',
      '/nft-access': 'GET - Check if user can mint NFT (requires NADS role)',
      '/callback-clean': 'GET - Clean OAuth2 callback returning simple boolean for NFT access'
    },
    guilds: config.GUILDS
  });
});

// Login endpoint - redirects to Discord OAuth2
app.get('/login', (req, res) => {
  const { redirect } = req.query;
  const redirectUri = redirect ? `${config.REDIRECT_URI}?redirect=${encodeURIComponent(redirect)}` : config.REDIRECT_URI;
  
  const params = new URLSearchParams({
    client_id: config.CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.SCOPES.join(' ')
  });
  
  const authUrl = `${config.OAUTH2_AUTHORIZE}?${params.toString()}`;
  res.redirect(authUrl);
});

// OAuth2 callback - checks roles across ALL guilds
app.get('/callback', async (req, res) => {
  const { code, redirect } = req.query;
  
  if (!code) {
    return res.status(400).json({ 
      error: 'No authorization code provided',
      success: false 
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
    
    // Check NADS role specifically for NFT minting
    let canMint = false;
    let message = "Access denied: NADS role required";
    
    try {
      const memberResponse = await axios.get(
        `${config.DISCORD_API}/users/@me/guilds/${config.GUILDS.NADS.id}/member`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        }
      );
      
      canMint = memberResponse.data.roles.includes(config.GUILDS.NADS.roleId);
      message = canMint ? "Access granted: You can mint this NFT" : "Access denied: NADS role required";
      
    } catch (error) {
      console.error('Error checking NADS role:', error.response?.data || error.message);
      canMint = false;
      message = "Access denied: Unable to verify Discord role";
    }
    
    // If redirect parameter is provided, redirect back to the website with clean result
    if (redirect) {
      const redirectUrl = `${redirect}?canMint=${canMint}&message=${encodeURIComponent(message)}`;
      res.redirect(redirectUrl);
    } else {
      // Return clean JSON response
      res.json({
        canMint,
        message,
        accessToken: access_token
      });
    }
    
  } catch (error) {
    console.error('OAuth2 error:', error.response?.data || error.message);
    
    if (redirect) {
      const errorMessage = "Authentication failed: Could not verify Discord account";
      const redirectUrl = `${redirect}?canMint=false&message=${encodeURIComponent(errorMessage)}`;
      res.redirect(redirectUrl);
    } else {
      res.status(500).json({ 
        error: 'Failed to exchange authorization code',
        success: false 
      });
    }
  }
});

// Individual guild role check endpoints
app.get('/nads', async (req, res) => {
  res.json({
    endpoint: '/nads',
    guild: config.GUILDS.NADS,
    message: 'Use POST /check-role/nads with access token or GET /login for OAuth2 flow'
  });
});

app.get('/slmnd', async (req, res) => {
  res.json({
    endpoint: '/slmnd',
    guild: config.GUILDS.SLMND,
    message: 'Use POST /check-role/slmnd with access token or GET /login for OAuth2 flow'
  });
});

app.get('/lamouch', async (req, res) => {
  res.json({
    endpoint: '/lamouch',
    guild: config.GUILDS.LAMOUCH,
    message: 'Use POST /check-role/lamouch with access token or GET /login for OAuth2 flow'
  });
});

// Dynamic role check endpoint for specific guilds
app.post('/check-role/:guild', async (req, res) => {
  const { guild } = req.params;
  const { accessToken } = req.body;
  
  if (!accessToken) {
    return res.status(400).json({ 
      error: 'Access token required',
      success: false 
    });
  }

  if (!config.GUILDS[guild.toUpperCase()]) {
    return res.status(404).json({ 
      error: `Guild '${guild}' not found. Available guilds: ${Object.keys(config.GUILDS).join(', ')}`,
      success: false 
    });
  }

  const guildConfig = config.GUILDS[guild.toUpperCase()];

  try {
    const memberResponse = await axios.get(
      `${config.DISCORD_API}/users/@me/guilds/${guildConfig.id}/member`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const memberData = memberResponse.data;
    const hasRole = memberData.roles.includes(guildConfig.roleId);
    
    res.json({
      guild: guild.toUpperCase(),
      guildId: guildConfig.id,
      guildName: guildConfig.name,
      roleId: guildConfig.roleId,
      roleName: guildConfig.roleName,
      hasRole: hasRole,
      success: true
    });

  } catch (error) {
    console.error('Role check error:', error.response?.data || error.message);
    
    let errorMessage = 'Failed to check role';
    let statusCode = 500;
    
    if (error.response?.status === 403) {
      errorMessage = 'Access denied - user may not be in the guild or lacks permissions';
      statusCode = 403;
    } else if (error.response?.status === 404) {
      errorMessage = 'User not a member of this guild';
      statusCode = 404;
    }
    
    res.status(statusCode).json({ 
      guild: guild.toUpperCase(),
      guildId: guildConfig.id,
      guildName: guildConfig.name,
      roleId: guildConfig.roleId,
      roleName: guildConfig.roleName,
      hasRole: false,
      success: false,
      error: errorMessage
    });
  }
});

// New clean endpoint for NFT minting
app.get('/nft-access', async (req, res) => {
    try {
        // Check if user has NADS role (required for NFT minting)
        const nadsResponse = await axios.get(`${config.DISCORD_API}/users/@me/guilds/${config.GUILDS.NADS.id}/member`, {
            headers: {
                Authorization: `Bearer ${req.query.accessToken || req.headers.authorization?.replace('Bearer ', '')}`
            }
        });

        const hasNADSRole = nadsResponse.data.roles.includes(config.GUILDS.NADS.roleId);
        
        if (hasNADSRole) {
            res.json({
                canMint: true,
                message: "Access granted: You can mint this NFT"
            });
        } else {
            res.json({
                canMint: false,
                message: "Access denied: NADS role required"
            });
        }
    } catch (error) {
        console.error('Error checking NFT access:', error.response?.data || error.message);
        
        // Return clean error response
        res.json({
            canMint: false,
            message: "Access denied: Unable to verify Discord role"
        });
    }
});

// Clean callback endpoint that returns simple boolean
app.get('/callback-clean', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.json({
            canMint: false,
            message: "Authentication failed: No authorization code"
        });
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post(`${config.DISCORD_API}/oauth2/token`, new URLSearchParams({
            client_id: config.CLIENT_ID,
            client_secret: config.CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: config.REDIRECT_URI
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const accessToken = tokenResponse.data.access_token;

        // Check NADS role specifically for NFT minting
        try {
            const memberResponse = await axios.get(`${config.DISCORD_API}/users/@me/guilds/${config.GUILDS.NADS.id}/member`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            const hasNADSRole = memberResponse.data.roles.includes(config.GUILDS.NADS.roleId);
            
            if (hasNADSRole) {
                res.json({
                    canMint: true,
                    message: "Access granted: You can mint this NFT",
                    accessToken: accessToken
                });
            } else {
                res.json({
                    canMint: false,
                    message: "Access denied: NADS role required",
                    accessToken: accessToken
                });
            }
        } catch (guildError) {
            // User not in guild or other error
            res.json({
                canMint: false,
                message: "Access denied: NADS role required",
                accessToken: accessToken
            });
        }

    } catch (error) {
        console.error('OAuth2 error:', error.response?.data || error.message);
        res.json({
            canMint: false,
            message: "Authentication failed: Could not verify Discord account"
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    success: false
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    success: false,
    availableEndpoints: [
      '/health', '/api', '/login', '/callback',
      '/nads', '/slmnd', '/lamouch',
      '/nft-access', '/callback-clean',
      'POST /check-role/:guild'
    ]
  });
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Multi-Guild Discord Role Checker API running on port ${PORT}`);
  console.log(`📱 Login URL: http://localhost:${PORT}/login`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api`);
  console.log(`\n🎯 Available Guilds:`);
  Object.entries(config.GUILDS).forEach(([key, guild]) => {
    console.log(`   ${key}: ${guild.name} (${guild.roleName})`);
  });
});

module.exports = app;
