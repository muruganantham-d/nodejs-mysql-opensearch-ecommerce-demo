// HEADER: Search route definitions for query and reindex operations.
const express = require('express');
const searchController = require('../controllers/searchController');

const router = express.Router();

router.get('/products', searchController.searchProducts);
router.post('/reindex', searchController.reindexProducts);

module.exports = router;

/*
BOTTOM EXPLANATION
- Responsibility: Exposes search-related endpoints under `/api/search`.
- Key syntax: `GET` is used for read/search; `POST` for reindex action side effect.
- Common mistakes: Putting reindex under product routes can blur ownership of search concerns.
*/
