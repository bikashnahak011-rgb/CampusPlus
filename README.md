# CampusOne 🎓
### One Campus. One Platform. Zero Confusion.

A campus management prototype with demo mode and partial Supabase/FastAPI integration. Several modules remain demo-only and need database-backed implementations before production use.

---

## 🚀 Quick Start — Demo Mode (No Setup Required)

```bash
npm install
npm run dev
```

Open **http://localhost:5173**

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Student | `student@campusone.demo` | `demo123` |
| Admin | `admin@campusone.demo` | `demo123` |

> Demo accounts are available only in local development. Production sign-in requires Supabase; live campus records also require the database migrations and backend below.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Charts | Recharts |
| Backend | Supabase (PostgreSQL + Auth) |
| AI | Poe-powered Campus AI chat and authenticated FastAPI campus services |

---

## ⚙️ Production Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Run `supabase/production_hardening.sql` to secure account roles, document/leave requests, and approval notifications
4. Run `supabase/document_requests.sql` to create private PDF storage and student/admin access policies for approved documents
5. Run `supabase/complaints_realtime.sql` to enable secure complaint updates and live complaint subscriptions
6. Run `supabase/ai_engine.sql` to enable live insights and backend analysis tables
7. Run `supabase/bus_tracking.sql` to enable secure GPS publishing and live bus route/location updates
8. Run `supabase/faculty.sql` to enable the shared faculty directory and admin-only editing
9. Run `supabase/exam_results.sql` to enable SGPA/CGPA result publishing and student notifications
10. Run `supabase/email_notifications.sql` to queue student email notifications for new in-app updates and journal reviews
11. Run or re-run `supabase/admin_roles.sql` and deploy `supabase/functions/manage-admin-users/index.ts`; it limits Main Administrator to the verified `bikashnahak023@gmail.com` account, restricts Hostel Management to `dragonfire0222@gmail.com`, and applies role-scoped access. All other users receive student profiles by default. The Main Administrator can invite administrators or assign specialist roles to existing student accounts from User Management.
12. Run or re-run `supabase/academic_resources.sql` to add Academic Resources (including faculty assignment PDFs), faculty subject permissions, timetable management, the private storage bucket, and RLS policies
13. Run `supabase/mess_orders.sql` after `admin_roles.sql` to enable student meal reservations and live order tracking for Mess Management.
13. Deploy the FastAPI backend as a separate HTTPS service. Set its `SUPABASE_URL`, server-only `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGINS`, and `POE_API_KEY` (plus optional `POE_MODEL` and `POE_TIMEOUT_SECONDS`) in the backend service settings. Keep the Poe key on the backend only. Add the Resend email settings described in `backend/README.md` if email delivery is enabled.

**Campus Help Desk / Offline Fallback:** Staff with Main Administrator access can open `/admin/help-desk` to submit assisted student requests. If the device loses connectivity, offline requests are kept in that staff browser's local storage and automatically synced to the existing `complaints` table when connectivity returns. No separate database is used. Apply `schema.sql`, `complaints_realtime.sql`, and `admin_roles.sql` as listed above; offline requests remain on the device until synchronization succeeds.

