import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faTags, 
  faSearch, 
  faTimesCircle, 
  faTh, 
  faList, 
  faSort 
} from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import TagsDropdown from '../tags/TagsDropdown';
import SortDropdown from '../sorting/SortDropdown';
import '../../styles/Header.css';

const Header = () => {
  const { state, dispatch } = useMovies();
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const [sortDropdownPosition, setSortDropdownPosition] = useState(null);
  const tagsButtonRef = useRef(null);
  const sortButtonRef = useRef(null);
  
  const handleAddClick = () => {
    dispatch({ type: 'OPEN_MODAL', payload: { type: 'add' } });
  };
  
  const handleTagsClick = () => {
    // Закрываем другие дропдауны если они открыты
    if (sortDropdownOpen) {
      setSortDropdownOpen(false);
    }
    
    if (tagsButtonRef.current) {
      const buttonRect = tagsButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom + window.scrollY,
        left: buttonRect.left + window.scrollX,
      });
    }
    setTagsDropdownOpen(prevState => !prevState);
  };
  
  const handleSortClick = () => {
    // Закрываем другие дропдауны если они открыты
    if (tagsDropdownOpen) {
      setTagsDropdownOpen(false);
    }
    
    if (sortButtonRef.current) {
      const buttonRect = sortButtonRef.current.getBoundingClientRect();
      setSortDropdownPosition({
        top: buttonRect.bottom + window.scrollY,
        left: buttonRect.left + window.scrollX,
      });
    }
    setSortDropdownOpen(prevState => !prevState);
  };
  
  const closeTagsDropdown = () => {
    setTagsDropdownOpen(false);
  };
  
  const closeSortDropdown = () => {
    setSortDropdownOpen(false);
  };

  // Функции для поиска
  const handleSearchChange = (e) => {
    dispatch({ type: 'SET_SEARCH', payload: e.target.value });
  };
  
  const clearSearch = () => {
    dispatch({ type: 'SET_SEARCH', payload: '' });
  };

  // Функции для управления видом
  const handleViewModeChange = (viewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: viewMode });
  };
  
  // Получение текущей метки сортировки для отображения в title
  const getSortLabel = () => {
    // Создаем объект с метками направления сортировки
    const directionLabels = {
      asc: 'по возрастанию',
      desc: 'по убыванию'
    };
    
    // Создаем объект с метками полей сортировки
    const fieldLabels = {
      title: 'названию',
      dateAdded: 'дате добавления',
      rating: 'рейтингу',
      dateWatched: 'дате просмотра'
    };
    
    const fieldLabel = fieldLabels[state.sortBy.field] || state.sortBy.field;
    const directionLabel = directionLabels[state.sortBy.direction] || state.sortBy.direction;
    
    return `Сортировка по ${fieldLabel} (${directionLabel})`;
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
              <button 
                className="header-clear-search" 
                onClick={clearSearch}
              >
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            ) : (
              <FontAwesomeIcon 
                icon={faSearch} 
                className="header-search-icon" 
              />
            )}
          </div>
          
          <div className="header-buttons">
            <button 
              className="btn btn-primary" 
              onClick={handleAddClick}
              title="Добавить новый фильм в коллекцию"
            >
              <FontAwesomeIcon icon={faPlus} /> Добавить
            </button>
            <button 
              ref={tagsButtonRef}
              className={`btn btn-secondary ${tagsDropdownOpen ? 'active' : ''}`} 
              onClick={handleTagsClick}
              title="Управление тегами"
            >
              <FontAwesomeIcon icon={faTags} /> Теги
            </button>
            
            {/* Разделитель между основными кнопками и контролами отображения */}
            <div className="view-controls-divider"></div>
            
            {/* Кнопки вида и сортировки в контейнере */}
            <div className="view-controls-group">
              <button 
                ref={sortButtonRef}
                className={`btn-view-control ${sortDropdownOpen ? 'active' : ''}`} 
                onClick={handleSortClick}
                title={getSortLabel()}
              >
                <FontAwesomeIcon icon={faSort} />
              </button>
              <button 
                className={`btn-view-control ${state.viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('cards')}
                title="Режим просмотра: карточки"
              >
                <FontAwesomeIcon icon={faTh} />
              </button>
              <button 
                className={`btn-view-control ${state.viewMode === 'list' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('list')}
                title="Режим просмотра: список"
              >
                <FontAwesomeIcon icon={faList} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <TagsDropdown 
        isOpen={tagsDropdownOpen} 
        onClose={closeTagsDropdown} 
        position={dropdownPosition}
        title="Выпадающий список тегов"
      />
      
      <SortDropdown
        isOpen={sortDropdownOpen}
        onClose={closeSortDropdown}
        position={sortDropdownPosition}
      />
    </header>
  );
};

export default Header;