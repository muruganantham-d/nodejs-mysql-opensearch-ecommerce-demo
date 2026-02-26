// HEADER: OpenSearch index management and indexing helpers for the product catalog.
const opensearchClient = require('../config/opensearch');
const logger = require('../utils/logger');

const INDEX_NAME = 'products_v1';

const INDEX_DEFINITION = {
  mappings: {
    properties: {
      // `name` is text for full-text search, plus `name.keyword` for exact match/sort use cases.
      name: {
        type: 'text',
        fields: {
          keyword: {
            type: 'keyword'
          }
        }
      },
      description: { type: 'text' },
      brand: { type: 'keyword' },
      category: { type: 'keyword' },
      price: { type: 'float' },
      rating: { type: 'float' },
      inStock: { type: 'boolean' },
      createdAt: { type: 'date' }
    }
  }
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractBody(response) {
  return response && Object.prototype.hasOwnProperty.call(response, 'body') ? response.body : response;
}

function isIndexExisting(rawExistsResponse) {
  if (typeof rawExistsResponse === 'boolean') {
    return rawExistsResponse;
  }

  if (rawExistsResponse && typeof rawExistsResponse.exists === 'boolean') {
    return rawExistsResponse.exists;
  }

  return Boolean(rawExistsResponse);
}

function toSearchDocument(product) {
  const plain = product && typeof product.toJSON === 'function' ? product.toJSON() : product;

  return {
    id: Number(plain.id),
    name: plain.name,
    description: plain.description || '',
    brand: plain.brand,
    category: plain.category,
    price: Number(plain.price),
    rating: Number(plain.rating || 0),
    inStock: Boolean(plain.inStock),
    createdAt: plain.createdAt
  };
}

async function waitForOpenSearch(options = {}) {
  const maxAttempts = Number(options.maxAttempts) || 15;
  const delayMs = Number(options.delayMs) || 2000;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await opensearchClient.ping();
      return { connected: true, attempts: attempt };
    } catch (error) {
      lastError = error;
      logger.warn(`OpenSearch ping failed (${attempt}/${maxAttempts}): ${error.message}`);

      if (attempt < maxAttempts) {
        await delay(delayMs);
      }
    }
  }

  const wrappedError = new Error(
    `OpenSearch connection failed after ${maxAttempts} attempts: ${lastError ? lastError.message : 'unknown error'}`
  );
  wrappedError.cause = lastError;
  throw wrappedError;
}

async function ensureIndex() {
  const existsResponse = await opensearchClient.indices.exists({ index: INDEX_NAME });
  const exists = isIndexExisting(extractBody(existsResponse));

  if (!exists) {
    await opensearchClient.indices.create({
      index: INDEX_NAME,
      body: INDEX_DEFINITION
    });

    logger.info(`Created OpenSearch index: ${INDEX_NAME}`);
  }
}

async function indexProduct(product) {
  // Ensure index exists in case OpenSearch became available after backend boot.
  await ensureIndex();

  const document = toSearchDocument(product);

  await opensearchClient.index({
    index: INDEX_NAME,
    id: String(document.id),
    body: document,
    refresh: 'wait_for'
  });
}

async function updateProductIndex(product) {
  // Full replace is enough here because backend sends current source-of-truth fields.
  await indexProduct(product);
}

async function deleteProductFromIndex(productId) {
  try {
    await opensearchClient.delete({
      index: INDEX_NAME,
      id: String(productId),
      refresh: 'wait_for'
    });
  } catch (error) {
    const statusCode = error && error.meta ? error.meta.statusCode : null;

    if (statusCode === 404) {
      return;
    }

    throw error;
  }
}

async function bulkReindexAllFromMySQL() {
  const { Product } = require('../db');

  await ensureIndex();

  const products = await Product.findAll({
    order: [['id', 'ASC']]
  });

  // Full reindex should mirror MySQL exactly, so clear existing docs first.
  await opensearchClient.deleteByQuery({
    index: INDEX_NAME,
    body: { query: { match_all: {} } },
    conflicts: 'proceed',
    refresh: true
  });

  if (products.length === 0) {
    return { indexed: 0, failed: 0, errors: false, mysqlCount: 0, opensearchCount: 0 };
  }

  const bulkPayload = [];

  for (const product of products) {
    const document = toSearchDocument(product);

    bulkPayload.push({
      index: {
        _index: INDEX_NAME,
        _id: String(document.id)
      }
    });

    bulkPayload.push(document);
  }

  const bulkResponse = extractBody(
    await opensearchClient.bulk({
      body: bulkPayload,
      refresh: 'wait_for'
    })
  );

  let failed = 0;

  if (bulkResponse.errors && Array.isArray(bulkResponse.items)) {
    failed = bulkResponse.items.filter((item) => item.index && item.index.error).length;
  }

  const countResponse = extractBody(
    await opensearchClient.count({
      index: INDEX_NAME
    })
  );

  return {
    indexed: products.length - failed,
    failed,
    errors: Boolean(bulkResponse.errors),
    mysqlCount: products.length,
    opensearchCount: Number(countResponse.count || 0)
  };
}

module.exports = {
  INDEX_NAME,
  waitForOpenSearch,
  ensureIndex,
  indexProduct,
  updateProductIndex,
  deleteProductFromIndex,
  bulkReindexAllFromMySQL
};

/*
BOTTOM EXPLANATION
- Responsibility: Creates the index mapping and provides CRUD/bulk sync helpers for product documents.
- Key syntax: `waitForOpenSearch` retries `ping`, then `indices.exists/create`, `index`, `delete`, and `bulk` handle index lifecycle/data sync.
- Common mistakes: Using text fields for exact filters (should use keyword), and assuming OpenSearch is ready immediately after container start.
*/
