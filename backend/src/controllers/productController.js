// HEADER: Controller handlers for product CRUD endpoints.
const productService = require('../services/productService');

function parseProductId(rawId) {
  const productId = Number.parseInt(rawId, 10);
  return Number.isNaN(productId) || productId <= 0 ? null : productId;
}

async function createProduct(req, res, next) {
  try {
    const result = await productService.createProduct(req.body);

    return res.status(201).json({
      success: true,
      data: result.product,
      warning: result.warning
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const productId = parseProductId(req.params.id);

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const result = await productService.updateProduct(productId, req.body);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({
      success: true,
      data: result.product,
      warning: result.warning
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const productId = parseProductId(req.params.id);

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const result = await productService.deleteProduct(productId);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      warning: result.warning
    });
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const productId = parseProductId(req.params.id);

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const product = await productService.getProductById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return next(error);
  }
}

async function listProducts(req, res, next) {
  try {
    const result = await productService.listProducts(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  listProducts
};

/*
BOTTOM EXPLANATION
- Responsibility: Handles HTTP details for product APIs and delegates business work to productService.
- Key syntax: Controllers use `try/catch` and call `next(error)` to centralize failure handling.
- Common mistakes: Mixing DB logic in controllers makes code harder to test and maintain.
*/
