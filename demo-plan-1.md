# Demo Appendix: Phase 1 End-to-End Vertical Slice

## Project Context
First 5 Alameda County is developing a **Coordinated Eligibility & Enrollment (CEE)** platform to help families learn about and access subsidized child care, while supporting subsidy administrators and First 5 staff with intake, data, and program oversight. The system is intentionally designed to be **phased, equity-centered, and extensible**, beginning with a public-facing discovery and intake experience and evolving over time to support more complex workflows.

This demo illustrates **Phase 1 functionality only**, consistent with the RFP and FAQ. It demonstrates how core personas interact with the platform and how the technical foundation supports future phases, without implying enrollment, matching, or policy determinations.

---

## Purpose of the Demo
This demo presents a **simplified, end-to-end vertical slice** of the CEE platform to demonstrate delivery approach, accessibility, and architectural readiness. It is intended to show how families, subsidy administrators, and First 5 system administrators interact with the platform within **Phase 1 scope**.

The demo does **not** represent final eligibility policy, enrollment workflows, matching algorithms, or real-time vacancy management. Those capabilities are intentionally positioned for future phases.

---

## Personas & Demo Flows

### 1. Family (Caregiver)
- Access a **mobile-first, multilingual, WCAG 2.2 AA–compliant** public website without authentication
- Complete a **simplified eligibility screener** (illustrative only)
- Search for child care providers using filters and an interactive map
- View **standardized provider profiles**, including:
  - Provider type (licensed family child care / center-based)
  - Generalized location and service attributes
- Select a provider and **express interest / request follow-up**
- Receive confirmation explaining next steps:
  - A subsidy administrator will follow up
  - Submission does not imply eligibility, approval, or enrollment

**Design Principles**
- Low-friction, equity-centered access  
- No account creation or login required  
- Incomplete information does not block submission  
- One provider per submission; families may submit interest in multiple providers **over time**

---

### 2. Subsidy Administrator
- Securely authenticate to an **intake dashboard**
- View incoming interest submissions with:
  - Provider selected
  - Eligibility indicators (illustrative)
  - Completeness flags
- Add notes and update status for follow-up
- Perform **operational exports** (e.g., secure CSV download) to support:
  - Outreach and navigation workflows
  - Case management coordination
  - Internal reporting

**Clarifications**
- Administrators do **not approve** interest forms  
- Export supports human-centered workflows, not automated determinations

---

## Eligibility Screener (Illustrative)
The demo includes a **simplified, configurable eligibility screener** to demonstrate flow and rules-based logic. Example questions include:
- Household ZIP code
- Child age range
- Care type preference (in-home / center-based)
- Household size
- Approximate income range
- Desired start date

All results are clearly labeled as **illustrative only** and not final determinations.

---

## Interest Flow (Demo Scope)
The interest action is **provider-specific** and intentionally lightweight.

**Auto-populated**
- Selected provider
- Care type
- Child age range
- Preferred start date
- Eligibility indicator (illustrative)

**Family-entered (minimal)**
- Preferred contact method
- Contact information (if not already provided)
- Preferred language
- Optional notes

Incomplete submissions are accepted and flagged to reduce barriers and support follow-up.

---

## Accessibility & Technical Signals
The demo demonstrates how accessibility and quality are operationalized during delivery:
- Keyboard navigation and screen-reader compatibility
- Color contrast and semantic labeling
- Mobile-first responsive layouts
- Cloud-hosted deployment
- Open-source repository structure (sanitized)
- CI/CD visibility and documentation patterns

---

## What the Demo Demonstrates
- End-to-end user flow across core personas
- Equity-first, low-barrier access
- Configurable rules and phased readiness
- Disciplined Phase 1 scope aligned with the RFP
- A durable technical foundation for future phases

---

## What the Demo Does *Not* Represent
- Final eligibility or policy logic
- Enrollment or placement decisions
- Matching algorithms or common interest forms
- Real-time vacancy reporting
- Deep external system integrations

These capabilities are intentionally reserved for **future phases**, consistent with the RFP and FAQ.

---

**Bottom line:**  
This demo shows how Focus can deliver a **clear, accessible Phase 1 experience** that supports families, administrators, and First 5 staff, while laying a strong foundation for subsequent phases of the CEE platform.
