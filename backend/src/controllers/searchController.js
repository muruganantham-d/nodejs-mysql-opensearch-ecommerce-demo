// HEADER: Controller handlers for search and reindex endpoints.
const searchService = require('../services/searchService');
const { bulkReindexAllFromMySQL } = require('../services/opensearchService');

async function searchProducts(req, res, next) {
  try {
    const result = await searchService.searchProducts(req.query);

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return next(error);
  }
}

async function reindexProducts(req, res, next) {
  try {
    const result = await bulkReindexAllFromMySQL();
    const hasSyncMismatch = result.failed > 0 || result.errors || result.opensearchCount < result.mysqlCount;

    if (hasSyncMismatch) {
      return res.status(500).json({
        success: false,
        message: 'Reindex finished with sync mismatch. Check logs and rerun reindex.',
        ...result
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reindex completed',
      ...result
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  searchProducts,
  reindexProducts
};

/*
BOTTOM EXPLANATION
- Responsibility: Exposes OpenSearch-focused endpoints for searching and repairing the index.
- Key syntax: `...result` spreads service fields directly into API response.
- Common mistakes: Returning raw OpenSearch SDK response leaks unnecessary/internal structure.
*/
