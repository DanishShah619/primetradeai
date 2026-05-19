# PrimeTrade API & Task Manager

A production-ready, full-stack application demonstrating scalable backend architecture, robust security practices, and a responsive modern frontend.

## 🚀 Architecture & Scalability Highlights

This project was built from the ground up to handle high concurrency and scale effortlessly, utilizing enterprise-grade patterns as outlined in the PRD.

### 1. High-Performance Caching & Rate Limiting (Redis)
- **Token Bucket Rate Limiting:** We utilize a custom atomic Lua script in Redis to enforce rate limits. This protects the API from brute-force attacks (strict limits on `/auth` routes) and DDoS attempts (global API limits) without relying on single-node memory, ensuring limits work perfectly across horizontally scaled instances.
- **API Response Caching:** Heavy read operations (like `GET /tasks`) are intercepted and cached in Redis. We implemented targeted cache invalidation—the moment a user creates, updates, or deletes a task, their specific cache keys are wiped. This guarantees sub-millisecond read times for frequent queries without ever serving stale data.

### 2. Infrastructure as Code (Docker)
- **Containerized Dependencies:** Both PostgreSQL (relational data) and Redis (in-memory data structure store) are fully containerized using `docker-compose`. This ensures environment parity (it runs the exact same way locally as it will in production) and makes onboarding instantaneous.
- **Persistent Volumes:** Data integrity is maintained across container restarts using Docker volumes, preventing data loss during local development or service disruptions.

### 3. Stateless Authentication & Security
- **JWT Token Rotation:** We use short-lived stateless Access Tokens (15m) alongside long-lived Refresh Tokens (7d).
- **Persistent Revocation:** Refresh tokens are securely hashed and stored in the database. During a refresh cycle, the old token is deleted and a new one is issued (Rotation). If a stolen refresh token is reused, the system instantly detects the anomaly and revokes all sessions for that user.
- **Role-Based Access Control (RBAC):** Middleware factories strictly enforce permissions (e.g., only `ADMIN` roles can hard-delete tasks, while `USER` roles only see their own tasks).

### 4. Resilient API Design
- **Strict Validation Layer:** Using `zod`, every incoming request (body, query parameters, URL params) is strictly validated against schemas *before* it ever reaches the business logic.
- **Thin Controllers:** The architecture strictly separates concerns. Controllers only handle HTTP requests and responses, delegating all database and business logic to isolated Service files.
- **Consistent Envelopes:** Every single endpoint returns a predictable `{ success, data, meta }` or `{ success, error }` JSON structure, drastically simplifying frontend error handling.

---

## 🛠️ Project Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running on your machine

### 1. Start the Infrastructure (Docker)
First, spin up the PostgreSQL database and Redis cache.
```bash
# In the project root directory:
docker-compose up -d
```
*This starts Postgres on port `5433` and Redis on port `6380` in the background.*

### 2. Set up the Backend
Navigate to the backend directory, install dependencies, and run the database migrations.
```bash
cd backend
npm install

# Run Prisma migrations to build the tables in Postgres
npx prisma migrate dev --name init

# Start the Express API server
npm run dev
```
✅ **Backend is now running at:** `http://localhost:4000`
📚 **Swagger API Docs:** `http://localhost:4000/api-docs`

### 3. Set up the Frontend
Open a **new terminal window**, navigate to the frontend directory, and start the Vite development server.
```bash
cd frontend
npm install

# Start the React app
npm run dev
```
✅ **Frontend is now running at:** `http://localhost:5173`

---

## 💻 Tech Stack Summary

**Backend:**
- Node.js & TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Redis (`ioredis`)
- Zod (Validation)
- Swagger / OpenAPI (Documentation)

**Frontend:**
- React (Vite)
- TypeScript
- Zustand (State management & persistence)
- Axios (API Client with automatic token refresh interceptors)
- Custom Vanilla CSS (Modern glassmorphism UI)
