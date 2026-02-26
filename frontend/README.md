<!-- HEADER: Frontend guide for running and understanding Product Search UI behavior. -->
# Frontend README

## What This UI Does
- Calls backend search API only (`GET /api/search/products`).
- Offers search text, filters, sorting, and displays facets.
- Shows highlighted text from OpenSearch results.

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

<!-- BOTTOM EXPLANATION
- Responsibility: Explains frontend purpose and setup in a short practical guide.
- Key syntax: Uses concise command blocks for copy-paste local run steps.
- Common mistakes: Starting frontend without backend makes API requests fail.
-->
