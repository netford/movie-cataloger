import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilm, 
  faCheck, 
  faCalendarAlt, 
  faPlay, 
  faTimes, 
  faTag,
  faTags
} from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import '../../styles/FilterBar.css';

const FilterBar = () => {
  const { state, dispatch, getPopularTags } = useMovies();
  
  // Получаем популярные теги (максимум 5)
  const popularTags = useMemo(() => getPopularTags(5), [getPopularTags]);
  
  // Расчет количества фильмов для каждого статуса
  const statusCounts = useMemo(() => {
    const counts = {
      all: state.movies.length,
      watched: 0,
      toWatch: 0,
      watching: 0,
      cancelled: 0
    };
    
    state.movies.forEach(movie => {
      if (movie.status in counts) {
        counts[movie.status]++;
      }
    });
    
    return counts;
  }, [state.movies]);
  
  // Расчет количества фильмов без тегов
  const noTagsCount = useMemo(() => {
    return state.movies.filter(movie => !movie.tags || movie.tags.length === 0).length;
  }, [state.movies]);
  
  // Обработчик смены статуса фильма - сбрасывает поиск по тегам
  const handleFilterChange = (filter) => {
    // Сначала сбрасываем поиск (теги)
    dispatch({ type: 'SET_SEARCH', payload: '' });
    // Затем устанавливаем фильтр (статус)
    dispatch({ type: 'SET_FILTER', payload: filter });
  };
  
  // Обработчик клика по тегу - сбрасывает фильтр по статусу
  const handleTagClick = (tagName) => {
    // Сначала сбрасываем фильтр по статусу
    dispatch({ type: 'SET_FILTER', payload: 'all' });
    // Затем устанавливаем поиск по тегу
    dispatch({ type: 'SET_SEARCH', payload: tagName });
  };
  
  // Обработчик для фильтрации фильмов без тегов - сбрасывает фильтр по статусу
  const handleNoTagsClick = () => {
    // Сначала сбрасываем фильтр по статусу
    dispatch({ type: 'SET_FILTER', payload: 'all' });
    // Затем устанавливаем специальный поиск
    dispatch({ type: 'SET_SEARCH', payload: '_NO_TAGS_' });
  };
  
  // Стили для тегов с автоматической шириной
  const tagButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'var(--tag-color)',
    color: 'white',
    border: 'none',
    borderRadius: '0',
    padding: '1px 4px',
    fontSize: '11px',
    cursor: 'pointer',
    opacity: 0.9,
    width: 'auto',
    minWidth: 'fit-content',
    maxWidth: 'none'
  };
  
  const tagActiveStyle = {
    ...tagButtonStyle,
    backgroundColor: 'var(--tag-color)',
    opacity: 1,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)'
  };
  
  // Стиль для кнопки "Без тегов"
  const noTagsButtonStyle = {
    ...tagButtonStyle,
    backgroundColor: '#95a5a6', // Серый цвет для отличия
    marginLeft: '5px', // Небольшой отступ от обычных тегов
  };
  
  const noTagsActiveStyle = {
    ...noTagsButtonStyle,
    backgroundColor: '#7f8c8d',
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
              <FontAwesomeIcon icon={faFilm} className="category-icon" /> 
              Все фильмы <span className="status-count">({statusCounts.all})</span>
            </button>
            <button 
              className={`category-btn category-watched ${state.filter === 'watched' ? 'active' : ''}`}
              onClick={() => handleFilterChange('watched')}
            >
              <FontAwesomeIcon icon={faCheck} className="category-icon" /> 
              Просмотрено <span className="status-count">({statusCounts.watched})</span>
            </button>
            <button 
              className={`category-btn category-to-watch ${state.filter === 'toWatch' ? 'active' : ''}`}
              onClick={() => handleFilterChange('toWatch')}
            >
              <FontAwesomeIcon icon={faCalendarAlt} className="category-icon" /> 
              Запланировано <span className="status-count">({statusCounts.toWatch})</span>
            </button>
            <button 
              className={`category-btn category-watching ${state.filter === 'watching' ? 'active' : ''}`}
              onClick={() => handleFilterChange('watching')}
            >
              <FontAwesomeIcon icon={faPlay} className="category-icon" /> 
              Смотрим <span className="status-count">({statusCounts.watching})</span>
            </button>
            <button 
              className={`category-btn category-cancelled ${state.filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => handleFilterChange('cancelled')}
            >
              <FontAwesomeIcon icon={faTimes} className="category-icon" /> 
              Отменено <span className="status-count">({statusCounts.cancelled})</span>
            </button>
          </div>
        </div>
        
        <div className="tags-container">
          {/* Популярные теги выровнены по правому краю */}
          {popularTags.length > 0 && (
            <div className="popular-tags">
              {popularTags.map(tag => (
                <button 
                  key={tag.id}
                  style={state.search === tag.name ? tagActiveStyle : tagButtonStyle}
                  onClick={() => handleTagClick(tag.name)}
                >
                  <FontAwesomeIcon icon={faTag} style={{ fontSize: '10px', marginRight: '3px' }} />
                  {tag.name}
                </button>
              ))}
            </div>
          )}
          
          {/* Кнопка "Без тегов" - всегда присутствует */}
          <button 
            style={state.search === '_NO_TAGS_' ? noTagsActiveStyle : noTagsButtonStyle}
            onClick={handleNoTagsClick}
            className="no-tags-btn"
          >
            <FontAwesomeIcon icon={faTags} style={{ fontSize: '10px', marginRight: '3px' }} />
            Без тегов <span style={{ fontSize: '10px', marginLeft: '3px' }}>({noTagsCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;