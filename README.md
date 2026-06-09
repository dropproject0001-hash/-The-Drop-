# THE DROP SHOP (Droppin Ops)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg?logo=react)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.x-38b2ac.svg?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ecf8e.svg?logo=supabase)

A futuristic, mobile-first, real-time GPS-based product drop tracking system designed specifically for secure, covert operations. 

## 🚀 System Overview

The Drop Shop platform offers a high-performance interactive map interface with real-time tracking, structured around 3 strict authorization levels:

1. **Super Admin / Owner**: Overseer clearance to track all agents, monitor drops, and analyze system-wide logistics.
2. **Admin / Dropper**: Operative clearance to execute GPS drops, provide instructions, and coordinate with clients on the field.
3. **Client / Buyer**: End-user clearance to await encrypted coordinates, trace paths to payload drops, and mark successful retrievals.

---

## 🛠 Tech Stack

- **Frontend:** React + Vite, TailwindCSS, Framer Motion
- **Backend & Database:** Supabase (PostgreSQL, Realtime subscriptions, Auth)
- **Map System:** React Leaflet (`react-leaflet`) for interactive open-source mapping
- **Architecture:** PWA (Progressive Web App) Support
- **Icons:** Lucide React

---

## 🔥 Key Features

### 🌍 Global Features
- **Realtime Live Map:** Moving markers, precise GPS tracking, dynamic pathway indicators.
- **Push & Realtime Notifications:** Live status updates without refreshing.
- **Cyberpunk / Tactical UI:** Dark mode by default, neon accents, glassmorphism aesthetics.
- **Mobile Responsive & PWA Ready:** Installable on Android devices, capable of offline basic support, fast load times via service workers.
- **Encrypted Messaging:** Realtime WebSocket-based multi-channel communication.

### 🛡 Super Admin Panel
- **Live GPS Tracking:** Complete visibility over Admin/Dropper users on the field.
- **Global Map Monitoring:** Color-coded tracking for all active drops and clients, supporting marker clustering.
- **Detailed Analytics:** Heatmaps, drop success logs, drop timestamps, and delivery success rates.
- **Master Inventory Management:** Stock monitoring, low stock alerts, logging.

### 🎯 Admin / Dropper Panel
- **Product Drop Execution:** Pin exact GPS coordinates, upload image/video evidence, and attach secure notes.
- **QR Code Generation:** Secure payloads with automatically generated validation QR codes.
- **Client Coordination:** Active order approvals, private client messaging, and secure location broadcasting.

### 📱 Client / Buyer Panel
- **Map & Routing:** Track approved product drop locations and actively calculate distance/pathway to the destination.
- **Product Looting:** Interactive confirmation loop. Once looted, the map marker disappears and transactions finalize automatically.
- **Encrypted Interaction:** Receive hidden product images, video guides, and coordinates *only* post-payment validation.

---

## 💻 Running Locally

### Prerequisites
- Node.js (v18+)
- npm or pnpm
- Supabase Account / configuration keys

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/the-drop-shop.git
   cd the-drop-shop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Duplicate `.env.example` to `.env` and fill out the required variables:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

---

## 📲 PWA Configuration

The Drop Shop is highly optimized for mobile devices and can be installed natively.
- Make sure `manifest.json` and service workers are correctly mapped.
- Ensure Android devices validate the custom "Add to Home Screen" prompt for the best full-screen tactical experience.

---

## 🔒 Security Practices

- **Role-Based Access Control (RBAC):** Users must be verified under strict role guidelines. Clients cannot see Admin GPS positions.
- **Map Privacy:** Location coordinate broadcast terminates the moment a transaction concludes or a product is 'Looted'.
- **Evidence Verification:** Media attachments (videos/images) are secured behind authenticated requests.

---

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

*Unauthorised access is strictly prohibited. Initialization sequence locked.*
