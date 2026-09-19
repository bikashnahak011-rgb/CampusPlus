# CampusPulse AI Service

Separate FastAPI automation service for the existing React + Supabase application. It does not replace the frontend or Supabase. The backend uses the Supabase service-role client only on the server, validates the caller's Supabase bearer token, loads the caller's `profiles.role`, and applies student/admin authorization before returning data.

## Architecture and data flow

```mermaid
flowchart TD
  UI[React Student/Admin UI] -->|Bearer Supabase access token| API[FastAPI AI service]
  API --> AUTH[Supabase Auth get_user]
  API --> DB[Supabase service-role client]
  DB --> CORE[(PostgreSQL campus tables)]
  API --> RULES[Deterministic rules]
  API --> NLP[Complaint NLP and similarity]
  RULES --> OUT[Insights, alerts, notifications]
  NLP --> OUT
  OUT --> DB
  OUT --> UI
```

Attendance uses deterministic thresholds: below 75% is a warning, and recent `attendance_history` records identify continuously decreasing attendance. Complaint analysis uses transparent keyword classification, location extraction, text similarity, and escalation rules; an optional LLM can be added behind `ai_service.py` without changing the API contract. The mess forecast combines room capacity, approved leave, day/date context, and feedback volume, and always returns uncertainty.

## Setup

1. Run the existing `supabase/schema.sql` in Supabase.
2. Run `supabase/ai_engine.sql` to add history, AI analysis, clusters, forecasts, and notification priority.
3. Create a backend environment file:

```powershell
cd backend
Copy-Item .env.example .env
```

Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `CORS_ORIGINS`. Never expose the service-role key to React or commit `.env`.

4. Install and run:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/health`. OpenAPI: `http://localhost:8000/docs`.

## API endpoints

All protected endpoints require `Authorization: Bearer <supabase-access-token>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/health` | public | Service health |
| GET | `/api/attendance/me` | student/admin token | Caller-scoped attendance warnings |
| POST | `/api/attendance/analyze` | admin | Analyze all students and create warnings |
| POST | `/api/complaints/analyze` | admin | Classify complaints and return incident clusters |
| GET | `/api/mess/forecast` | admin | Meal demand forecast and uncertainty |
| GET | `/api/insights/action-center` | admin | Structured dashboard summary |
| POST | `/api/assistant/admin` | admin | Natural-language campus copilot |
| POST | `/api/assistant/student` | student | Caller-only assistant data |
| GET | `/api/notifications/me` | caller | Caller-only notifications |
| POST | `/api/notifications/admin` | admin | Create an authorized notification |

## Example requests

```bash
curl -X POST http://localhost:8000/api/attendance/analyze \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN"
```

```json
{
  "analyzed": 1,
  "warnings": [{
    "student_id": "uuid",
    "attendance": 68,
    "required": 75,
    "risk": "HIGH",
    "reason": "Attendance is below required threshold",
    "decreasing": false
  }]
}
```

```bash
curl -X POST http://localhost:8000/api/assistant/admin \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"How many students have attendance below 75%?"}'
```

Student requests are always filtered by the authenticated profile ID. The service never includes another student's name or academic data in a student response.

## React connection

Keep Supabase auth in React. Send the current Supabase session access token to the service:

```js
const { data: { session } } = await supabase.auth.getSession()
const response = await fetch(`${import.meta.env.VITE_AI_API_URL}/api/insights/action-center`, {
  headers: { Authorization: `Bearer ${session.access_token}` }
})
const actionCenter = await response.json()
```

Set `VITE_AI_API_URL=http://localhost:8000` in the React environment. Do not send the service-role key from the browser.

## Deployment

Deploy the backend as a Python web service with a start command such as `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`. Configure the Supabase URL, service-role key, CORS origin, and rate limit as platform secrets. Use HTTPS, restrict CORS to the deployed React origin, and rotate the service-role key if it is ever exposed.

## Demo data

Use the commented Room 205 inserts at the end of `supabase/ai_engine.sql` with real profile UUIDs. Add multiple attendance history rows for the same student, for example 78, 72, and 68, to demonstrate a decreasing MEDIUM/HIGH warning. Add three Room 205 water complaints from different student IDs to demonstrate one HIGH incident cluster rather than three independent admin alerts.
