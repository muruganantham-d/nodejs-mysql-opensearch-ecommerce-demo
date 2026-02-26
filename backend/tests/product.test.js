// HEADER: Tests product creation endpoint with mocked MySQL model and OpenSearch indexing service.
const request = require('supertest');

jest.mock('../src/db', () => ({
  Product: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn()
  },
  sequelize: {
    authenticate: jest.fn()
  }
}));

jest.mock('../src/services/opensearchService', () => ({
  INDEX_NAME: 'products_v1',
  ensureIndex: jest.fn(),
  indexProduct: jest.fn(),
  updateProductIndex: jest.fn(),
  deleteProductFromIndex: jest.fn(),
  bulkReindexAllFromMySQL: jest.fn()
}));

const app = require('../src/app');
const { Product } = require('../src/db');
const { indexProduct } = require('../src/services/opensearchService');

function buildSequelizeLikeProduct(overrides = {}) {
  const data = {
    id: 101,
    name: 'Test Shoe',
    brand: 'TestBrand',
    category: 'Shoes',
    description: 'Light and durable',
    price: 99.99,
    rating: 4.2,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };

  return {
    toJSON: () => data
  };
}

describe('POST /api/products', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('writes to MySQL and calls OpenSearch indexer', async () => {
    Product.create.mockResolvedValue(buildSequelizeLikeProduct());
    indexProduct.mockResolvedValue({});

    const payload = {
      name: 'Test Shoe',
      brand: 'TestBrand',
      category: 'Shoes',
      description: 'Light and durable',
      price: 99.99,
      rating: 4.2,
      inStock: true
    };

    const response = await request(app).post('/api/products').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expect.objectContaining({ name: 'Test Shoe', brand: 'TestBrand' }));
    expect(Product.create).toHaveBeenCalledWith(expect.objectContaining(payload));
    expect(indexProduct).toHaveBeenCalledTimes(1);
  });

  test('returns warning when OpenSearch indexing fails but MySQL write succeeds', async () => {
    Product.create.mockResolvedValue(buildSequelizeLikeProduct({ id: 102 }));
    indexProduct.mockRejectedValue(new Error('OpenSearch is down'));

    const payload = {
      name: 'Fallback Product',
      brand: 'SafeBrand',
      category: 'General',
      description: 'Stored in MySQL first',
      price: 49.99,
      rating: 4,
      inStock: true
    };

    const response = await request(app).post('/api/products').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.warning).toContain('Run POST /api/search/reindex');
    expect(Product.create).toHaveBeenCalledTimes(1);
  });
});

/*
BOTTOM EXPLANATION
- Responsibility: Verifies MySQL-first create flow and confirms OpenSearch indexing call behavior with mocks.
- Key syntax: `jest.mock` replaces real modules, while Supertest calls API endpoints like a real client.
- Common mistakes: Not mocking dependent modules can trigger real DB/network calls during tests.
*/
