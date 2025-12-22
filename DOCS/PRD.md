# **HOTEL MANAGEMENT SYSTEM (HMS)**
## **PRODUCT REQUIREMENTS DOCUMENT (PRD)**

**Version:** 3.0  
**Date:** December 23, 2025  
**Status:** Approved  
**Prepared For:** Development Team, Stakeholders, AI Development Agents  
**Prepared By:** Grace Kamami & Team  
**Purpose:** To define a modern, scalable Hotel Management System built with cutting-edge technologies for optimal performance, developer experience, and future scalability.

---

## **1.0 EXECUTIVE SUMMARY**

### **1.1 Product Vision**
To build a **modern, cloud-native Hotel Management System** that provides small to medium-sized hotels with enterprise-grade capabilities through a beautiful, intuitive interface, real-time data synchronization, and robust automation—all while maintaining developer velocity and system reliability.

### **1.2 Problem Statement**
Traditional hotel systems suffer from:
- **Fragmented Data:** Information silos between reservations, guests, and billing
- **Poor User Experience:** Clunky interfaces that slow down staff
- **Technical Debt:** Legacy systems difficult to maintain or extend
- **Scalability Issues:** Cannot handle growth or additional properties
- **Security Risks:** Weak authentication and authorization models

### **1.3 Technology Advantage**
- **Real-time Updates:** Instant room status changes across all devices
- **Modern Stack:** Developer-friendly with strong typing and excellent tooling
- **Cloud-First:** Built for reliability and global accessibility
- **Security First:** Enterprise-grade authentication with minimal configuration
- **Future-Proof:** Modular architecture ready for extensions

---

## **2.0 SCOPE & DELIMITATIONS**

### **2.1 In-Scope (MVP Features)**
| Module | Key Capabilities |
|--------|------------------|
| **1. Authentication & Authorization** | Clerk-powered auth, role-based access, session management, multi-factor authentication support |
| **2. Hotel Configuration** | Property setup, room types, pricing strategies, tax configurations, amenity definitions |
| **3. Real-time Room Management** | Live room status dashboard, maintenance tracking, visual floor plans, availability calendar |
| **4. Reservation System** | Availability search, booking engine, waitlist management, cancellation handling |
| **5. Guest Relationship Management** | Guest profiles, stay history, preferences, document management |
| **6. Front Desk Operations** | Streamlined check-in/out, walk-in reservations, early/late handling |
| **7. Billing & Payments** | Automated invoicing, payment tracking, receipt generation, outstanding balance management |
| **8. Analytics Dashboard** | Real-time KPIs, occupancy analytics, revenue reports, guest insights |
| **9. Admin Panel** | User management, audit logs, system monitoring, backup controls |

### **2.2 Out-of-Scope (Post-MVP)**
- Mobile applications (iOS/Android)
- Channel manager integrations (Booking.com, Expedia)
- POS integration for restaurants/spa
- Housekeeping mobile app
- Inventory management
- Marketing automation
- Multi-property management (though architecture supports it)
- Advanced revenue management algorithms

---

## **3.0 USER PERSONAS & ROLES**

### **3.1 System Administrator**
- **Goal:** System stability and security
- **Tech Stack Access:** Clerk Dashboard, Supabase Dashboard
- **Key Tasks:** User management, role assignment, system configuration, backup management
- **Authentication:** Clerk Admin Portal access

### **3.2 Hotel Manager**
- **Goal:** Business optimization and reporting
- **Tech Stack Access:** Advanced analytics views, financial reports
- **Key Tasks:** Performance monitoring, rate management, staff oversight
- **Authentication:** Clerk with `manager` role, dashboard access

### **3.3 Front Desk Agent**
- **Goal:** Efficient guest service
- **Tech Stack Access:** Reservation management, guest check-in/out
- **Key Tasks:** Guest handling, room assignment, billing processing
- **Authentication:** Clerk with `receptionist` role, limited access

### **3.4 Housekeeping (Future)**
- **Goal:** Room readiness and maintenance
- **Tech Stack Access:** Mobile-optimized task lists
- **Key Tasks:** Room status updates, maintenance reporting
- **Authentication:** Clerk with `housekeeping` role (future scope)

---

## **4.0 FUNCTIONAL REQUIREMENTS**

### **4.1 Authentication & Authorization (Powered by Clerk)**
- **FR-AUTH-01:** Secure login via Clerk with email/password, social providers optional
- **FR-AUTH-02:** Role-based permissions (`admin`, `manager`, `receptionist`)
- **FR-AUTH-03:** Session management with automatic timeout (configurable)
- **FR-AUTH-04:** Multi-factor authentication capability (ready for future enablement)
- **FR-AUTH-05:** Password policies enforced by Clerk
- **FR-AUTH-06:** Seamless logout across all tabs/devices

