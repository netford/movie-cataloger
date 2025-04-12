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
  
  // Функция для определения типа медиа
  const isImageMedia = (media) => {
    return typeof media === 'string' || (media.type && media.type === 'image');
  };

  // Функция для получения URL медиа
  const getMediaUrl = (media) => {
    return typeof media === 'string' ? media : media.url;
  };

  // Рендерим кадры из фильма (только изображения)
  const renderMovieImages = () => {
    if (!movie.images || movie.images.length === 0) return null;
    
    // Фильтруем только изображения
    const images = movie.images.filter(media => isImageMedia(media));
    
    if (images.length === 0) return null;
    
    // Ограничиваем количество отображаемых кадров до 3
    const limitedImages = images.slice(0, 3);
    
    return (
      <div className="images-container" style={{
        display: 'flex',
        gap: '10px',
        height: '100%',
        overflow: 'hidden',
        padding: '0',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {limitedImages.map((media, index) => (
          <div key={index} className="movie-image" style={{
            flex: '0 0 auto',
            width: '160px',
            height: '100%',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <img 
              src={getMediaUrl(media)} 
              alt={`Кадр ${index + 1}`} 
              style={{
                width: '100%', 
                height: '100%', 
                objectFit: 'cover'
              }}
            />
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
              
              {/* Возвращаем информацию о продолжительности */}
              <div style={{ margin: '-8px 0 10px 0', padding: '0' }}>
                {renderDurationInfo()}
              </div>

              {/* Мои заметки - перенесли из правой панели */}
              <div style={{ margin: '0', padding: '0' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '14px' }}>Мои заметки:</label>
                <div style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.5', 
                  padding: '0', 
                  backgroundColor: 'transparent', 
                  borderRadius: '4px', 
                  whiteSpace: 'pre-line',
                  maxHeight: '85px',
                  minHeight: '40px', 
                  height: 'auto', 
                  overflowY: 'auto'
                }}>
                  {movie.notes || 'Заметки отсутствуют'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-right-panel">
            {/* Название с годом и теги в одной строке */}
            <div className="form-row" style={{ marginBottom: '15px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                width: '100%',
                overflow: 'hidden'
              }}>
                <h3 style={{ 
                  margin: '0', 
                  textAlign: 'left',
                  maxWidth: '50%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>{getMovieTitle()}</h3>
                
                <div style={{ 
                  display: 'flex', 
                  flex: '1 1 auto', 
                  marginLeft: '10px', 
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                  overflow: 'hidden'
                }}>
                  {movie.isSeries && (
                    <span style={{ 
                      color: 'var(--secondary-color)', 
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}>
                      Сезон {movie.seasons}, Серий {movie.episodes}
                    </span>
                  )}
                  
                  {/* Теги в той же строке */}
                  {movie.tags && movie.tags.length > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '5px', 
                      flexWrap: 'wrap', 
                      justifyContent: 'flex-end',
                      margin: '0 0 0 8px'
                    }}>
                      {movie.isSeries && <span style={{ margin: '0 4px' }}></span>}
                      {movie.tags.map((tag, index) => (
                        <div key={index} className="movie-tag" style={{ 
                          flex: '0 0 auto',
                          backgroundColor: '#2176ff',
                          color: 'white',
                          padding: '3px 10px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          margin: '2px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                          <span>{tag}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Описание - с оптимизированной высотой */}
            <div className="form-row" style={{ marginTop: '0' }}>
              <div className="form-control">
                <label>Описание:</label>
                <div className="description-display" style={{ 
                  maxHeight: '200px',
                  overflowY: 'auto',
                  backgroundColor: 'rgba(245, 245, 245, 0.3)',
                  padding: '10px',
                  borderRadius: '5px' 
                }}>
                  {movie.description || 'Описание отсутствует'}
                </div>
              </div>
            </div>

            {/* Компактный блок с трейлером и кадрами */}
            <div className="form-row" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '20px',
              marginTop: '15px',
              marginBottom: '0'
            }}>
              {/* Компактный трейлер без лейбла */}
              {movie.trailerUrl && (
                <div style={{ 
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '0'
                }}>
                  <div style={{ 
                    width: '350px', 
                    height: '197px',
                    borderRadius: '4px', 
                    overflow: 'hidden'
                  }}>
                    {renderVideo(movie.trailerUrl, 'compact-trailer')}
                  </div>
                </div>
              )}
              
              {/* Компактные кадры из фильма без лейбла и приподнятые вверх */}
              {movie.images && movie.images.filter(media => isImageMedia(media)).length > 0 && (
                <div style={{ 
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '5px'
                }}>
                  <div style={{ 
                    height: '130px',
                    overflow: 'hidden',
                    padding: '0',
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '550px'
                  }}>
                    {renderMovieImages()}
                  </div>
                </div>
              )}
            </div>
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