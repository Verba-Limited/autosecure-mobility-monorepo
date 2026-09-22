# AutoSecure Admin Portal Integration Plan

## Objective

Integrate all 77 admin API operations in the AutoSecure API v2 collection and provide the admin UI needed to use them safely and efficiently. Work will be completed one numbered step at a time. A step is complete only when its client methods, UI, validation, error handling, and verification checks are finished.

## Scope

| Area | Endpoints | Step |
| --- | ---: | ---: |
| Authentication | 3 | 2 |
| Dashboard and reports | 2 | 4 |
| Suppliers | 2 | 5 |
| Contact messages | 4 | 6 |
| Config and taxonomy | 10 | 7 |
| Dynamic attributes | 5 | 8 |
| Vehicle trims | 11 | 9 |
| Listing lifecycle | 8 | 10 |
| Listing pricing and merchandising | 3 | 11 |
| Order stages and orders | 11 | 12 |
| Quotes | 5 | 13 |
| Notifications | 5 | 14 |
| AI population | 8 | 15 |
| **Total** | **77** | |

## Non-Negotiable UI Rules

1. Follow the current admin theme: dark navy navigation, warm gold accent, light neutral work surfaces, restrained borders, and existing typography.
2. Do not use gradients. Use solid colors and subtle borders or shadows only when they improve hierarchy.
3. Never use emojis in navigation, buttons, empty states, alerts, labels, or generated content. Use `react-icons` where an icon improves comprehension, keep icon sizing and stroke weight consistent, and do not mix unrelated icon families on the same screen.
4. Do not add decorative page badges, eyebrow badges, novelty labels, or promotional pills around page headings. Use a clear title, optional short description, and relevant actions.
5. Operational status indicators are allowed only where they communicate real record state and have accessible contrast.
6. Keep the interface neat and functional. Prefer standard headers, toolbars, forms, tables, drawers, and dialogs.
7. Do not create a card for every small value. Use cards only to group related information or important metrics.
8. Avoid unnecessary animation. Use motion only for loading and clear state transitions.
9. Every workflow must have loading, disabled, success, empty, and error states where applicable.
10. Destructive actions require a confirmation dialog identifying the affected record and result.
11. Forms must show inline validation and retain values after recoverable failures.
12. Tables must support appropriate pagination, filtering, search, and responsive overflow.
13. Mobile and tablet layouts must remain usable.
14. Controls must be keyboard accessible, visibly focused, and clearly labelled.
15. Never expose supplier information, internal pricing, provenance, or admin notes outside authenticated admin routes.

## Engineering Rules

- Keep API methods in `packages/api`; do not call `fetch` from page components.
- Replace `unknown` payload handling with explicit DTO, pagination, status, and error types.
- Use the configured API base URL and never hardcode hosts in components.
- Refresh the access token and retry once before expiring a session.
- Load data per route instead of requesting every resource on initial load.
- Use server search and pagination when available.
- Centralize API error normalization and reload only affected resources after mutations.
- Use `react-toastify` for short-lived success confirmations and recoverable action errors. Keep field validation inline and use persistent page-level error states for load failures or problems that require user action; a toast must not be the only explanation for a blocking failure.
- Mount one shared, accessible `ToastContainer` in the authenticated admin shell. Avoid duplicate toasts, excessive notifications, and toasts for routine background refreshes.
- Do not use mock data in authenticated admin workflows.
- An endpoint is integrated only when it has a client method and usable UI or an intentional documented background workflow.

## Contract Decisions

- Confirm the API environment: Postman uses localhost while the frontend defaults to a deployed Render URL.
- Confirm DTOs for `POST /admin/listings` and `PATCH /admin/listings/:id`.
- The supplier status request body is absent from the Postman request definition. The UI uses the existing `{ status }` client contract with `ACTIVE` and `SUSPENDED`, matching the collection's "Approve, Suspend" label and saved `ACTIVE` response; verify both actions against the live API.
- Treat reused `{{listingId}}` variables as resource-specific IDs.
- Assign structured vehicle classification to taxonomy and miscellaneous values to config unless the backend says otherwise.
- Confirm pagination, filters, and search parameters against real responses.
- Document backend mismatches rather than hiding them with frontend guessing.