### **4.2 Hotel Configuration**
- **FR-CONFIG-01:** Hotel profile management (name, address, contact, logo)
- **FR-CONFIG-02:** Room type definitions with amenities, photos, pricing tiers
- **FR-CONFIG-03:** Dynamic pricing rules (seasonal, day-of-week, last-minute)
- **FR-CONFIG-04:** Tax configuration (multiple tax rates, inclusive/exclusive)
- **FR-CONFIG-05:** Cancellation policy management

### **4.3 Real-time Room Management**
- **FR-ROOM-01:** Visual room grid with real-time status via Supabase Realtime
- **FR-ROOM-02:** Color-coded statuses: Available, Occupied, Cleaning, Maintenance
- **FR-ROOM-03:** Drag-and-drop room assignments for check-ins
- **FR-ROOM-04:** Maintenance scheduling with notes and expected completion
- **FR-ROOM-05:** Bulk room status updates
- **FR-ROOM-06:** Room move functionality with audit trail

### **4.4 Reservation System**
- **FR-RES-01:** Availability calendar with rate display
- **FR-RES-02:** Intelligent search by date range, room type, guest count
- **FR-RES-03:** Real-time availability validation (prevents overbooking)
- **FR-RES-04:** Booking creation with guest selection (existing or new)
- **FR-RES-05:** Special requests and notes attached to reservations
- **FR-RES-06:** Waitlist management with automatic promotion when available
- **FR-RES-07:** Reservation modification with availability re-check
- **FR-RES-08:** Cancellation with policy enforcement and reason tracking

### **4.5 Guest Management**
- **FR-GUEST-01:** Comprehensive guest profile creation/editing
- **FR-GUEST-02:** Document upload and storage (passport, ID scans) via Supabase Storage
- **FR-GUEST-03:** Stay history with drill-down capability
- **FR-GUEST-04:** Preference tracking (room preferences, amenities, special needs)
- **FR-GUEST-05:** Communication log (calls, emails, notes)
- **FR-GUEST-06:** Merge duplicate profiles with conflict resolution

### **4.6 Front Desk Operations**
- **FR-FD-01:** Quick check-in flow with ID verification and payment capture
- **FR-FD-02:** Express check-out with bill preview and email receipt
- **FR-FD-03:** Walk-in reservation to check-in in under 2 minutes
- **FR-FD-04:** Early check-in/late check-out with automatic pricing
- **FR-FD-05:** Room change with automatic system updates
- **FR-FD-06:** Folio management with charge/postings

### **4.7 Billing & Payments**
- **FR-BILL-01:** Automatic charge calculation with tax and service fees
- **FR-BILL-02:** Real-time folio updates as charges are added
- **FR-BILL-03:** Multiple payment methods per stay (split payments)
- **FR-BILL-04:** Receipt generation (PDF) with hotel branding
- **FR-BILL-05:** Deposit management and refund processing
- **FR-BILL-06:** Outstanding balance tracking and reminders
- **FR-BILL-07:** Daily transaction summary and audit reports

### **4.8 Analytics & Reporting**
- **FR-REPORT-01:** Real-time dashboard with key metrics (occupancy, ADR, RevPAR)
- **FR-REPORT-02:** Custom date range reporting
- **FR-REPORT-03:** Export capabilities (PDF, CSV, Excel)
- **FR-REPORT-04:** Guest segmentation and behavior analysis
- **FR-REPORT-05:** Staff performance metrics (check-ins per hour, etc.)
- **FR-REPORT-06:** Financial reports (P&L, revenue by segment, payment methods)

### **4.9 Administration**
- **FR-ADMIN-01:** User management via Clerk integration
- **FR-ADMIN-02:** Role and permission management
- **FR-ADMIN-03:** Audit trail of all system changes
- **FR-ADMIN-04:** System health monitoring
- **FR-ADMIN-05:** Database backup and restore interface

---

## **5.0 NON-FUNCTIONAL REQUIREMENTS**

### **5.1 Performance**
- Initial page load: < 3 seconds
- Subsequent interactions: < 1 second
- Support 50+ concurrent users
- Real-time updates: < 500ms propagation
- Supabase query performance: < 100ms for core queries

