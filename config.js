module.exports = {
  // Discord Application Credentials
  CLIENT_ID: '1404438843112820756',
  CLIENT_SECRET: 'KflrC5F8aynL8P348qLacIq_nM2-mB0_',
  
  // OAuth2 Configuration
  REDIRECT_URI: 'http://localhost:3000/callback',
  
  // Multiple Guild and Role Configurations
  GUILDS: {
    NADS: {
      id: '1036357772826120242',
      name: 'NADS',
      roleId: '1051562453495971941',
      roleName: 'NADS Role'
    },
    SLMND: {
      id: '1325852385054031902',
      name: 'SLMND',
      roleId: '1329565499335381033',
      roleName: 'Riverborn'
    },
    LAMOUCH: {
      id: '1329166769566388264',
      name: 'LAMOUCH',
      roleId: '1337881787409371372',
      roleName: 'Mouch OG'
    }
  },
  
  // Server Configuration
  PORT: process.env.PORT || 3000,
  SESSION_SECRET: 'your-super-secret-session-key-change-this-in-production',
  
  // Discord API URLs
  DISCORD_API: 'https://discord.com/api',
  OAUTH2_AUTHORIZE: 'https://discord.com/api/oauth2/authorize',
  OAUTH2_TOKEN: 'https://discord.com/api/oauth2/token',
  
  // OAuth2 Scopes
  SCOPES: ['identify', 'guilds.members.read']
};
