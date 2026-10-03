<<<<<<< HEAD
# SafeSphere
=======
# SafeSphere - Agentic AI Disaster Intelligence & Emergency Response Platform

SafeSphere is an Agentic AI-powered community disaster intelligence and response platform. It connects citizens reporting hazards with emergency management authorities through two isolated portals, automated AI analysis, spatial-temporal duplicate clustering, interactive Leaflet maps, and Recharts analytics.

---

## ?? Core Features

- **Citizen Incident Reporting**: Report community hazards (Floods, Landslides, Road Blockages, Fallen Trees, Infrastructure Damage, Fire, Other) with Leaflet interactive pin location, evidence photo attachments, and real-time 5-stage AI progress tracking.
- **Agentic AI Layer**:
  - `analyzeIncident()`: Orchestrates multi-agent analysis pipeline.
  - `verifyEvidence()`: Evaluates credibility and text/media clarity.
  - `detectDuplicates()`: Spatial-temporal Haversine proximity clustering (~2.5km radius) to group duplicate reports into a single event cluster.
  - `calculateSeverity()` & `calculatePriority()`: Automatically ranks urgency (Low, Medium, High, Critical).
  - `generateResponse()`: Synthesizes tactical emergency response recommendations for authorities.
- **Authority Emergency Command Dashboard**:
  - Total, Critical, High Priority, Pending, and Resolved metric cards.
  - Interactive Leaflet geospatial map with color-coded severity markers.
  - Recharts visual category breakdown analytics.
  - Multi-parameter filter bar (Filter by Type, Severity, Priority, Status, Search location).
- **Admin Action Control**: Mark incidents as Seen, update status (In Progress, Resolved), and publish direct response messages visible to reporting citizens.
- **Strict Role Security**: No "Admin Login" links exist on citizen pages. Admin signup requires a valid **Admin Authorization Code** (`SAFESPHERE_ADMIN_2026`).

---

## ?? Security Architecture & RLS

- **Zero Browser Secrets**: Gemini API calls and Admin Invite Code verifications are proxied securely through a Node.js server (`client/server.cjs`). Secrets are kept strictly server-side.
- **PostgreSQL Row-Level Security**: Includes `schema.sql` defining `public.profiles` linked to `auth.users(id)`, `public.incidents`, and `public.incident_updates` with strict RLS policies:
  - Citizens can SELECT/UPDATE only their own incidents.
  - Admins can SELECT/UPDATE all incidents and publish update messages.

---

## ?? Repository Structure

```
SafeSphere/
+-- client/
¦   +-- src/
¦   ¦   +-- components/       # Navbar with DEMO/REAL mode badge, ProtectedRoutes
¦   ¦   +-- context/          # AuthContext (Supabase Auth + Profile checking & invite code validation)
¦   ¦   +-- pages/
¦   ¦   ¦   +-- citizen/      # CitizenLogin, CitizenSignup, CitizenDashboard, ReportIncident, MyReports
¦   ¦   ¦   +-- admin/        # AdminLogin, AdminSignup, AdminDashboard, AdminIncidentDetail
¦   ¦   +-- services/
¦   ¦   ¦   +-- aiService.js  # Agentic AI Pipeline
¦   ¦   ¦   +-- incidentStore.js # Incident data store & 6 pre-loaded seed reports
¦   ¦   ¦   +-- supabaseClient.js # Mode detector (DEMO MODE vs REAL MODE)
¦   ¦   ¦   +-- schema.sql    # Supabase DDL & RLS Policies
¦   ¦   +-- App.jsx           # React Router & protected routes
¦   ¦   +-- index.css         # SaaS design tokens & Leaflet styling
¦   +-- .env.example          # Safe template without secrets
¦   +-- server.cjs            # Secure backend proxy server (Port 5000)
¦   +-- vite.config.js        # Vite + @tailwindcss/vite configuration
¦   +-- package.json
+-- README.md
>>>>>>> b799234 (Build complete SafeSphere MVP)
