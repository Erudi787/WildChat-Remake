# WildChat – Love Purrs Around Campus 🐾

**WildChat** is a real-time, campus-based messaging platform designed for a university community. This project is a modern, monorepo rebuild of a legacy application, demonstrating scalable full-stack architecture, real-time WebSocket communication, and modern UI/UX principles.

## 🚀 Features

- **Real-Time Messaging**: Built with an Express + Socket.IO microservice for instant, reliable message delivery, typing indicators, and real-time read receipts.
- **Secure Authentication**: NextAuth.js (v5) implementation with JWT sessions and robust password hashing (bcryptjs).
- **Comprehensive User Profiles**: Customizable profiles with avatars, bios, and personalized settings.
- **Responsive Split-Pane UI**: A dynamic, mobile-friendly chat interface featuring conversation lists, unread message counts, and auto-scrolling message threads.
- **Dual-Database Strategy**: Configured to work out-of-the-box with either a serverless cloud provider (Neon PostgreSQL) or a local Dockerized PostgreSQL instance for flexible deployment and local testing.
- **Automated CI Pipeline**: GitHub Actions workflow for type-checking and automated unit testing (Vitest).

## 🛠 Tech Stack

- **Monorepo**: Turborepo
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Backend APIs**: Next.js Route Handlers (RESTful)
- **Real-time Gateway**: Node.js, Express, Socket.IO (custom microservice)
- **Database**: PostgreSQL (Neon Cloud / Local Docker)
- **ORM**: Prisma
- **Validation**: Zod (shared types between frontend and backend)
- **Testing**: Vitest, @testing-library

## 📂 Project Structure

```
WildChat-Remake/
├── apps/
│   ├── web/          # Next.js 15 + Tailwind frontend and REST APIs
│   ├── realtime/     # Node.js + Socket.IO microservice
│   └── mobile/       # Expo React Native client (Planned)
├── packages/
│   ├── types/        # Shared DTOs, Zod schemas, API contracts
│   └── api-client/   # Typed fetch wrapper
└── .github/          # CI workflows
```

## 💻 Local Setup (Development)

1. **Clone & Install**
   ```bash
   git clone https://github.com/yourusername/WildChat-Remake.git
   cd WildChat-Remake
   npm install
   ```

2. **Database Configuration**
   Copy the example environment files in both the `web` and `realtime` apps:
   ```bash
   cp apps/web/.env.example apps/web/.env
   cp apps/realtime/.env.example apps/realtime/.env  # if applicable
   ```
   > **Note:** The project provides a `docker-compose.yml` file. You can run `docker compose up -d` to spin up a local PostgreSQL database, or use a cloud database string in `DATABASE_URL`.

3. **Initialize Prisma**
   ```bash
   cd apps/web
   npx prisma db push
   npx prisma generate
   cd ../..
   ```

4. **Run the Application**
   Start both the Next.js web application and the Realtime Socket.IO server simultaneously using Turborepo:
   ```bash
   npm run dev
   ```

## 🌩 Deployment

- **Web App**: Designed to be deployed on serverless platforms like **Vercel**. Ensure all environment variables (`DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_REALTIME_URL`) are configured in the Vercel dashboard.
- **Realtime Server**: Must be deployed to a stateful container/VM service that supports WebSockets (e.g., Railway, Render, Fly.io, or AWS ECS), allowing persistent socket connections.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