14. Set these frontend environment variables in Vercel Project Settings → Environment Variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_AI_API_URL=https://your-deployed-backend.example.com
```

`VITE_AI_API_URL` must be the deployed backend's public HTTPS URL, never `localhost`. Redeploy Vercel after changing environment variables. Never put the Supabase service-role key or an AI provider key in a `VITE_*` variable. The login page includes preview-only Student and administrator demo profiles; demo changes are stored locally and are not sent to Supabase.

Promote a trusted account to administrator from the Supabase SQL Editor after that account signs up; do not grant admin by changing the login tab:

```sql
UPDATE public.profiles
SET role = 'admin', admin_role = 'main_administrator', is_active = TRUE
WHERE email = 'trusted-admin@example.edu';
```

Production tables intentionally start without sample campus records. Add actual attendance, timetable, fee, hostel, bus, room, and meal records before those pages can show live data. If this Supabase project was initialized with an older schema, inspect `mess_menu` and `events` for the former sample rows before removing them so real records are not deleted accidentally. Real fee payment processing is not available until a payment provider is integrated.

Bus GPS sharing is started by an authenticated admin from Admin → Bus Routes using the driver's device. The browser must have location permission, and production deployments must use HTTPS. Demo mode does not publish or simulate GPS locations.

### Academic Resources setup and verification

The feature adds `/student/syllabus`, `/student/timetable`, `/student/pyq`, `/student/class-material`, and `/student/assignments`, plus `/admin/assignments` and the faculty/main-administrator resource management routes under `/admin`. Assignment uploads are PDF-only and remain private until approved; students can browse approved PDFs from their assignments page and dashboard. It uses the existing `profiles`, authentication provider, layouts, toast system, and Supabase client. The migration extends the current timetable table in place and does not delete existing rows.

**Apply the SQL in this order:** `schema.sql` → `production_hardening.sql` → `document_requests.sql` → `admin_roles.sql` → `academic_resources.sql` → `mess_orders.sql`. The `document_requests.sql` script creates the private `document-requests` bucket for approved student documents; `academic_resources.sql` creates a separate private `academic-resources` bucket. Keep both buckets private.

From the Supabase Dashboard:

1. Open **SQL Editor → New query**.
2. Open `supabase/academic_resources.sql` in VS Code, copy the complete file, paste it into the query, and click **Run**. If the prerequisite migrations are not applied, apply those first in the order above.
3. Open **Storage → Buckets** and confirm `academic-resources` exists with **Public bucket** turned off. Its storage policies should appear under **Storage → Policies**.
4. Sign in as the main administrator and open **Admin → Academic Management**. Assign each faculty account its department, course, semester, and subject. Faculty uploads and timetable edits are checked against these assignments in database policies; frontend visibility is not the authorization boundary.
5. Confirm faculty profiles have `role = 'admin'` and `admin_role = 'faculty'`; verify student profiles have their department, semester, and section populated for timetable matching.

**Windows PowerShell commands** from the project directory:

```powershell
Set-Location 'C:\Users\bikas\OneDrive\Documents\Campus Portal\campusplus'
npm install
npm run dev
```

Open the local Vite URL printed in the terminal. Before deployment, run:

```powershell
npm run lint
npm run build
```

**Beginner-friendly checks:**

1. Log in as a student. Open each item under **Academic Resources**; search/filter results, open a PDF or image preview, and download an approved item. Switch the timetable between Weekly and Daily and verify the department, semester, section, day, faculty, room, and time details.
2. Log in as a faculty account with an assigned subject. Upload a syllabus, PYQ, and class material for that exact assignment; confirm each is marked pending and that you can edit/delete your own entries. Try an unassigned subject and confirm Supabase rejects it.
3. Log in as the main administrator. Approve a pending resource and confirm it appears for students. Edit/delete resources, add a timetable entry, and add/remove a faculty subject permission.
4. Log in as each non-academic admin role (Hostel Management, Mess Manager, and Account & Examination). Confirm their existing dashboard/modules still load and academic-management routes send them back to their permitted home.
5. In Supabase, inspect **Table Editor → academic_resources**, **faculty_subjects**, and **timetable**, and **Storage → academic-resources**. Confirm student uploads are denied and the storage bucket remains private.

---

## 🎯 Hackathon Demo Flow (15 Steps)

| Step | Who | Action | Result |
|------|-----|--------|--------|
| 1 | Student | Login | Dashboard loads |
| 2 | Student | View Dashboard | Stats, classes, mess menu visible |
| 3 | Student | Complaints → Report a Problem | Form opens |
| 4 | Student | Type "Water leaking near Room 203" → AI Analyze | AI detects: Water/Plumbing, High, Hostel Maintenance |
| 5 | Student | Submit complaint | CMP-XXXX generated |
| 6 | Admin | Login → Dashboard | Complaint visible in recent list |
| 7 | Admin | Complaints → View CMP-XXXX | Assign to "Ravi Plumbing Team" |
| 8 | Admin | Update status: Assigned → In Progress | Student notified |
| 9 | Admin | Update status: In Progress → Resolved | Student notified |
| 10 | Student | Check Notifications | "Complaint Resolved" notification |
| 11 | Student | Documents → New Request → Bonafide Certificate | REQ-XXXX submitted |
| 12 | Admin | Requests → Approve REQ-XXXX | Student notified |
| 13 | Student | Check Notifications | "Document Approved" notification |
| 14 | Admin | Analytics | Charts show complaint data |
| 15 | Admin | AI Insights | Recurring water issue detected |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── StudentLayout.jsx    # Student app shell
│   │   ├── StudentSidebar.jsx   # Dark blue sidebar with nav
│   │   ├── TopHeader.jsx        # Search, notifications, profile
│   │   ├── AdminLayout.jsx      # Admin app shell
│   │   └── AdminSidebar.jsx     # Admin sidebar
│   ├── ui/
│   │   ├── Modal.jsx            # Reusable modal
│   │   ├── Toast.jsx            # Toast notification system
│   │   ├── States.jsx           # Loading/Error/Empty states + StatusBadge
│   │   └── DataTable.jsx        # Reusable table
│   └── AIAssistant.jsx          # Floating AI chat widget
├── contexts/
│   ├── AuthContext.jsx          # Auth + demo mode login
│   └── AppContext.jsx           # Global state management
├── data/
│   └── demoData.js              # Realistic seed data
├── lib/
│   ├── supabase.js              # Supabase client
│   └── aiService.js             # AI routing (OpenAI + mock)
├── pages/
│   ├── student/                 # 14 student pages
│   │   ├── Dashboard.jsx
│   │   ├── Complaints.jsx       # AI-powered complaint submission
│   │   ├── Attendance.jsx
│   │   ├── Timetable.jsx
│   │   ├── Hostel.jsx
│   │   ├── Mess.jsx             # Weekly menu + feedback
│   │   ├── Leave.jsx            # Leave & Gate Pass
│   │   ├── Documents.jsx        # Document requests
│   │   ├── Fees.jsx             # Fee payment simulation
│   │   ├── Notifications.jsx
│   │   ├── Profile.jsx
│   │   ├── Settings.jsx         # Lite Mode toggle
│   │   ├── Services.jsx
│   │   └── Search.jsx
│   ├── admin/                   # 11 admin pages
│   │   ├── Dashboard.jsx
│   │   ├── Complaints.jsx       # Full complaint management
│   │   ├── Requests.jsx         # Approve/reject requests
│   │   ├── Students.jsx
│   │   ├── Hostel.jsx
│   │   ├── Mess.jsx             # View feedback
│   │   ├── Notices.jsx          # Publish notices
│   │   ├── Attendance.jsx
│   │   ├── Analytics.jsx        # Recharts dashboards
│   │   ├── AIInsights.jsx       # Recurring issue detection
│   │   └── Settings.jsx
│   ├── LandingPage.jsx          # Public landing page
│   └── LoginPage.jsx
└── App.jsx                      # Routes + protected routes
```

