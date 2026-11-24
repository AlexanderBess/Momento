# MOMENTO launch scope

**Release objective.** A customer in Novosibirsk or Berdsk can choose one or more services, review an intelligible estimate or request a quote, and deliver one inquiry that the owners can act on. Only the owners confirm price, date and availability.

| Area | First release | Completion evidence |
|---|---|---|
| Public site | Russian-language discovery for AI booth rental, photography, ready/custom photozones and photobooks. Accurate service area, contact channel, privacy information and usable mobile navigation. | Each published link has a useful destination. Every visible image, claim and price has owner approval. Withhold empty showcases. |
| Photobooks | Choose a producible format, page count, compatible cover, materials, colours, finishing and quantity. Preview and edit the specification, including a book with an unfinished layout. | The customer and operator can agree the same specification from the inquiry. Owners arrange personal photos and proof approval afterwards. |
| Selection and checkout | One shared editable selection, mixed services, one optional event and one contact. Reload and retry where browser storage permits. | A successful receipt identifies delivery. No automatic reservation, payment or sale. Errors preserve input and offer recovery. |
| Delivery | Existing private Nitro endpoint, server-owned catalog validation, Telegram Bot API and a private group. | Server credentials, truthful acknowledgement, bounded traffic and a tested manual fallback. |
| Operations | A responsible owner checks the group, reconciles duplicate or uncertain messages, contacts the customer and records agreed details in an approved external spreadsheet or business tool. | Owner signs off access, handling, retention and a worked recovery example. |

**Architecture decision.** Retain Nuxt 4, Vue, TypeScript, the existing composables and Node-capable Nitro deployment. Initial release excludes standalone services, databases, custom CRM/admin, customer accounts, payments, availability calendars and automatic confirmations.

**Preserve for later.** Keep local Book Studio projects, demo libraries, spread editing and version conflict handling. A hidden advanced control may continue to support existing local data. Cloud projects, uploads, print export, multi-tenant accounts and a standalone PhotoBook Engine belong to a separate post-launch product decision.

**Owner decisions.** Approve the four service offerings, territories, offer-specific prices or quote-only wording, print supplier options, image rights, business identity, fallback contact, operator workflow and privacy arrangements. The planning default for an unapproved numeric price is an individual quote. A placeholder or demo rate cannot establish a sale term.

The [audit](PRODUCTION_READINESS_AUDIT.md) records current behavior. The [release checklist](PRODUCTION_CHECKLIST.md) defines launch evidence.
