// HEADER: Product route definitions and request validation wiring.
const express = require('express');
const productController = require('../controllers/productController');
const validateRequest = require('../middlewares/validateRequest');
const {
  createProductSchema,
  updateProductSchema
} = require('../utils/validationSchemas');

const router = express.Router();

router.post('/', validateRequest(createProductSchema), productController.createProduct);
router.put('/:id', validateRequest(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.get('/:id', productController.getProductById);
router.get('/', productController.listProducts);

module.exports = router;

/*
BOTTOM EXPLANATION
- Responsibility: Maps product URLs to controllers and enforces validation on create/update endpoints.
- Key syntax: `router.METHOD(path, ...middlewares, handler)` composes request pipeline steps.
- Common mistakes: Route order matters; specific routes should appear before generic wildcard routes.
*/

