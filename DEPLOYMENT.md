# Norman Invoicing Tool - Deployment Guide

This guide explains how to deploy the Norman Invoicing Tool using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Git (for cloning/updating the repository)

## Quick Start

### Development Deployment

```bash
# Run development environment (API: localhost:8000)
./deploy.sh dev
```

The app will be available at `http://localhost:3000`

### Production Deployment

```bash
# Run production environment (API: api.norman.finance)
./deploy.sh prod
```

The app will be available at `http://localhost:81`

## Manual Deployment

### Development

```bash
docker-compose up --build -d
```

### Production

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

## Environment Variables

The application uses the following environment variables:

- `NODE_ENV`: Set to `production` for production builds
- `NEXT_PUBLIC_API_URL`: API endpoint URL
  - Development: `http://localhost:8000`
  - Production: `https://api.norman.finance`

## Docker Configuration

### Multi-stage Build

The Dockerfile uses a multi-stage build process:

1. **deps**: Installs production dependencies
2. **builder**: Builds the Next.js application
3. **runner**: Creates the minimal production image

### Optimization Features

- Uses Node.js 18 Alpine for smaller image size
- Standalone output for optimal Docker builds
- Non-root user for security
- Health checks for production deployment
- Resource limits for production

## Deployment Scripts

### deploy.sh

The deployment script supports the following commands:

```bash
./deploy.sh dev         # Deploy development environment
./deploy.sh prod        # Deploy production environment
./deploy.sh logs        # Show application logs
./deploy.sh stop        # Stop all services
```

## Production Considerations

### Security

- Runs as non-root user (`nextjs`)
- Uses security headers in Next.js config
- Minimal attack surface with Alpine Linux

### Performance

- Resource limits: 1 CPU, 512MB RAM
- Health checks every 30 seconds
- Automatic restart on failure

### Monitoring

- Health check endpoint at `/`
- Application logs via Docker
- Resource monitoring with Docker stats

## Troubleshooting

### View Logs

```bash
# Development
docker-compose logs -f norman-tools

# Production
docker-compose -f docker-compose.prod.yml logs -f norman-tools
```

### Check Container Status

```bash
docker ps
```

### Rebuild and Restart

```bash
# Development
docker-compose down && docker-compose up --build -d

# Production
docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up --build -d
```

### Clean Up

```bash
# Remove containers and images
docker-compose down --rmi all --volumes --remove-orphans

# Remove all unused Docker resources
docker system prune -a
```

## CI/CD Integration

For automated deployments, you can use the Docker setup with:

- GitHub Actions
- GitLab CI/CD
- Jenkins
- Any other CI/CD platform that supports Docker

Example GitHub Action workflow:

```yaml
name: Deploy Norman Invoicing Tool

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and Deploy
        run: |
          cd norman-tools
          docker-compose -f docker-compose.prod.yml up --build -d
```

## Support

For deployment issues, check:

1. Docker daemon is running
2. Ports 81/3000 are not in use
3. Sufficient disk space for Docker images
4. Network connectivity to api.norman.finance (production) 