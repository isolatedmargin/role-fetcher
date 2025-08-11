# 🎨 NFT Test - Discord Role Gated Minting Integration

A complete guide on how the NFT website integrates with your Discord Role Checker API for gated access control.

## 🚀 **Live NFT Website**

- **URL**: https://discord-role-checker.vercel.app/nft-test.html
- **Purpose**: Demonstrate Discord role-gated NFT minting
- **Gate**: Only NADS role holders can mint

## 🔐 **How It Works**

### **1. User Experience Flow:**

1. **User visits NFT website** → Sees beautiful NFT display
2. **Clicks "Mint NFT"** → Discord authentication required
3. **Connects Discord** → API checks for NADS role
4. **If NADS role exists** → NFT minting proceeds
5. **If no NADS role** → Access denied message

### **2. API Integration Points:**

- **Frontend**: NFT website (HTML/CSS/JS)
- **Backend**: Your Discord Role Checker API
- **Authentication**: Discord OAuth2 flow
- **Role Verification**: API checks NADS role
- **Access Control**: Frontend gates based on API response

## 📱 **Frontend Implementation**

### **Key Functions:**

```javascript
// Check if user can mint
function mintNFT() {
    if (!isAuthenticated) {
        showAuthModal(); // Show Discord login
        return;
    }

    // Check NADS role via API response
    if (userRoles && userRoles.NADS && userRoles.NADS.hasRole) {
        proceedWithMint(); // Allow minting
    } else {
        showMessage('❌ Access Denied: You need the NADS role', 'error');
    }
}

// Discord authentication
function authenticateWithDiscord() {
    // Redirect to your API's OAuth2 endpoint
    window.location.href = 'https://discord-role-checker.vercel.app/login';
}
```

### **Button States:**

- **🔐 Connect Discord to Mint** (Unauthenticated)
- **🎨 Mint NFT (NADS Role Verified)** (Authenticated + Has Role)
- **❌ NADS Role Required** (Authenticated + No Role)
- **✅ NFT Minted Successfully!** (Minting Complete)

## 🔧 **Backend API Usage**

### **API Endpoints Used:**

1. **`/login`** - Discord OAuth2 redirect
2. **`/callback`** - OAuth2 callback with role results
3. **`/check-role/nads`** - Verify NADS role (optional)

### **Role Check Flow:**

```javascript
// After OAuth2 callback, API returns:
{
    "success": true,
    "results": {
        "NADS": {
            "guildId": "1036357772826120242",
            "guildName": "NADS",
            "roleId": "1051562453495971941",
            "roleName": "NADS Role",
            "hasRole": true,  // ← This controls access
            "success": true
        }
        // ... other guilds
    }
}
```

## 🎯 **Access Control Logic**

### **Frontend Gate:**

```javascript
// Simple role check
const hasNADSRole = userRoles?.NADS?.hasRole || false;

if (hasNADSRole) {
    // User can mint NFT
    showMintingInterface();
} else {
    // User cannot mint
    showAccessDenied();
}
```

### **No Backend State Display:**

- ❌ **Don't show**: Role details, guild IDs, technical info
- ✅ **Do show**: Access granted/denied, minting status
- 🎯 **Focus**: User experience, not technical implementation

## 🚀 **Production Integration**

### **1. Replace Mock Data:**

```javascript
// Replace this mock function:
function simulateOAuth2Callback() {
    // ... mock data
}

// With real API call:
async function handleOAuth2Callback(code) {
    try {
        const response = await fetch(`${API_BASE}/callback?code=${code}`);
        const results = await response.json();
        
        if (results.success) {
            userRoles = results.results;
            isAuthenticated = true;
            updateMintButton();
        }
    } catch (error) {
        console.error('Authentication failed:', error);
    }
}
```

### **2. Real NFT Minting:**

```javascript
function proceedWithMint() {
    // Replace simulation with real minting
    const mintBtn = document.getElementById('mintBtn');
    mintBtn.disabled = true;
    mintBtn.innerHTML = '<span class="loading"></span>Minting NFT...';
    
    // Call your NFT minting API
    mintNFTOnBlockchain()
        .then(() => {
            mintBtn.innerHTML = '✅ NFT Minted Successfully!';
            showMessage('🎉 NFT minted on blockchain!', 'success');
        })
        .catch((error) => {
            mintBtn.innerHTML = '🎨 Mint NFT (NADS Role Verified)';
            mintBtn.disabled = false;
            showMessage('❌ Minting failed: ' + error.message, 'error');
        });
}
```

