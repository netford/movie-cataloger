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
        // Можно добавить отображение ошибки для пользователя
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
        // Можно добавить отображение ошибки для пользователя
      }
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
    if (!dateString) return null;
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
  
  // Формирует заголовок с годом выпуска
  const getMovieTitle = () => {
    if (movie.year) {
      return `${movie.title} (${movie.year})`;
    }
    return movie.title;
  };
  
  const renderDurationInfo = () => {
    if (movie.isSeries) {
      // Показываем только если есть все необходимые данные
      if (movie.episodes && movie.episodeDuration) {
        // Рассчитываем общую продолжительность
        const totalMinutes = movie.episodes * movie.episodeDuration;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return (
          <>
            {movie.seasons && (
              <div className="metadata-item">
                <span className="metadata-label">Количество сезонов:</span>
                <span className="metadata-value">{movie.seasons}</span>
              </div>
            )}
            <div className="metadata-item">
              <span className="metadata-label">Количество серий:</span>
              <span className="metadata-value">{movie.episodes}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Длительность серии:</span>
              <span className="metadata-value">{movie.episodeDuration} мин.</span>
            </div>
            <div className="metadata-item total-duration-info">
              <span className="metadata-label">Общая продолжительность:</span>
              <span className="metadata-value">
                приблизительно {totalMinutes} мин. 
                ({hours > 0 ? `${hours} ч. ` : ''}{minutes > 0 ? `${minutes} мин.` : ''})
              </span>
            </div>
          </>
        );
      }
      return null;
    } else if (movie.duration) {
      // Обычный фильм с указанной продолжительностью
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
    
    return null;
  };
  
  const renderMovieImages = () => {
    if (!movie.images || movie.images.length === 0) return null;
    
    return (
      <>
        <span className="metadata-label">Кадры из фильма:</span>
        <div className="images-container">
          {movie.images.map((img, index) => (
            <div key={index} className="movie-image">
              <img src={img} alt={`Кадр ${index + 1}`} />
            </div>
          ))}
        </div>
      </>
    );
  };
  
  return (
    <Modal title="Детальная информация о фильме">
      <div className="movie-view">
        <div className="compact-form-layout">
          <div className="form-left-panel">
            {/* Обязательное поле: Постер */}
            <div className="form-poster-container">
              <div className="form-poster">
                {movie.poster ? (
                  <img src={movie.poster} alt={movie.title} />
                ) : (
                  <div className="poster-placeholder">
                    <FontAwesomeIcon icon={faFilm} size="2x" />
                  </div>
                )}
                
                {movie.status === 'watched' && movie.rating && (
                  <div className="movie-rating">{movie.rating}/100</div>
                )}
              </div>
            </div>
            
            <div className="form-fields-group">
              {/* Обязательное поле: Статус */}
              <div className="metadata-item">
                <span className="metadata-label">Статус:</span>
                <span className={`metadata-value status-${movie.status}`}>
                  {getStatusLabel(movie.status)}
                </span>
              </div>
              
              {/* Необязательное поле: Рейтинг (только для просмотренных) */}
              {movie.status === 'watched' && movie.rating && (
                <div className="metadata-item">
                  <span className="metadata-label">Рейтинг:</span>
                  <span className="metadata-value">{movie.rating}/100</span>
                </div>
              )}
              
              {/* Необязательное поле: Дата добавления */}
              {movie.dateAdded && (
                <div className="metadata-item">
                  <span className="metadata-label">Дата добавления:</span>
                  <span className="metadata-value">{formatDate(movie.dateAdded)}</span>
                </div>
              )}
              
              {/* Необязательное поле: Дата просмотра (только если заполнена) */}
              {movie.dateWatched && (
                <div className="metadata-item">
                  <span className="metadata-label">Дата просмотра:</span>
                  <span className="metadata-value">{formatDate(movie.dateWatched)}</span>
                </div>
              )}
              
              {/* Необязательное поле: Тип контента */}
              <div className="metadata-item">
                <span className="metadata-label">Тип:</span>
                <span className="metadata-value">{movie.isSeries ? 'Сериал' : 'Фильм'}</span>
              </div>
              
              {/* Необязательное поле: Информация о продолжительности */}
              <div className="left-panel-bottom">
                {renderDurationInfo()}
              </div>
            </div>
          </div>
          
          <div className="form-right-panel">
            <div className="form-row tags-year-row">
              {/* Необязательное поле: Теги (без заголовка) */}
              {movie.tags && movie.tags.length > 0 && (
                <div className="metadata-item tags-display">
                  <div className="movie-tags-container">
                    {movie.tags.map(tag => (
                      <span key={tag} className="movie-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Обязательное поле: Название с годом выпуска */}
            <div className="form-row">
              <div className="metadata-item">
                <h2 className="movie-title-display">{getMovieTitle()}</h2>
              </div>
            </div>
            
            {/* Обязательное поле: Описание */}
            <div className="form-row">
              <div className="metadata-item">
                <span className="metadata-label">Описание:</span>
                <div className="description-display">
                  {movie.description || 'Описание отсутствует'}
                </div>
              </div>
            </div>
            
            {/* Необязательное поле: Трейлер */}
            {movie.trailerUrl && (
              <div className="form-row">
                <div className="metadata-item">
                  <span className="metadata-label">Трейлер:</span>
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
            
            {/* Необязательное поле: Кадры из фильма */}
            {movie.images && movie.images.length > 0 && (
              <div className="form-row">
                <div className="metadata-item">
                  {renderMovieImages()}
                </div>
              </div>
            )}
            
            {/* Необязательное поле: Заметки */}
            {movie.notes && (
              <div className="form-row">
                <div className="metadata-item">
                  <span className="metadata-label">Мои заметки:</span>
                  <div className="notes-display">
                    {movie.notes}
                  </div>
                </div>
              </div>
            )}
          </div>
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