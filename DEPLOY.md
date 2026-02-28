# Fish Farm App - Deployment Guide

## Quick Deploy Options

### Option 1: Railway.app (Recommended - Free Tier Available)

1. Push your code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically detect and deploy using the Dockerfile
6. You'll get a shareable URL like: `https://your-app.up.railway.app`

### Option 2: Render.com (Free Tier Available)

1. Push your code to GitHub
2. Go to [Render.com](https://render.com)
3. Click "New+" → "Web Service"
4. Connect your GitHub repository
5. Select "Docker" as the environment
6. Click "Create Web Service"
7. You'll get a shareable URL like: `https://your-app.onrender.com`

### Option 3: Docker (Self-hosted)

Build and run with Docker:

```bash
# Build the image
docker build -t fishfarm-app .

# Run the container
docker run -p 3001:3001 fishfarm-app
```

Or use Docker Compose:

```bash
docker-compose up -d
```

### Option 4: Fly.io (Free Tier Available)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch (follow prompts)
fly launch

# Deploy
fly deploy
```

You'll get a shareable URL like: `https://your-app.fly.dev`

## Testing the Build Locally

```bash
# Build the Docker image
docker build -t fishfarm-app .

# Run it
docker run -p 3001:3001 fishfarm-app

# Access at http://localhost:3001
```

## Environment Variables

For production deployments, you can set:
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Set to "production"

## Database

The app uses SQLite and will automatically create and seed the database on first run.
