# Deployment Guide

Deploying VedaAI requires coordinating three main components: The Frontend, the Backend API, and the Redis datastore.

## Infrastructure
- **Redis Server:** A mandatory prerequisite for BullMQ. We recommend a managed cloud Redis instance (e.g., Upstash, Redis Cloud, or an AWS ElastiCache node).
- **MongoDB:** A managed MongoDB Atlas cluster is recommended for the primary datastore.
- **Hosting:** The system is optimized for hosting providers like Render, Vercel, or Heroku.

## Handling Ephemeral Storage
**CRITICAL:** Cloud providers like Render Web Services use *ephemeral disks*. This means that when the server goes to sleep or restarts, any files saved in the local `/uploads` directory are completely erased.

VedaAI implements several fail-safes for this:
1. **Dynamic PDF Regeneration:** The `/api/assignments/:id/download` endpoint physically checks the disk. If the file was wiped, it instantly re-runs the `PDFKit` logic on the fly using the MongoDB data, regenerating the file seamlessly before downloading it to the client.
2. **Library Graceful Degradation:** Because raw user uploads cannot be regenerated, the `/api/library/:id/download` endpoint intercepts requests for wiped library files and serves a styled HTML message instructing the user to re-upload, avoiding harsh Express `Cannot GET` crashes.

## Environment Variables
Ensure the following variables are strictly mapped in your production environment:

**Backend:**
- `PORT`
- `MONGODB_URI`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD` (if applicable)
- `GEMINI_API_KEY`
- `FRONTEND_URL` (For CORS mapping)

**Frontend:**
- `NEXT_PUBLIC_API_URL` (Point to your production backend, e.g., `https://my-backend.onrender.com/api`)

## Build Steps
**Frontend:**
```bash
npm install
npm run build
npm run start
```
*Note: Next.js handles static optimization during the build phase.*

**Backend:**
```bash
npm install
npm run build
npm start
```
*Note: The backend must compile TypeScript into the `/dist` directory via `tsc` before starting the node runtime.*
