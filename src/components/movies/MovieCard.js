import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faFilm, faPlay, faDownload, faTags } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import '../../styles/MovieCard.css';

const MovieCard = ({ movie }) => {
  const { dispatch } = useMovies();
  
  const handleCardClick = () => {
    dispatch({ 
      type: 'OPEN_MODAL', 
      payload: { type: 'view', movieId: movie.id } 
    });
  };
  
  const handleMenuClick = (e) => {
    e.stopPropagation();
    // В будущем здесь можно реализовать выпадающее меню
  };
  
  const handleLinkClick = (e, url) => {
    e.stopPropagation();
    window.open(url, '_blank');
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
  
  const formatDuration = () => {
    if (movie.isSeries && movie.episodes && movie.episodeDuration) {
      // Рассчитываем общую продолжительность сериала
      const totalMinutes = movie.episodes * movie.episodeDuration;
      const totalHours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      
      // Форматируем общую продолжительность
      const totalDuration = `~${totalHours} ${totalHours === 1 ? 'час' : 
                            totalHours > 1 && totalHours < 5 ? 'часа' : 'часов'}${
                            remainingMinutes > 0 ? ` ${remainingMinutes} мин.` : ''}`;
      
      // Для сериалов возвращаем объект с двумя строками
      return {
        seriesInfo: `Сезон ${movie.seasons}, Серий ${movie.episodes} (${totalDuration})`,
        episodeInfo: `Продолжительность серии: ~${movie.episodeDuration} мин.`
      };
    } else if (movie.duration) {
      // Обычный фильм
      const hours = Math.floor(movie.duration / 60);
      const minutes = movie.duration % 60;
      
      return `${hours > 0 ? `${hours} ч. ` : ''}${minutes > 0 ? `${minutes} мин.` : ''}`;
    }
    
    return null;
  };
  
  // Функция для определения цвета рейтинга
  const getRatingColor = (rating) => {
    if (rating >= 86) return '#FFD700'; // Золотистый - шедевр
    if (rating >= 71) return '#1976D2'; // Синий - хороший фильм
    if (rating >= 51) return '#7B1FA2'; // Фиолетовый - средний/неплохой
    if (rating >= 31) return '#D32F2F'; // Тёмно-красный - слабый фильм
    return '#9E9E9E';                   // Серый - не стоит тратить время
  };
  
  // Проверка наличия данных
  const hasRating = movie.status === 'watched' && movie.rating !== null && movie.rating !== undefined;
  const hasTags = movie.tags && movie.tags.length > 0;
  const hasDateWatched = movie.status === 'watched' && movie.dateWatched;
  const hasDuration = movie.duration || (movie.isSeries && movie.episodes && movie.episodeDuration);
  const hasTrailer = movie.trailerUrl && movie.trailerUrl.trim() !== '';
  const hasWatchLink = movie.watchLink && movie.watchLink.trim() !== ''; // Заготовка для будущего поля
  
  // Получаем форматированную продолжительность
  const duration = formatDuration();
  // Проверяем, является ли duration объектом (для сериалов) или строкой (для фильмов)
  const isSeriesDuration = duration !== null && typeof duration === 'object';
  
  return (
    <div className="movie-card" onClick={handleCardClick}>
      <div className="movie-poster">
        {movie.poster ? (
          <img src={movie.poster} alt={movie.title} />
        ) : (
          <div className="poster-placeholder">
            <FontAwesomeIcon icon={faFilm} />
          </div>
        )}
        
        {/* Отображаем рейтинг слева и статус справа */}
        {hasRating && (
          <div className="movie-rating" style={{ 
            position: 'absolute', 
            top: '0', 
            left: '0',
            backgroundColor: getRatingColor(movie.rating),
            color: 'white',
            fontWeight: 'bold',
            padding: '3px 8px',
            borderRadius: '3px',
            fontSize: '14px',
            zIndex: 10
          }}>
            {movie.rating}
          </div>
        )}
        
        {/* Статус отображаем всегда */}
        <div className={`movie-status status-${movie.status}`} style={{ 
          position: 'absolute', 
          top: '0',
          right: '0', 
          padding: '5px 15px',
          backgroundColor: movie.status === 'watched' ? 'rgba(39, 174, 96, 0.8)' : 
                      movie.status === 'toWatch' ? 'rgba(52, 152, 219, 0.8)' : 
                      movie.status === 'watching' ? 'rgba(243, 156, 18, 0.8)' : 
                      'rgba(127, 140, 141, 0.8)',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 10
        }}>
          {getStatusLabel(movie.status)}
        </div>
      </div>
      
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        
        {/* Теги отображаем если они есть */}
        {hasTags && (
          <div className="movie-tags" style={{ marginBottom: '8px' }}>
            {movie.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="movie-tag" style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#9b59b6', /* более точный оттенок фиолетового как в заголовке */
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'normal',
                margin: '2px 4px 2px 0',
                boxShadow: '0 1px 1px rgba(0,0,0,0.1)'
              }}>
                <FontAwesomeIcon icon={faTags} size="xs" style={{ marginRight: '3px', fontSize: '8px' }} />
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Дата добавления */}
        <div className="movie-date" style={{ fontSize: '13px', margin: '3px 0' }}>
          Добавлено: {new Date(movie.dateAdded).toLocaleDateString('ru-RU')}
        </div>
        
        {/* Дата просмотра - только если есть */}
        {hasDateWatched && (
          <div className="movie-date" style={{ fontSize: '13px', margin: '3px 0' }}>
            Просмотрено: {new Date(movie.dateWatched).toLocaleDateString('ru-RU')}
          </div>
        )}
        
        {/* Продолжительность - разные форматы для фильмов и сериалов */}
        {hasDuration && (
          <>
            {isSeriesDuration ? (
              <>
                <div className="movie-duration" style={{ fontSize: '13px', margin: '3px 0' }}>
                  {duration.seriesInfo}
                </div>
                <div className="movie-duration" style={{ fontSize: '13px', margin: '3px 0' }}>
                  {duration.episodeInfo}
                </div>
              </>
            ) : (
              <div className="movie-duration" style={{ fontSize: '13px', margin: '3px 0' }}>
                Продолжительность: {duration}
              </div>
            )}
          </>
        )}
        
        {/* Трейлер - только если есть */}
        {hasTrailer && (
          <div className="movie-trailer" style={{ fontSize: '13px', margin: '3px 0' }}>
            <a 
              href={movie.trailerUrl} 
              onClick={(e) => handleLinkClick(e, movie.trailerUrl)}
              style={{ color: 'var(--primary-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <FontAwesomeIcon icon={faPlay} size="sm" />
              Трейлер
            </a>
          </div>
        )}
        
        {/* Заготовка для будущей ссылки Скачать/Смотреть */}
        {hasWatchLink && (
          <div className="movie-watch-link" style={{ fontSize: '13px', margin: '3px 0' }}>
            <a 
              href={movie.watchLink}
              onClick={(e) => handleLinkClick(e, movie.watchLink)}
              style={{ color: 'var(--primary-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <FontAwesomeIcon icon={faDownload} size="sm" />
              Скачать/Смотреть
            </a>
          </div>
        )}
        
        {/* Кнопка с меню перемещена в правый нижний угол */}
        <button 
          className="card-menu-btn" 
          onClick={handleMenuClick}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            top: 'auto'
          }}
        >
          <FontAwesomeIcon icon={faEllipsisV} />
        </button>
      </div>
    </div>
  );
};

export default MovieCard;