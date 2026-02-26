/* HEADER: Admin products page with list, create/edit form, delete modal, and reindex control. */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  reindexProductsFromMySQL,
  updateProduct
} from '../api';
import ProductForm from '../components/ProductForm';
import ConfirmModal from '../components/ConfirmModal';

function getApiErrorMessage(error) {
  const responseData = error?.response?.data;

  if (responseData?.message) {
    return responseData.message;
  }

  return 'Request failed. Please verify backend is running.';
}

function formatPrice(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? '-' : `$${parsed.toFixed(2)}`;
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString();
}

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [loadingList, setLoadingList] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);
  const [reindexing, setReindexing] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [reindexSummary, setReindexSummary] = useState('');

  const loadProducts = useCallback(async (targetPage, targetLimit) => {
    setLoadingList(true);

    try {
      const response = await fetchProducts({
        page: targetPage,
        limit: targetLimit
      });

      setProducts(response.items || []);
      setTotalPages(Math.max(1, response.totalPages || 1));
      setTotalItems(response.total || 0);

      return response;
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      return null;
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(page, limit);
  }, [page, limit, loadProducts]);

  function clearFeedback() {
    setErrorMessage('');
    setSuccessMessage('');
    setWarningMessage('');
  }

  async function refreshList(preferredPage = page) {
    const response = await loadProducts(preferredPage, limit);

    if (response && preferredPage > 1 && (response.items || []).length === 0) {
      setPage(preferredPage - 1);
    }
  }

  async function handleCreateProduct(payload) {
    clearFeedback();
    setSubmittingForm(true);

    try {
      const response = await createProduct(payload);

      setSuccessMessage('Product created in MySQL successfully.');
      setWarningMessage(response.warning || '');

      if (page !== 1) {
        setPage(1);
      } else {
        await refreshList(1);
      }

      return true;
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      return false;
    } finally {
      setSubmittingForm(false);
    }
  }

  async function handleUpdateProduct(payload) {
    if (!editingProduct) {
      return false;
    }

    clearFeedback();
    setSubmittingForm(true);

    try {
      const response = await updateProduct(editingProduct.id, payload);

      setSuccessMessage(`Product #${editingProduct.id} updated in MySQL successfully.`);
      setWarningMessage(response.warning || '');
      setEditingProduct(null);
      await refreshList(page);

      return true;
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      return false;
    } finally {
      setSubmittingForm(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) {
      return;
    }

    clearFeedback();
    setDeletingItem(true);

    try {
      const response = await deleteProduct(deleteTarget.id);

      setSuccessMessage(response.message || `Product #${deleteTarget.id} deleted successfully.`);
      setWarningMessage(response.warning || '');
      setDeleteTarget(null);
      await refreshList(page);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setDeletingItem(false);
    }
  }

  async function handleReindex() {
    clearFeedback();
    setReindexSummary('');
    setReindexing(true);

    try {
      const response = await reindexProductsFromMySQL();

      setReindexSummary(
        `Reindex completed. MySQL count: ${response.mysqlCount ?? 0}, OpenSearch count: ${response.opensearchCount ?? 0}, Indexed: ${response.indexed ?? 0}, Failed: ${response.failed ?? 0}.`
      );

      if ((response.failed || 0) > 0 || (response.opensearchCount ?? 0) < (response.mysqlCount ?? 0)) {
        setWarningMessage('Reindex completed with mismatch. Check counts and backend logs.');
      } else {
        setSuccessMessage('Reindex from MySQL finished successfully.');
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setReindexing(false);
    }
  }

  return (
    <div className="page-shell admin-page-shell">
      <header className="hero">
        <h1>Admin Products</h1>
        <p>Create, edit, delete products in MySQL, then keep OpenSearch index aligned.</p>
        <div className="admin-link-row">
          <Link to="/" className="inline-link">Go to Product Search</Link>
        </div>
      </header>

      <main className="admin-layout">
        <ProductForm
          mode={editingProduct ? 'edit' : 'create'}
          initialValues={editingProduct}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={() => setEditingProduct(null)}
          isSubmitting={submittingForm}
          title={editingProduct ? `Edit Product #${editingProduct.id}` : 'Create Product'}
          submitLabel={editingProduct ? 'Save Changes' : 'Create Product'}
        />

        <section className="panel admin-table-panel">
          <div className="admin-toolbar">
            <h2>Products ({totalItems})</h2>
            <div className="admin-toolbar-actions">
              <button type="button" className="ghost" onClick={() => setEditingProduct(null)} disabled={submittingForm}>
                New Product Form
              </button>
              <button type="button" onClick={handleReindex} disabled={reindexing}>
                {reindexing ? 'Reindexing...' : 'Reindex from MySQL'}
              </button>
            </div>
          </div>

          <div className="admin-limit-row">
            <label>
              Rows per page
              <select
                value={limit}
                onChange={(event) => {
                  setLimit(Number(event.target.value));
                  setPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>
          </div>

          {errorMessage && <p className="error-box">{errorMessage}</p>}
          {warningMessage && <p className="warning-box">Warning: {warningMessage}</p>}
          {successMessage && <p className="success-box">{successMessage}</p>}
          {reindexSummary && <p className="hint">{reindexSummary}</p>}

          {loadingList ? (
            <p className="hint">Loading products...</p>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Rating</th>
                    <th>In Stock</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={9}>No products found.</td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{product.name}</td>
                        <td>{product.brand}</td>
                        <td>{product.category}</td>
                        <td>{formatPrice(product.price)}</td>
                        <td>{product.rating}</td>
                        <td>{product.inStock ? 'Yes' : 'No'}</td>
                        <td>{formatDate(product.createdAt)}</td>
                        <td>
                          <div className="admin-action-buttons">
                            <button type="button" className="ghost" onClick={() => setEditingProduct(product)}>
                              Edit
                            </button>
                            <button type="button" className="danger" onClick={() => setDeleteTarget(product)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="pagination-row">
            <button
              type="button"
              className="ghost"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || loadingList}
            >
              Previous
            </button>
            <span>Page {page} / {totalPages}</span>
            <button
              type="button"
              className="ghost"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || loadingList}
            >
              Next
            </button>
          </div>
        </section>
      </main>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        product={deleteTarget}
        isDeleting={deletingItem}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  );
}

export default AdminProductsPage;

/*
BOTTOM EXPLANATION
- Responsibility: Provides full admin CRUD operations and explicit reindex action while consuming existing backend APIs.
- Key syntax: State tracks table data, form mode, and async statuses; handlers call API functions and refresh list.
- Common mistakes: Not displaying backend `warning` fields can hide OpenSearch indexing issues after successful MySQL writes.
*/