### **5.2 User Experience**
- **Intuitive Interface:** New staff proficient within 30 minutes
- **Responsive Design:** Flawless on desktop, tablet, and mobile
- **Accessibility:** WCAG 2.1 AA compliance
- **Offline Capability:** Critical data cached for brief disconnections
- **Progressive Web App:** Installable on mobile devices

### **5.3 Security**
- **Authentication:** Clerk enterprise-grade security
- **Authorization:** Row-Level Security (RLS) in Supabase
- **Data Encryption:** At-rest and in-transit encryption
- **Audit Logging:** Complete audit trail of all data changes
- **Compliance:** GDPR-ready data handling

### **5.4 Reliability**
- **Uptime:** 99.9% target (via Supabase SLA)
- **Error Rate:** < 0.1% of requests
- **Data Durability:** Supabase automatic backups
- **Recovery:** Point-in-time recovery capability

### **5.5 Scalability**
- **Database:** Supabase auto-scaling PostgreSQL
- **Storage:** Supabase Storage with CDN
- **Concurrency:** Designed for multiple properties
- **Internationalization:** Architecture ready for i18n

---

## **6.0 TECHNOLOGY ARCHITECTURE**

### **6.1 Technology Stack**

#### **Frontend**
- **Framework:** React 18+ with TypeScript
- **State Management:** TanStack Query (React Query) + Zustand
- **UI Library:** Shadcn/ui (Radix UI based) + Tailwind CSS
- **Forms:** React Hook Form with Zod validation
- **Charts:** Recharts or Tremor
- **PDF Generation:** React-PDF or jsPDF
- **Build Tool:** Vite
- **Testing:** Vitest + React Testing Library
- **Deployment:** Vercel or Netlify

#### **Backend Services**
- **Database & Backend:** Supabase (PostgreSQL + Realtime + Storage)
- **Authentication:** Clerk (with Supabase integration)
- **APIs:** Supabase REST/GraphQL + Edge Functions when needed
- **Realtime:** Supabase Realtime subscriptions

#### **Development & DevOps**
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Code Quality:** ESLint + Prettier + TypeScript strict mode
- **Monitoring:** Sentry for error tracking
- **Analytics:** PostHog or Vercel Analytics

