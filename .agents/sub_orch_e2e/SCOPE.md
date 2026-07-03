# Scope: E2E Testing Track

## Architecture
The E2E test suite will be requirement-driven and opaque-box. It will run against the locally hosted Next.js app (running at http://localhost:3000) using a Node.js-based test framework.
The tests will interact with `/library`, `/api/books`, `/api/books/download`, and verify layout responsiveness, search, filtering, PDF viewing, and Cloudflare R2 downloads.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| 1 | Test Infra & Runner Setup | Select test runner/framework, install dependencies (if needed), implement base runner script. Design TEST_INFRA.md. | None | PLANNED | TBD |
| 2 | Tier 1 Feature Coverage Tests | Write >=5 test cases for each of the 3 features (Grid page, PDF reader, Download/R2). | M1 | PLANNED | TBD |
| 3 | Tier 2 Edge & Corner Cases | Write >=5 test cases for edge cases (boundaries, errors, invalid query parameters, narrow viewports) for each feature. | M2 | PLANNED | TBD |
| 4 | Tier 3 & 4 Tests | Write pairwise feature combinations (Tier 3) and real-world application scenarios (Tier 4). Verify all tests pass. | M3 | PLANNED | TBD |
| 5 | Verify & Publish TEST_READY | Run the entire test suite, generate reports, verify no gaps, write TEST_READY.md. | M4 | PLANNED | TBD |

## Interface Contracts
- The test runner must execute using a single command.
- The test suite must run against the application URL (configured via env or defaulting to `http://localhost:3000`).
- Test cases must output clear pass/fail assertions.
