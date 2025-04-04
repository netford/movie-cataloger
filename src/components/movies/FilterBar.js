import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTh, faList, faSort } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import '../../styles/FilterBar.css';

const FilterBar = () => {
  const { state, dispatch } = useMovies();
  
  const handleFilterChange = (filter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };
  
  const handleSearchChange = (e) => {
    dispatch({ type: 'SET_SEARCH', payload: e.target.value });
  };
  
  const handleViewModeChange = (viewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: viewMode });
  };
  
  const handleSortClick = () => {
    // Простое переключение направления сортировки
    const newDirection = state.sortBy.direction === 'asc' ? 'desc' : 'asc';
    dispatch({ 
      type: 'SET_SORT', 
      payload: { 
        ...state.sortBy, 
        direction: newDirection 
      } 
    });
  };
  
  return (
    <div className="filter-bar">
      <div className="categories">
        <button 
          className={`category-btn ${state.filter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          Все фильмы
        </button>
        <button 
          className={`category-btn ${state.filter === 'watched' ? 'active' : ''}`}
          onClick={() => handleFilterChange('watched')}
        >
          Просмотрено
        </button>
        <button 
          className={`category-btn ${state.filter === 'toWatch' ? 'active' : ''}`}
          onClick={() => handleFilterChange('toWatch')}
        >
          Запланировано
        </button>
        <button 
          className={`category-btn ${state.filter === 'watching' ? 'active' : ''}`}
          onClick={() => handleFilterChange('watching')}
        >
          Смотрим
        </button>
        <button 
          className={`category-btn ${state.filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => handleFilterChange('cancelled')}
        >
          Отменено
        </button>
      </div>
      
      <div className="search-sort-view">
        <div className="search-container">
          <input
            type="text"
            placeholder="Поиск по названию или тегам..."
            value={state.search}
            onChange={handleSearchChange}
            className="search-input"
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
        </div>
        
        <div className="view-sort-controls">
          <button className="sort-btn" onClick={handleSortClick}>
            <FontAwesomeIcon icon={faSort} />
          </button>
          <button 
            className={`view-btn ${state.viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('cards')}
          >
            <FontAwesomeIcon icon={faTh} />
          </button>
          <button 
            className={`view-btn ${state.viewMode === 'list' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('list')}
          >
            <FontAwesomeIcon icon={faList} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;