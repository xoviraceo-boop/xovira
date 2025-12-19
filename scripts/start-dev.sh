#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Starting Startup Platform          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
echo ""

# Check if .env files exist
echo -e "${YELLOW}Checking environment files...${NC}"

if [ ! -f "packages/database/.env" ]; then
    echo -e "${YELLOW}⚠️  packages/database/.env not found. Creating from example...${NC}"
    cp packages/database/.env.example packages/database/.env 2>/dev/null || true
fi

if [ ! -f "apps/socket-server/.env" ]; then
    echo -e "${YELLOW}⚠️  apps/socket-server/.env not found. Creating from example...${NC}"
    cp apps/socket-server/.env.example apps/socket-server/.env 2>/dev/null || true
fi

if [ ! -f "apps/web/.env.local" ]; then
    echo -e "${YELLOW}⚠️  apps/web/.env.local not found. Creating from example...${NC}"
    cp apps/web/.env.local.example apps/web/.env.local 2>/dev/null || true
fi

echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
pnpm install

echo ""

# Generate Prisma Client
echo -e "${BLUE}🔨 Generating Prisma Client...${NC}"
cd packages/database
pnpm prisma generate
cd ../..

echo ""

# Push database schema
echo -e "${BLUE}🗄️  Pushing database schema...${NC}"
read -p "Do you want to push the database schema? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd packages/database
    pnpm prisma db push
    cd ../..
fi

echo ""

# Start services
echo -e "${GREEN}🚀 Starting services...${NC}"
echo -e "${GREEN}   - Next.js Web: http://localhost:3000${NC}"
echo -e "${GREEN}   - Socket.IO: http://localhost:3001${NC}"
echo ""

pnpm dev