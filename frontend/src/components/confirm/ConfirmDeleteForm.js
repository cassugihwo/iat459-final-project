import "./ConfirmDeleteForm.css";

function ConfirmDeleteForm({ title, message, onConfirm, onCancel }) {
  return (
    <div className="cdm-overlay" onClick={onCancel}>
      <div className="cdm-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="cdm-title">{title}</h3>
        <p className="cdm-msg">{message}</p>
        <div className="cdm-actions">
          <button className="cdm-cancel" onClick={onCancel}>Cancel</button>
          <button className="cdm-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteForm;
