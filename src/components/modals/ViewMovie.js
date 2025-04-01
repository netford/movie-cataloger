import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faBan, faEdit, faPlay, faFilm } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import Modal from './Modal';
import '../../styles/ViewMovie.css';

const ViewMovie = ({ movieId }) => {
  const { state, dispatch } = useMovies();
  
  // Находим фильм по ID
  const movie = state.movies.find(m => m.id === movieId);
  
  if (!movie) return null;
  
  const handleEdit = () => {
    dispatch({ 
      type: 'OPEN_MODAL', 
      payload: { type: 'edit', movieId: movie.id } 
    });
  };
  
  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить этот фильм?')) {
      dispatch({ type: 'DELETE_MOVIE', payload: movie.id });
      dispatch({ type: 'CLOSE_MODAL' });
    }
  };
  
  const handleCancel = () => {
    if (movie.status !== 'cancelled') {
      dispatch({ 
        type: 'UPDATE_MOVIE', 
        payload: { ...movie, status: 'cancelled' } 
      });
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'watched': return 'Просмотрено';
      case 'toWatch': return 'Планирую посмотреть';
      case 'cancelled': return 'Отменён';
      default: return '';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };
  
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Извлекаем ID видео из различных форматов URL YouTube
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };
  
  const renderDurationDetails = () => {
    if (movie.isSeries) {
      // Рассчитываем общую продолжительность
      const totalMinutes = movie.episodes * movie.episodeDuration;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      return (
        <div className="series-info">
          <div className="metadata-item">
            <span className="metadata-label">Тип:</span>
            <span className="metadata-value">Сериал</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Количество сезонов:</span>
            <span className="metadata-value">{movie.seasons}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Количество серий:</span>
            <span className="metadata-value">{movie.episodes}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Длительность серии:</span>
            <span className="metadata-value">{movie.episodeDuration} мин.</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Общая продолжительность:</span>
            <span className="metadata-value">
              приблизительно {totalMinutes} мин. 
              ({hours > 0 ? `${hours} ч. ` : ''}{minutes > 0 ? `${minutes} мин.` : ''})
            </span>
          </div>
        </div>
      );
    } else {
      // Обычный фильм
      const hours = Math.floor(movie.duration / 60);
      const minutes = movie.duration % 60;
      
      return (
        <div className="metadata-item">
          <span className="metadata-label">Продолжительность:</span>
          <span className="metadata-value">
            {movie.duration} мин.
            ({hours > 0 ? `${hours} ч. ` : ''}{minutes > 0 ? `${minutes} мин.` : ''})
          </span>
        </div>
      );
    }
  };
  
  return (
    <Modal title="Детальная информация о фильме">
      <div className="movie-view">
        <div className="movie-view-left">
          <div className="movie-poster-large">
            {movie.poster ? (
              <img src={movie.poster} alt={movie.title} />
            ) : (
              <div className="poster-placeholder-large">
                <FontAwesomeIcon icon={faFilm} />
              </div>
            )}
            
            {movie.status === 'watched' && (
              <div className="movie-rating-large">{movie.rating}/100</div>
            )}
          </div>
          
          <div className="movie-metadata">
            <div className="metadata-item">
              <span className="metadata-label">Статус:</span>
              <span className={`metadata-value status-${movie.status}`}>
                {getStatusLabel(movie.status)}
              </span>
            </div>
            
            <div className="metadata-item">
              <span className="metadata-label">Дата просмотра:</span>
              <span className="metadata-value">{formatDate(movie.dateWatched)}</span>
            </div>
            
            <div className="metadata-item">
              <span className="metadata-label">Дата добавления:</span>
              <span className="metadata-value">{formatDate(movie.dateAdded)}</span>
            </div>
            
            {renderDurationDetails()}
            
            <div className="metadata-item">
              <span className="metadata-label">Год выпуска:</span>
              <span className="metadata-value">{movie.year || '—'}</span>
            </div>
            
            <div className="metadata-item">
              <span className="metadata-label">Режиссёр:</span>
              <span className="metadata-value">{movie.director || '—'}</span>
            </div>
          </div>
        </div>
        
        <div className="movie-view-right">
          <div className="movie-view-header">
            <h1 className="movie-title-large">{movie.title}</h1>
            
            <div className="movie-tags-container">
              {movie.tags.map(tag => (
                <span key={tag} className="movie-tag">{tag}</span>
              ))}
            </div>
          </div>
          
          {movie.description && (
            <div className="movie-section">
              <h3 className="section-title">Описание</h3>
              <p className="movie-description">{movie.description}</p>
            </div>
          )}
          
          {movie.trailerUrl && (
            <div className="movie-section">
              <h3 className="section-title">Трейлер</h3>
              <div className="trailer-container">
                {getYoutubeEmbedUrl(movie.trailerUrl) ? (
                  <iframe
                    title={`Трейлер ${movie.title}`}
                    src={getYoutubeEmbedUrl(movie.trailerUrl)}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="trailer-link">
                    <FontAwesomeIcon icon={faPlay} />
                    <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer">
                      {movie.trailerUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {movie.images && movie.images.length > 0 && (
            <div className="movie-section">
              <h3 className="section-title">Кадры из фильма</h3>
              <div className="movie-images">
                {/* Здесь будет галерея изображений */}
              </div>
            </div>
          )}
          
          {movie.notes && (
            <div className="movie-section">
              <h3 className="section-title">Мои заметки</h3>
              <div className="movie-notes">{movie.notes}</div>
            </div>
          )}
        </div>
      </div>
      
      <div className="modal-actions">
        <button className="btn btn-danger" onClick={handleDelete}>
          <FontAwesomeIcon icon={faTrash} /> Удалить
        </button>
        
        {movie.status !== 'cancelled' && (
          <button className="btn btn-warning" onClick={handleCancel}>
            <FontAwesomeIcon icon={faBan} /> Отменить
          </button>
        )}
        
        <button className="btn btn-primary btn-right" onClick={handleEdit}>
          <FontAwesomeIcon icon={faEdit} /> Изменить
        </button>
      </div>
    </Modal>
  );
};

export default ViewMovie;