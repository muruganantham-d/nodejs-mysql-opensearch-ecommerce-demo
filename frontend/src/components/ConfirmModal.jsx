/* HEADER: Lightweight confirmation modal used before deleting a product in admin UI. */
function ConfirmModal({
  isOpen,
  product,
  isDeleting = false,
  onCancel,
  onConfirm
}) {
  if (!isOpen || !product) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
        <h3 id="delete-modal-title">Confirm Delete</h3>
        <p>
          Delete <strong>{product.name}</strong> (ID: {product.id})?
        </p>
        <p>This cannot be undone.</p>

        <div className="button-row">
          <button type="button" className="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <button type="button" className="ghost" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

/*
BOTTOM EXPLANATION
- Responsibility: Prevents accidental deletes by requiring explicit confirmation from the user.
- Key syntax: Returning `null` in React means the component renders nothing when closed.
- Common mistakes: Deleting immediately from table button without confirmation leads to accidental data loss.
*/
