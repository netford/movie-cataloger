import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faBan, faEdit, faPlay, faFilm } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import Modal from './Modal';
import '../../styles/ViewMovie.css';

const ViewMovie = ({ movieId }) => {
  const { state, dispatch, updateMovieInFirestore, deleteMovieFromFirestore } = useMovies();
  
  // Находим фильм по ID
  const movie = state.movies.find(m => m.id === movieId);
  
  if (!movie) return null;
  
  const handleEdit = () => {
    dispatch({ 
      type: 'OPEN_MODAL', 
      payload: { type: 'edit', movieId: movie.id } 
    });
  };
  
  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот фильм?')) {
      try {
        await deleteMovieFromFirestore(movie.id);
        dispatch({ type: 'CLOSE_MODAL' });
      } catch (error) {
        console.error("Ошибка при удалении фильма:", error);
      }
    }
  };
  
  const handleCancel = async () => {
    if (movie.status !== 'cancelled') {
      try {
        await updateMovieInFirestore({ 
          ...movie, 
          status: 'cancelled' 
        });
      } catch (error) {
        console.error("Ошибка при отмене фильма:", error);
      }
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'watched': return 'Просмотрено';
      case 'toWatch': return 'Планирую посмотреть';
      case 'watching': return 'Смотрим';
      case 'cancelled': return 'Отменён';
      default: return '';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    
    return `${day}.${month}.${year}`;
  };
  
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };
  
  // Формирует заголовок с годом выпуска
  const getMovieTitle = () => {
    if (movie.year) {
      return `${movie.title} (${movie.year})`;
    }
    return movie.title;
  };
  
  // Вычисляем информацию о продолжительности
  const renderDurationInfo = () => {
    if (movie.isSeries) {
      if (movie.episodes && movie.episodeDuration) {
        const totalMinutes = movie.episodes * movie.episodeDuration;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return (
          <div className="series-duration-info">
            <div className="duration-header">Продолжительность:</div>
            <div className="duration-row">
              <span>Серия: </span>{movie.episodeDuration} мин.
            </div>
            <div className="duration-row total-duration" style={{fontStyle: 'normal'}}>
              <span>Общая: </span>{totalMinutes} мин. 
              ({hours > 0 ? `${hours} ч. ` : ''}{minutes > 0 ? `${minutes} мин.` : ''})
            </div>
          </div>
        );
      }
      return null;
    } else if (movie.duration) {
      const hours = Math.floor(movie.duration / 60);
      const minutes = movie.duration % 60;
      
      return (
        <div className="form-control">
          <label>Продолжительность:</label>
          <div className="metadata-value">
            {movie.duration} мин.
            ({hours > 0 ? `${hours} ч. ` : ''}{minutes > 0 ? `${minutes} мин.` : ''})
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Рендерим кадры из фильма
  const renderMovieImages = () => {
    if (!movie.images || movie.images.length === 0) return null;
    
    return (
      <div className="images-container">
        {movie.images.map((img, index) => (
          <div key={index} className="movie-image">
            <img src={img} alt={`Кадр ${index + 1}`} />
          </div>
        ))}
      </div>
    );
  };
   
  // Проверяем, есть ли рейтинг у фильма
  const hasRating = movie.rating !== null && movie.rating !== undefined;
  
  return (
    <Modal title="Детальная информация о фильме">
      <div className="movie-form">
        <div className="compact-form-layout">
          <div className="form-left-panel">
            {/* Блок с постером */}
            <div className="form-poster-container">
              <div className="form-poster">
                {movie.poster ? (
                  <img src={movie.poster} alt={movie.title} />
                ) : (
                  <div className="poster-placeholder">
                    <FontAwesomeIcon icon={faFilm} size="2x" />
                  </div>
                )}
                
                {/* Рейтинг вверху слева - отображаем всегда при наличии рейтинга */}
                {hasRating && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '0', 
                    left: '0',
                    backgroundColor: 'var(--danger-color)',
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
                
                {/* Статус вверху справа */}
                <div style={{ 
                  position: 'absolute', 
                  top: '0',
                  right: '0', 
                  padding: '5px 15px',
                  backgroundColor: movie.status === 'watched' ? 'var(--primary-color)' : 
                                  movie.status === 'toWatch' ? 'var(--success-color)' : 
                                  movie.status === 'watching' ? 'var(--secondary-color)' : 
                                  'var(--warning-color)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  zIndex: 10
                }}>
                  {getStatusLabel(movie.status)}
                </div>
              </div>
            </div>
                      
            <div className="form-fields-group">
              {/* Даты */}
              <div className="form-row">
                <div className="form-control" style={{ width: '100%' }}>
                  <div className="metadata-value" style={{ 
                    fontSize: '13px', 
                    letterSpacing: '-0.2px', 
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    justifyContent: (movie.status === 'watched' || movie.status === 'cancelled') && movie.dateWatched ? 'space-between' : 'flex-start'
                  }}>
                    <span>Добавлено: {formatDate(movie.dateAdded)}</span>
                    
                    {movie.status === 'watched' && movie.dateWatched && (
                      <span>Просмотрено: {formatDate(movie.dateWatched)}</span>
                    )}
                    
                    {movie.status === 'cancelled' && movie.dateWatched && (
                      <span>Отменено: {formatDate(movie.dateWatched)}</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Информация о продолжительности */}
              <div className="left-panel-bottom">
                {movie.isSeries ? (
                  <div className="series-details">
                    <div className="form-row">
                      {renderDurationInfo()}
                    </div>
                  </div>
                ) : (
                  <div className="form-row">
                    {renderDurationInfo()}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-right-panel">
            {/* Название с годом */}
            <div className="form-row">
              <div className="form-control">
                <h3 className="movie-title">{getMovieTitle()}</h3>
              </div>
            </div>

            <div className="metadata-value series-info" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              {movie.isSeries && (
                <span>Сезон {movie.seasons}, Серий {movie.episodes}</span>
              )}
              
              {/* Теги в той же строке */}
              {movie.tags && movie.tags.length > 0 && (
                <>
                  {movie.isSeries && <span style={{ margin: '0 8px' }}></span>}
                  {movie.tags.map((tag, index) => (
                    <div key={index} className="movie-tag">
                      <span>{tag}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
            
            {/* Описание */}
            <div className="form-row">
              <div className="form-control">
                <label>Описание:</label>
                <div className="description-display">
                  {movie.description || 'Описание отсутствует'}
                </div>
              </div>
            </div>
            
            {/* Трейлер */}
            {movie.trailerUrl && (
              <div className="form-row">
                <div className="form-control">
                  <label>URL трейлера:</label>
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
              </div>
            )}
            
            {/* Кадры из фильма */}
            {movie.images && movie.images.length > 0 && (
              <div className="form-row">
                <div className="form-control">
                  <div className="images-label-row">
                    <label>Кадры из фильма:</label>
                  </div>
                  {renderMovieImages()}
                </div>
              </div>
            )}
            
            {/* Заметки */}
            {movie.notes && (
              <div className="form-row">
                <div className="form-control">
                  <label>Мои заметки:</label>
                  <div className="notes-display">
                    {movie.notes}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
          >
            <FontAwesomeIcon icon={faTrash} /> Удалить
          </button>
          
          {movie.status !== 'cancelled' && (
            <button 
              type="button" 
              className="btn btn-warning"
              onClick={handleCancel}
            >
              <FontAwesomeIcon icon={faBan} /> Отменить
            </button>
          )}
          
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleEdit}
          >
            <FontAwesomeIcon icon={faEdit} /> Изменить
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewMovie;