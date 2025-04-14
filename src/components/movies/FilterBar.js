import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTh, faList, faSort } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import '../../styles/FilterBar.css';

const FilterBar = () => {
  const { state, dispatch, getPopularTags } = useMovies();
  
  // Получаем популярные теги (максимум 5)
  const popularTags = useMemo(() => getPopularTags(5), [getPopularTags]);
  
  const handleFilterChange = (filter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
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
  
  return (
    <div className="filter-bar">
      <div className="filter-main-row">
        <div className="filter-left-group">
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
          
          {/* Популярные теги в той же строке */}
          {popularTags.length > 0 && (
            <div className="popular-tags">
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