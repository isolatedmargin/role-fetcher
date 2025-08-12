import React, { useState, useEffect } from 'react';

/**
 * Discord Role Checker React Component
 * 
 * This component provides a complete Discord OAuth2 integration
 * with role checking capabilities for your React application.
 * 
 * @param {Object} props
 * @param {Array} props.requiredRoles - Array of required role names (e.g., ['NADS', 'SLMND'])
 * @param {React.ReactNode} props.children - Content to show when user has required roles
 * @param {React.ReactNode} props.fallback - Content to show when access is denied
 * @param {Function} props.onRoleCheck - Callback function when roles are checked
 * @param {string} props.apiBase - API base URL (defaults to production)
 * @param {string} props.className - Additional CSS classes
 */
const DiscordRoleChecker = ({ 
    children, 
    requiredRoles = [], 
    fallback = null,
    onRoleCheck = null,
    apiBase = 'https://discord-role-checker.vercel.app',
    className = ''
}) => {
    const [userRoles, setUserRoles] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    useEffect(() => {
        checkAuthentication();
    }, []);

    /**
     * Check if user is returning from Discord OAuth2
     */
    const checkAuthentication = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            handleOAuth2Callback(code);
        } else {
            setIsLoading(false);
        }
    };

    /**
     * Handle OAuth2 callback from Discord
     */
    const handleOAuth2Callback = async (code) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`${apiBase}/callback?code=${code}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const results = await response.json();
            
            if (results.success) {
                setUserRoles(results.results);
                
                // Call callback if provided
                if (onRoleCheck && typeof onRoleCheck === 'function') {
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
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Start Discord OAuth2 authentication
     */
    const authenticateWithDiscord = () => {
        setIsAuthenticating(true);
        window.location.href = `${apiBase}/login`;
    };

    /**
     * Check if user has required roles
     */
    const hasRequiredRole = requiredRoles.length === 0 || 
        requiredRoles.some(role => userRoles?.[role]?.hasRole);

    /**
     * Get user's role summary
     */
    const getRoleSummary = () => {
        if (!userRoles) return null;
        
        const roles = Object.entries(userRoles).map(([guild, data]) => ({
            guild,
            guildName: data.guildName,
            roleName: data.roleName,
            hasRole: data.hasRole
        }));
        
        const totalRoles = roles.length;
        const rolesHeld = roles.filter(r => r.hasRole).length;
        
        return { roles, totalRoles, rolesHeld };
    };

    // Loading state
    if (isLoading) {
        return (
            <div className={`discord-role-checker loading ${className}`}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Checking Discord authentication...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={`discord-role-checker error ${className}`}>
                <div className="error-message">
                    <h3>❌ Authentication Error</h3>
                    <p>{error}</p>
                    <button 
                        onClick={authenticateWithDiscord}
                        disabled={isAuthenticating}
                        className="discord-btn"
                    >
                        {isAuthenticating ? '🔄 Redirecting...' : '🔐 Try Again'}
                    </button>
                </div>
            </div>
        );
    }

    // Not authenticated state
    if (!userRoles) {
        return (
            <div className={`discord-role-checker not-authenticated ${className}`}>
                <div className="auth-prompt">
                    <h3>🔒 Access Restricted</h3>
                    <p>Connect your Discord account to continue</p>
                    <button 
                        onClick={authenticateWithDiscord}
                        disabled={isAuthenticating}
                        className="discord-btn"
                    >
                        {isAuthenticating ? '🔄 Redirecting...' : '🔐 Connect Discord'}
                    </button>
                </div>
            </div>
        );
    }

    // Access denied state
    if (!hasRequiredRole) {
        return fallback || (
            <div className={`discord-role-checker access-denied ${className}`}>
                <div className="access-denied-message">
                    <h3>❌ Access Denied</h3>
                    <p>You don't have the required Discord roles</p>
                    {requiredRoles.length > 0 && (
                        <div className="required-roles">
                            <p><strong>Required roles:</strong></p>
                            <ul>
                                {requiredRoles.map(role => (
                                    <li key={role}>
                                        {userRoles[role]?.guildName || role}: {userRoles[role]?.roleName || 'Unknown Role'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="user-roles-summary">
                        <h4>Your Current Roles:</h4>
                        <div className="role-grid">
                            {Object.entries(userRoles).map(([guild, data]) => (
                                <div 
                                    key={guild} 
                                    className={`role-card ${data.hasRole ? 'has-role' : 'no-role'}`}
                                >
                                    <h5>{data.guildName}</h5>
                                    <p>{data.roleName}</p>
                                    <span className="status">
                                        {data.hasRole ? '✅' : '❌'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Access granted - show children
    return (
        <div className={`discord-role-checker authenticated ${className}`}>
            {children}
        </div>
    );
};

/**
 * Discord Role Display Component
 * 
 * A utility component to display user's Discord roles
 */
export const DiscordRoleDisplay = ({ 
    userRoles, 
    showOnly = null, // Show only specific guilds
    className = '' 
}) => {
    if (!userRoles) return null;

    const rolesToShow = showOnly 
        ? Object.entries(userRoles).filter(([guild]) => showOnly.includes(guild))
        : Object.entries(userRoles);

    return (
        <div className={`discord-role-display ${className}`}>
            <h4>Your Discord Roles</h4>
            <div className="role-grid">
                {rolesToShow.map(([guild, data]) => (
                    <div 
                        key={guild} 
                        className={`role-card ${data.hasRole ? 'has-role' : 'no-role'}`}
                    >
                        <h5>{data.guildName}</h5>
                        <p>{data.roleName}</p>
                        <span className="status">
                            {data.hasRole ? '✅ Has Role' : '❌ No Role'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Discord Connect Button Component
 * 
 * A simple button component to start Discord authentication
 */
export const DiscordConnectButton = ({ 
    apiBase = 'https://discord-role-checker.vercel.app',
    className = '',
    children = '🔐 Connect Discord'
}) => {
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const handleClick = () => {
        setIsAuthenticating(true);
        window.location.href = `${apiBase}/login`;
    };

    return (
        <button 
            onClick={handleClick}
            disabled={isAuthenticating}
            className={`discord-connect-btn ${className}`}
        >
            {isAuthenticating ? '🔄 Redirecting...' : children}
        </button>
    );
};

export default DiscordRoleChecker;

// Usage Examples:

/*
// Basic usage - requires any Discord role
<DiscordRoleChecker>
    <h2>Welcome to our community!</h2>
    <p>You have access to basic content.</p>
</DiscordRoleChecker>

// Require specific role
<DiscordRoleChecker requiredRoles={['NADS']}>
    <h2>NADS Community Access</h2>
    <p>Exclusive content for NADS members!</p>
</DiscordRoleChecker>

// Require multiple roles (AND logic)
<DiscordRoleChecker requiredRoles={['NADS', 'SLMND']}>
    <h2>Elite Access</h2>
    <p>Ultra-exclusive content for elite members!</p>
</DiscordRoleChecker>

// Custom fallback
<DiscordRoleChecker 
    requiredRoles={['LAMOUCH']}
    fallback={
        <div>
            <h2>VIP Access Required</h2>
            <p>Join the LAMOUCH community to unlock this content!</p>
        </div>
    }
>
    <h2>VIP Content</h2>
    <p>Exclusive VIP features!</p>
</DiscordRoleChecker>

// With callback
<DiscordRoleChecker 
    onRoleCheck={(roles) => {
        console.log('User roles:', roles);
        // Handle role data
    }}
>
    <h2>Content</h2>
</DiscordRoleChecker>

// Display roles
<DiscordRoleDisplay userRoles={userRoles} />

// Show only specific guilds
<DiscordRoleDisplay userRoles={userRoles} showOnly={['NADS', 'SLMND']} />

// Connect button
<DiscordConnectButton>Connect with Discord</DiscordConnectButton>
*/