### **6.2 Architecture Diagram**
```mermaid
graph TB
    subgraph "Client Layer"
        A[React PWA] --> B[TanStack Query]
        B --> C[Zustand Store]
    end
    
    subgraph "API Layer"
        D[Supabase Client] --> E[Supabase REST API]
        D --> F[Supabase Realtime]
        D --> G[Supabase Storage]
    end
    
    subgraph "Auth Layer"
        H[Clerk Auth] --> I[Supabase JWT Integration]
    end
    
    subgraph "Data Layer"
        J[PostgreSQL Database]
        K[Row Level Security]
        L[Database Functions]
    end
    
    C --> D
    I --> J
    E --> J
    J --> K

6.3 Database Schema (Supabase PostgreSQL)
sql

-- Core tables with RLS policies
profiles (
  id UUID REFERENCES auth.users,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'receptionist')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  max_occupancy INTEGER,
  amenities JSONB,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number TEXT UNIQUE NOT NULL,
  room_type_id UUID REFERENCES room_types(id),
  status TEXT CHECK (status IN ('available', 'occupied', 'cleaning', 'maintenance')),
  floor INTEGER,
  features JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  phone TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  id_type TEXT,
  id_number TEXT,
  id_scan_url TEXT,
  nationality TEXT,
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id),
  room_id UUID REFERENCES rooms(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults INTEGER DEFAULT 1,
  children INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show')),
  special_requests TEXT,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_overlap EXCLUDE USING gist (
    room_id WITH =,
    daterange(check_in, check_out) WITH &&
  )
);

invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id),
  invoice_number TEXT UNIQUE NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'partially_paid', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

6.4 Row-Level Security (RLS) Policies
sql

-- Example RLS policies for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Similar policies for other tables based on role

7.0 UI/UX REQUIREMENTS
7.1 Design System

    Design Tool: Figma (component library)

    Theme: Light/Dark mode support

    Typography: Inter font family

    Spacing: 4px base unit (Tailwind spacing scale)

    Colors: Custom hotel brand colors with accessibility contrast

7.2 Key Screens & Components

    Dashboard

        Real-time occupancy widget

        Today's arrivals/departures

        Revenue summary

        Quick actions panel

    Room Grid View

        Visual floor representation

        Color-coded room status

        Drag-and-drop assignments

        Room details on hover/click

    Reservation Calendar

        Month/week/day views

        Drag to modify stays

        Rate display overlay

        Conflict detection

    Guest Check-in Flow

        Step-by-step wizard

        ID capture (camera/upload)

        Payment method collection

        Room assignment interface

    Billing Interface

        Real-time folio updates

        Split payment interface

        Receipt preview

        Payment history

7.3 Mobile Responsiveness

    Desktop: Full feature set

    Tablet: Optimized for iPad at front desk

    Mobile: Critical functions only (future housekeeping app)

8.0 API & INTEGRATION REQUIREMENTS
8.1 Supabase Integration

    Real-time subscriptions for room status

    Storage for guest documents

    Database functions for complex operations

    Edge Functions for custom business logic

8.2 Clerk Integration

    JWT tokens passed to Supabase

    User metadata sync with profiles table

    Webhook handlers for user events

    Session management synchronization

8.3 Future Integration Points

    Payment Gateways: Stripe, PayPal webhooks

    Email Service: Resend or SendGrid

    SMS Service: Twilio

    Analytics: PostHog for user behavior

9.0 DEVELOPMENT WORKFLOW
9.1 Git Strategy

    Main Branch: Production-ready code

    Develop Branch: Integration branch

    Feature Branches: feature/description

    Release Branches: release/v1.0.0

    Hotfix Branches: hotfix/description

9.2 CI/CD Pipeline
yaml

# GitHub Actions example
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}

9.3 Testing Strategy

    Unit Tests: Component logic, utilities

    Integration Tests: API endpoints, database operations

    E2E Tests: Critical user flows (Cypress or Playwright)

    Performance Tests: Lighthouse CI integration

10.0 DEPLOYMENT & HOSTING
10.1 Frontend Deployment

    Primary: Vercel (for React optimization)

    Fallback: Netlify

    Domain: Custom domain with SSL

    CDN: Global edge network

10.2 Backend Deployment

    Database: Supabase managed PostgreSQL

    Auth: Clerk managed service

    Storage: Supabase Storage with CDN

    Functions: Supabase Edge Functions

10.3 Environment Configuration
text

.env.local
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-key

11.0 SUCCESS METRICS & KPIs
11.1 System Performance

    Page Load Time: < 3 seconds

    Time to Interactive: < 5 seconds

    Error Rate: < 0.1%

    Uptime: 99.9%

11.2 Business Impact

    Check-in Time: Reduced from 5+ minutes to < 2 minutes

    Double Bookings: 0% occurrence

    Reporting Time: Real-time vs daily manual compilation

    Guest Satisfaction: Measured via future survey integration

11.3 Development Metrics

    Build Time: < 2 minutes

    Test Coverage: > 80%

    Lighthouse Score: > 90

    Bundle Size: < 500KB gzipped

12.0 FUTURE ROADMAP
Phase 2 (Q2 2026)

    Online booking portal for guests

    Email notification system

    Basic housekeeping module

    Enhanced reporting with forecasting

Phase 3 (Q3 2026)

    Mobile app for housekeeping

    Channel manager integration

    Advanced revenue management

    Guest mobile check-in

Phase 4 (Q4 2026)

    Multi-property management

    AI-powered recommendations

    Predictive maintenance

    Marketplace for integrations

13.0 RISKS & MITIGATIONS
Risk	Probability	Impact	Mitigation
Supabase dependency	Medium	High	Regular database exports, escape plan to self-hosted Postgres
Clerk pricing changes	Low	Medium	Auth abstraction layer, backup Supabase Auth
Team skill gap	Medium	Medium	Comprehensive documentation, paired programming
Scope creep	High	High	Strict MVP definition, feature freeze periods
Performance issues	Low	High	Performance budgets, regular load testing
14.0 APPROVALS
Role	Name	Signature	Date
Product Owner	Grace Kamami	[Digital Signature]	2025-12-23
Technical Lead	[To be assigned]	[Digital Signature]	[Date]
Supervisor	Emmanuel Charo	[Digital Signature]	2025-12-23
15.0 APPENDIX
15.1 Glossary

    ADR: Average Daily Rate

    RevPAR: Revenue Per Available Room

    RLS: Row-Level Security (Supabase)

    PWA: Progressive Web App

    JWT: JSON Web Token

15.2 References

    Supabase Documentation

    Clerk Documentation

    React Documentation

    TypeScript Handbook

15.3 Change Log
Version	Date	Changes	Author
1.0	2025-12-22	Initial draft	Grace Kamami
2.0	2025-12-23	Technology update	Grace Kamami
3.0	2025-12-23	React + Supabase + Clerk stack	Grace Kamami