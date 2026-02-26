<!-- HEADER: Frontend guide for running and understanding Product Search UI behavior. -->
# Frontend README

## What This UI Does
- Search page (`/`) calls backend search API (`GET /api/search/products`).
- Admin page (`/admin/products`) calls CRUD + reindex APIs:
  - `GET /api/products`
  - `POST /api/products`
  - `PUT /api/products/:id`
  - `DELETE /api/products/:id`
  - `POST /api/search/reindex`
- Shows backend warning messages when MySQL succeeds but OpenSearch indexing fails.

## Run Frontend
```bash
npm install
copy .env.example .env
npm run dev
```

Default URL:
- `http://localhost:5173`

## Notes
- The backend must run on `http://localhost:4000` by default.
- CORS is enabled in backend for local development.

## Search UX Flow
1. Enter keywords or filters.
2. Submit form.
3. UI fetches from backend.
4. Results + facets + highlight are rendered.

## Admin UX Flow
1. Open `http://localhost:5173/admin/products`.
2. Create or edit with reusable form.
3. Delete with confirmation modal.
4. Click **Reindex from MySQL** to force full sync to OpenSearch.
5. Review reindex summary (`mysqlCount` and `opensearchCount`).

## Manual Admin Testing
1. Create product in admin page and confirm it appears in table.
2. Edit same product and confirm row updates.
3. Delete it and confirm row disappears.
4. Click reindex and confirm success summary appears.
5. Open search page (`/`) and search by product name/brand to verify search reflects changes.

<!-- BOTTOM EXPLANATION
- Responsibility: Explains frontend purpose and setup in a short practical guide.
- Key syntax: Uses concise command blocks for copy-paste local run steps.
- Common mistakes: Running only frontend without backend leaves admin/search requests failing.
-->
