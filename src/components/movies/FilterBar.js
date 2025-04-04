import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTh, faList, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import '../../styles/FilterBar.css';

const FilterBar = () => {
  const { state, dispatch, getPopularTags } = useMovies();
  
  // Получаем популярные теги (максимум 5)
  const popularTags = useMemo(() => getPopularTags(5), [getPopularTags]);
  
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
  
  // Обработчик клика по тегу для фильтрации
  const handleTagClick = (tagName) => {
    dispatch({ type: 'SET_SEARCH', payload: tagName });
  };
  
  // Очистить поиск (и фильтрацию по тегам)
  const clearSearch = () => {
    dispatch({ type: 'SET_SEARCH', payload: '' });
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
      
      {/* Добавляем популярные теги */}
      {popularTags.length > 0 && (
        <div className="popular-tags">
          <div className="popular-tags-label">Популярные теги:</div>
          <div className="tags-buttons">
            {popularTags.map(tag => (
              <button 
                key={tag.id}
                className={`tag-btn ${state.search === tag.name ? 'active' : ''}`}
                onClick={() => handleTagClick(tag.name)}
              >
                {tag.name} <span className="tag-count">({tag.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="search-sort-view">
        <div className="search-container">
          <input
            type="text"
            placeholder="Поиск по названию или тегам..."
            value={state.search}
            onChange={handleSearchChange}
            className="search-input"
          />
          {state.search ? (
            <button className="clear-search" onClick={clearSearch}>
              <FontAwesomeIcon icon={faTimesCircle} />
            </button>
          ) : (
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
          )}
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