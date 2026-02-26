// HEADER: Search service that builds OpenSearch bool queries, sorting, highlighting, and facets.
const opensearchClient = require('../config/opensearch');
const { INDEX_NAME } = require('./opensearchService');
const {
  parsePositiveInt,
  parseOptionalNumber,
  parseOptionalBoolean
} = require('../utils/parseQuery');

function extractBody(response) {
  return response && Object.prototype.hasOwnProperty.call(response, 'body') ? response.body : response;
}

function buildFilters(queryParams) {
  const filters = [];

  // `term` is for exact matching on keyword/boolean fields.
  if (queryParams.brand) {
    filters.push({ term: { brand: queryParams.brand } });
  }

  if (queryParams.category) {
    filters.push({ term: { category: queryParams.category } });
  }

  const minPrice = parseOptionalNumber(queryParams.minPrice);
  const maxPrice = parseOptionalNumber(queryParams.maxPrice);

  if (minPrice !== undefined || maxPrice !== undefined) {
    const rangeFilter = {};

    if (minPrice !== undefined) {
      rangeFilter.gte = minPrice;
    }

    if (maxPrice !== undefined) {
      rangeFilter.lte = maxPrice;
    }

    filters.push({ range: { price: rangeFilter } });
  }

  const inStock = parseOptionalBoolean(queryParams.inStock);

  if (typeof inStock === 'boolean') {
    filters.push({ term: { inStock } });
  }

  return filters;
}

function buildSortClause(sort) {
  switch (sort) {
    case 'price_asc':
      return [{ price: { order: 'asc' } }];
    case 'price_desc':
      return [{ price: { order: 'desc' } }];
    case 'newest':
      return [{ createdAt: { order: 'desc' } }];
    default:
      return null; // relevance keeps default `_score` ordering.
  }
}

function mapBuckets(aggregation) {
  if (!aggregation || !Array.isArray(aggregation.buckets)) {
    return [];
  }

  return aggregation.buckets.map((bucket) => ({
    key: bucket.key,
    count: bucket.doc_count
  }));
}

async function searchProducts(queryParams) {
  const q = (queryParams.q || '').trim();
  const page = parsePositiveInt(queryParams.page, 1);
  const limit = Math.min(parsePositiveInt(queryParams.limit, 10), 50);
  const from = (page - 1) * limit;
  const sort = queryParams.sort || 'relevance';

  const filters = buildFilters(queryParams);

  // `must` contributes to score (relevance), while `filter` narrows results without scoring.
  const boolQuery = {
    filter: filters
  };

  // `multi_match` is used on text fields and supports fuzziness for typo tolerance.
  if (q) {
    boolQuery.must = [
      {
        multi_match: {
          query: q,
          fields: ['name^3', 'description'],
          fuzziness: 'AUTO'
        }
      }
    ];
  }

  const searchBody = {
    from,
    size: limit,
    query: {
      bool: boolQuery
    },
    highlight: {
      pre_tags: ['<mark>'],
      post_tags: ['</mark>'],
      fields: {
        name: {},
        description: {}
      }
    },
    aggs: {
      brands: {
        terms: { field: 'brand' }
      },
      categories: {
        terms: { field: 'category' }
      },
      price_ranges: {
        range: {
          field: 'price',
          ranges: [
            { key: '0-100', to: 100 },
            { key: '100-500', from: 100, to: 500 },
            { key: '500-1000', from: 500, to: 1000 },
            { key: '1000+', from: 1000 }
          ]
        }
      }
    }
  };

  const sortClause = buildSortClause(sort);

  if (sortClause) {
    searchBody.sort = sortClause;
  }

  const searchResponse = extractBody(
    await opensearchClient.search({
      index: INDEX_NAME,
      body: searchBody
    })
  );

  const hitsSection = searchResponse.hits || { total: { value: 0 }, hits: [] };
  const rawTotal = hitsSection.total;
  const total = typeof rawTotal === 'number' ? rawTotal : rawTotal && rawTotal.value ? rawTotal.value : 0;

  const hits = (hitsSection.hits || []).map((hit) => ({
    id: Number(hit._id),
    score: hit._score,
    ...hit._source,
    highlight: hit.highlight || null
  }));

  return {
    page,
    limit,
    total,
    hits,
    facets: {
      brands: mapBuckets(searchResponse.aggregations && searchResponse.aggregations.brands),
      categories: mapBuckets(searchResponse.aggregations && searchResponse.aggregations.categories),
      price_ranges: mapBuckets(searchResponse.aggregations && searchResponse.aggregations.price_ranges)
    }
  };
}

module.exports = {
  searchProducts
};

/*
BOTTOM EXPLANATION
- Responsibility: Builds OpenSearch DSL query and transforms raw response into API-friendly shape.
- Key syntax: `bool.must` is relevance search, `bool.filter` is exact/range filtering, and `aggs` computes facets.
- Common mistakes: Using `term` on analyzed text fields or expecting filter clauses to change relevance score.
*/