## Step 1 - Foundation and API Contract

**Status:** Complete

**Goal:** Prepare a typed, testable foundation for all later steps.

**Work:**

- Repair or reinstall the malformed TypeScript dependency blocking the admin type-check.
- Declare `react-icons` and `react-toastify` in the admin workspace package. Do not use the unrelated `toastify` package for React UI feedback.
- Add an admin environment example with the API base URL.
- Convert saved Postman examples into domain-specific TypeScript DTOs.
- Add shared envelope, pagination, error, money, ID, and timestamp types.
- Use resource-specific ID names in client signatures.
- Add shared query-string and multipart helpers.
- Create reusable page header, toolbar, table, pagination, confirmation, empty, error, and form components.
- Add the shared Toastify container and notification helpers for consistent success, warning, and error messages.
- Split the oversized `AdminClient` into route-level or feature modules without changing working behavior.

**Done when:** Type-check, lint, and build run reliably; existing behavior still works; new pages do not require `unknown` payloads; shared UI follows this plan.

## Step 2 - Authentication and Session Management

**Status:** Complete

**Endpoints:**

- `POST /admin/auth/login`
- `POST /admin/auth/refresh`
- `POST /admin/auth/change-password`

**Work:**

- Retain the login design while improving validation and backend errors.
- Add automatic token refresh and one retry for failed authorized requests.
- Deduplicate simultaneous refresh calls and prevent refresh loops.
- Log out only when refresh fails or no refresh token exists.
- Add a security screen for password change with confirmation and validation.
- Protect every admin route and never log or display tokens.

**Done when:** Login, refresh, retry, expiry, logout, and password change are verified.

## Step 3 - Admin Shell and Routes

**Status:** Complete

**Goal:** Create a maintainable console that can hold every feature.

**Work:**

- Add destinations for Dashboard, Listings, Suppliers, Catalog, Attributes, Trims, Orders, Order Stages, Quotes, Messages, Notifications, AI Population, and Settings.
- Group related catalog destinations without complicating navigation.
- Replace the hardcoded date with a localized date or remove it.
- Add a functional mobile navigation drawer.
- Isolate route data and errors so one failed endpoint cannot break the console.
- Add consistent authenticated boundaries and expired-session handling.
- Ensure URLs are linkable and browser navigation works normally.

**Done when:** Every feature has a route; desktop, tablet, and mobile navigation work; the shell has no gradients, emojis, or decorative page badges.

## Step 4 - Dashboard and Reports

**Status:** Complete

**Endpoints:**

- `GET /admin/dashboard`
- `GET /admin/dashboard/reports`

**Work:**

- Map current metrics to typed response fields.
- Show useful operational totals, pending work, supplier activity, orders, quotes, and message indicators when available.
- Use restrained charts or tables only when visualization improves understanding.
- Link actions to matching filtered queues.
- Load dashboard and report errors independently.

**Done when:** Values match API responses, empty datasets are honest, and dashboard actions open the correct queues.

## Step 5 - Supplier Administration

**Status:** Complete

**Endpoints:**

- `GET /admin/suppliers`
- `PATCH /admin/suppliers/:supplierId/status`

**Work:**

- Add real pagination, supported filters, and search.
- Add a focused supplier detail drawer or page from returned fields.
- Support approval and suspension with confirmation and backend validation.
- Keep sensitive supplier information within authenticated admin views.
- Refresh only supplier data after mutations.

**Done when:** Pagination and statuses work consistently and loading, empty, success, and error states are verified.

## Step 6 - Contact Message Operations

**Status:** Complete

**Endpoints:**

- `GET /admin/contact-messages`
- `GET /admin/contact-messages/stats`
- `GET /admin/contact-messages/:messageId`
- `PATCH /admin/contact-messages/:messageId/status`

**Work:**

- Move the queue to its own route with server-supported pagination, status filters, and search.
- Call the detail endpoint when a message opens.
- Support `NEW`, `IN_PROGRESS`, and `RESOLVED` states.
- Keep statistics compact and refresh detail and counts after changes.