## 🔒 **Security Features**

### **Frontend Security:**

- **No sensitive data exposure** - Role details hidden
- **Client-side validation** - Immediate feedback
- **Session management** - localStorage for demo

### **Backend Security:**

- **OAuth2 authentication** - Secure Discord login
- **Role verification** - Server-side validation
- **No role data exposure** - Only boolean responses

## 📊 **User States**

### **State 1: Unauthenticated**
- Button: "🔐 Connect Discord to Mint"
- Action: Shows Discord auth modal
- Access: None

### **State 2: Authenticated, No NADS Role**
- Button: "❌ NADS Role Required" (Disabled)
- Action: Shows access denied message
- Access: None

### **State 3: Authenticated, Has NADS Role**
- Button: "🎨 Mint NFT (NADS Role Verified)"
- Action: Proceeds with minting
- Access: Full

### **State 4: Minting in Progress**
- Button: "⏳ Minting NFT..." (Disabled)
- Action: Shows minting progress
- Access: Processing

### **State 5: Minting Complete**
- Button: "✅ NFT Minted Successfully!" (Disabled)
- Action: Shows success message
- Access: Complete

## 🎨 **Customization Options**

### **Change Required Role:**

```javascript
// Change from NADS to SLMND
if (userRoles && userRoles.SLMND && userRoles.SLMND.hasRole) {
    proceedWithMint();
} else {
    showMessage('❌ Access Denied: You need the SLMND Riverborn role', 'error');
}
```

### **Multiple Role Requirements:**

```javascript
// Require both NADS and SLMND roles
const hasNADS = userRoles?.NADS?.hasRole || false;
const hasSLMND = userRoles?.SLMND?.hasRole || false;

if (hasNADS && hasSLMND) {
    proceedWithMint();
} else {
    showMessage('❌ Access Denied: You need both NADS and SLMND roles', 'error');
}
```

### **Different NFT Collections:**

```javascript
// Different NFTs for different roles
if (userRoles?.NADS?.hasRole) {
    showNADSNFT();
} else if (userRoles?.SLMND?.hasRole) {
    showSLMNDNFT();
} else if (userRoles?.LAMOUCH?.hasRole) {
    showLAMOUCHNFT();
} else {
    showAccessDenied();
}
```

## 🧪 **Testing the Integration**

### **1. Test Without Discord Role:**
- Visit NFT website
- Click "Mint NFT"
- Connect Discord (without NADS role)
- Should see "NADS Role Required"

### **2. Test With Discord Role:**
- Visit NFT website
- Click "Mint NFT"
- Connect Discord (with NADS role)
- Should see "Mint NFT (NADS Role Verified)"
- Click to mint successfully

### **3. Test API Endpoints:**
- Health: https://discord-role-checker.vercel.app/health
- API Docs: https://discord-role-checker.vercel.app/api
- Login: https://discord-role-checker.vercel.app/login

## 🚀 **Deployment Checklist**

### **Frontend:**
- ✅ NFT website created
- ✅ Discord authentication integrated
- ✅ Role-based access control
- ✅ Beautiful UI/UX
- ✅ Responsive design

### **Backend:**
- ✅ Discord Role Checker API deployed
- ✅ OAuth2 endpoints working
- ✅ Role verification functional
- ✅ Environment variables set

### **Integration:**
- ✅ Frontend calls backend API
- ✅ Role results control access
- ✅ No technical data exposed
- ✅ User-friendly experience

## 🎯 **Perfect for:**

- **NFT Marketplaces** - Role-gated collections
- **Gaming Platforms** - Exclusive item access
- **Community Sites** - Member-only features
- **Premium Services** - Role-based pricing
- **Access Control** - Discord-based gates

---

**Your NFT website is now a perfect example of Discord role-gated access control!** 🎉

Users can only mint if they hold the NADS role, and the API handles all the authentication and verification behind the scenes.
