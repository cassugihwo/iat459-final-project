import { useEffect, useState } from "react";
import "./UI_Toast.css";

function UI_Toast({ message, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`toast${visible ? " toast-visible" : ""}`}>
      <span className="toast-message">{message}</span>
      <button
        className="toast-close"
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

export default UI_Toast;
