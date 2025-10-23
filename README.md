# Nuxt Layout-Based Web Experience

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)
[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.1.3-00DC82?logo=nuxt)](https://nuxt.com)

A professional layout-based web application built with Nuxt 4, Nuxt UI v4, and Pinia state management.

## 🎯 Project Overview

This project demonstrates a complete implementation of a dual-layout web application with:

- **Frontend Layout**: Public-facing pages with header, footer, and navigation
- **Admin Layout**: Administrative interface with collapsible sidebar and dashboard

## ✨ Features

- 🎨 **Nuxt UI v4** - Professional component library with Tailwind CSS v4
- 🏗️ **Dual Layouts** - Separate frontend and admin layouts
- 🔗 **Cross-Section Navigation** - Quick links between frontend and admin sections
- 🔐 **Authentication System** - Email/password and GitHub OAuth with Appwrite
- 📦 **Pinia State Management** - Reactive stores for layout and navigation
- 🧩 **Composables** - Clean API layer over stores
- 🎭 **Component Library** - Reusable components (Header, Footer, Sidebar, Logo)
- 🎯 **Heroicons** - Professional icon system
- 📱 **Responsive Design** - Mobile-friendly layouts
- ⚡ **Hot Module Replacement** - Fast development experience
- 🧪 **Comprehensive Testing** - 113 unit and API tests passing

## Quick Start

```bash [Terminal]
npm create nuxt@latest -- -t github:nuxt-ui-templates/starter
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=starter&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fstarter&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fstarter-dark.png&demo-url=https%3A%2F%2Fstarter-template.nuxt.dev%2F&demo-title=Nuxt%20Starter%20Template&demo-description=A%20minimal%20template%20to%20get%20started%20with%20Nuxt%20UI.)

## 📁 Project Structure

```
app/
├── assets/css/          # Tailwind CSS configuration
├── components/          # Reusable components
│   ├── AdminHeader.vue  # Admin page header with toggle
│   ├── AdminSidebar.vue # Collapsible navigation sidebar
│   ├── AppFooter.vue    # Frontend footer
│   ├── AppHeader.vue    # Frontend header with navigation
│   └── AppLogo.vue      # Brand logo component
├── composables/         # Composable functions
│   ├── useLayoutState.ts   # Layout state management
│   └── useNavigation.ts    # Navigation helpers
├── layouts/             # Layout templates
│   ├── admin.vue        # Admin layout with sidebar
│   └── default.vue      # Frontend layout
├── pages/               # Application pages
│   ├── index.vue        # Home page
│   ├── info.vue         # About page
│   └── admin/           # Admin pages
│       ├── index.vue    # Admin dashboard
│       └── users.vue    # User management
└── stores/              # Pinia stores
    ├── layout.ts        # Layout state
    └── navigation.ts    # Navigation state

specs/                   # Project specifications
└── 001-layout-based-we/ # Implementation documentation
```

## 🚀 Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Appwrite (Required for Authentication)

1. Copy the environment variables template:

   ```bash
   cp .env.example .env
   ```

2. Follow the [Appwrite Setup Guide](./APPWRITE-SETUP.md) to configure your backend

3. Update `.env` with your Appwrite credentials:
   ```bash
   APPWRITE_PROJECT_ID=your-project-id
   APPWRITE_API_KEY=your-api-key
   APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

## 💻 Development Server

Start the development server on `http://localhost:3001`:

```bash
pnpm dev
```

Visit the following pages:

- **Home**: http://localhost:3001/
- **Info**: http://localhost:3001/info
- **Login**: http://localhost:3001/login
- **Register**: http://localhost:3001/register
- **Admin Dashboard**: http://localhost:3001/admin (requires authentication)
- **Admin Users**: http://localhost:3001/admin/users

## 🏗️ Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

## 🛠️ Tech Stack

- **Framework**: Nuxt 4.1.3
- **UI Library**: Nuxt UI v4.0.1 (Tailwind CSS v4)
- **State Management**: Pinia 3.0.3 with @pinia/nuxt 0.11.2
- **Icons**: Heroicons via @iconify-json/heroicons
- **TypeScript**: Full type safety
- **Dev Server Port**: 3001

## 🧪 Testing

Run the test suite:

```bash
# Unit and API tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage

# E2E tests (requires dev server running)
pnpm e2e
```

**Test Coverage**: 113/113 unit and API tests passing ✅

For E2E testing status and instructions, see [`tests/e2e/auth/E2E-STATUS.md`](./tests/e2e/auth/E2E-STATUS.md)

## 📚 Documentation

### Implementation Documentation

- **Spec 001** (`specs/001-layout-based-we/`) - Layout system and dark mode
- **Spec 002** (`specs/002-basic-usability-i/`) - Cross-section navigation
- **Spec 003** (`specs/003-login-auth-we/`) - Authentication system
  - [`spec.md`](./specs/003-login-auth-we/spec.md) - Feature specification
  - [`IMPLEMENTATION-COMPLETE.md`](./specs/003-login-auth-we/IMPLEMENTATION-COMPLETE.md) - Implementation status

### Setup Guides

- **[APPWRITE-SETUP.md](./APPWRITE-SETUP.md)** - Complete Appwrite backend setup
- **[.env.example](./.env.example)** - Environment variables reference

## 🔐 Authentication

The application includes a complete authentication system powered by [Appwrite](https://appwrite.io):

### Features

- ✅ Email/Password registration and login
- ✅ GitHub OAuth authentication
- ✅ Email verification
- ✅ Password reset flow
- ✅ Protected routes with middleware
- ✅ Session management
- ✅ User-friendly error handling

### Authentication Pages

- `/login` - Login with email/password or GitHub
- `/register` - Create new account
- `/password-reset` - Request password reset
- `/verify-email` - Email verification confirmation

### API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - End session
- `GET /api/auth/session` - Check current session
- `GET /api/auth/oauth/github` - Initiate GitHub OAuth
- `GET /api/auth/callback/github` - Handle OAuth callback
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/verify-email/resend` - Resend verification
- `POST /api/auth/password-reset` - Request password reset
- `POST /api/auth/password-reset/confirm` - Confirm password reset

### Usage in Components

```vue
<script setup lang="ts">
const { user, login, logout } = useAuth();

// Login
await login("user@example.com", "password");

// Access user info
console.log(user.value?.name);

// Logout
await logout();
</script>
```

### Protected Routes

Use middleware to protect routes:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: "auth", // Requires authentication
});
</script>
```

For complete setup instructions, see [APPWRITE-SETUP.md](./APPWRITE-SETUP.md)

## 🎨 Key Components

### Cross-Section Navigation

- **Frontend Header**: Shows "Admin Panel" link to quickly access admin section
- **Admin Header**: Shows "View Site" link to return to frontend
- **Smart Detection**: Automatically shows appropriate link based on current section
- **Seamless UX**: Client-side routing for instant navigation between sections

### Frontend Layout

- Responsive header with navigation
- Three-column footer with brand info
- Clean, professional design

### Admin Layout

- Collapsible sidebar (240px → 64px)
- Dynamic page titles
- Dashboard with stats cards
- User management with search and filters

### Nuxt UI Components Used

- `UButton` - Action buttons with variants
- `UCard` - Content cards
- `UIcon` - Heroicons integration
- `UBadge` - Status and role badges
- `UInput` - Form inputs with icons

## 🔧 Configuration

The project uses:

- **Port 3001** to avoid conflicts
- **Experimental features**: `inlineSSRStyles: false` for better CSS loading
- **App config**: Custom primary/neutral colors (green/slate)

## 📝 Development Notes

- Minor FOUC (Flash of Unstyled Content) in dev mode is expected
- Production builds will have proper CSS extraction
- Components are auto-imported (no manual imports needed)
- Stores are accessible via composables

Check out the [Nuxt documentation](https://nuxt.com/docs) and [Nuxt UI documentation](https://ui.nuxt.com) for more information.
