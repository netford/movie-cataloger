import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTh, 
  faList, 
  faSort, 
  faFilm, 
  faCheck, 
  faCalendarAlt, 
  faPlay, 
  faTimes, 
  faTag 
} from '@fortawesome/free-solid-svg-icons';
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
  
  // Стили для тегов с автоматической шириной
  const tagButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#9b59b6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '3px 10px',
    fontSize: '13px',
    cursor: 'pointer',
    opacity: 0.8,
    width: 'auto',
    minWidth: 'fit-content',
    maxWidth: 'none'
  };
  
  const tagActiveStyle = {
    ...tagButtonStyle,
    backgroundColor: '#8e44ad',
    opacity: 1,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };
  
  return (
    <div className="filter-bar">
      <div className="filter-main-row">
        <div className="filter-left-group">
          <div className="categories">
            <button 
              className={`category-btn category-all ${state.filter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              <FontAwesomeIcon icon={faFilm} className="category-icon" /> Все фильмы
            </button>
            <button 
              className={`category-btn category-watched ${state.filter === 'watched' ? 'active' : ''}`}
              onClick={() => handleFilterChange('watched')}
            >
              <FontAwesomeIcon icon={faCheck} className="category-icon" /> Просмотрено
            </button>
            <button 
              className={`category-btn category-to-watch ${state.filter === 'toWatch' ? 'active' : ''}`}
              onClick={() => handleFilterChange('toWatch')}
            >
              <FontAwesomeIcon icon={faCalendarAlt} className="category-icon" /> Запланировано
            </button>
            <button 
              className={`category-btn category-watching ${state.filter === 'watching' ? 'active' : ''}`}
              onClick={() => handleFilterChange('watching')}
            >
              <FontAwesomeIcon icon={faPlay} className="category-icon" /> Смотрим
            </button>
            <button 
              className={`category-btn category-cancelled ${state.filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => handleFilterChange('cancelled')}
            >
              <FontAwesomeIcon icon={faTimes} className="category-icon" /> Отменено
            </button>
          </div>
          
          {/* Популярные теги в той же строке */}
          {popularTags.length > 0 && (
            <div className="popular-tags">
              {popularTags.map(tag => (
                <button 
                  key={tag.id}
                  style={state.search === tag.name ? tagActiveStyle : tagButtonStyle}
                  onClick={() => handleTagClick(tag.name)}
                >
                  <FontAwesomeIcon icon={faTag} style={{ fontSize: '10px', marginRight: '3px' }} />
                  {tag.name} <span style={{ fontSize: '11px', marginLeft: '3px' }}>({tag.count})</span>
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