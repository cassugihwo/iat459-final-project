import { useEffect } from "react";
import "./UI_Toast.css";

function UI_Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="toast-overlay">
      <div className="toast-box">
        <span className="toast-icon">!</span>
        <p className="toast-message">{message}</p>
        <button className="toast-close" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}

export default UI_Toast;
