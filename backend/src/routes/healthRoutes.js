// HEADER: Health route definition used to verify dependency connectivity.
const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

router.get('/', healthController.checkHealth);

module.exports = router;

/*
BOTTOM EXPLANATION
- Responsibility: Registers health check endpoint at `/api/health`.
- Key syntax: A route file should stay thin and call controller methods.
- Common mistakes: Doing health logic directly in route files hurts testability.
*/
