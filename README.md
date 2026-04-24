# 🚀 zrok-ui — Self-Hosted Tunnel Dashboard

> A **premium, open-source SaaS-style dashboard** for [Zrok](https://zrok.io) — your own self-hosted alternative to Ngrok.  
> Built with **React + TypeScript + Node.js + Redis + Docker**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://github.com/YOUR_USERNAME/zrok-ui/pkgs/container/zrok-ui-dashboard)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/zrok-ui/docker-publish.yml?label=CI%2FCD)](https://github.com/YOUR_USERNAME/zrok-ui/actions)

---

## 📸 Screenshots

| Login | Dashboard | My Shares |
|:--|:--|:--|
| Email/Password Auth | Live Analytics + Stats | Public/Private toggle |

---

## ✨ Features

| Feature | Description |
|:--|:--|
| 🔐 **Auth System** | Email + Password login/signup with JWT |
| 🌐 **Public Shares** | Share local ports publicly (like Ngrok) |
| 🔒 **Private Shares** | Restrict access to specific users |
| 📊 **Traffic Analytics** | 7-day traffic graph per share |
| 🌍 **Custom Domain** | Add your own domain with DNS verification |
| 👥 **Admin Panel** | View all users and shares (live data) |
| 📚 **Setup Guide** | Built-in guide for Windows / Linux / Mac |
| 🐳 **Docker Ready** | One-command deploy anywhere |
| 🤖 **GitHub Actions CI/CD** | Auto-build + push to GHCR on every push |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  User's Browser                      │
└────────────────────────┬────────────────────────────┘
                         │ HTTP :80
         ┌───────────────▼───────────────┐
         │   Nginx (React Dashboard)      │
         │   • Serves React SPA           │
         │   • Proxies /api/* → Backend   │
         └───────────────┬───────────────┘
                         │ :5001
         ┌───────────────▼───────────────┐
         │   Node.js Express API          │
         │   • Auth (Register / Login)    │
         │   • Share Management           │
         │   • Analytics API              │
         │   • Domain Verification        │
         └───────────────┬───────────────┘
                         │
         ┌───────────────▼───────────────┐
         │   Redis                        │
         │   • Users & Tokens             │
         │   • Share Registry             │
         └───────────────────────────────┘
```

---

## ⚡ Quick Deploy — One Command!

### ✅ Option 1: Any VPS / Server (Recommended)

```bash
# 1. Download deploy file
curl -O https://raw.githubusercontent.com/YOUR_USERNAME/zrok-ui/main/docker-compose.ghcr.yml

# 2. Create environment file
cat > .env << 'EOF'
GITHUB_USERNAME=YOUR_USERNAME
JWT_SECRET=your-super-secret-key-min-32-chars
BASE_DOMAIN=yourdomain.com
EOF

# 3. Start with ONE command!
docker compose -f docker-compose.ghcr.yml up -d
```

🎉 Visit `http://your-server-ip` — Done!

---

### ✅ Option 2: Deploy on Railway (Free Tier)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

1. Click the button above
2. Connect your GitHub account
3. Select `YOUR_USERNAME/zrok-ui` repo
4. Set environment variables:
   - `JWT_SECRET` → any random string
   - `BASE_DOMAIN` → your railway subdomain
5. Click **Deploy** ✅

---

### ✅ Option 3: Deploy on Render (Free Tier)

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect GitHub → Select `zrok-ui` repo
3. Set **Root Directory** = `server`
4. Set environment vars (same as above)
5. Click **Deploy** ✅

---

### ✅ Option 4: Build & Run Locally

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/zrok-ui.git
cd zrok-ui

# Build & Start all services
docker compose up -d --build

# Visit
open http://localhost
```

---

## 🔧 Local Development (Without Docker)

```bash
# Terminal 1 — Backend
cd server
npm install
cp .env.example .env   # edit JWT_SECRET
npm run dev            # Runs on :5001

# Terminal 2 — Frontend
cd dashboard
npm install
npm run dev            # Runs on :4000
```

---

## 🔐 Environment Variables

| Variable | Required | Description | Example |
|:--|:--|:--|:--|
| `JWT_SECRET` | ✅ Yes | Secret for JWT signing | `abc123xyz...` (32+ chars) |
| `BASE_DOMAIN` | ✅ Yes | Your server's domain | `tunnel.example.com` |
| `REDIS_URL` | Auto | Redis connection URL | `redis://redis:6379` |
| `PORT` | No | API server port | `5001` |
| `MAX_TUNNELS_PER_TOKEN` | No | Shares per user | `5` |
| `GITHUB_USERNAME` | Deploy | Your GitHub username | `ganeshchavan` |

---

## 📁 Project Structure

```
zrok-ui/
├── .github/
│   └── workflows/
│       └── docker-publish.yml   ← Auto CI/CD (GHCR)
├── dashboard/                   ← React + TypeScript + Tailwind
│   ├── src/
│   │   ├── App.tsx              ← Main SPA
│   │   └── index.css
│   ├── Dockerfile               ← Multi-stage Nginx build
│   └── nginx.conf               ← Reverse proxy config
├── server/                      ← Node.js Express API
│   ├── src/
│   │   ├── index.ts             ← Entry point
│   │   ├── routes/
│   │   │   ├── auth.ts          ← Login/Register/Users
│   │   │   └── tunnels.ts       ← Shares + Analytics
│   │   ├── services/
│   │   │   ├── userService.ts
│   │   │   ├── tokenService.ts
│   │   │   └── tunnelRegistry.ts
│   │   └── utils/
│   │       ├── redis.ts
│   │       └── errors.ts
│   └── Dockerfile
├── docker-compose.yml           ← Local build compose
├── docker-compose.ghcr.yml      ← Production deploy compose
├── .env.example                 ← Environment template
├── LICENSE                      ← MIT License
└── README.md                    ← This file
```

---

## 🤝 Contributing

Pull requests are welcome!

1. Fork the repo
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request ✅

---

## 📄 License

**MIT** © 2024 [Ganesh Chavan](https://github.com/YOUR_USERNAME)

> This project uses [Zrok](https://zrok.io) (Apache 2.0) as the underlying tunneling engine.  
> `zrok-ui` is an independent open-source dashboard and is not officially affiliated with the Zrok project.
