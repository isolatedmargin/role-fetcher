module.exports = {
    CLIENT_ID: '1404438843112820756',
    CLIENT_SECRET: process.env.CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE',
    REDIRECT_URI: 'https://discord-role-checker.vercel.app/callback',
    SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-here',
    
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
