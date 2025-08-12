module.exports = {
    CLIENT_ID: '1404438843112820756',
    CLIENT_SECRET: 'ZGE9IEIi-FS28lubR_eWFqdDQqY78k0f',
    REDIRECT_URI: 'https://discord-role-checker-r4yo0mj64-fdggfs-projects.vercel.app/callback',
    SESSION_SECRET: 'debug-session-secret-2024',
    
    // Discord API URLs
    DISCORD_API: 'https://discord.com/api',
    OAUTH2_AUTHORIZE: 'https://discord.com/api/oauth2/authorize',
    OAUTH2_TOKEN: 'https://discord.com/api/oauth2/token',
    
    // OAuth2 Scopes
    SCOPES: ['identify', 'guilds.members.read'],
    
    // Multiple guilds and roles configuration
    GUILDS: {
        NADS: {
            id: '1036357772826120242',
            name: 'NADS',
            roleId: '1051562453495971941',
            roleName: 'NADS role'
        },
        SLMND: {
            id: '1325852385054031902',
            name: 'SLMND',
            roleId: '1329565499335381033',
            roleName: 'Riverborn role'
        },
        LAMOUCH: {
            id: '1329166769566388264',
            name: 'LAMOUCH',
            roleId: '1337881787409371372',
            roleName: 'Mouch OG role'
        }
    }
};
