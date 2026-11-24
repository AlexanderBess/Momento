# First-release checklist

Use this on the exact candidate and intended host. Record build/commit, environment, tester, date and evidence for each applicable P0 gate. Use synthetic data in QA and references or redacted results in release notes. A local audit result is available in [Project status](PROJECT_STATUS.md). Empty boxes below require release-candidate evidence.

## Owner and customer-facing gates

- [ ] Owners approve offers, both cities, travel/delivery conditions, service availability, prices or individual-quote wording and actual print supplier combinations.
- [ ] Public assets have permission for this use. Illustrations are identified. Empty galleries/portfolio and stub links are withheld or replaced. Header, footer and home agree.
- [ ] A monitored business contact is visible on the contact page, in the footer and on failure. Owner confirms a test contact reached the intended recipient.
- [ ] Owner/legal signs off operator identity, data flow and locations, third-party transfers, notices/consent, access, retention, deletion and externally maintained records. Policy is published and reachable from checkout.
- [ ] Named primary and backup owners can read the private group, access the external register and manually agree dates and prices. Agree a review schedule and customer follow-up wording.

## Engineering and platform gates

- [ ] Install from the approved lock in a clean target build environment. Run lint, typecheck and production build. Confirm the FE-01 fixes on the candidate and record dependency advisory triage.
- [ ] Build for the actual host OS/CPU and start the Node-capable Nitro artifact. HTTPS works, HTTP redirects, production hostname and scheme are correct, optimized images, fonts and all service routes load. Protect any staging host from indexing.
- [ ] Inject private Telegram bot token/chat ID at runtime, restrict group access, prevent production use of the local test base and verify the client payload/bundle and proxy/application logs contain no secrets.
- [ ] Set proxy/request byte limits, bounded server rate and concurrency limits and appropriate timeouts. Review proxy trust and production log access/retention.
- [ ] Observe availability, aggregate delivery outcomes, latency and configuration failures. Verify alert ownership. Record the previous known-good artifact and configuration, restart procedure and rollback result.

Local FE-01 verification passed lint, typecheck, production build and the Home/About browser checks. The engineering and public route gates remain open for the exact release candidate and intended host. See the [FE-01 verification record](PROJECT_STATUS.md#phase-01-fe-01).

## Candidate acceptance scenarios

| Gate | Exercise | Required evidence |
|---|---|---|
| [ ] Public routes | Home, all four services, About, Contacts, FAQ/Portfolio publication decision, Privacy, Checkout, direct unknown URLs, `/order`. Navigate by phone and keyboard, follow same-page anchors and restore focus after drawers/dialogs. | Correct statuses and destinations, meaningful indexed pages, no promoted placeholders. Inspect the invalid-slug console diagnostic and exercise the error-page home action. |
| [ ] Configuration | Change single booth and photography positions with both cancel and replace. Add two ready zone concepts, custom notes and two different books. Modify one item without changing the others. | Stable selection IDs, correct distinction between copies and positions, correct regional/currency copy. Full notes, contact/event and actionable specs survive into the business message. |
| [ ] Book and pricing | Minimum/maximum pages and copies, cover/colour/material compatibility, finishing, unfinished layout, stale catalog and missing local project. Check quote-only and approved fixed/partial cases. | Cart and server agree on approved terms. Revised or unavailable choices require customer review. Owner can quote the book without access to the customer's device. |
| [ ] Validation and consent | Empty/invalid contact, conditional channels, invalid and past dates in business timezone, oversized input/items and absent consent. | Accessible field errors, consent actually checked server-side, accurate HTTP result, no upstream send for rejected inquiries. |
| [ ] Storage and mobile | Refresh and return from privacy, test expired/v1 carts, unavailable storage, two tabs and an edit while sending. Try portrait/short landscape, zoom, keyboard, reduced motion and a screen reader. | Draft survives recoverable errors and storage limits are explained. First invalid field, submit status, success and edit dialogs can be reached and understood. Actions remain visible. |
| [ ] Delivery and recovery | Use stub for missing config, refusal, timeout, upstream throttling, single and multipart bounds, repeated clicks, concurrent retries, changed payload and restart. | No false receipt. Known delivery clears only matching submitted state. Uncertain delivery preserves data, reference and fallback. Bounded limits and redacted outcomes are observable. |
| [ ] Real group acceptance | With owner authorization, send one labelled synthetic mixed inquiry through the target HTTPS deployment into the private group. | Operator matches reference and all commercial details with the screen, records the inquiry once externally and confirms that the customer is asked to wait for manual confirmation. |
| [ ] Release and rollback | Record owner go/no-go, deploy approved build, repeat public route/image smoke and check error rates. Revert or close intake if delivery is degraded. | Known-good version and alternate contact work. A named person monitors the first real inquiries and follows up. |

## Manual recovery

1. **Customer sees refusal or timeout.** Keep the selection and draft on the device. Show the support reference when available and the approved alternative contact. For a definitive refusal, retry the same submitted version after the problem clears. For an uncertain acknowledgement, ask the operator to check before sending again. Avoid a fresh submission merely to obtain a new reference.
2. **Operator receives a call, duplicate or incomplete set.** Search the private group and external register by reference. If the current client lacked a reference, reconcile contact, time and service summary privately. For numbered messages verify all parts. Confirm with the customer which revision to use and request only the missing details through an approved channel.
3. **Record one inquiry.** Assign an owner in the existing external business tool, link or note the reference, flag uncertainty/duplicates and agree the next contact. Confirm price and date manually after checking availability. Apply the agreed access and deletion periods to group messages and external records.
4. **Restore service.** Technical owner checks redacted status counts, configuration, bot permissions, reachability and timeouts. Use the stub first, then an owner-authorized synthetic group check. Reopen intake after acknowledgement and complete content are verified. Keep the fallback available throughout.
5. **If no copy can be found**, the server has no durable request archive. A browser draft may still be recoverable on the original device. Ask the customer to resend once or supply essentials through the alternate contact, and reconcile any late-arriving message.

A Telegram receipt documents API acceptance. Reading by an owner, entry into the business tool and confirmation of the booking each need their own action.
