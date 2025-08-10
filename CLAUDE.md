# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Raftel is a modern, feature-rich UI for managing qBittorrent instances, built with React 19, Vite, and TypeScript. It uses TanStack Router for routing, Zustand for state management, and shadcn/ui components with TailwindCSS for styling.

## Common Development Commands

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun build

# Run tests
bun test

# Lint code
bun lint

# Format code
bun format

# Check and fix code (lint + format)
bun check
```

## Architecture Overview

### Core Technologies
- **Framework**: React 19 with TypeScript
- **Routing**: TanStack Router (@tanstack/react-router)
- **State Management**: Zustand
- **UI Components**: shadcn/ui with TailwindCSS
- **Build Tool**: Vite
- **API Client**: Ky (HTTP client)
- **Testing**: Vitest with jsdom

### Project Structure
- `src/main.tsx` - Application entry point
- `src/routes/` - Route definitions using TanStack Router file-based routing
- `src/components/` - Reusable UI components
- `src/features/` - Feature-specific components and logic
- `src/stores/` - Zustand stores for state management
- `src/services/` - API service integrations (qBittorrent)
- `src/types/` - TypeScript type definitions

### Key Architectural Patterns
1. **File-based Routing**: Uses TanStack Router's file-based routing system where routes are defined by file structure
2. **Zustand Stores**: Centralized state management with persisted settings
3. **Service Layer**: qBittorrent API integration through a dedicated service provider
4. **Component Organization**: shadcn/ui style component organization with clear separation of concerns
5. **Authentication Flow**: Built-in auth guard for protected routes

### State Management
- Uses Zustand for global state management
- Settings store handles both qBittorrent preferences and WebUI settings
- Stores are persisted using Zustand's middleware
- Separate stores for different domains (torrents, settings, auth, etc.)

### Routing Structure
- Root route (`/`) with authenticated layout
- Main sections: Dashboard, Torrents, Search, RSS, Logs, Settings
- Settings section with multiple sub-routes for different configuration panels
- Protected routes using AuthGuard component

### API Integration
- qBittorrent Web API integration through QBitProvider service
- Centralized API client configuration
- Type-safe API responses and payloads
- Error handling and authentication management

## Development Guidelines

### Adding New Components
- Use shadcn/ui component installation: `pnpx shadcn@latest add <component-name>`
- Follow existing component patterns in `src/components/`

### Creating New Routes
- Add new route files in `src/routes/` following TanStack Router conventions
- Use file-based routing structure

### State Management
- Create new stores in `src/stores/` for new feature domains
- Use existing store patterns as reference
- Leverage Zustand middleware for persistence when needed

### Testing
- Use Vitest for unit and integration tests
- Place test files adjacent to the code they test
- Use jsdom environment for React component testing