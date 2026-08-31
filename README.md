# 🏥 CarePulse EHR: Clinical Diabetic Management System

An advanced, production-ready Electronic Health Record (EHR) engineered for rural clinical environments. This system focuses on metabolic tracking, diagnostic integrity, and offline-first reliability.

---

## 🚀 Key Clinical Features

### 🔐 Clinician Portal & RBAC
*   **Role-Based Access Control (RBAC)**: Specialized dashboards for **Nurses (Field Triage)** and **Doctors (Regional Consultants)**.
*   **Authentication Gate**: Secure clinical login card protecting the regional medical registry.
*   **Automated Landing Logic**: Nurses are directed to intake forms, while Doctors land on the global Workspace Dashboard.

### 🫀 Cardio-Metabolic Triage (CDSS)
*   **Expanded Vital Tracking**: Capture Systolic/Diastolic BP, Weight, and Pulse alongside glucose levels.
*   **Intelligent Alert Engine**: Automated detection of Hypertensive Crises and Dual Metabolic-Cardio Risks.
*   **Referral Queue**: High-fidelity emergency dashboard with triage indicator badges and pulse animations for critical metrics.

### 🩸 Comprehensive Glucose Monitoring
*   **Production-Ready Analytics**: Intelligent tracking of blood glucose fluctuations with risk categorization.
*   **Risk-Level Visuals**: Automatic status updates (Stable vs. High Risk) based on custom clinical thresholds.
*   **History Timeline**: Longitudinal view of diagnostic events including symptoms and interventions.

### 💾 Disaster Recovery & Telemetry
*   **Offline CSV Export**: 100% network-independent physical backup of the entire clinical registry for portable audit trails.
*   **Storage Telemetry Widget**: Real-time visualization of local disk consumption against browser capacity (5MB ceiling).
*   **Cache Management**: Granular controls for system purges and cloud re-hydration.

### ☁️ Resilient Cloud Sync Engine (Supabase Power)
*   **Offline-First Architecture**: Continuous local persistence ensuring no data loss in areas with unstable internet.
*   **Bulk Upsert Logic**: High-efficiency synchronization that maps local camelCase objects to database-standard snake_case.
*   **Integrity Pipeline**: Sequential execution flow ensures Patient records are secured before Checkup logs, preventing foreign-key violations.

### 🇳🇬 Rural Data Integrity
*   **Strict Validation**: Region-specific validation for Nigerian phone network patterns and biological constraints (Age 1-120).
*   **Modular Architecture**: Clean separation of concerns (Registry, Profile, Forms, Sidebar) for rapid extensibility.

---

## 🛠️ Technical Stack

- **Frontend**: React 19 + Vite 8
- **Styling**: Tailwind CSS (Custom Clinical Animations)
- **Database/Auth**: Supabase (PostgreSQL)
- **Icons**: Lucide-React
- **Persistence**: Hybrid (LocalStorage + Cloud Upsert)

---

## ⚙️ Maintenance & Configuration

### 1. Database Schema Update
To support the latest **Cardio-Metabolic** and **Medication** features, ensure your existing Supabase table is upgraded:

```sql
-- Comprehensive upgrade for checkup_logs
ALTER TABLE checkup_logs 
ADD COLUMN IF NOT EXISTS medication TEXT DEFAULT 'None',
ADD COLUMN IF NOT EXISTS systolic INTEGER,
ADD COLUMN IF NOT EXISTS diastolic INTEGER,
ADD COLUMN IF NOT EXISTS weight NUMERIC,
ADD COLUMN IF NOT EXISTS pulse INTEGER;
```

### 2. Role-Based Access Gate
The system currently uses two default clinician profiles for testing:
*   **Nurse Amina**: `role: 'nurse'`, landing page: `NewPatientView`
*   **Dr. Bello**: `role: 'doctor'`, landing page: `WorkspaceDashboard` (Full Access)
Ensure the following keys are set in your environment:
- `VITE_SUPABASE_URL`: Your project URL
- `VITE_SUPABASE_ANON_KEY`: Your project anonymous key

---

## 📂 Project Structure

```text
src/
├── components/          # Modularized Clinical Views
│   ├── PatientRegistry  # Primary data engine
│   ├── LogVitalsForm    # Diagnostic input logic
│   └── PatientProfile   # Longitudinal clinical timeline
├── App.jsx              # Orchestrator & Sync Engine
├── App.css              # Global clinical themes
└── index.css            # Custom animations (animate-glow-amber)
```

---

## 📄 License
Designed and maintained by **tesssie-tech**. Build for impact.
