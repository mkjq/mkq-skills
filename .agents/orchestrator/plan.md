# plan.md — Books Library Feature Implementation Plan

## Objective
Implement a books library page (`/library`) displaying 45 books with a responsive in-browser PDF reader (using `react-pdf`) and Cloudflare R2 integration for hosting/downloading.

## Execution Topology
We will use the **Project Pattern** with Dual Tracks running in parallel:
1. **E2E Testing Track**: Build testing infrastructure and tests for Tiers 1-4.
2. **Implementation Track**: Develop the features incrementally through milestones, verified against unit/milestone tests and integrated with the E2E tests once ready.

```
                  ┌───────────────────────────────┐
                  │      Project Orchestrator     │
                  └──────────────┬────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
     ┌───────────────────────┐       ┌───────────────────────┐
     │ E2E Testing Track     │       │ Implementation Track  │
     │ (sub_orch_e2e)        │       │ (sub_orch_impl)       │
     └───────────────────────┘       └───────────────────────┘
```

## Track Details

### 1. E2E Testing Track (`.agents/sub_orch_e2e/`)
- **Role**: Define features, write tests for Tiers 1-4, publish `TEST_READY.md`.
- **Methodology**:
  - **Tier 1 (Feature Coverage)**: Verification of page loads, presence of 45 books, download button functionality, and PDF viewer existence.
  - **Tier 2 (Boundary & Corner Cases)**: Empty query results, missing files on R2, mobile viewport rendering, extremely long book titles.
  - **Tier 3 (Cross-feature)**: Search and filter combinations, download while viewing, multiple PDF loading.
  - **Tier 4 (Real-World Scenarios)**: User navigating the library, searching, opening viewer, paging through a book, closing, and downloading.

### 2. Implementation Track (`.agents/sub_orch_impl/`)
- **Role**: Coordinates incremental development of milestones M1 through M5.
- **Milestones**:
  - **M1**: R2 Connection and `verify_r2.js` script.
  - **M2**: hardcoded metadata list of 45 books (JSON).
  - **M3**: API endpoints `/api/books` and `/api/books/download`.
  - **M4**: Mobile-responsive PDF reader component using `react-pdf`.
  - **M5**: Glassmorphic `/library` UI, integrating the viewer and search/filter.
- **Integrity**: Runs Forensic Auditor checks at every step. Undergoes Adversarial Hardening (Tier 5) during the final milestone phase.

## Current Steps
1. Create track working directories under `.agents/`.
2. Spawn E2E Testing Track Orchestrator.
3. Spawn Implementation Track Orchestrator.
4. Monitor progress of both tracks and coordinate handoffs.
