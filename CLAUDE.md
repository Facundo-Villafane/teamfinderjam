# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Basic Operations
- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

### Testing
No test framework is currently configured. Check with the team before adding tests.

### Code Quality
- **Linting Status**: The codebase currently has 59 linting issues (46 errors, 13 warnings)
- Most issues are unused variables that should be cleaned up
- The ESLint rule `no-unused-vars` has a pattern `/^[A-Z_]/u` to allow unused vars starting with capital letters or underscores
- Run `npm run lint` to see detailed issues before committing changes

## Project Architecture

### Technology Stack
- **Frontend Framework**: React 19.1.0 with JSX
- **Build Tool**: Vite 7.0.0
- **Styling**: Tailwind CSS 4.1.11 with Vite plugin
- **Routing**: React Router 7.6.3
- **Authentication**: Firebase Auth (Google OAuth)
- **Database**: Firestore
- **PDF Generation**: jsPDF with QR code support
- **Icons**: Lucide React + React Icons

### Application Structure

This is a **Game Jam Team Finder** application that facilitates team formation and certificate generation for game jams. The app has three main user roles: participants, admins, and visitors.

#### Core Pages & Routing
- `/teamfinder` - Main team finder interface (requires jam participation)
- `/voting` - Theme voting for game jams (requires jam participation)  
- `/admin` - Admin dashboard (restricted to admin emails)
- `/profile` - User profile management (requires authentication)

#### Key Components Architecture

**Layout & Navigation**:
- `Layout.jsx` - Main app layout with navigation
- `AppHeader.jsx` - Header with auth controls
- `NavigationMenu.jsx` - Main navigation component

**Team Finder Module** (`src/components/gamejam/`):
- `JamBanner.jsx` - Displays current jam info and join controls
- `PostsGrid.jsx` - Grid of team-finding posts
- `CreatePostFormWrapper.jsx` - Form for creating/editing posts
- `Navigation.jsx` - Browse/Create post navigation
- `SkillSelector.jsx` / `ToolSelector.jsx` - Skill and tool selection components

**Admin Dashboard** (`src/components/admin/`):
- `AdminDashboard.jsx` - Main admin interface  
- `JamsTab.jsx` - Manage game jams
- `CertificatesTab.jsx` - Generate certificates
- `ThemesTab.jsx` - Manage voting themes
- `UsersTab.jsx` - User management
- `ModerationTab.jsx` - Content moderation

**Certificate System** (`src/components/certificates/`):
- `AdvancedCertificateCreator.jsx` - Bulk certificate generation
- `ManualCertificateCreator.jsx` - Individual certificate creation
- `CertificatePreview.jsx` - Certificate preview component

#### Custom Hooks Pattern

The app uses a comprehensive custom hooks architecture:

- `useAuth.js` - Authentication state and Google OAuth
- `useJams.js` - Active jam data and management
- `useJamParticipation.js` - User participation status and permissions
- `usePosts.js` - Team-finding posts CRUD operations
- `usePostForm.js` - Post form state management
- `useAdminData.js` - Admin dashboard data aggregation
- `useThemeActions.js` - Theme voting operations

#### Firebase Architecture

**Collections**:
- `jams` - Game jam definitions and settings
- `participants` - User participation in specific jams
- `posts` - Team-finding posts by users
- `themes` - Voting themes for jams
- `certificates` - Generated certificates
- `users` - User profiles and settings

**Authentication**:
- Google OAuth only
- Admin access controlled by hardcoded email list in `App.jsx:12`
- User profiles stored in `users` collection

#### Permission System

The app implements a participation-based permission system:

1. **Visitors** - Can view jam info, cannot access posts or voting
2. **Participants** - Must join active jam to create posts or vote
3. **Admins** - Full access to dashboard and management features

Key permission checks:
- `useJamParticipation` hook manages access control
- Posts and voting require active jam participation
- Admin features restricted by email whitelist

#### Certificate Generation

Advanced PDF certificate system using jsPDF:

- **Recognition certificates** - For winners/special categories
- **Participation certificates** - For all participants  
- **Custom certificates** - Manual creation with placeholders
- **Team certificates** - Support for multiple participants
- **QR code integration** - Links to game submissions
- **Dynamic styling** - Category-specific designs and colors

Key files:
- `src/utils/certificateGenerator.js` - Main PDF generation logic
- `src/firebase/certificates.js` - Firestore operations

## Development Guidelines

### Firebase Configuration
- Configuration is in `src/firebase/config.js` with exposed API keys (standard for client-side Firebase)
- Admin email list is hardcoded in `App.jsx` - update as needed

### Code Patterns
- Use custom hooks for data fetching and state management
- Follow existing component structure in `src/components/`
- Firebase operations are abstracted into `src/firebase/` modules
- Form validation and submission handled in custom hooks

### Styling
- Tailwind CSS with dark theme (gray-900 backgrounds)
- Consistent color scheme: green for success, red for errors, blue for info
- Mobile-responsive design patterns established

### State Management
- No external state management library
- State managed through React hooks and context
- Custom hooks handle complex state logic and side effects

## Important Notes

- The app displays Spanish content but code is in English
- Certificate generation supports multiple languages and customization
- Firebase security rules should be reviewed for production deployment
- QR code generation may fail gracefully if library unavailable
- Admin panel includes migration tools for data management