**Done when:** Queue, statistics, detail, and status actions use their intended endpoints; long content, missing fields, and empty queues render correctly.

## Step 7 - Platform Configuration and Taxonomy

**Status:** Complete

**Endpoints:**

- `GET /admin/config`
- `POST /admin/config`
- `PUT /admin/config/:configId`
- `DELETE /admin/config/:configId`
- `GET /admin/taxonomy`
- `POST /admin/taxonomy`
- `PATCH /admin/taxonomy/reorder`
- `GET /admin/taxonomy/:taxonomyId`
- `PATCH /admin/taxonomy/:taxonomyId`
- `DELETE /admin/taxonomy/:taxonomyId`

**Work:**

- Reserve config for miscellaneous values such as delivery options and pricing rules unless confirmed otherwise.
- Add config editing and active-state management.
- Manage brands, models, categories, subcategories, vehicle types, powertrains, body types, drive types, use cases, and other taxonomy kinds.
- Support parent-child terms, activation, ordering, metadata, editing, and safe deletion.
- Provide keyboard-accessible reordering that does not depend only on drag-and-drop.
- Explain referenced-term conflicts and offer deactivation when deletion is unsafe.
- Remove hardcoded classifications as taxonomy becomes available.

**Done when:** All ten operations have usable workflows, config and taxonomy do not duplicate ownership, and ordering and relationships persist.

## Step 8 - Dynamic Attribute Management

**Status:** Complete

**Endpoints:**

- `GET /admin/attributes`
- `POST /admin/attributes`
- `GET /admin/attributes/:attributeId`
- `PATCH /admin/attributes/:attributeId`
- `DELETE /admin/attributes/:attributeId`

**Work:**

- Build an attribute list with group, scope, active, filterable, and comparable filters.
- Add forms for key, label, group, data type, unit, options, storage path, scopes, ordering, and metadata.
- Change form controls according to the selected data type.
- Make core attributes read-only or non-deletable when indicated by the API.
- Distinguish filterable, comparable, and display-only attributes.

**Done when:** Supported types can be created and edited, core deletion failures are clear, and definitions can drive trim forms and catalog filters.

## Step 9 - Vehicle Trim and Specification Management

**Status:** Complete

**Endpoints:**

- `GET /admin/trims`
- `POST /admin/trims`
- `GET /admin/trims/:trimId`
- `PATCH /admin/trims/:trimId`
- `DELETE /admin/trims/:trimId`
- `POST /admin/trims/:trimId/verify`
- `POST /admin/trims/:trimId/publish`
- `POST /admin/trims/:trimId/unpublish`
- `POST /admin/trims/:trimId/archive`
- `POST /admin/trims/:trimId/duplicate`
- `POST /admin/trims/:trimId/images`

**Work:**

- Build a paginated trim library with brand, model, year, status, verification, and search filters.
- Build structured create and edit forms for identity, classification, specifications, review content, price range, suitability, colors, and images.
- Source taxonomy selections and dynamic fields from their admin endpoints.
- Divide long forms into clear sections without turning every field into a card.
- Support draft, verification, publishing, unpublishing, archiving, duplication, deletion, and image upload.
- Display provenance and unverified sections when returned.
- Prevent publishing while required sections remain unverified.
- Validate image count, file type, and size before multipart upload.

**Done when:** A trim moves through its full lifecycle, dynamic taxonomy and attributes populate forms, uploads work, and referenced trims are not destructively deleted.

## Step 10 - Listing Lifecycle and Moderation

**Status:** Complete

**Endpoints:**

- `GET /admin/listings`
- `POST /admin/listings`
- `GET /admin/listings/:listingId`
- `PATCH /admin/listings/:listingId`
- `DELETE /admin/listings/:listingId`
- `POST /admin/listings/:listingId/verify`
- `PATCH /admin/listings/:listingId/approve`
- `PATCH /admin/listings/:listingId/reject`

**Work:**

- Expand the moderation queue into complete listing management with server pagination, filters, and search.
- Replace local row expansion with the full detail endpoint.
- Separate customer-facing content from supplier identity, internal pricing, provenance, and admin notes.
- Add AutoSecure listing creation after the create DTO is confirmed.
- Add editing, soft archival, section verification, approval, and rejection.
- Require a useful rejection reason and only allow actions valid for the current state.

