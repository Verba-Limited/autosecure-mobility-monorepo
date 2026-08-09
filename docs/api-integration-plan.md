# autoSecure API Integration Plan

## API Bases

- Public API: `https://autosecure-public-api.onrender.com/api/v1`
- Admin API: `https://autosecure-admin-api.onrender.com/api/v1`

## Phase 1 - Foundation

- Add shared API client package.
- Add DTO types from the Postman collection.
- Add environment variables for API base URLs.
- Keep existing mock data as fallback while pages are wired one by one.

## Phase 2 - Customer Catalog

- Replace `CARS` with `GET /catalog/vehicles`.
- Replace `PART_PRODUCTS` with `GET /catalog/parts`.
- Replace detail pages with `GET /catalog/vehicles/:id` and later `GET /catalog/parts/:id`.
- Replace direct WhatsApp links with inquiry calls:
  - `POST /catalog/vehicles/:id/inquire`
  - `POST /catalog/parts/:id/inquire`

## Phase 3 - Supplier Auth

- Add supplier register, verify email, login, forgot/reset password.
- Store access and refresh tokens.
- On `401`, call `POST /auth/refresh`, then retry once.

## Phase 4 - Supplier Inventory

- Replace dashboard mock data with `GET /inventory/dashboard`.
- Replace listings mock data with `GET /inventory?page=1&limit=10`.
- Wire forms:
  - `POST /inventory/cars`
  - `POST /inventory/parts`
  - `POST /inventory/:id/media` with `files`
  - `POST /inventory/:id/submit`

## Phase 5 - Admin Portal

- Add admin app or admin routes.
- Wire admin login and refresh.
- Add supplier approval/suspension.
- Add listing approval/rejection with rejection reason modal.
- Add config management for brands, models, categories, delivery options, and pricing rules.
- Add dashboard and reports.

## Known UI Gaps From PRD

- Customer auth pages are not present.
- Supplier auth pages are not present.
- Admin portal is not present.
- Catalog filters are incomplete compared with the PRD.
- Parts detail page is not present.
- Used car detail page is not present.
- Dynamic config-driven select fields are not wired yet.
- Supplier forms do not expose every backend DTO field yet.
- Media upload is visual only and not connected to multipart upload yet.
