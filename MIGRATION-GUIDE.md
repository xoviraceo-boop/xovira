# Migration Guide: Inngest to Backend

This guide explains the changes made to move Inngest from the frontend to the backend.

## Changes Summary

### Backend (New)
- ✅ Created `/apps/backend/service-server/src/routes/agents.ts` - Agent API routes
- ✅ Created `/apps/backend/service-server/src/middleware/httpAuth.ts` - HTTP authentication middleware
- ✅ Created `/apps/backend/service-server/src/lib/inngest.ts` - Inngest client setup
- ✅ Created `/apps/backend/service-server/src/inngest/functions/agent-execution.ts` - Inngest function
- ✅ Created `/apps/backend/service-server/src/inngest/serve.ts` - Inngest serve handler
- ✅ Created `/apps/backend/service-server/src/services/agents/agentExecutionService.ts` - Execution logic
- ✅ Updated `/apps/backend/service-server/src/index.ts` - Added agent routes and Inngest endpoint
- ✅ Updated `/apps/backend/service-server/src/config/env.ts` - Added Inngest env vars
- ✅ Updated `/apps/backend/service-server/package.json` - Added Inngest dependency

### Frontend (Updated)
- ✅ Updated `/apps/frontend/src/trpc/routers/agent.ts` - Now calls backend API
- ✅ Created `/apps/frontend/src/lib/backend-client.ts` - Secure backend client
- ✅ Removed `/apps/frontend/src/lib/inngest.ts` - Moved to backend
- ✅ Removed `/apps/frontend/src/lib/inngest/functions/agent-execution.ts` - Moved to backend
- ✅ Removed `/apps/frontend/src/app/api/inngest/route.ts` - Moved to backend
- ✅ Removed `/apps/frontend/src/app/api/agents/execute/route.ts` - Moved to backend
- ✅ Removed `/apps/frontend/src/app/api/agents/execute-internal/route.ts` - Moved to backend

## Setup Instructions

### 1. Install Dependencies

```bash
# Backend
cd apps/backend/service-server
pnpm add inngest

# Frontend (no changes needed)
cd apps/frontend
# Already has jsonwebtoken for token generation
```

### 2. Environment Variables

**Backend** (`.env` in `apps/backend/service-server`):
```env
# Existing vars...
PORT=3001
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret

# New: Inngest (optional for production)
INNGEST_EVENT_KEY=your_event_key
INNGEST_SIGNING_KEY=your_signing_key
INNGEST_BASE_URL=https://api.inngest.com
```

**Frontend** (`.env` in `apps/frontend`):
```env
# New: Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
# Or in production:
# NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
```

### 3. Start Services

```bash
# Terminal 1: Backend server
cd apps/backend/service-server
pnpm dev

# Terminal 2: Frontend (if not already running)
cd apps/frontend
pnpm dev

# Terminal 3: Inngest Dev Server (optional, for local development)
npx inngest-cli dev
```

## API Endpoints

### Backend Endpoints (Port 3001)

All endpoints require `Authorization: Bearer <jwt_token>` header.

- `POST /v1/agents/execute` - Execute an agent
- `GET /v1/agents/:agentId/executions` - Get execution history
- `GET /v1/agents/:agentId/executions/:executionId` - Get execution details
- `POST /v1/agents/:agentId/cancel/:executionId` - Cancel execution
- `POST /api/inngest` - Inngest webhook (for Inngest service)

### Frontend Endpoints (Port 3000)

- `GET /api/auth/token` - Get JWT token for backend authentication
- All tRPC endpoints remain the same

## Security Features

1. **JWT Authentication**: All backend endpoints require valid JWT tokens
2. **Token Generation**: Frontend generates tokens using shared secret
3. **Request Validation**: Zod schemas validate all inputs
4. **Rate Limiting**: Execution endpoint limited to 30 RPM, 500 RPD
5. **Access Control**: Users can only access agents they own or collaborate on
6. **CORS**: Configured to only allow frontend origins

## Request Flow

1. **Frontend** → User triggers agent execution via tRPC
2. **tRPC Router** → Creates execution record in database
3. **tRPC Router** → Calls backend API with JWT token
4. **Backend API** → Validates token and request
5. **Backend API** → Triggers Inngest function
6. **Inngest** → Executes agent in background
7. **Inngest Function** → Updates execution status in database
8. **Frontend** → Polls or receives updates via WebSocket/SSE

## Testing

### Test Backend Endpoint

```bash
# Get token from frontend API
TOKEN=$(curl -s http://localhost:3000/api/auth/token | jq -r .token)

# Execute agent
curl -X POST http://localhost:3001/v1/agents/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "executionId": "exec-id",
    "agentId": "agent-id",
    "inputData": {}
  }'
```

### Test Frontend Integration

1. Navigate to `/dashboard/agents`
2. Create an agent
3. Click "Execute" on an agent
4. Check execution status

## Troubleshooting

### Authentication Errors
- Verify `JWT_SECRET` matches between frontend and backend
- Check token expiration (default: 1 hour)
- Ensure `Authorization: Bearer <token>` header format

### Backend Connection Errors
- Verify `NEXT_PUBLIC_BACKEND_URL` is set correctly
- Check backend server is running on correct port
- Verify CORS configuration allows frontend origin

### Inngest Not Working
- Install Inngest: `pnpm add inngest` in backend
- Start Inngest dev server: `npx inngest-cli dev`
- Check Inngest webhook URL is configured correctly
- Verify environment variables are set

### Rate Limiting
- Check Redis connection for rate limiting
- Verify `REDIS_URL` is configured
- Rate limits: 30 RPM, 500 RPD per user

## Production Deployment

1. **Backend**:
   - Deploy to your server/cloud
   - Set environment variables
   - Configure Inngest webhook URL: `https://your-backend.com/api/inngest`

2. **Frontend**:
   - Set `NEXT_PUBLIC_BACKEND_URL` to production backend URL
   - Ensure `AUTH_SECRET` matches backend `JWT_SECRET`

3. **Inngest**:
   - Set up Inngest account
   - Configure webhook in Inngest dashboard
   - Add production keys to backend environment

## Benefits of This Architecture

1. **Separation of Concerns**: Background jobs handled in backend
2. **Security**: Sensitive operations isolated in backend
3. **Scalability**: Backend can scale independently
4. **Reliability**: Inngest handles retries and failures
5. **Monitoring**: Centralized logging and monitoring
6. **Rate Limiting**: Applied at API level
7. **Type Safety**: Full TypeScript support

