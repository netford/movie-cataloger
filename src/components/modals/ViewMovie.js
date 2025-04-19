import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faTimes, faPlay, faFilm, faPlus, faTags, faLink, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
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
  
  // Функция для определения цвета рейтинга
  const getRatingColor = (rating) => {
    if (rating >= 86) return '#FFD700'; // Золотистый - шедевр
    if (rating >= 71) return '#1976D2'; // Синий - хороший фильм
    if (rating >= 51) return '#7B1FA2'; // Фиолетовый - средний/неплохой
    if (rating >= 31) return '#D32F2F'; // Тёмно-красный - слабый фильм
    return '#9E9E9E';                   // Серый - не стоит тратить время
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
              <span>Серия: ~</span>{movie.episodeDuration} мин.
            </div>
            <div style={{ marginTop: '3px', fontSize: '14px' }}>
              <span>Общая: ~</span>{totalMinutes} мин. 
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

  // Рендерим кадры из фильма в линейном виде (для совместимости)
  // eslint-disable-next-line no-unused-vars
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

  // Рендерим кадры из фильма в сетке 2×2
  const renderMovieImagesGrid = () => {
    if (!movie.images || movie.images.length === 0) return null;
    
    // Фильтруем только изображения
    const images = movie.images.filter(media => isImageMedia(media));
    
    if (images.length === 0) return null;
    
    // Ограничиваем количество отображаемых кадров до 4 для сетки 2×2
    const limitedImages = images.slice(0, 4);
    
    return limitedImages.map((media, index) => (
      <div key={index} className="movie-image-grid" style={{
        borderRadius: '4px',
        overflow: 'hidden',
        width: '100%',
        height: '100%'
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
    ));
  };
  
  // Проверяем, есть ли рейтинг у фильма
  const hasRating = movie.rating !== null && movie.rating !== undefined;
  
  return (
    <Modal title="Детальная информация о фильме">
      <div className="movie-form" style={{ height: '850px', overflow: 'auto' }}>
        <div className="compact-form-layout" style={{ height: '780px', overflow: 'visible', paddingTop: '10px' }}>
          <div className="form-left-panel">
            {/* Блок с постером */}
            <div className="form-poster-container" style={{ marginTop: '5px' }}>
              <div className="form-poster">
                {movie.poster ? (
                  <img src={movie.poster} alt={movie.title} />
                ) : (
                  <div className="poster-placeholder">
                    <FontAwesomeIcon icon={faFilm} size="2x" />
                  </div>
                )}
                
                {/* Рейтинг вверху слева - с цветовой градацией */}
                {hasRating && movie.status === 'watched' && (
                  <div style={{ 
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
                                
                {/* Статус вверху справа */}
                <div style={{ 
                  position: 'absolute', 
                  top: '0',
                  right: '0', 
                  padding: '5px 15px',
                  backgroundColor: movie.status === 'watched' ? 'rgba(39, 174, 96, 0.7)' : // Менее прозрачный зелёный
                              movie.status === 'toWatch' ? 'rgba(52, 152, 219, 0.7)' : // Менее прозрачный синий
                              movie.status === 'watching' ? 'rgba(243, 156, 18, 0.7)' : // Менее прозрачный оранжевый
                              'rgba(127, 140, 141, 0.7)', // Менее прозрачный серый
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  zIndex: 10,
                  backdropFilter: 'blur(2px)'
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
              {movie.notes && (
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
                    {movie.notes}
                  </div>
                </div>
              )}
              
              {/* Ссылка Смотреть/Скачать - перемещена в конец левой панели */}
              {movie.watchLink && (
                <div className="form-row" style={{ 
                  margin: '20px 0 0',
                  width: '100%'
                }}>
                  <div className="form-control" style={{ width: '100%' }}>
                    <div style={{ 
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'rgba(245, 245, 245, 0.5)',
                      padding: '10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: '1px solid rgba(200, 200, 200, 0.5)',
                      transition: 'all 0.2s ease-in-out'
                    }}>
                      <a 
                        href={movie.watchLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--primary-color)',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement.style.backgroundColor = 'rgba(235, 235, 235, 0.9)';
                          e.currentTarget.parentElement.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.color = '#1565C0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement.style.backgroundColor = 'rgba(245, 245, 245, 0.5)';
                          e.currentTarget.parentElement.style.boxShadow = 'none';
                          e.currentTarget.style.color = 'var(--primary-color)';
                        }}
                      >
                        <FontAwesomeIcon icon={faExternalLinkAlt} style={{ flexShrink: 0 }} />
                        <span style={{
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap'
                        }}>
                          Смотреть/Скачать
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="form-right-panel">
            {/* Название с годом и теги в одной строке */}
            <div className="form-row" style={{ marginBottom: '15px', marginTop: '5px' }}>
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
                          backgroundColor: '#9b59b6',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'normal',
                          margin: '2px',
                          boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}>
                          <FontAwesomeIcon icon={faTags} size="xs" style={{ marginRight: '3px', fontSize: '8px' }} />
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
                  maxHeight: '300px',
                  height: '300px',
                  overflowY: 'auto',
                  backgroundColor: 'rgba(245, 245, 245, 0.3)',
                  padding: '10px',
                  borderRadius: '5px' 
                }}>
                  {movie.description || 'Описание отсутствует'}
                </div>
              </div>
            </div>

            {/* Блок с трейлером и кадрами в горизонтальном расположении */}
            <div className="form-row media-container-row" style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              gap: '15px',
              marginTop: '30px',
              marginBottom: '0',
              justifyContent: 'space-between',
              paddingRight: '15px'
            }}>
              {/* Трейлер слева - показываем либо трейлер, либо плейсхолдер */}
              <div style={{ 
                width: '45%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
                <label style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '5px', 
                  fontSize: '14px' 
                }}>Трейлер:</label>
                <div style={{ 
                  width: '100%',
                  height: '200px',
                  borderRadius: '4px', 
                  overflow: 'hidden',
                  backgroundColor: movie.trailerUrl ? '#000' : '#f0f0f0',
                  border: movie.trailerUrl ? 'none' : '1px dashed var(--gray-color)'
                }}>
                  {movie.trailerUrl ? (
                    renderVideo(movie.trailerUrl, 'compact-trailer')
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--primary-color)'
                    }}
                    onClick={() => handleEdit()} // При клике на плейсхолдер переходим к редактированию
                    >
                      <FontAwesomeIcon icon={faPlay} size="2x" style={{ marginBottom: '10px', opacity: 0.7 }} />
                      <span style={{ fontSize: '14px', color: 'var(--dark-gray)' }}>Трейлер отсутствует</span>
                      <button 
                        className="btn" 
                        style={{ 
                          marginTop: '10px', 
                          padding: '5px 10px', 
                          fontSize: '12px', 
                          backgroundColor: 'var(--primary-color)', 
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px'
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // Предотвращаем переход к редактированию
                          handleEdit(); // Открываем форму редактирования
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} /> Добавить трейлер
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Кадры справа в сетке 2×2 - всегда фиксированной ширины */}
              {movie.images && movie.images.filter(media => isImageMedia(media)).length > 0 ? (
                <div style={{ 
                  width: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}>
                  <label style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '5px', 
                    fontSize: '14px',
                    alignSelf: 'flex-start'
                  }}>Кадры из фильма:</label>
                  <div style={{ 
                    width: '100%',
                    height: '200px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gridTemplateRows: 'repeat(2, 1fr)',
                    gap: '10px'
                  }}>
                    {renderMovieImagesGrid()}
                  </div>
                </div>
              ) : (
                <div style={{ 
                  width: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}>
                  <label style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '5px', 
                    fontSize: '14px',
                    alignSelf: 'flex-start'
                  }}>Кадры из фильма:</label>
                  <div style={{ 
                    width: '100%',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f0f0f0',
                    border: '1px dashed var(--gray-color)',
                    borderRadius: '4px'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      color: 'var(--dark-gray)'
                    }}>
                      <FontAwesomeIcon icon={faPlus} size="2x" style={{ marginBottom: '10px', opacity: 0.5 }} />
                      <div>Нет загруженных кадров</div>
                      <button 
                        className="btn" 
                        style={{ 
                          marginTop: '10px', 
                          padding: '5px 10px', 
                          fontSize: '12px', 
                          backgroundColor: 'var(--primary-color)', 
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px'
                        }}
                        onClick={handleEdit}
                      >
                        <FontAwesomeIcon icon={faEdit} /> Добавить кадры
                      </button>
                    </div>
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