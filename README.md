# Puddle - Web3 Savings dApp

A beautiful, pixel-art RPG-styled web3 savings application built with Next.js 14, featuring WebGL animations, particle systems, and a gorgeous UI inspired by Codédex.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwind-css)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎮 **Pixel Art RPG Interface**
- Custom WebGL rendering engine for smooth 2D graphics
- Particle systems (clouds, birds, grass animations)
- Parallax scrolling with 11-layer depth effect
- Sprite animation system for pixel art characters

### 🔐 **Authentication System**
- Email/Password login (mockup)
- OAuth integration (Google & GitHub - mockup)
- Persistent sessions with localStorage
- Protected routes with middleware

### 🎨 **Beautiful UI/UX**
- Dark mode support with theme switching
- Responsive design (mobile-first)
- Framer Motion animations throughout
- Glass-morphism effects
- Custom pixel-art styling

### 💰 **Savings Features**
- Dashboard with stats overview
- Multiple savings goals tracking
- Progress visualization with animated charts
- Transaction history
- Goal management interface

### 🔍 **Navigation**
- Sticky navbar with scroll effects
- Slide-in search sidebar
- Mobile-responsive hamburger menu
- Smooth page transitions

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd puddle/fe
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Run development server**
```bash
npm run dev
# or
pnpm dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
fe/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page
│   ├── login/               # Login page
│   └── home/                # Protected home dashboard
│
├── components/
│   ├── auth/                # Authentication components
│   │   ├── LoginForm.tsx
│   │   └── OAuthButtons.tsx
│   │
│   ├── landing/             # Landing page components
│   │   ├── PixelScene.tsx   # WebGL wrapper
│   │   ├── HeroSection.tsx
│   │   └── FeaturesSection.tsx
│   │
│   ├── layout/              # Layout components
│   │   ├── Navbar.tsx
│   │   ├── SearchSidebar.tsx
│   │   ├── MainLayout.tsx
│   │   └── MiddlewareWrapper.tsx
│   │
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       └── card.tsx
│
├── lib/
│   ├── store/               # Zustand stores
│   │   ├── authStore.ts     # Authentication state
│   │   ├── themeStore.ts    # Theme management
│   │   └── uiStore.ts       # UI state (sidebar, etc)
│   │
│   ├── webgl/               # WebGL rendering engine
│   │   ├── PixelSceneRenderer.ts  # Core renderer
│   │   ├── ParticleSystem.ts      # Particle effects
│   │   ├── SpriteAnimator.ts      # Sprite animations
│   │   └── ParallaxController.ts  # Parallax effects
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   ├── useScrollPosition.ts
│   │   └── useMediaQuery.ts
│   │
│   └── utils.ts             # Utility functions
│
├── styles/
│   ├── globals.css          # Global styles & Tailwind
│   ├── themes.css           # CSS custom properties
│   └── components.css       # Reusable component styles
│
└── types/
    ├── auth.types.ts        # Authentication types
    └── webgl.types.ts       # WebGL types
```

## 🎨 Tech Stack

### Core Framework
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **React 19** - Latest React features

### Styling
- **Tailwind CSS v4** - Utility-first CSS framework
- **CSS Custom Properties** - Theme system
- **Framer Motion** - Animation library

### State Management
- **Zustand** - Lightweight state management
- **localStorage** - Persistent storage

### Graphics
- **Native WebGL** - High-performance 2D rendering
- **Canvas API** - Particle systems and effects

### UI Components
- **shadcn/ui** - Accessible component library
- **Lucide React** - Icon library

## 🎮 Key Pages

### Landing Page (`/`)
- Hero section with animated pixel scene background
- Feature cards showcasing app capabilities
- Stats section with user metrics
- Footer with navigation links
- **Public access** - no authentication required

### Login Page (`/login`)
- Email/password form with validation
- OAuth buttons (Google, GitHub)
- Animated background particles
- Form error handling
- **Public route** - redirects if already authenticated

### Home Dashboard (`/home`)
- Protected route requiring authentication
- Stats overview (savings, goals, streak)
- Savings goals with progress bars
- Recent transaction history
- Interactive goal cards
- **Protected** - requires login

## 🧪 Demo Mode

The app is in **demo mode** - any credentials work:

**Email Login**
- Email: any valid email format
- Password: any 6+ characters

**OAuth Login**
- Click Google/GitHub button
- Auto-generates mock user

## 📱 Responsive Design

- **Mobile First** - Optimized for touch devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interfaces
- Hamburger menu navigation
- Simplified animations on mobile

## 🎨 Theme System

Toggle between light/dark modes via navbar. Themes persist in localStorage.

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - How to deploy to production
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines

## 🗺️ Roadmap

### Phase 7: Web3 Integration (Future)
- Connect to Ethereum/Polygon
- Smart contract integration  
- Wallet connection (MetaMask)

### Phase 8: Advanced Features (Future)
- Multi-currency support
- Achievement system
- Leaderboards

## 📄 License

MIT License - feel free to use this code for learning.

## 🙏 Acknowledgments

- Next.js team for the framework
- Tailwind CSS for styling utilities
- shadcn for component library

---

