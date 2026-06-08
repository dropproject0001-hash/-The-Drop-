# Food Delivery & Logistics Platform

A comprehensive, production-ready full-stack web application with real-time GPS tracking, multi-role dashboards, and enterprise features.

## 🚀 Features

- **Real-time GPS Tracking**: Live driver and order tracking with Mapbox
- **Multi-Role System**: Admin, Restaurant Manager, Driver, Customer, Warehouse Manager
- **Live Chat**: Real-time messaging with WebSocket
- **Order Management**: Complete order lifecycle management
- **Inventory System**: Warehouse inventory tracking and management
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **PWA Support**: Installable web app with offline support
- **Dark Mode UI**: Modern, futuristic glassmorphism design
- **Mobile-First**: Optimized for mobile and desktop devices

## 🛠 Tech Stack

**Frontend:**
- Next.js 15 with React 19
- TailwindCSS + Shadcn/ui
- Mapbox GL JS
- Socket.io Client
- Framer Motion
- Zustand State Management

**Backend:**
- Node.js + Express.js
- Socket.io Server
- PostgreSQL + Prisma ORM
- JWT Authentication
- Redis Caching
- Cloudinary Storage

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL Database
- Redis Cache
- Nginx (optional reverse proxy)

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+
- Mapbox Account (for API token)

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone repository
git clone <repo-url>
cd food-delivery-logistics

# Setup environment variables
cp .env.example .env

# Start all services
docker-compose up -d

# Access services
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432
- Redis: localhost:6379
