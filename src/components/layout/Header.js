import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTags } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import '../../styles/Header.css';

const Header = () => {
  const { dispatch } = useMovies();
  
  const handleAddClick = () => {
    dispatch({ type: 'OPEN_MODAL', payload: { type: 'add' } });
  };
  
  const handleTagsClick = () => {
    // Будет реализовано позже
    alert('Управление тегами будет реализовано в следующих версиях');
  };
  
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Каталогизатор фильмов</h1>
        
        <div className="header-buttons">
          <button className="btn btn-primary" onClick={handleAddClick}>
            <FontAwesomeIcon icon={faPlus} /> Добавить
          </button>
          <button className="btn btn-secondary" onClick={handleTagsClick}>
            <FontAwesomeIcon icon={faTags} /> Теги
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;