**Done when:** All eight operations have usable workflows, details include protected internal information, and invalid transitions are prevented or explained.

## Step 11 - Listing Pricing and Merchandising

**Status:** Complete

**Endpoints:**

- `PATCH /admin/listings/:listingId/pricing`
- `PATCH /admin/listings/:listingId/hot-deal`
- `PATCH /admin/listings/:listingId/feature`

**Work:**

- Add a pricing editor for internal values, currency, customer-facing minimum and maximum, and supported cost fields.
- Keep exact internal prices visually and structurally separate from public price ranges.
- Add controlled Hot Deal activation and optional label editing.
- Add feature and unfeature actions for homepage placement.
- Show current merchandising state in details and supported filters.
- Use functional switches or actions without promotional decoration.

**Done when:** Exact prices cannot leak into public ranges, Hot Deal and featured states update predictably, and validation failures preserve form data.

## Step 12 - Order Stages and Customer Orders

**Status:** Complete

**Endpoints:**

- `GET /admin/order-stages`
- `POST /admin/order-stages`
- `PATCH /admin/order-stages/reorder`
- `PATCH /admin/order-stages/:stageId`
- `DELETE /admin/order-stages/:stageId`
- `POST /admin/orders`
- `GET /admin/orders`
- `GET /admin/orders/:orderId`
- `PATCH /admin/orders/:orderId`
- `POST /admin/orders/:orderId/status`
- `POST /admin/orders/:orderId/cancel`

**Work:**

- Build stage settings for labels, descriptions, ordering, terminal state, and activation.
- Protect immutable stage keys and handle referenced-stage deletion by offering deactivation.
- Build a paginated orders area with customer, stage, date, and supported search filters.
- Add order creation using customer, vehicle, agreed price, delivery information, and initial stage.
- Build order details with current stage, chronological history, customer details, notes, and delivery information.
- Support editing allowed fields, status changes with notes, optional customer notification, and cancellation with a reason.
- Confirm cancellation and irreversible transitions.

**Done when:** Status changes append history, stage ordering drives timelines, and order creation, editing, progress, and cancellation are verified.

## Step 13 - Quotation Operations

**Status:** Complete

**Endpoints:**

- `GET /admin/quotes`
- `GET /admin/quotes/:quoteId`
- `POST /admin/quotes/:quoteId/assign`
- `POST /admin/quotes/:quoteId/respond`
- `POST /admin/quotes/:quoteId/close`

**Work:**

- Build a paginated queue with status, assignment, date, product type, and supported search filters.
- Add details containing the request, compatible vehicle or part, supplier assignment, and prior responses.
- Support assigning, changing, or clearing a supplier.
- Add an AutoSecure response form for price, availability, lead time, condition, message, and validity date.
- Support closure with a reason and allow actions only in valid states.

**Done when:** The lifecycle works from queue through assignment, response, and closure, with consistent currency and date validation.

## Step 14 - Admin Notifications

**Status:** Ready for manual verification

**Endpoints:**

- `POST /admin/notifications`
- `GET /admin/notifications`
- `GET /admin/notifications/unread-count`
- `PATCH /admin/notifications/read-all`
- `PATCH /admin/notifications/:notificationId/read`

**Work:**

- Add a compact notification control with an unread count and a paginated list when supported.
- Support marking one or all notifications as read.
- Add a separate send form for an individual user or supported audience.
- Validate audience, optional user ID, title, body, and type.
- Require confirmation before a large-audience broadcast.
- Do not use browser alerts or decorative badge clusters.

**Done when:** Counts stay synchronized, individual and broadcast payloads are correct, and failed sends preserve content.

## Step 15 - AI Population and Release Hardening

**Endpoints:**

- `GET /admin/ai/config`
- `POST /admin/ai/vehicles/generate`
- `POST /admin/ai/parts/generate`
- `GET /admin/ai/generations`
- `GET /admin/ai/generations/:generationId`
- `PATCH /admin/ai/generations/:generationId`
- `POST /admin/ai/generations/:generationId/apply`
- `POST /admin/ai/generations/:generationId/discard`

**Work:**

- Put AI Population behind a feature flag or configuration check.
- Show availability, model, limits, and cost data from the config endpoint.
- Provide separate vehicle and part generation forms.
- Build generation history with status, token usage, cost, dates, and supported filters.
- Add a review screen containing draft, sources, usage, and editable fields.
- Require explicit review before applying generated data and confirmation before discarding it.
- Never treat generated content as verified merely because generation succeeded.
- Verify every operation has a client method and intentional UI or background workflow.
- Add focused tests for request construction, refresh, DTO mapping, validation, and state transitions.
- Add integration tests for login refresh, approval, pricing, trim publishing, order history, quote response, broadcast notification, and AI apply.
- Run type-check, lint, production build, tests, responsive checks, and accessibility checks.
- Confirm there are no gradients, emojis, decorative page badges, mock fallbacks, or sensitive-data leaks.
- Produce a final 77-operation coverage checklist with any genuine backend blockers.

**Done when:** All available groups are implemented and verified, contract defects are documented with evidence, and the portal is ready for acceptance testing.

## Per-Step Working Procedure

For every step requested by the user:

1. Re-read the step and inspect affected files.
2. Confirm the exact Postman requests and saved responses.
3. Identify contract ambiguity before building around assumptions.
4. Implement shared types and API methods first.
5. Implement the smallest complete UI workflow for every endpoint in the step.
6. Add loading, empty, error, success, validation, confirmation, and appropriate Toastify feedback states.
7. Verify responsive and keyboard behavior.
8. Run relevant type-check, lint, build, and tests.
9. Mark completed work in the tracker below.
10. Give the user a concise manual test checklist containing setup or credentials needed, exact actions to perform, expected results, important responsive or error cases, and any known limitation.
11. Report endpoints completed, files changed, automated verification results, and genuine backend blockers.
12. Do not start the next numbered step until the user has reviewed the handoff and asks to continue.

## User Testing Handoff

At the end of every step, the completion report must include:

- **What changed:** the completed UI, API methods, and behavior.
- **Before testing:** the command to run, required environment values, test account or role requirements, and any backend dependency.
- **Happy-path tests:** numbered actions the user can perform and the expected result after each action.
- **Failure-path tests:** at least one relevant validation, permission, network, empty-state, or backend-error case.
- **Responsive checks:** the pages or controls that should be checked on desktop and mobile widths.
- **Expected notifications:** which actions should show Toastify success or error feedback and which errors should remain inline or page-level.
- **Known limitations:** anything that cannot yet be verified because a later step or backend contract is still pending.

A step may be marked implemented after its code and automated checks pass, but the handoff must clearly distinguish that from user acceptance. The next step starts only when the user requests it.

## Progress Tracker

- [x] Step 1 - Foundation and API contract
- [x] Step 2 - Authentication and session management
- [x] Step 3 - Admin shell and routes
- [x] Step 4 - Dashboard and reports
- [x] Step 5 - Suppliers
- [x] Step 6 - Contact messages
- [x] Step 7 - Platform configuration and taxonomy
- [x] Step 8 - Dynamic attributes
- [x] Step 9 - Vehicle trims
- [x] Step 10 - Listing lifecycle and moderation
- [x] Step 11 - Listing pricing and merchandising
- [x] Step 12 - Order stages and orders
- [x] Step 13 - Quotes
- [ ] Step 14 - Notifications (ready for manual verification)
- [ ] Step 15 - AI population and release hardening

## Definition of Done

- All 77 admin operations have typed client coverage.
- Every operation has usable UI or a documented background workflow.
- Authentication refresh and authorization boundaries are reliable.
- All list views have appropriate pagination, filters, search, and independent loading states.
- Sensitive supplier and pricing information remains admin-only.
- Type-check, lint, production build, and the agreed tests pass.
- Success and recoverable action errors use consistent Toastify feedback, while field and blocking errors remain visible in context.
- UI iconography uses `react-icons` consistently and contains no emoji substitutes.
- Every completed step includes a user-facing manual test checklist with expected results and known limitations.
- The UI follows every rule in this document and remains consistent with the existing admin theme.
