// HEADER: Product business logic layer that writes MySQL first, then OpenSearch.
const { Product } = require('../db');
const {
  indexProduct,
  updateProductIndex,
  deleteProductFromIndex
} = require('./opensearchService');
const { parsePositiveInt } = require('../utils/parseQuery');
const logger = require('../utils/logger');

function toPlainProduct(productInstance) {
  const plain = productInstance && typeof productInstance.toJSON === 'function'
    ? productInstance.toJSON()
    : productInstance;

  return {
    ...plain,
    id: Number(plain.id),
    price: Number(plain.price),
    rating: Number(plain.rating),
    inStock: Boolean(plain.inStock)
  };
}

function buildIndexWarning(action) {
  return `Product ${action} in MySQL, but OpenSearch indexing failed. Run POST /api/search/reindex to repair index consistency.`;
}

async function createProduct(payload) {
  // Reliability rule: MySQL write is always done first.
  const created = await Product.create(payload);
  const product = toPlainProduct(created);

  let warning = null;

  try {
    await indexProduct(product);
  } catch (error) {
    warning = buildIndexWarning('created');
    logger.error('OpenSearch index failed after create', error);
  }

  return { product, warning };
}

async function updateProduct(productId, payload) {
  const existing = await Product.findByPk(productId);

  if (!existing) {
    return null;
  }

  await existing.update(payload);
  const product = toPlainProduct(existing);

  let warning = null;

  try {
    await updateProductIndex(product);
  } catch (error) {
    warning = buildIndexWarning('updated');
    logger.error('OpenSearch update failed after MySQL update', error);
  }

  return { product, warning };
}

async function deleteProduct(productId) {
  const existing = await Product.findByPk(productId);

  if (!existing) {
    return null;
  }

  await existing.destroy();

  let warning = null;

  try {
    await deleteProductFromIndex(productId);
  } catch (error) {
    warning = buildIndexWarning('deleted');
    logger.error('OpenSearch delete failed after MySQL delete', error);
  }

  return { warning };
}

async function getProductById(productId) {
  const product = await Product.findByPk(productId);

  if (!product) {
    return null;
  }

  return toPlainProduct(product);
}

async function listProducts(query) {
  const page = parsePositiveInt(query.page, 1);
  const limit = Math.min(parsePositiveInt(query.limit, 10), 100);
  const offset = (page - 1) * limit;

  const { rows, count } = await Product.findAndCountAll({
    offset,
    limit,
    order: [['createdAt', 'DESC']]
  });

  return {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
    items: rows.map(toPlainProduct)
  };
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
- Responsibility: Implements product CRUD business flow and enforces MySQL-first reliability rule.
- Key syntax: DB calls are awaited first; OpenSearch errors are caught and converted into `warning`.
- Common mistakes: Throwing OpenSearch errors after DB success can accidentally hide successful writes.
*/
