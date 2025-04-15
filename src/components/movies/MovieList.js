import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faFilm, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import '../../styles/MovieList.css';

const ITEMS_PER_PAGE = 10;

const MovieList = () => {
  const { state, dispatch } = useMovies();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Фильтруем и сортируем фильмы (аналогично MovieGrid)
  const filteredMovies = useMemo(() => {
    let result = [...state.movies];
    
    if (state.filter !== 'all') {
      result = result.filter(movie => movie.status === state.filter);
    }
    
    if (state.search) {
      if (state.search === '_NO_TAGS_') {
        // Специальный случай для фильтрации фильмов без тегов
        result = result.filter(movie => !movie.tags || movie.tags.length === 0);
      } else {
        // Обычная фильтрация по поисковому запросу
        const searchLower = state.search.toLowerCase();
        result = result.filter(movie => 
          movie.title.toLowerCase().includes(searchLower) ||
          movie.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
    }
    
    const { field, direction } = state.sortBy;
    result.sort((a, b) => {
      if (a[field] == null && b[field] == null) return 0;
      if (a[field] == null) return direction === 'asc' ? 1 : -1;
      if (b[field] == null) return direction === 'asc' ? -1 : 1;
      
      if (typeof a[field] === 'string' && typeof b[field] === 'string') {
        const aValue = a[field].toLowerCase();
        const bValue = b[field].toLowerCase();
        return direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return direction === 'asc'
        ? a[field] - b[field]
        : b[field] - a[field];
    });
    
    return result;
  }, [state.movies, state.filter, state.search, state.sortBy]);
  
  // Пагинация
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  
  // Корректируем текущую страницу, если она вышла за пределы доступных
  React.useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  // Получаем фильмы только для текущей страницы
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMovies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);
  
  const handleRowClick = (movieId) => {
    dispatch({ 
      type: 'OPEN_MODAL', 
      payload: { type: 'view', movieId } 
    });
  };
  
  const handleMenuClick = (e, movieId) => {
    e.stopPropagation();
    // В будущем здесь можно реализовать выпадающее меню
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'watched': return 'Просмотрено';
      case 'toWatch': return 'Запланировано';
      case 'watching': return 'Смотрим';
      case 'cancelled': return 'Отменено';
      default: return '';
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'watched': return 'status-watched';
      case 'toWatch': return 'status-to-watch';
      case 'watching': return 'status-watching';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };
  
  if (filteredMovies.length === 0) {
    return (
      <div className="no-movies-message">
        <p>Фильмы не найдены. Попробуйте изменить параметры поиска или добавьте новый фильм.</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="movie-list-container">
        <table className="movie-list-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Теги</th>
              <th>Статус</th>
              <th>Рейтинг</th>
              <th>Дата просмотра</th>
              <th>Дата добавления</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMovies.map((movie, index) => (
              <tr 
                key={movie.id} 
                className={index % 2 === 0 ? 'row-even' : 'row-odd'}
                onClick={() => handleRowClick(movie.id)}
              >
                <td className="title-cell">
                  {movie.poster ? (
                    <div className="mini-poster">
                      <img src={movie.poster} alt={movie.title} />
                    </div>
                  ) : (
                    <div className="mini-poster">
                      <FontAwesomeIcon icon={faFilm} />
                    </div>
                  )}
                  <span className="movie-title">{movie.title}</span>
                </td>
                <td>{movie.tags.join(', ') || '—'}</td>
                <td className={getStatusClass(movie.status)}>
                  {getStatusLabel(movie.status)}
                </td>
                <td>
                  {movie.status === 'watched' ? (
                    <div className="rating-badge">{movie.rating}/100</div>
                  ) : (
                    '—'
                  )}
                </td>
                <td>{formatDate(movie.dateWatched)}</td>
                <td>{formatDate(movie.dateAdded)}</td>
                <td>
                  <button 
                    className="list-menu-btn"
                    onClick={(e) => handleMenuClick(e, movie.id)}
                  >
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          )).slice(
            // Показываем только часть страниц, чтобы не загромождать интерфейс
            Math.max(0, currentPage - 3),
            Math.min(totalPages, currentPage + 2)
          )}
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </>
  );
};

export default MovieList;