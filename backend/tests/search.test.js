// HEADER: Tests search endpoint response shape using mocked OpenSearch search responses.
const request = require('supertest');

jest.mock('../src/config/opensearch', () => ({
  search: jest.fn(),
  ping: jest.fn()
}));

const app = require('../src/app');
const opensearchClient = require('../src/config/opensearch');

describe('GET /api/search/products', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns hits, highlights, and facets with expected shape', async () => {
    opensearchClient.search.mockResolvedValue({
      body: {
        hits: {
          total: { value: 1 },
          hits: [
            {
              _id: '1',
              _score: 2.31,
              _source: {
                id: 1,
                name: 'Runner Pro Shoes',
                brand: 'Nike',
                category: 'Shoes',
                description: 'Lightweight running shoes',
                price: 129.99,
                rating: 4.6,
                inStock: true,
                createdAt: '2026-02-26T00:00:00.000Z'
              },
              highlight: {
                name: ['<mark>Runner</mark> Pro Shoes']
              }
            }
          ]
        },
        aggregations: {
          brands: {
            buckets: [{ key: 'Nike', doc_count: 1 }]
          },
          categories: {
            buckets: [{ key: 'Shoes', doc_count: 1 }]
          },
          price_ranges: {
            buckets: [{ key: '100-500', doc_count: 1 }]
          }
        }
      }
    });

    const response = await request(app).get('/api/search/products').query({
      q: 'runer',
      brand: 'Nike',
      sort: 'relevance',
      page: 1,
      limit: 10
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toEqual(
      expect.objectContaining({
        hits: expect.any(Array),
        facets: expect.objectContaining({
          brands: expect.any(Array),
          categories: expect.any(Array),
          price_ranges: expect.any(Array)
        })
      })
    );
    expect(response.body.hits[0]).toEqual(
      expect.objectContaining({
        id: 1,
        name: 'Runner Pro Shoes',
        highlight: expect.any(Object)
      })
    );
  });

  test('builds bool.must and bool.filter query parts correctly', async () => {
    opensearchClient.search.mockResolvedValue({
      body: {
        hits: { total: { value: 0 }, hits: [] },
        aggregations: { brands: { buckets: [] }, categories: { buckets: [] }, price_ranges: { buckets: [] } }
      }
    });

    await request(app).get('/api/search/products').query({
      q: 'jacket',
      brand: 'Puma',
      minPrice: 10,
      maxPrice: 200,
      inStock: true,
      sort: 'price_asc'
    });

    const searchCallArg = opensearchClient.search.mock.calls[0][0];

    expect(searchCallArg.body.query.bool.must[0].multi_match.fields).toEqual(['name^3', 'description']);
    expect(searchCallArg.body.query.bool.must[0].multi_match.fuzziness).toBe('AUTO');
    expect(searchCallArg.body.query.bool.filter).toEqual(
      expect.arrayContaining([
        { term: { brand: 'Puma' } },
        { term: { inStock: true } },
        { range: { price: { gte: 10, lte: 200 } } }
      ])
    );
    expect(searchCallArg.body.sort).toEqual([{ price: { order: 'asc' } }]);
  });
});

/*
BOTTOM EXPLANATION
- Responsibility: Confirms search API output contract and verifies key OpenSearch query DSL parts.
- Key syntax: `mock.calls[0][0]` inspects first SDK invocation payload for assertions.
- Common mistakes: Testing only status code misses query construction regressions.
*/
