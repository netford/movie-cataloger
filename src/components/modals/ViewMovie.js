import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faTimes, faPlay, faFilm } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import Modal from './Modal';
import '../../styles/ViewMovie.css';

const ViewMovie = ({ movieId }) => {
  const { state, dispatch, deleteMovieFromFirestore } = useMovies();
  
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
  
  const handleClose = () => {
    dispatch({ type: 'CLOSE_MODAL' });
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

  // Функция для получения Vimeo ссылки
  const getVimeoEmbedUrl = (url) => {
    if (!url) return null;
    
    const regExp = /vimeo.com\/(\d+)/;
    const match = url.match(regExp);
    
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  };

  // Функция для получения RuTube ссылки
  const getRutubeEmbedUrl = (url) => {
    if (!url) return null;
    
    const regExp = /rutube.ru\/video\/([a-zA-Z0-9]+)/;
    const match = url.match(regExp);
    
    return match ? `https://rutube.ru/play/embed/${match[1]}` : null;
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
          <div style={{ margin: '5px 0' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '14px' }}>Продолжительность:</div>
            <div style={{ fontSize: '14px' }}>
              <span>Серия: </span>{movie.episodeDuration} мин.
            </div>
            <div style={{ marginTop: '3px', fontSize: '14px' }}>
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
        <div style={{ margin: '5px 0' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '14px' }}>Продолжительность:</div>
          <div style={{ fontSize: '14px' }}>
            {movie.duration} мин.
            ({hours > 0 ? `${hours} ч. ` : ''}{minutes > 0 ? `${minutes} мин.` : ''})
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Функция для определения типа медиа
  const isImageMedia = (media) => {
    return typeof media === 'string' || (media.type && media.type === 'image');
  };
  
  // Функция для получения URL медиа
  const getMediaUrl = (media) => {
    return typeof media === 'string' ? media : media.url;
  };
  
  // Функция для отображения видео
  const renderVideo = (url, index) => {
    // Определяем, является ли видео YouTube, Vimeo, RuTube или другим
    const youtubeEmbedUrl = getYoutubeEmbedUrl(url);
    const vimeoEmbedUrl = getVimeoEmbedUrl(url);
    const rutubeEmbedUrl = getRutubeEmbedUrl(url);
    
    if (youtubeEmbedUrl) {
      return (
        <iframe
          title={typeof index === 'string' ? index : `Видео ${index + 1}`}
          src={youtubeEmbedUrl}
          frameBorder="0"
          allowFullScreen
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        ></iframe>
      );
    } else if (vimeoEmbedUrl) {
      return (
        <iframe
          title={typeof index === 'string' ? index : `Видео ${index + 1}`}
          src={vimeoEmbedUrl}
          frameBorder="0"
          allowFullScreen
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        ></iframe>
      );
    } else if (rutubeEmbedUrl) {
      return (
        <iframe
          title={typeof index === 'string' ? index : `Видео ${index + 1}`}
          src={rutubeEmbedUrl}
          frameBorder="0"
          allowFullScreen
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        ></iframe>
      );
    } else {
      // Для других URL создаем ссылку
      return (
        <div className="external-video">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <div className="video-play-icon">
              <FontAwesomeIcon icon={faPlay} />
            </div>
            <span>Открыть видео</span>
          </a>
        </div>
      );
    }
  };
  
  // Рендерим кадры и видео из фильма
  const renderMovieImages = () => {
    if (!movie.images || movie.images.length === 0) return null;
    
    return (
      <div className="images-container">
        {movie.images.map((media, index) => (
          <div key={index} className={`movie-image ${isImageMedia(media) ? '' : 'movie-video'}`}>
            {isImageMedia(media) ? (
              <img src={getMediaUrl(media)} alt={`Кадр ${index + 1}`} />
            ) : (
              renderVideo(getMediaUrl(media), index)
            )}
          </div>
        ))}
      </div>
    );
  };
   
  // Проверяем, есть ли рейтинг у фильма
  const hasRating = movie.rating !== null && movie.rating !== undefined;
  
  return (
    <Modal title="Детальная информация о фильме">
      <div className="movie-form" style={{ height: '850px', overflow: 'auto' }}>
        <div className="compact-form-layout" style={{ height: '780px', overflow: 'visible' }}>
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
                {hasRating && movie.status === 'watched' && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '0', 
                    left: '0',
                    backgroundColor: 'rgba(39, 174, 96, 0.8)', // Полупрозрачный зеленый для соответствия статусу "просмотрено"
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
                  backgroundColor: movie.status === 'watched' ? 'rgba(39, 174, 96, 0.8)' : // Полупрозрачный зеленый для "просмотрено"
                              movie.status === 'toWatch' ? 'rgba(52, 152, 219, 0.8)' : // Полупрозрачный синий для "запланировано"
                              movie.status === 'watching' ? 'rgba(243, 156, 18, 0.8)' : // Полупрозрачный оранжевый для "смотрим"
                              'rgba(127, 140, 141, 0.8)', // Полупрозрачный серый для "отменено"
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
              
              {/* Информация о продолжительности сразу после дат */}
              <div style={{ margin: '5px 0', padding: '0' }}>
                {renderDurationInfo()}
              </div>
              
              {/* Блок трейлера, если он существует */}
              {movie.trailerUrl && (
                <div style={{ margin: '15px 0', padding: '0' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>Трейлер:</div>
                  <div style={{ width: '100%', height: '220px', borderRadius: '4px', overflow: 'hidden' }}>
                    {renderVideo(movie.trailerUrl, 'trailer')}
                  </div>
                </div>
              )}
              
              {/* Пустой блок для сохранения структуры */}
              <div className="left-panel-bottom">
                {/* Пустое пространство */}
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
            
            {/* Мои заметки - под описанием */}
            <div className="form-row" style={{ marginTop: '15px' }}>
              <div className="form-control">
                <label>Мои заметки:</label>
                <div className="notes-display">
                  {movie.notes || 'Заметки отсутствуют'}
                </div>
              </div>
            </div>
            
            {/* Добавляем отступ перед "Кадрами из фильма" */}
            {movie.images && movie.images.length > 0 && (
              <div className="form-row" style={{ marginTop: '30px' }}>
                <div className="form-control">
                  <div className="images-label-row">
                    <label>Кадры и видео:</label>
                  </div>
                  {renderMovieImages()}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
          <div>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
            >
              <FontAwesomeIcon icon={faTrash} /> Удалить
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleEdit}
            >
              <FontAwesomeIcon icon={faEdit} /> Изменить
            </button>
            
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleClose}
            >
              <FontAwesomeIcon icon={faTimes} /> Закрыть
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewMovie;