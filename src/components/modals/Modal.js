import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import '../../styles/Modal.css';

const Modal = ({ children, title }) => {
  const { dispatch } = useMovies();
  
  // Закрытие модального окна по Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'CLOSE_MODAL' });
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    
    // Блокируем скролл на body
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      // Восстанавливаем скролл при размонтировании
      document.body.style.overflow = 'auto';
    };
  }, [dispatch]);
  
  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      dispatch({ type: 'CLOSE_MODAL' });
    }
  };
  
  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;