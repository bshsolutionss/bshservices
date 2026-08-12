# Product Requirements Document (PRD)
## Agency Management System (CRM + Project + Finance Platform)

| Field | Detail |
|---|---|
| Document Owner | Bilal (BSH Solutions) |
| Version | 1.0 (Draft) |
| Date | 12 August 2026 |
| Status | Draft — ready for stakeholder review |

---

## 1. Purpose & Vision

This system is a **single admin panel** that manages an agency's entire operating lifecycle — from the first lead contact to final payment collection — instead of using separate disconnected tools (spreadsheet for leads, WhatsApp for follow-ups, another app for invoices).

**Core principle (this is the backbone of the whole PRD — memorize this flow):**

```
Lead → Qualified → Client → Deal → Project → Tasks → Invoice → Payment → Reports
```

A lead is never "just a CRM record." When a deal is won, the system should *automatically* create the downstream entities (client record, project shell, invoice draft) instead of requiring the sales team to re-enter data manually. This single design decision (**automation of the lifecycle**, *zanjeer/chain ko khud-kaar banana*) is what separates a real product from a glorified spreadsheet — it's the difference an experienced developer looks for before writing a single line of code.

---

## 2. Problem Statement

Agencies (marketing/dev/creative) today track leads, clients, projects, team workload, and finance in disconnected tools. This causes:
- Leads falling through the cracks (missed follow-ups)
- No visibility into team workload or project profitability
- Manual, error-prone invoicing
- No single source of truth for management reporting

## 3. Goals & Success Metrics (KPIs)

| Goal | Metric |
|---|---|
| Reduce lead leakage | % of leads with a follow-up ever missed → target < 5% |
| Faster lead-to-client conversion | Average days from "New Lead" → "Won" |
| Financial visibility | Time to generate a revenue/outstanding report → real-time, 0 manual work |
| Team accountability (*zimmedari*) | % of tasks completed within due date |
| Reduce tool sprawl | Number of external tools this replaces (target: 4–5) |

## 4. Target Users (Personas)

| Persona | Needs |
|---|---|
| **Super Admin / Founder** | Full visibility: revenue, pipeline, team performance |
| **Sales Executive** | Manage own leads, follow-ups, deals |
| **Sales Manager** | Team pipeline, proposals, conversion reports |
| **Project Manager** | Task boards, deadlines, resource load |
| **Developer/Designer (team member)** | Assigned tasks, time tracking, deadlines |
| **Finance/Admin staff** | Invoices, payments, expenses |
| **Client (external)** | View own project status, invoices, approvals (Client Portal) |

---

## 5. Scope — Phased Rollout (Sequence-Wise)

Building all 25 modules together is a **classic beginner mistake** (*shuruwaati developer ki ghalti*) — it delays launch and you learn nothing from real usage before it's too late to change direction. An experienced developer ships the smallest version that completes the **full lifecycle loop once**, then expands.

### Phase 1 — MVP (must ship first)
Goal: prove the complete Lead→Payment loop works end-to-end, even if each module is basic.

1. Dashboard (basic snapshot)
2. CRM — Leads
3. Pipeline / Deals (Kanban)
4. Clients
5. Follow-ups & Activity Timeline
6. Team & Roles/Permissions (basic)
7. Tasks
8. Projects
9. Proposals
10. Invoices / Payments
11. Notifications (in-app only)
12. Reports (basic — sales + finance only)
13. Settings / core configuration

### Phase 2 — Operational depth
14. Time Tracking
15. Attendance
16. Leave Management
17. Marketing Campaign Management
18. Social Media Management
19. Client Portal
20. Support / Tickets
21. Advanced Finance (retainers/subscriptions, tax rules)
22. Automation rules (auto-create project on "Won", auto-recurring invoices)

### Phase 3 — Enterprise hardening
23. Audit Logs
24. Advanced Reports & Analytics (BI-level, performance dashboards)
25. Documents (central document vault with folder structure)
26. Integrations (email, WhatsApp API, payment gateways)

**Why this exact order:** Modules in Phase 1 are the ones with *revenue impact* — every one of them sits directly on the Lead→Payment chain. Phase 2 modules improve *internal efficiency* (time, attendance) but the business runs without them. Phase 3 modules are about *scale and trust* (audit, security) — needed once you have real paying clients and a bigger team, not on day one.

---

## 6. Detailed Functional Requirements (Phase 1)

### 6.1 Dashboard
Snapshot view shown immediately after admin login.

- Total Leads / New Leads (today, this week)
- Follow-ups Due
- Active Clients / New Clients
- Active Projects / Pending Tasks
- Team Workload
- Monthly Revenue / Outstanding Invoices / Expenses
- Conversion Rate (visual funnel: Lead → Qualified → Proposal → Negotiation → Won → Client → Project → Invoice → Payment)
- Recent activity feed
- Upcoming meetings
- Notifications summary

