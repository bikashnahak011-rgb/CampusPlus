# CampusOne 🎓
### One Campus. One Platform. Zero Confusion.

A complete, production-ready campus management platform built for hackathon demonstration.

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

> **No Supabase setup needed.** All features work with in-memory state in demo mode.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Charts | Recharts |
| Backend | Supabase (PostgreSQL + Auth) |
| AI | OpenAI API (optional, mock fallback included) |

---

## ⚙️ Production Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Copy your project credentials
4. Create `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_OPENAI_API_KEY=sk-...  # Optional — enables real AI routing
```

5. Restart dev server: `npm run dev`

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
- [x] OpenAI integration with keyword-based mock fallback

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

The AI complaint routing works in two modes:

**With OpenAI API key** (`VITE_OPENAI_API_KEY` set):
- Uses GPT-3.5-turbo to analyze complaint text
- Returns category, priority, department, and suggested action

**Without API key (Mock Mode)**:
- Keyword-based analysis (water, electric, clean, mess, etc.)
- Location extraction from text (Block A, Room 203)
- Priority detection (urgent, emergency = High)
- Same UI experience, no crashes

---

Built with ❤️ for Hackathon 2024 | **CAMPUSONE — ONE CONNECTED CAMPUS PLATFORM**
