# PROBELEMA — Government Desktop Application (Workflow & Incident Management)

A desktop-grade municipal government workflow application built directly from the provided 35 UI wireframes. This implementation focuses strictly and exclusively on the **Government Desktop Application** first, with full design parity, local state functionality, and zero external database dependencies. The Citizen application is deferred until its wireframes are ready.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following directions govern this revision:

- **Government Portal Priority**: 100% focus on the Government Desktop Application (all 35 wireframe screens: Dashboard, Map, Reports, Verification, Assign, In Progress, Resolved, Rejected, Archived, Notifications, Settings, and all 6 action modals).
- **Citizen Application Deferred**: As requested, the Citizen desktop application is set aside for now since its wireframes are still in progress.
- **No External Database Required**: Operates with a self-contained local state engine and a sample generator that matches the exact numbers, reports, and cases from the wireframes (e.g., `1,284` total reports, `126` awaiting verification, `64` to assign, `451` in progress, `574` resolved, `69` rejected).
- **Complete Visual & Functional Fidelity**:
  - Exact layout, navigation hierarchy, colors (deep navy `#0B1238`, active gold pill `#FFD100`), and typography.
  - Interactive Leaflet street map with custom SVG status pins, filter panel drawer, and marker preview drawer.
  - Full workflow modals: Confirm Verification, Reject Report (with reasons & formal explanation), Assign Report (department, officer, priority, due date), Progress Updates (photos, timestamps), Resolve Report, and Confirm Archive.
  - Append-only report history timeline matching wireframes.
  - C#-compatible data contracts and JSON serialization structure for easy future desktop integration.

---

## 1. Overview & Core Concept

- **What It Does**: PROBELEMA gives municipal departments (such as Environment, Public Works, Drainage) a complete desktop operations console to manage civic incident reports submitted across city sectors.
- **Current Scope**: Government Official Desktop Portal (`Juan Dela Cruz · Environment Department`).
- **Deferred Scope**: Citizen incident submission portal (kept modular for Phase 2 when wireframes arrive).
- **Key Value**: Enforces the strict civic workflow pipeline from triage to resolution without data loss ("Reports are never deleted").

---

## 2. User Experience & Visual Design

### Exact Wireframe Fidelity & Theme Specs
- **Color Palette**:
  - Sidebar: Deep Navy `#0B1238` / `#0C1445`
  - Active Menu Pill: Vibrant Gold `#FFD100` with dark navy text `#0B1238`
  - Workspace Background: High-legibility civic light slate `#F8FAFC`
  - Badges & Status Chips:
    - `SUBMITTED`: Cool slate outline
    - `UNDER VERIFICATION`: Soft amber/yellow outline
    - `VERIFIED`: Mint/teal outline
    - `ASSIGNED`: Sky blue outline
    - `IN PROGRESS`: Orange outline
    - `RESOLVED`: Forest green outline
    - `REJECTED`: Crimson outline
    - `ARCHIVED`: Steel gray outline
- **Layout Contract**:
  - Left Sidebar ($240\text{px}$):
    - App Logo & Wordmark: `PROBELEMA` with custom pin icon
    - Primary Nav: `Dashboard`, `Map`, `Reports`
    - Section `WORKFLOW`: `Verification`, `Assign`, `In Progress`, `Resolved`, `Rejected`
    - Section `RECORDS`: `Archived`
    - Section `SYSTEM`: `Notifications`, `Settings`
  - Top Bar:
    - Dynamic breadcrumbs matching current view and active report (e.g., `Workflow / Assign / PL-2026-001245`)
    - Quick actions toolbar (Seed Wireframe Data, Reset)
    - User Identity: **Juan Dela Cruz** (bold) · *Environment Department* (subtext)

### Screens & Views Checklist (Matching all 35 wireframes)
1. **Dashboard (`Government___Dashboard_2x_0589ae27.png`)**:
   - 6 KPI metric cards: Total reports (1,284), Awaiting verification (126), To assign (64), In progress (451), Resolved (574), Rejected (69)
   - Map preview widget linking directly to Map
   - "Needs attention" panel with urgent counter (5) and red "Verify pending" CTA
   - "Recent reports" table with live status pills and direct view triggers
