# Personal Wellness Journal

## Overview

This is a secure behavior and incident tracking application designed to help users document and analyze patterns of abuse or concerning behaviors. The application provides a safe, encrypted environment for users to log incidents, track emotional patterns, and gain insights through AI-powered analysis.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL (configured for Neon Database)
- **API Style**: RESTful endpoints
- **Build Tool**: Vite for development, esbuild for production

### Development Stack
- **Build System**: Vite with React plugin
- **Type Checking**: TypeScript with strict configuration
- **Package Manager**: npm
- **Development Tools**: tsx for TypeScript execution, Replit integration

## Key Components

### Database Schema
- **Users Table**: Authentication and user management
- **Incidents Table**: Core incident logging with behavior types, feelings, safety ratings
- **Audio Recordings Table**: Audio attachment storage with transcription support
- **Data Types**: Support for JSON fields for audio recordings array

### Core Features
1. **Incident Logging**: Comprehensive form for documenting concerning behaviors
2. **Audio Recording**: Integrated audio capture with transcription capabilities
3. **Analytics Dashboard**: Visual insights into behavior patterns and trends
4. **Security Features**: Local encryption, secure storage, discretion mode
5. **AI Integration**: OpenRouter API for incident analysis and insights

### UI Components
- **Incident Form**: Multi-field form with validation for logging incidents
- **Analytics Dashboard**: Charts and visualizations for pattern recognition
- **Audio Recorder**: Component for capturing and managing audio evidence
- **Sidebar**: Navigation and recent entries display

## Data Flow

1. **Incident Creation**: User fills form → Validation → API call → Database storage
2. **Audio Recording**: Microphone access → Blob creation → Optional transcription → Storage
3. **Analytics**: Database queries → Statistical analysis → Visualization
4. **AI Analysis**: Incident data → OpenRouter API → Insights → User display

## External Dependencies

### Database & Storage
- **Neon Database**: PostgreSQL hosting
- **Drizzle Kit**: Database migrations and schema management

### AI & Analysis
- **OpenRouter API**: AI-powered incident analysis using Gemini models
- **Galadia API**: Audio recording and transcription services (planned)

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component library

### Development Tools
- **Replit**: Development environment with custom plugins
- **Vite**: Development server and build tool
- **esbuild**: Production bundling

## Deployment Strategy

### Development
- Vite development server with HMR
- tsx for TypeScript execution
- Replit integration for cloud development

### Production Build
1. Frontend: Vite builds React app to `dist/public`
2. Backend: esbuild bundles server to `dist/index.js`
3. Database: Drizzle Kit manages schema migrations
4. Environment: Node.js production server

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `VITE_OPENROUTER_API_KEY`: AI analysis API key
- `NODE_ENV`: Environment specification

## Changelog

```
Changelog:
- June 28, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```