# 🚀 Discord Role Checker API Deployment Guide

Complete guide to deploy the Discord Role Checker API to various platforms.

## 🌐 Vercel (Recommended)

### **Prerequisites**
- GitHub account
- Vercel account
- Discord application with OAuth2 configured

### **Step 1: Fork and Clone**
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/yourusername/discord-role-checker.git
cd discord-role-checker
```

### **Step 2: Configure Discord Application**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **OAuth2** tab
4. Add redirect URL: `https://your-app.vercel.app/callback`
5. Note your Client ID and Client Secret

### **Step 3: Deploy to Vercel**
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project: `N`
   - Project name: `discord-role-checker`
   - Directory: `.`
   - Override settings: `N`

### **Step 4: Configure Environment Variables**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

```bash
CLIENT_ID=your_discord_client_id
CLIENT_SECRET=your_discord_client_secret
REDIRECT_URI=https://your-app.vercel.app/callback
SESSION_SECRET=your_secure_random_string
```

5. **Redeploy** after adding environment variables:
   ```bash
   vercel --prod
   ```

### **Step 5: Update Discord OAuth2 Redirect**
1. Go back to [Discord Developer Portal](https://discord.com/developers/applications)
2. Update redirect URL to: `https://your-app.vercel.app/callback`
3. Save changes

## 🐳 Docker Deployment

### **Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### **Docker Compose**
```yaml
version: '3.8'
services:
  discord-role-checker:
    build: .
    ports:
      - "3000:3000"
    environment:
      - CLIENT_ID=${CLIENT_ID}
      - CLIENT_SECRET=${CLIENT_SECRET}
      - REDIRECT_URI=${REDIRECT_URI}
      - SESSION_SECRET=${SESSION_SECRET}
    restart: unless-stopped
```

### **Deploy with Docker**
```bash
# Build and run
docker-compose up -d

# Or build manually
docker build -t discord-role-checker .
docker run -p 3000:3000 --env-file .env discord-role-checker
```

## ☁️ AWS Deployment

### **AWS Lambda + API Gateway**

#### **1. Create Lambda Function**
```bash
# Install dependencies
npm install

# Create deployment package
zip -r function.zip . -x "node_modules/*" ".git/*"

# Upload to AWS Lambda
aws lambda create-function \
  --function-name discord-role-checker \
  --runtime nodejs18.x \
  --handler multi-guild-api.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role
```

#### **2. Configure Environment Variables**
```bash
aws lambda update-function-configuration \
  --function-name discord-role-checker \
  --environment Variables='{
    CLIENT_ID=your_client_id,
    CLIENT_SECRET=your_client_secret,
    REDIRECT_URI=https://your-api-gateway-url/callback
  }'
```

#### **3. Set up API Gateway**
- Create REST API
- Create resources for `/login`, `/callback`, `/nads`, `/slmnd`, `/lamouch`
- Integrate with Lambda function
- Deploy API

### **AWS EC2**

#### **1. Launch EC2 Instance**
```bash
# Connect to instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2
npm install -g pm2
```

#### **2. Deploy Application**
```bash
# Clone repository
git clone https://github.com/yourusername/discord-role-checker.git
cd discord-role-checker

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REDIRECT_URI=http://your-domain.com/callback
SESSION_SECRET=your_session_secret
EOF

# Start with PM2
pm2 start multi-guild-api.js --name "discord-role-checker"
pm2 startup
pm2 save
```

#### **3. Configure Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐙 GitHub Actions Deployment

### **Workflow File**
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### **Setup Secrets**
1. Go to GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `ORG_ID`: Your Vercel organization ID
   - `PROJECT_ID`: Your Vercel project ID

## 🔧 Environment Configuration

### **Environment Variables**
```bash
# Required
CLIENT_ID=your_discord_client_id
CLIENT_SECRET=your_discord_client_secret
REDIRECT_URI=your_callback_url

# Optional
SESSION_SECRET=your_secure_random_string
PORT=3000
NODE_ENV=production
```

### **Generate Session Secret**
```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🔒 Security Configuration

### **HTTPS Setup**
```bash
# For Vercel - automatic
# For custom domains, configure SSL certificates

# Let's Encrypt (free)
sudo certbot --nginx -d your-domain.com
```

### **CORS Configuration**
```javascript
// In your API
app.use(cors({
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  credentials: true
}));
```

### **Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

## 📊 Monitoring & Health Checks

### **Health Check Endpoint**
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  });
});
```

### **Logging**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## 🧪 Testing Deployment

### **Health Check**
```bash
curl https://your-app.vercel.app/health
```

### **OAuth2 Flow Test**
1. Visit: `https://your-app.vercel.app/login`
2. Complete Discord authorization
3. Verify callback response

### **Role Check Test**
```bash
# Test with valid token
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-app.vercel.app/nads
```

## 🚨 Troubleshooting

### **Common Issues**

#### **1. "Invalid redirect URI" Error**
- Verify redirect URI in Discord Developer Portal matches exactly
- Check for trailing slashes or protocol mismatches

#### **2. Environment Variables Not Loading**
- Restart application after adding environment variables
- Check variable names for typos
- Verify file permissions

#### **3. CORS Errors**
- Configure CORS properly for your domain
- Check if frontend and backend URLs match

#### **4. Rate Limiting**
- Implement proper rate limiting
- Add retry logic with exponential backoff

### **Debug Mode**
```javascript
// Enable debug logging
process.env.DEBUG = 'discord-role-checker:*';

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});
```

## 📈 Performance Optimization

### **Caching**
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

app.get('/nads', async (req, res) => {
  const cacheKey = `nads_${req.headers.authorization}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  // ... role check logic
  
  cache.set(cacheKey, result);
  res.json(result);
});
```

### **Compression**
```javascript
const compression = require('compression');
app.use(compression());
```

## 🔄 CI/CD Pipeline

### **Automated Testing**
```yaml
name: Test and Deploy

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📚 Additional Resources

- **Vercel Documentation**: https://vercel.com/docs
- **AWS Lambda Documentation**: https://docs.aws.amazon.com/lambda/
- **Docker Documentation**: https://docs.docker.com/
- **GitHub Actions**: https://docs.github.com/en/actions

---

**Ready to deploy? Choose your platform and follow the steps above!** 🚀