2. **Interactive Map (`Government___Map_2x_5f27177c.png`)**:
   - Leaflet street map centered on city landmarks and incident hotspots
   - Custom SVG pins with status glyphs (↑, ✓, 👤, ⏱, Loupe, Cluster 14)
   - Status legend footer
   - Filter panel slide-over drawer (`Government___Map___Filters_panel_2x_8a9c4bc4.png`)
   - Marker inspector preview drawer (`Government___Map___Marker_preview_2x_485d89c1.png`) with "VIEW FULL REPORT" and "OPEN IN WORKFLOW"
3. **Reports Master Repository (`Government___Reports_2x_3e8c0c87.png`)**:
   - Comprehensive searchable listing with Filter, Sort: Last updated, and pagination
4. **Workflow Queues**:
   - **Verification Queue (`Government___Verification_2x_e70ae24d.png`)**: 126 reports, REVIEW actions
   - **Assign Queue (`Government___Workflow___Verified_list_2x_3b3fbbe9.png`)**: 64 reports, ASSIGN actions
   - **In Progress Queue (`Government___Workflow___In_Progress_list_2x_d80a87c8.png`)**: 451 reports, filter pills for "All · 451" and "Assigned, not started · 167"
   - **Resolved Queue (`Government___Workflow___Resolved_list_2x_988d9007.png`)**: 574 reports awaiting archival
   - **Rejected Queue (`Government___Workflow___Rejected_list_2x_c98c3c8e.png`)**: 69 reports with formal reasons
5. **Records — Archived (`Government___Archived_Reports_2x_6b9a23d8.png`)**:
   - Read-only historical completed cases with "Closed records" banner
6. **Report Detail View (All stages)**:
   - Stage progress stepper: `Stage: ✓ Verification > ✓ Assign > ● In Progress > Resolved > Archived`
   - Case details, photo slots (Before / Progress / After), assignment meta, and coordinates
   - Append-only vertical timeline with actor attribution
   - Contextual action box matching stage (Verify/Reject, Assign, Start Action, Add Progress, Resolve, Archive)
7. **Modals & Dialogs**:
   - Confirm Verification (`Government___Confirm_Verification_2x_32404a08.png`)
   - Reject Report (`Government___Reject_Report_2x_bf79860a.png`)
   - Assign Report (`Government___Assign_Report_2x_aa89de9a.png`)
   - Add Progress Update (`Government___Progress_Update_2x_0d5f445e.png`)
   - Confirm Resolution & Resolve Report (`Government___Resolve_Report_2x_2ba09ffe.png`, `2a00cd0a.png`)
   - Confirm Archive (`Government___Confirm_Archive_2x_a45b97cb.png`)
8. **System Views**:
   - Notifications list (`Government___Notifications_2x_ec162de7.png`) with interactive navigation
   - Settings page (`Government___Settings_2x_f823602d.png`) with tabs and threshold controls

---

## 3. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│             PROBELEMA Government Desktop Application (React)           │
├────────────────────────────────────────────────────────────────────────┤
│  Top Navigation (Breadcrumbs, Quick Seeder, Profile: Juan Dela Cruz)   │
├───────────────────┬────────────────────────────────────────────────────┤
│                   │                    Active View                     │
│   Sidebar Nav     ├────────────────────────────────────────────────────┤
│   - Dashboard     │  [DashboardView]   [MapView]        [ReportsListView]  │
│   - Map           │  [VerificationView][AssignView]     [InProgressView]   │
│   - Reports       │  [ResolvedView]    [RejectedView]   [ArchivedView]     │
│   - Workflow      │  [ReportDetailView][Notifications]  [SettingsView]     │
│   - Records       ├────────────────────────────────────────────────────┤
│   - System        │               Slide-Over Drawers                   │
│                   │  - MapFilterDrawer  - MapMarkerPreviewDrawer       │
│                   ├────────────────────────────────────────────────────┤
│                   │                 Workflow Modals                    │
│                   │  - ConfirmVerificationModal - RejectReportModal    │
│                   │  - AssignReportModal        - ProgressUpdateModal  │
│                   │  - ResolveReportModal       - ConfirmArchiveModal  │
└───────────────────┴────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│               In-Memory Store & State Engine (src/store.ts)            │
│  - No external database needed                                         │
│  - Seeded with exact wireframe cases (PL-2026-001245, 001244, etc.)    │
│  - Full live state transitions, timeline appending & notification sync │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Implementation Steps & Completed Expansions