---

## ✨ Feature Checklist

### Student Features
- [x] Dashboard with live stats (attendance, complaints, requests, classes)
- [x] AI-powered complaint submission with auto-categorization
- [x] Subject-wise attendance with below-80% warnings
- [x] Weekly timetable with class status (Upcoming/Current/Completed)
- [x] Hostel info, roommates, warden contact
- [x] Weekly mess menu with star rating feedback
- [x] Leave & Gate Pass requests with status tracking
- [x] Document requests with progress workflow
- [x] Fee payment simulation with breakdown
- [x] Real-time notification center (mark read/all read)
- [x] AI Campus Assistant chatbot (floating button)
- [x] Global search across complaints, documents, notices
- [x] ⚡ Lite Mode for low-bandwidth environments
- [x] Responsive design (mobile/tablet/desktop)

### Admin Features
- [x] Dashboard with campus-wide statistics
- [x] Complaint management (assign, update status, add notes)
- [x] Request approval (documents, leave, gate pass)
- [x] Student directory with search and filter
- [x] Notice publishing with audience targeting
- [x] Recharts analytics (complaints by category, status, monthly trend, mess ratings)
- [x] AI Insights with dynamic recurring issue detection
- [x] Mess feedback viewer
- [x] Hostel block overview

### Technical
- [x] Protected routes with role-based access
- [x] Supabase Auth integration (demo mode fallback)
- [x] Row Level Security policies
- [x] Toast notifications for all actions
- [x] Loading/Error/Empty states on all operations
- [x] Authenticated backend complaint classification and student assistant
- [x] Live admin AI insights from the FastAPI action center

---

## 🔒 Security

- Supabase RLS on all sensitive tables
- Role-based route protection (students can't access admin pages)
- No credentials stored in frontend code
- All secrets via environment variables
- Input validation on all forms

---

## ⚡ Lite Mode

Toggle in **Settings** to enable Lite Mode:
- Disables all CSS animations and transitions
- Reduces visual complexity
- Loads critical data first
- Works smoothly on 2G/3G connections and low-end devices

---

## 🤖 AI Smart Routing

Real accounts send complaint classification, student assistant questions, and admin insights to the authenticated FastAPI backend. Poe powers Campus AI and is the default provider for complaint classification and admin copilot answers when `AI_PROVIDER=poe` and the server-only `POE_API_KEY` are configured. If Poe is unavailable, deterministic backend rules remain available. OpenAI can optionally be selected for classification/admin answers with `AI_PROVIDER=openai` and `OPENAI_API_KEY`; it does not power Campus AI chat. Demo accounts use local sample data and rules. Never put AI provider secrets in `VITE_*` variables; browser environment values are public.

---

Built with ❤️ for Hackathon 2024 | **CAMPUSONE — ONE CONNECTED CAMPUS PLATFORM**
