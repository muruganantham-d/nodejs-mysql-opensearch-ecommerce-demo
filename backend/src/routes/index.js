// HEADER: Central API router that composes product, search, and health route modules.
const express = require('express');
const productRoutes = require('./productRoutes');
const searchRoutes = require('./searchRoutes');
const healthRoutes = require('./healthRoutes');

const router = express.Router();

router.use('/products', productRoutes);
router.use('/search', searchRoutes);
router.use('/health', healthRoutes);

module.exports = router;

/*
BOTTOM EXPLANATION
- Responsibility: Provides one place to attach all feature routes under `/api`.
- Key syntax: `router.use('/prefix', childRouter)` mounts nested route modules.
- Common mistakes: Inconsistent base paths between router and frontend API calls.
*/
