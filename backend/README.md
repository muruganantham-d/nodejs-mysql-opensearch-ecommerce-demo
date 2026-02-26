<!-- HEADER: Backend-specific setup, architecture, and endpoint guide. -->
# Backend README

## What This Backend Does
- Handles product CRUD in MySQL.
- Maintains OpenSearch index (`products_v1`) for search.
- Exposes health, reindex, and search APIs.

## Architecture (Separation of Concerns)
- `routes/` receives HTTP calls.
- `controllers/` translates HTTP request/response.
- `services/` handles business logic and integrations.
- `models/` maps JS objects to MySQL tables.
- `migrations/` and `seeders/` evolve DB schema and sample data.

## Reliability Rule Implemented
- MySQL write happens first.
- If OpenSearch indexing fails, API still returns MySQL success plus `warning`.
- You can repair search index with `POST /api/search/reindex`.

## Install + Run
```bash
npm install
copy .env.example .env
npm run migrate
npm run seed
npm run dev
```

Windows OpenSearch note:
- Prefer `OPENSEARCH_URL=http://127.0.0.1:9200` for local Docker access.
- Startup now retries OpenSearch ping before index creation for better container warm-up reliability.

## Useful Commands
Run tests:
```bash
npm test
```

Undo migrations and re-run:
```bash
npm run migrate:undo
npm run migrate
```

## API Endpoints
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/products/:id`
- `GET /api/products?page=1&limit=10`
- `GET /api/health`
- `POST /api/search/reindex`
- `GET /api/search/products?q=shoe&brand=Nike&category=Shoes&minPrice=10&maxPrice=500&inStock=true&sort=relevance&page=1&limit=10`

## Health Check Details
Run:
```bash
curl http://localhost:4000/api/health
```

The response includes:
- `services.mysql.status`
- `services.opensearch.status`
- `services.opensearch.nodes` (actual URLs backend is trying)
- `services.opensearch.clusterStatus`
- `troubleshooting.opensearch` quick fix steps

If OpenSearch is down:
```bash
docker ps -a
docker logs opensearch --tail 200
curl http://127.0.0.1:9200
```

## Search Concepts Used
- `must` clause: affects score (relevance).
- `filter` clause: exact/range filtering, no score impact, cache-friendly.
- `match`/`multi_match`: for analyzed text (`name`, `description`).
- `term`: exact match for `keyword` fields (`brand`, `category`, `inStock`).
- `name.keyword`: needed for exact matches/sorts because `name` text is analyzed.

## Testing Notes
- Product API tests mock OpenSearch service.
- Search API tests mock OpenSearch client response.
- This keeps tests fast and deterministic.

<!-- BOTTOM EXPLANATION
- Responsibility: Explain backend architecture, commands, and API contract in beginner-friendly terms.
- Key syntax: Backticks mark endpoints/commands; query string examples show filter usage.
- Common mistakes: Using term on text fields and expecting fuzzy/analyzed behavior.
-->
