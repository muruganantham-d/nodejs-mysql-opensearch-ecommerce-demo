/* HEADER: Reusable product form used for both create and edit operations in admin UI. */
import { useEffect, useMemo, useState } from 'react';

const DEFAULT_FORM_VALUES = {
  name: '',
  brand: '',
  category: '',
  description: '',
  price: '',
  rating: '',
  inStock: true
};

function normalizeValues(initialValues) {
  if (!initialValues) {
    return DEFAULT_FORM_VALUES;
  }

  return {
    name: initialValues.name || '',
    brand: initialValues.brand || '',
    category: initialValues.category || '',
    description: initialValues.description || '',
    price: initialValues.price === undefined || initialValues.price === null ? '' : String(initialValues.price),
    rating: initialValues.rating === undefined || initialValues.rating === null ? '' : String(initialValues.rating),
    inStock: typeof initialValues.inStock === 'boolean' ? initialValues.inStock : true
  };
}

function ProductForm({
  mode = 'create',
  initialValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
  title,
  submitLabel
}) {
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);
  const [formError, setFormError] = useState('');

  const isEditMode = mode === 'edit';

  const resolvedTitle = useMemo(() => {
    return title || (isEditMode ? 'Edit Product' : 'Create Product');
  }, [isEditMode, title]);

  const resolvedSubmitLabel = useMemo(() => {
    return submitLabel || (isEditMode ? 'Update Product' : 'Create Product');
  }, [isEditMode, submitLabel]);

  useEffect(() => {
    setFormValues(normalizeValues(initialValues));
    setFormError('');
  }, [initialValues]);

  function handleFieldChange(event) {
    const { name, value, type, checked } = event.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function validateFormValues() {
    if (!formValues.name.trim()) {
      return 'Name is required.';
    }

    if (!formValues.brand.trim()) {
      return 'Brand is required.';
    }

    if (!formValues.category.trim()) {
      return 'Category is required.';
    }

    const parsedPrice = Number(formValues.price);

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      return 'Price must be a number greater than 0.';
    }

    if (formValues.rating !== '') {
      const parsedRating = Number(formValues.rating);

      if (Number.isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        return 'Rating must be between 0 and 5.';
      }
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const validationMessage = validateFormValues();

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      brand: formValues.brand.trim(),
      category: formValues.category.trim(),
      description: formValues.description.trim(),
      price: Number(formValues.price),
      rating: formValues.rating === '' ? 0 : Number(formValues.rating),
      inStock: Boolean(formValues.inStock)
    };

    const didSucceed = await onSubmit(payload);

    if (didSucceed && !isEditMode) {
      setFormValues(DEFAULT_FORM_VALUES);
    }
  }

  return (
    <section className="panel admin-form-panel">
      <h2>{resolvedTitle}</h2>

      {formError && <p className="error-box">{formError}</p>}

      <form className="search-form admin-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" value={formValues.name} onChange={handleFieldChange} placeholder="Product name" />
        </label>

        <label>
          Brand
          <input name="brand" value={formValues.brand} onChange={handleFieldChange} placeholder="Brand" />
        </label>

        <label>
          Category
          <input name="category" value={formValues.category} onChange={handleFieldChange} placeholder="Category" />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={formValues.description}
            onChange={handleFieldChange}
            rows={3}
            placeholder="Short product description"
          />
        </label>

        <div className="price-row">
          <label>
            Price
            <input name="price" type="number" step="0.01" min="0" value={formValues.price} onChange={handleFieldChange} />
          </label>

          <label>
            Rating (0-5)
            <input name="rating" type="number" step="0.1" min="0" max="5" value={formValues.rating} onChange={handleFieldChange} />
          </label>
        </div>

        <label className="inline-check">
          <input name="inStock" type="checkbox" checked={formValues.inStock} onChange={handleFieldChange} />
          In stock
        </label>

        <div className="button-row">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : resolvedSubmitLabel}
          </button>

          {isEditMode && (
            <button type="button" className="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default ProductForm;

/*
BOTTOM EXPLANATION
- Responsibility: Captures product fields and reuses one form component for create and edit actions.
- Key syntax: `mode` controls behavior (create vs edit), while `onSubmit(payload)` sends validated data to parent page.
- Common mistakes: Sending string numbers (price/rating) without conversion can fail backend validation.
*/
