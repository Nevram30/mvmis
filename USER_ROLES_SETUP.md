# User Roles Setup - Motor Vehicle Management Information System

## Overview
The system has been successfully configured with role-based access control and navigation. Users are automatically redirected to their appropriate dashboards based on their assigned roles.

## Database Setup

### User Roles
The system supports 4 user roles:
- **ADMIN** - System administration and user management
- **SECRETARY** - Document management, appointments, customer records
- **MECHANIC** - Work orders, vehicle inspections, parts inventory
- **PROPRIETOR** - Business analytics, financial overview, staff management

### Database Schema
- Added `UserRole` enum with the 4 roles
- Added `role` field to User model with default value `PROPRIETOR`
- Migration applied successfully

## User Accounts Created
5 users have been seeded in the database:

| Role | Email | Name | Password |
|------|-------|------|----------|
| ADMIN | admin@mvmis.com | System Administrator | password123 |
| SECRETARY | secretary@mvmis.com | Maria Santos | password123 |
| MECHANIC | mechanic1@mvmis.com | Juan Dela Cruz | password123 |
| MANAGER| manager@mvmis.com | Carlos Mendoza | password123 |
| PROPRIETOR | proprietor@mvmis.com | Roberto Reyes | password123 |

## Authentication & Session Management

### NextAuth Configuration
- Updated to include user role in session
- JWT tokens now carry role information
- Session callbacks properly return role data

### Protected Routes
- Created `ProtectedLayout` component for role-based access control
- Each role-specific page is protected and only accessible by authorized users
- Unauthorized users are redirected to appropriate pages

## Navigation & Routing

### Route Structure
```
/                    -> Login page (redirects to /dashboard if authenticated)
/dashboard           -> Role-based redirect hub
/auth/login          -> Login page with role-based redirection
/admin               -> Admin dashboard (ADMIN only)
/secretary           -> Secretary dashboard (SECRETARY only)
/mechanic            -> Mechanic dashboard (MECHANIC only)
/proprietor          -> Proprietor dashboard (PROPRIETOR only)
```

### Dashboard Features

#### Admin Dashboard
- User management
- System settings
- System reports
- Recent activity tracking

#### Secretary Dashboard
- Document management
- Appointment scheduling
- Customer records management
- Daily task tracking

#### Mechanic Dashboard
- Work order management
- Vehicle inspections
- Parts inventory
- Current job status tracking

#### Proprietor Dashboard
- Business analytics
- Financial overview
- Staff management
- Key performance metrics

## Security Features

### Role-Based Access Control
- Each page checks user role before rendering
- Unauthorized access attempts redirect to appropriate dashboard
- Session validation on every protected route

### Session Management
- Automatic session refresh
- Role information persisted in JWT
- Secure logout functionality

## Usage Instructions

### For Testing
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Use any of the test accounts listed above
4. Users will be automatically redirected to their role-specific dashboard

### Navigation Flow
1. User visits any route
2. If not authenticated -> redirected to login
3. After successful login -> redirected to `/dashboard`
4. `/dashboard` checks user role and redirects to appropriate page:
   - ADMIN -> `/admin`
   - SECRETARY -> `/secretary`
   - MECHANIC -> `/mechanic`
   - PROPRIETOR -> `/proprietor`

### Direct Route Access
- Users can directly access `/dashboard` and will be redirected appropriately
- Direct access to role-specific routes is protected
- Wrong role access attempts redirect to user's correct dashboard

## Files Modified/Created

### Database
- `prisma/schema.prisma` - Added UserRole enum and role field
- `prisma/seed.ts` - Updated to create 5 users with different roles

### Authentication
- `src/server/auth/config.ts` - Updated to include role in session

### Components
- `src/app/_components/protected-layout.tsx` - Role-based access control component

### Pages
- `src/app/page.tsx` - Updated main page with authentication redirect
- `src/app/dashboard/page.tsx` - Role-based redirect hub
- `src/app/auth/login/page.tsx` - Updated with role-based redirection
- `src/app/admin/page.tsx` - Admin dashboard
- `src/app/secretary/page.tsx` - Secretary dashboard
- `src/app/mechanic/page.tsx` - Mechanic dashboard
- `src/app/proprietor/page.tsx` - Proprietor dashboard

## Next Steps
- Implement actual functionality for each dashboard
- Add user management features for admin
- Create database models for business entities (vehicles, work orders, etc.)
- Add more granular permissions within roles
- Implement audit logging for security
