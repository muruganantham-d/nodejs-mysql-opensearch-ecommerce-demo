/* HEADER: Main Product Search page with query controls, facets, and result list. */
import { useEffect, useMemo, useState } from 'react';
import { fetchSearchProducts } from './api';

function App() {
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('relevance');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [data, setData] = useState({
    hits: [],
    facets: { brands: [], categories: [], price_ranges: [] },
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((data.total || 0) / limit));
  }, [data.total, limit]);

  async function runSearch(targetPage = 1) {
    setLoading(true);
    setError('');

    try {
      const response = await fetchSearchProducts({
        q: q || undefined,
        brand: brand || undefined,
        category: category || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        inStock: inStockOnly ? true : undefined,
        sort,
        page: targetPage,
        limit
      });

      setData(response);
      setPage(targetPage);
    } catch (requestError) {
      const apiMessage = requestError?.response?.data?.message;
      setError(apiMessage || 'Search failed. Check backend/OpenSearch status.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    runSearch(1);
  }

  function handleReset() {
    setQ('');
    setBrand('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSort('relevance');
    setPage(1);
    setData({ hits: [], facets: { brands: [], categories: [], price_ranges: [] }, total: 0 });
    setError('');
  }

  useEffect(() => {
    // Initial fetch populates first page and facet dropdown options.
    runSearch(1);
    // Intentionally run once on first load for beginner-friendly default view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-shell">
      <header className="hero">
        <h1>Product Search</h1>
        <p>MySQL for source-of-truth. OpenSearch for search + filters + facets.</p>
      </header>

      <main className="layout-grid">
        <aside className="panel panel-left">
          <h2>Search Controls</h2>
          <form onSubmit={handleSubmit} className="search-form">
            <label>
              Search text
              <input
                type="text"
                placeholder="Try: runer shooe (typo)"
                value={q}
                onChange={(event) => setQ(event.target.value)}
              />
            </label>

            <label>
              Brand
              <select value={brand} onChange={(event) => setBrand(event.target.value)}>
                <option value="">All brands</option>
                {data.facets.brands.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.key} ({item.count})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Category
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">All categories</option>
                {data.facets.categories.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.key} ({item.count})
                  </option>
                ))}
              </select>
            </label>

            <div className="price-row">
              <label>
                Min price
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                />
              </label>
              <label>
                Max price
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                />
              </label>
            </div>

            <label className="inline-check">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) => setInStockOnly(event.target.checked)}
              />
              In stock only
            </label>

            <label>
              Sort
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </label>

            <div className="button-row">
              <button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button type="button" className="ghost" onClick={handleReset}>
                Reset
              </button>
            </div>
          </form>

          <section className="facet-panel">
            <h3>Facet Counts</h3>
            <p className="facet-title">Brands</p>
            <ul>
              {data.facets.brands.map((item) => (
                <li key={`brand-${item.key}`}>{item.key}: {item.count}</li>
              ))}
            </ul>
            <p className="facet-title">Categories</p>
            <ul>
              {data.facets.categories.map((item) => (
                <li key={`cat-${item.key}`}>{item.key}: {item.count}</li>
              ))}
            </ul>
            <p className="facet-title">Price ranges</p>
            <ul>
              {data.facets.price_ranges.map((item) => (
                <li key={`price-${item.key}`}>{item.key}: {item.count}</li>
              ))}
            </ul>
          </section>
        </aside>

        <section className="panel panel-right">
          <h2>Results ({data.total})</h2>
          {error && <p className="error-box">{error}</p>}

          {!error && data.hits.length === 0 && <p className="hint">Run a search to see products.</p>}

          <div className="result-list">
            {data.hits.map((item) => (
              <article key={item.id} className="result-card">
                <h3>{item.name}</h3>
                <p className="meta">{item.brand} | {item.category}</p>
                <p className="meta">Price: ${Number(item.price).toFixed(2)} | Rating: {item.rating} | In Stock: {item.inStock ? 'Yes' : 'No'}</p>
                <p>{item.description}</p>

                {/* OpenSearch highlight shows matched fragments with <mark> tags from backend response. */}
                {item.highlight?.name?.length > 0 && (
                  <p className="highlight" dangerouslySetInnerHTML={{ __html: `Name match: ${item.highlight.name[0]}` }} />
                )}
                {item.highlight?.description?.length > 0 && (
                  <p className="highlight" dangerouslySetInnerHTML={{ __html: `Description match: ${item.highlight.description[0]}` }} />
                )}
              </article>
            ))}
          </div>

          <div className="pagination-row">
            <button type="button" className="ghost" disabled={page <= 1 || loading} onClick={() => runSearch(page - 1)}>
              Previous
            </button>
            <span>Page {page} / {totalPages}</span>
            <button type="button" className="ghost" disabled={page >= totalPages || loading} onClick={() => runSearch(page + 1)}>
              Next
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

/*
BOTTOM EXPLANATION
- Responsibility: Renders all search UI controls, calls backend API, and displays hits/facets/highlights.
- Key syntax: React `useState` tracks filter values; form submit calls async API function with query params.
- Common mistakes: Sending empty strings as filters can create confusing backend query behavior, so undefined is used.
*/
