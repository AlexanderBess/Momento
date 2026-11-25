# Working on MOMENTO

MOMENTO is a Russian-language event-services site for Novosibirsk and Berdsk. Start with [MVP scope](docs/MVP_SCOPE.md), [project status](docs/PROJECT_STATUS.md) and the [backlog](docs/BACKLOG.md). The 22 November deep audit and older architectural notes are historical. Verify current behavior in source.

## Architecture and data

- Extend the existing Nuxt application. Pages and components live in `app/`, shared inquiry types in `shared/lead.ts` and delivery in `server/api/leads.post.ts`. Route all commercial inquiries through the shared cart, checkout and private Nitro handler.
- Reuse service data and position builders in `app/config/` and `app/lib/selection.ts`. Keep price and option validation consistent at the server boundary. Preserve existing browser cart/project formats and customer edits when changing configuration.
- Keep Telegram credentials in private runtime configuration. Use synthetic records and a local stub for transport testing. Record operational results without personal data or tokens.
- Business owners confirm bookings and maintain external business records. Standalone backend, database, CRM/admin, accounts and payments are outside this release. Preserve advanced photobook functionality when simplifying the public configurator.
- Use only owner-approved commercial claims, imagery, prices and legal copy. Track outstanding decisions in the backlog. Keep public copy in Russian and project planning documentation in English.

## Resource-efficient development

- Prioritize correctness, simplicity, and maintainability.
- Inspect only files directly relevant to the current task.
- Reuse existing components, utilities, types, and business logic.
- Do not repeat completed repository audits.
- Avoid unrelated refactoring and speculative architecture.
- Search before reading entire directories or large files.
- Do not create new documentation when existing documents can be updated.
- Keep tool output and implementation reports concise.
- Avoid repetitive progress messages and unnecessary explanations.
- Run focused validation for local changes.
- Run broader regression checks when changes affect shared logic, data contracts, or critical user flows.
- Run full production validation before release.
- Do not repeat successful checks unless subsequent changes invalidate them.
- Preserve existing user modifications.
- Never invent business requirements, commercial prices, or product specifications.
- Stop and report unresolved blockers instead of repeatedly attempting the same unsuccessful solution.
- Do not commit, push, or deploy without approval.
- Efficiency must never come at the expense of correctness, security, or data integrity.

## Verification and change discipline

Use npm and `package-lock.json`, with the Node version in `.nvmrc`. Inspect scripts in `package.json`. Run `npm run lint`, `npm run typecheck` and `npm run build` individually when diagnosing failures. Build requires font-provider access or available cached resources. Validate delivery against a running Nitro server. Static-only output cannot handle inquiry submission.

Match the requested phase. Phase 00 authorizes audit documentation only. Start Phase 01 after approval. Keep unrelated working-tree changes intact, including untracked user documents. Report actual check results and secure approval before committing or pushing.
