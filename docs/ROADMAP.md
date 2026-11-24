# Release roadmap

Phase 00 ends at the audit. Phase 01 requires owner approval to start. IDs and acceptance criteria are in the [backlog](BACKLOG.md). Owner decisions can be collected while engineering prepares later phases. Catalog-dependent work must use the approved data before release.

| Phase | Outcome and order of work | Exit evidence |
|---|---|---|
| 00 · Production Readiness Audit | Inspect source and local delivery behavior, run existing checks, establish scope, blockers and release evidence. | [Audit](PRODUCTION_READINESS_AUDIT.md) and [status](PROJECT_STATUS.md) available for review. |
| 01 · Frontend Completion | Start with FE-01 on About. Then FE-02 reconciles discovery links, empty states and fallback contact placements. | Green typecheck, distinct Home/About, usable destinations. Missing owner material has an explicit publication decision. |
| 02 · PhotoBook Configurator | Use the printer matrix from BUS-01. BOOK-01 simplifies the public choices, preserves old projects and produces a complete order specification. | An unfinished and a configured book can each be reviewed in checkout. No public demo prices. |
| 03 · Order Flow and Telegram Integration | FLOW-01 preserves data across retries. LEAD-01 establishes the server-owned contract and prices. LEAD-02 hardens the existing transport and acknowledgement. | Mixed-service inquiry agrees across screen and group message. Local stub covers failures and concurrency. |
| 04 · Business Content and Operations | Finish BUS-01 and BUS-02, publish approved assets, contacts, service area and policy. OPS-01 assigns group ownership and rehearses reconciliation. | Owner confirms actual offers and that the business may process inquiries by the proposed route. Fallback is reachable. |
| 05 · Production Hardening | REL-01 prepares a matching Node/Nitro host, TLS, build inputs and operational signals. WEB-01 and DEP-01 address discoverability and dependency review. | Staging serves SSR, optimized images and POST over HTTPS. Runtime secrets and logs are checked. |
| 06 · QA and Deployment | QA-01 exercises the checklist on staging. Owner authorizes a controlled group test and go-live. Deploy the verified artifact, smoke-test and record rollback. | Customer, operator and technical sign-offs recorded. Keep public intake closed if any P0 gate is open. |

After launch, evaluate richer portfolio content and the separate PhotoBook Engine opportunity (LATER-01). No SaaS extraction is on the launch critical path.
