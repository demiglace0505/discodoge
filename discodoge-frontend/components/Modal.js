import React, { useState, useEffect } from "react";
import reactDom from "react-dom";
import { FaTimes } from "react-icons/fa";

import styles from "@/styles/Modal.module.css";

function Modal({ show, onClose, children, title }) {
  const handleClose = (e) => {
    e.preventDefault();
    onClose();
  };

  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <a href="#" onClick={handleClose}>
            <FaTimes />
          </a>
        </div>

        {!!title && <h3>{title}</h3>}

        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );

  // another workaround, using reactdom createPortal
  //https://devrecipes.net/modal-component-with-next-js/

  // const [isBrowser, setIsBrowser] = useState(false);
  // useEffect(() => setIsBrowser(true));

  // const modalContent = show ? (
  //   <div className={styles.overlay}>
  //     <div className={styles.modal}>
  //       <div className={styles.header}>
  //         <a href="#" onClick={handleClose}>
  //           <FaTimes />
  //         </a>
  //       </div>
  //       {title && <div>{title}</div>}
  //       <div className={styles.body}>{children}</div>
  //     </div>
  //   </div>
  // ) : null;

  // if (isBrowser) {
  //   return reactDom.createPortal(
  //     modalContent,
  //     document.getElementById("modal-root")
  //   );
  // } else {
  //   return null;
  // }
}

export default Modal;
