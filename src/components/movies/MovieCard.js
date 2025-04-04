import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faFilm } from '@fortawesome/free-solid-svg-icons';
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
      case 'watching': return 'Смотрим';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };
  
  const renderDuration = () => {
    if (movie.isSeries) {
      // Рассчитываем общую продолжительность
      const totalMinutes = movie.episodes * movie.episodeDuration;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      return (
        <div className="movie-duration">
          <div>Сезон {movie.seasons}, серий {movie.episodes}</div>
          <div>Примерная продолжительность серии: {movie.episodeDuration} мин.</div>
          <div className="total-duration">
            Общая продолжительность: приблизительно {totalMinutes} мин. 
            ({hours > 0 ? `${hours} ч. ` : ''}{minutes > 0 ? `${minutes} мин.` : ''})
          </div>
        </div>
      );
    } else if (movie.duration) {
      // Обычный фильм
      const hours = Math.floor(movie.duration / 60);
      const minutes = movie.duration % 60;
      
      return (
        <div className="movie-duration">
          <div>Общая продолжительность: {movie.duration} мин. 
            ({hours > 0 ? `${hours} ч. ` : ''}{minutes > 0 ? `${minutes} мин.` : ''})
          </div>
        </div>
      );
    }
    
    return null;
  };
  
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
        
        {movie.status === 'watched' ? (
          <div className="movie-rating">{movie.rating}/100</div>
        ) : (
          <div className={`movie-status ${getStatusClass(movie.status)}`}>
            {getStatusLabel(movie.status)}
          </div>
        )}
        
        <button className="card-menu-btn" onClick={handleMenuClick}>
          <FontAwesomeIcon icon={faEllipsisV} />
        </button>
      </div>
      
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-tags">
          {movie.tags.length > 0 
            ? movie.tags.slice(0, 2).join(' • ') 
            : 'Нет тегов'}
        </div>
        
        {movie.status === 'watched' && movie.dateWatched && (
          <div className="movie-date">
            Просмотрено: {new Date(movie.dateWatched).toLocaleDateString('ru-RU')}
          </div>
        )}
        
        <div className="movie-date">
          Добавлено: {new Date(movie.dateAdded).toLocaleDateString('ru-RU')}
        </div>
        
        {(movie.duration || (movie.isSeries && movie.episodes && movie.episodeDuration)) && (
          <div className="movie-duration-info">
            {renderDuration()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;