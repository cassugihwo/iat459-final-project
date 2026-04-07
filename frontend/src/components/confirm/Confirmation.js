import "./Confirmation.css";

function Confirmation({ title, message, onConfirm, onCancel, confirmLabel = "Delete" }) {
  return (
    <div className="cdm-overlay" onClick={onCancel}>
      <div className="cdm-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="cdm-title">{title}</h3>
        <p className="cdm-msg">{message}</p>
        <div className="cdm-actions">
          <button className="cdm-cancel" onClick={onCancel}>Cancel</button>
          <button className="cdm-delete" onClick={() => { onConfirm(); onCancel(); }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default Confirmation;
