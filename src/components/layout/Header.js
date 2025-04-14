import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTags, faSearch, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import TagsDropdown from '../tags/TagsDropdown';
import '../../styles/Header.css';

const Header = () => {
  const { state, dispatch } = useMovies();
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const tagsButtonRef = useRef(null);
  
  const handleAddClick = () => {
    dispatch({ type: 'OPEN_MODAL', payload: { type: 'add' } });
  };
  
  const handleTagsClick = () => {
    if (tagsButtonRef.current) {
      const buttonRect = tagsButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom + window.scrollY,
        left: buttonRect.left + window.scrollX,
      });
    }
    setTagsDropdownOpen(prevState => !prevState);
  };
  
  const closeTagsDropdown = () => {
    setTagsDropdownOpen(false);
  };

  // Функции для поиска
  const handleSearchChange = (e) => {
    dispatch({ type: 'SET_SEARCH', payload: e.target.value });
  };
  
  const clearSearch = () => {
    dispatch({ type: 'SET_SEARCH', payload: '' });
  };
  
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Каталогизатор фильмов</h1>
        
        <div className="header-search-buttons">
          {/* Поле поиска */}
          <div className="header-search-container">
            <input
              type="text"
              placeholder="Поиск по названию или тегам..."
              value={state.search}
              onChange={handleSearchChange}
              className="header-search-input"
            />
            {state.search ? (
              <button className="header-clear-search" onClick={clearSearch}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            ) : (
              <FontAwesomeIcon icon={faSearch} className="header-search-icon" />
            )}
          </div>
          
          <div className="header-buttons">
            <button className="btn btn-primary" onClick={handleAddClick}>
              <FontAwesomeIcon icon={faPlus} /> Добавить
            </button>
            <button 
              ref={tagsButtonRef}
              className={`btn btn-secondary ${tagsDropdownOpen ? 'active' : ''}`} 
              onClick={handleTagsClick}
            >
              <FontAwesomeIcon icon={faTags} /> Теги
            </button>
          </div>
        </div>
      </div>
      
      <TagsDropdown 
        isOpen={tagsDropdownOpen} 
        onClose={closeTagsDropdown} 
        position={dropdownPosition}
      />
    </header>
  );
};

export default Header;