1. **Install Leaflet**: Installed `leaflet` and `@types/leaflet` for desktop map component.
2. **Setup State Store & Models**:
   - Defined TypeScript models mirroring C# domain entities (ReportItem, TimelineItem, Priority, Status, Notification, AuthUser).
   - Pre-populated wireframe cases (`PL-2026-001245` Garbage/Waste at River Bridge, `PL-2026-001260` Road Damage, `PL-2026-001250` Streetlight, `PL-2026-001198`, etc.).
   - Implemented reactive store actions with `localStorage` persistence.
3. **Core Shell & Brand Foundations**:
   - Deep navy sidebar with official PROBELEMA logo mark and yellow pill active states.
   - Header with breadcrumbs and dynamic official profile lockup.
4. **All Wireframe Views & Modals**:
   - Dashboard with KPI cards, Needs Attention box, and Recent Reports.
   - Map with Leaflet integration, custom colored markers, filter drawer, and detail drawer.
   - Reports master table with sort, search, pagination, and SLA column.
   - 5 Workflow views (Verification, Assign, In Progress, Resolved, Rejected).
   - Archived records view with closed-records banner.
   - Report Detail view with stage stepper, photos, and live append-only timeline.
   - 6 Workflow modals with form validation and state updates.
   - Notifications and Settings panels.
5. **Phase 4: Google Auth & Operations Expansion (COMPLETED)**:
   - **Split-Screen Government Portal Login System**:
     - Official PROBELEMA vector logo + tagline banner.
     - **Sign in with Google** (official 4-color G icon) + Government Email/Password form.
     - Wireframe State Tester (Default, Invalid Credentials, Account Disabled, Unauthorized, Loading).
     - Wireframe-faithful Forgot Password screen.
   - **Item 1: KPI Trend Badges & Municipal Health Indicators**:
     - Vibrant solid metric cards inspired by modern dashboard design (`image_50067140.png`).
     - Welcome greeting bar with live time and date.
     - Operational trend indicators (`+8.4% this week`, `94% on-time`, `38 field squads`, `Avg triage: 35m`).
     - Active Workflow Pipelines quick strip for rapid stage jumping.
   - **Item 2: Multi-Select Batch Actions (Storm / Disaster Mode)**:
     - Header and row checkboxes in Verification and Assign queues.
     - Floating bottom batch action bar in deep navy with counter pill and direct actions:
       - Quick Verify All
       - Batch Reject (with reason dropdown and formal explanation modal)
       - Batch Assign (with department, squad, priority, and SLA target modal)
       - Clear selection
   - **Item 3: Split-Screen "Queue + Map" Dispatch View**:
     - Table vs Split Dispatch switcher in Workflow headers.
     - Left column: compact incident queue cards with photo thumbnails, SLA badges, categories, and quick review link.
     - Right column: embedded interactive Leaflet map with custom colored teardrop pins. Clicking a card or pin centers the map with a glowing ping ring and reveals a floating popover case card with a 1-click `Open Case` CTA.
   - **Item 4: Interactive Before & After Resolution Comparison Slider**:
     - Dual-image comparison slider with draggable vertical divider on Resolved and Archived reports.
     - Toggle between Before/After Slider and 3-Phase Photo Gallery.
   - **Item 5: SLA Urgency & Aging Badges**:
     - Dynamic SLA urgency tags across all table views, split dispatch cards, and Report Detail header.
     - Visual status cues: Critical (`SLA: 2h left` with flashing rose badge), High (`SLA: 14h left` in amber), Medium (`SLA: 36h left` in blue), Submitted (`Age: 4h`), Resolved (`SLA: Met` in emerald).

---

## 5. Verification & Validation Checklist

- [x] Split-screen Login with Sign in with Google and all 4 wireframe error/loading states verified.
- [x] Dashboard greeting, 4 vibrant solid KPI cards with trend deltas, and pipeline quick strip verified.
- [x] Verification and Assign multi-select batch actions and modals verified.
- [x] Split-screen Queue + Map dispatch view with live Leaflet coordinates verified.
- [x] Before & After resolution slider with touch/mouse drag handlers verified.
- [x] SLA urgency & aging badges across all queues and detail views verified.
- [x] TypeScript validation clean (`tsc --noEmit` exited 0).
- [x] Production bundle verified (`vite build` succeeded).