**Acceptance criteria:** All widgets load with real data within 2 seconds; empty states shown clearly when no data exists (don't show "0" with no context — show "No leads yet, add your first lead").

### 6.2 CRM — Leads

**Lead fields:**
Name, Company, Email, Phone, WhatsApp, Website, Industry, Source (Website / Facebook / Instagram / LinkedIn / Referral / Cold Email / WhatsApp), Assigned Sales Person, Lead Status, Priority, Expected Value, Notes, Tags, Last Contact, Next Follow-up.

**Lead Pipeline (Kanban, drag & drop):**
```
New → Contacted → Qualified → Meeting → Proposal Sent → Negotiation → Won / Lost
```

**Acceptance criteria:**
- Dragging a card updates status instantly and logs an activity entry automatically.
- Marking "Won" triggers the Lead→Client conversion flow (see 6.3).
- Marking "Lost" requires a reason (dropdown: budget, timing, competitor, no response, other) — this data feeds Phase 3 analytics.

### 6.3 Client Management

**Convert Lead → Client** is a one-click action that carries over lead data into a new Client profile.

**Client profile contains:**
Company info, Contacts, Services, Contracts, Projects, Invoices, Payments, Documents, Communication history, Meetings, Tasks, Notes, Assigned Account Manager.

**Acceptance criteria:** Converting a lead never loses data — every field, note, and activity log entry transfers to the client profile.

### 6.4 Activity Timeline

Chronological, reverse-order feed on every lead/client record.

Activity types: Call, Email, WhatsApp, Meeting, Note, Proposal, Invoice, Task, Status Change.

**Acceptance criteria:** Every status change, proposal sent, or invoice created writes an activity entry automatically (*no manual logging required* — this is what makes the timeline trustworthy).

### 6.5 Follow-up Management

**"Today's Follow-ups" table:** Lead | Assigned Person | Follow-up Type | Priority.

Features: Reminder, Due date, Recurring follow-up, Snooze, Completed, Overdue (auto-flagged in red once due date passes).

**Acceptance criteria:** Overdue follow-ups surface on the Dashboard and trigger a notification to the assigned salesperson + their manager after 24 hours overdue.

### 6.6 Sales / Deals / Pipeline

**Deal fields:** Deal Name, Client, Service, Deal Value, Probability (%), Expected Close Date, Salesperson, Stage, linked Proposal, linked Contract.

**Sales dashboard:**
Pipeline Value, Weighted Pipeline (value × probability), Won This Month, Lost This Month, Conversion Rate.

### 6.7 Proposals & Quotations

Create from templates → Services/packages → Pricing → Discounts → Taxes → Terms & Conditions → Generate PDF → Send.

**Status flow:** `Draft → Sent → Viewed → Accepted → Rejected`

**Acceptance criteria:** "Viewed" status updates automatically when the client opens the proposal link (requires a trackable link, not just a PDF attachment).

### 6.8 Team & Roles/Permissions (basic for Phase 1)

**Roles (example hierarchy):**

| Role | Access |
|---|---|
| Super Admin | Everything |
| Manager | Clients, Projects, Team, Reports |
| Sales Manager | Leads, Deals, Clients, Proposals |
| Sales Executive | Own Leads, Follow-ups, Deals |
| Developer | Assigned Projects, Tasks, Time Tracking |
| Finance | Invoices, Payments, Expenses |

**Permission levels (action-level, not just module-level):** View, Create, Edit, Delete, Export, Approve, Assign.

**This matters more than it looks (don't underestimate this module):** Getting roles/permissions wrong early means a painful data migration later. Design the permission table (module × action × role) before writing any UI — this is a backend/database design decision, not a UI checkbox afterthought.

### 6.9 Tasks

```
Task
├── Title
├── Description
├── Client
├── Project
├── Assignee
├── Priority
├── Due Date
├── Status
└── Estimated Hours
```

**Status flow:** `Todo → In Progress → Review → Completed`

### 6.10 Projects

Created automatically when a deal is won (or manually).

**Stage flow:** `Planning → UI/UX → Development → Testing → Client Review → Deployment → Completed`

Features: Milestones, Tasks/Subtasks, Team members, Deadlines, Files, Comments, Activity log, Progress %, Client approval step.

### 6.11 Invoices & Payments

**Invoice fields:** Invoice number, Client, Project, Services, Amount, Tax, Discount, Due date, Status.

**Status flow:** `Draft → Sent → Paid / Partially Paid / Overdue`

**Payment fields:** Amount, Date, Method, Reference, linked Invoice.

**Basic Expenses:** Office, Software, Salaries, Advertising, Hosting, Domain, Other.

### 6.12 Notifications (Phase 1: in-app only; email/push in Phase 2)

Triggers: New lead, Lead assigned, Follow-up due, Task assigned/overdue, New client, Invoice overdue, Payment received, Proposal accepted, Client message, Approval requested.

### 6.13 Reports (Phase 1: sales + finance only)

- Sales: Leads, Qualified leads, Conversion rate, Revenue, Lost deals, Salesperson performance
- Finance: Revenue, Expenses, Profit, Outstanding invoices

### 6.14 Settings (core)

General (agency name, logo, currency, timezone, languages), CRM config (lead statuses, sources, pipeline stages, tags), Team (departments, roles, permissions), Finance (tax, invoice settings, payment methods).

---

## 7. Phase 2 — Requirement Summary

| Module | Key Fields/Flow |
|---|---|
| Time Tracking | Start/End time per task, Total hours, Billable vs. non-billable, Utilization reports |
| Attendance | Check-in/out, Working hours, Late, Leave, Remote/Office |
| Leave Management | Request → Approve/Reject; Types: Annual, Sick, Casual, Unpaid |
| Marketing Campaigns | Budget, Spend, Leads generated, Conversion, Cost per lead, ROI |
| Social Media | Content calendar; Workflow: `Idea → Draft → Internal Review → Client Approval → Scheduled → Published` |
| Client Portal | Client-facing view of Projects, Tasks, Files, Proposals, Invoices, Payments, Messages, Approvals — **no internal agency data exposed** |
| Support/Tickets | Status flow: `Open → Assigned → In Progress → Resolved → Closed` |
| Retainers/Subscriptions | Monthly fee, Renewal cycle, Status, Recurring invoice auto-generation |

## 8. Phase 3 — Requirement Summary

- **Audit Logs:** who changed what, old value → new value, timestamp, optionally IP/device — required once multiple people have edit access, so accountability isn't guesswork.
- **Documents:** central vault structured per client (Contracts / Projects / Assets / Reports / Invoices).
- **Advanced Reports:** team utilization, project profitability, on-time delivery rate.
- **Integrations:** email, WhatsApp Business API, payment gateways.

---

## 9. Data Lifecycle / Core Entity Flow

```
Lead ──(Won)──> Client ──> Deal ──> Project ──> Tasks
                                       │
                                       ▼
                                   Invoice ──> Payment ──> Reports
```

**Design rule:** Every entity above should reference its origin (a Project always knows which Client and Deal it came from; an Invoice always knows which Project). This traceability (*qabu mein rakhna, poori chain track karna*) is what makes the Reports module possible without extra manual work later — if you skip this in your database schema now, you will be stuck writing manual data-reconciliation scripts in 6 months.

---

## 10. Non-Functional Requirements

- **Security:** Role-based access control enforced at the API level, not just hidden in the UI (a common junior mistake — hiding a button isn't security, *sirf button chhupana security nahi hai*).
- **Performance:** Dashboard and pipeline views should load under 2 seconds with up to ~10,000 lead records.
- **Data isolation:** Client Portal users must never be able to query or see another client's data (multi-tenant boundary — *har client ka data alag rakhna*).
- **Auditability:** All financial and status-change actions must be logged (ties to Phase 3 Audit Logs, but the underlying event log should be built from day one — cheap to add now, expensive to retrofit).
- **Scalability:** Architecture should support adding new pipeline stages, custom fields, and roles without a schema rewrite.

## 11. Out of Scope (for this version)

- Native mobile apps (web-responsive only, for now)
- AI-based lead scoring
- Multi-currency accounting beyond basic tax/currency settings
- White-labeling for reselling the platform to other agencies

## 12. Recommended Sidebar / Information Architecture

```
Dashboard
CRM        → Leads, Contacts, Companies, Deals, Pipeline, Follow-ups, Activities
Sales      → Proposals, Quotations, Contracts
Clients    → All Clients, Client Portal, Client Documents
Projects   → All Projects, Tasks, Milestones, Calendar, Time Tracking
Team       → Employees, Departments, Attendance, Leave, Performance
Marketing  → Campaigns, Social Media, Content Calendar, Analytics
Finance    → Invoices, Payments, Expenses, Retainers, Financial Reports
Support    → Tickets, Knowledge Base
Reports    → Sales, CRM, Projects, Team, Finance
Documents
Notifications
Settings   → Users, Roles & Permissions, Integrations, General, Audit Logs
```

## 13. Open Questions (to resolve before development starts)

1. Is this an internal tool for BSH Solutions only, or a SaaS product to sell to other agencies? (Changes multi-tenancy requirements significantly.)
2. Which payment gateway(s) need to be supported at launch?
3. Will WhatsApp integration be via official Business API (paid, reliable) or a workaround (risky, can get numbers banned)?
4. Who are the first 3–5 real users who will test the MVP before Phase 2 is planned?
