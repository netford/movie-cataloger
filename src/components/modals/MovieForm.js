import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faUpload, faChevronUp, faChevronDown, faImage, faVideo } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import Modal from './Modal';
import TagSelector from '../tags/TagSelector';
import '../../styles/MovieForm.css';

const MovieForm = ({ movieId = null }) => {
  const { state, dispatch, addMovieToFirestore, updateMovieInFirestore } = useMovies();
  const isEditMode = Boolean(movieId);
  
  // Генерация списка годов от текущего до 1925
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1924 }, (_, i) => currentYear - i);
  
  // Форматируем текущую дату в формат YYYY-MM-DD для полей input type="date"
  const today = new Date().toISOString().slice(0, 10);

  // Находим фильм для редактирования или используем шаблон для нового
  const initialMovie = isEditMode
    ? state.movies.find(m => m.id === movieId)
    : {
        id: '',
        title: '',
        description: '',
        poster: '',
        tags: [],
        status: 'toWatch',
        rating: 50,
        dateAdded: new Date().toISOString(),
        dateWatched: null, // Изначально null для нового фильма
        director: '',
        year: new Date().getFullYear(),
        isSeries: false,
        seasons: 1,
        episodes: null,
        episodeDuration: null,
        duration: 120,
        trailerUrl: '', // Поле для URL трейлера
        images: [],
        notes: ''
      };
  
  const [movie, setMovie] = useState(initialMovie);
  
  // Общий стиль для числовых полей ввода
  const numberInputStyle = {
    height: '30px',
    padding: '4px 6px',
    border: '1px solid var(--gray-color)',
    borderRadius: '3px 0 0 3px',
    appearance: 'textfield',
    MozAppearance: 'textfield',
    WebkitAppearance: 'textfield',
    margin: '0'
  };

  // Общий стиль для кнопки вверх
  const upButtonStyle = {
    border: '1px solid var(--gray-color)',
    borderLeft: 'none',
    borderBottom: 'none',
    background: '#f5f5f5', 
    color: 'var(--dark-gray)', 
    width: '16px', 
    height: '15px',
    fontSize: '8px',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderTopRightRadius: '3px',
  };

  // Общий стиль для кнопки вниз
  const downButtonStyle = {
    border: '1px solid var(--gray-color)',
    borderLeft: 'none',
    background: '#f5f5f5', 
    color: 'var(--dark-gray)', 
    width: '16px', 
    height: '15px',
    fontSize: '8px',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderBottomRightRadius: '3px',
  };
  
  // Вспомогательные функции для обработки изменений формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Преобразуем числовые поля из строк в числа
    if (['rating', 'year', 'duration', 'seasons', 'episodes', 'episodeDuration'].includes(name)) {
      setMovie(prev => ({ ...prev, [name]: value === '' ? null : parseInt(value, 10) }));
    } else {
      setMovie(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleStatusChange = (e) => {
    const status = e.target.value;
    let updates = { status };
    
    // Если статус изменился на "просмотрено", устанавливаем дату просмотра на сегодня
    if (status === 'watched' && !movie.dateWatched) {
      updates.dateWatched = today;
    }
    // Если статус изменился с "просмотрено" на другой, сбрасываем дату просмотра
    else if (status !== 'watched' && movie.status === 'watched') {
      updates.dateWatched = null;
    }
    
    setMovie(prev => ({ ...prev, ...updates }));
  };
  
  // Функция для увеличения или уменьшения рейтинга с шагом 5
  const handleRatingStep = (step) => {
    const newRating = Math.max(0, Math.min(100, (movie.rating || 0) + step));
    setMovie(prev => ({ ...prev, rating: newRating }));
  };
  
  // Функция для валидации рейтинга при ручном вводе
  const handleRatingChange = (e) => {
    let value = e.target.value;
    
    // Если поле пустое, не обновляем состояние (оставляем пустым для дальнейшего ввода)
    if (value === '') {
      setMovie(prev => ({ ...prev, rating: '' }));
      return;
    }
    
    // Преобразуем в число
    value = parseInt(value, 10);
    
    // Валидация: число должно быть от 0 до 100
    if (!isNaN(value)) {
      value = Math.max(0, Math.min(100, value));
      setMovie(prev => ({ ...prev, rating: value }));
    }
  };
  
  // Обработчик увеличения/уменьшения значения поля
  const handleNumberStep = (field, step, min, max) => {
    const currentValue = movie[field] || min;
    let newValue = currentValue + step;
    
    // Проверка на выход за границы диапазона
    newValue = Math.max(min, Math.min(max, newValue));
    
    setMovie(prev => ({ ...prev, [field]: newValue }));
  };

  // Функция для сжатия изображения
  const compressImage = (dataUrl, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Вычисляем размеры с сохранением пропорций
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Получаем сжатое изображение в формате base64
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
    });
  };

  const handlePosterChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        // Сжимаем изображение перед сохранением
        const compressedImage = await compressImage(reader.result, 600, 800);
        setMovie(prev => ({ ...prev, poster: compressedImage }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Обработчик для добавления видео
  const handleAddVideoLink = () => {
    // Запрашиваем ссылку на видео
    const videoUrl = prompt("Введите ссылку на видео (YouTube, Vimeo и др.):");
    if (!videoUrl || !videoUrl.trim()) return;
    
    // Проверяем, что URL корректный
    try {
      new URL(videoUrl);
      // Добавляем видео в массив изображений, но с маркером типа
      setMovie(prev => ({ 
        ...prev, 
        images: [...prev.images, { type: 'video', url: videoUrl.trim() }] 
      }));
    } catch (e) {
      alert("Пожалуйста, введите корректную ссылку на видео");
    }
  };

  // Обновленный обработчик для добавления изображений
  const handleAddImage = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          // Сжимаем изображение кадра перед сохранением
          const compressedImage = await compressImage(reader.result, 400, 300);
          // Для обратной совместимости, можно сохранять как объект или как строку
          // Но для новых изображений лучше сохранять как объект с типом
          setMovie(prev => ({ 
            ...prev, 
            images: [...prev.images, { type: 'image', url: compressedImage }] 
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const handleRemoveImage = (indexToRemove) => {
    setMovie(prev => ({ 
      ...prev, 
      images: prev.images.filter((_, index) => index !== indexToRemove) 
    }));
  };
  
  const handleTypeChange = (e) => {
    const isSeries = e.target.value === 'series';
    setMovie(prev => ({ ...prev, isSeries }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const movieData = {
        ...movie,
        id: isEditMode ? movie.id : '' // id будет сгенерирован Firestore при добавлении
      };
      
      let savedMovie;
      if (isEditMode) {
        savedMovie = await updateMovieInFirestore(movieData);
      } else {
        savedMovie = await addMovieToFirestore(movieData);
      }
      
      // Вместо простого закрытия модального окна, открываем окно просмотра фильма
      dispatch({ 
        type: 'OPEN_MODAL', 
        payload: { type: 'view', movieId: savedMovie.id } 
      });
    } catch (error) {
      console.error("Ошибка при сохранении фильма:", error);
      // Можно добавить отображение ошибки для пользователя
    }
  };
  
  // Определяем, какой режим отображения полей использовать
  const isWatchedStatus = movie.status === 'watched';
  
  // Генерируем уникальный ID для стилей
  const formId = `movie-form-${movieId || 'new'}`;
  
  // Вспомогательная функция для проверки типа медиа
  const isImageMedia = (media) => {
    return typeof media === 'string' || (media.type && media.type === 'image');
  };
  
  // Вспомогательная функция для получения URL медиа
  const getMediaUrl = (media) => {
    return typeof media === 'string' ? media : media.url;
  };
  
  // Функция для отображения миниатюр кадров из фильма в сетке 2×2
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
        height: '100%',
        position: 'relative'
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
        <button
          type="button"
          className="image-remove"
          onClick={() => handleRemoveImage(index)}
          style={{
            position: 'absolute',
            top: '3px',
            right: '3px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--danger-color)',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
            zIndex: '5'
          }}
        >
          ×
        </button>
      </div>
    ));
  };
  
  return (
    <Modal title={isEditMode ? 'Редактирование фильма' : 'Добавление фильма'}>
    {/* Вставляем стили непосредственно в компонент */}
    <style>
      {`
        #${formId} .watched-notes-textarea {
          height: 135px !important;
          max-height: 135px !important;
          min-height: 135px !important;
        }
        
        #${formId} .non-watched-notes-textarea {
          height: 189px !important;
          max-height: 189px !important;
          min-height: 189px !important;
        }
        
        #${formId} .form-right-panel {
          position: relative;
        }
        
        #${formId} .form-right-panel-content {
          margin-bottom: 200px;
        }
      `}
    </style>
    
    <form id={formId} className="movie-form" style={{ height: 'auto', overflow: 'visible' }} onSubmit={handleSubmit}>
      <div className="compact-form-layout" style={{ height: 'auto', overflow: 'visible' }}>
        <div className="form-left-panel">
          <div className="form-poster-container">
            {movie.poster ? (
              <div className="form-poster">
                <img src={movie.poster} alt="Постер фильма" />
                <div className="poster-overlay">
                  <label className="poster-upload-btn" htmlFor="poster-upload">
                    Изменить
                  </label>
                </div>
              </div>
            ) : (
              <label className="form-poster-placeholder" htmlFor="poster-upload">
                <FontAwesomeIcon icon={faUpload} size="2x" style={{ marginBottom: '10px' }} />
                <span>Загрузить постер</span>
              </label>
            )}
            <input
              type="file"
              id="poster-upload"
              accept="image/*"
              onChange={handlePosterChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Добавляем заметки сразу после постера */}
          <div className="form-control" style={{ marginTop: '2px' }}>
            <textarea
              name="notes"
              value={movie.notes}
              onChange={handleInputChange}
              maxLength={130}
              placeholder="Здесь вы можете добавить свой комментарий"
              style={{ 
                height: '75px',
                maxHeight: '75px',
                width: '100%',
                resize: 'none',
                border: '1px solid var(--gray-color)',
                borderRadius: 'var(--border-radius)',
                padding: '6px 8px',
                fontSize: '13px'
              }}
            ></textarea>
            <div style={{ 
              textAlign: 'right', 
              fontSize: '11px', 
              color: 'var(--dark-gray)',
              marginTop: '2px' 
            }}>
              {movie.notes ? movie.notes.length : 0}/130
            </div>
          </div>
          
          
          
          <div className="form-fields-group" style={{ gap: '2px', marginTop: '-5px' }}>
            <div className="form-row" style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              {/* Левая часть верхней строки: при статусе "Просмотрено" - рейтинг, при других статусах - дата добавления */}
              <div className="form-control" style={{ width: '48%' }}>
                {isWatchedStatus ? (
                  <>
                    <label style={{ marginBottom: '2px' }}>Рейтинг:</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="number"
                        name="rating"
                        min="0"
                        max="100"
                        value={movie.rating}
                        onChange={handleRatingChange}
                        style={{...numberInputStyle, width: '60px'}}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button 
                          type="button" 
                          onClick={() => handleRatingStep(5)}
                          style={upButtonStyle}
                        >
                          <FontAwesomeIcon icon={faChevronUp} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleRatingStep(-5)}
                          style={downButtonStyle}
                        >
                          <FontAwesomeIcon icon={faChevronDown} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <label style={{ marginBottom: '2px' }}>Добавлено:</label>
                    <input
                      type="date"
                      name="dateAdded"
                      value={movie.dateAdded.slice(0, 10)}
                      onChange={handleInputChange}
                      className="date-input"
                    />
                  </>
                )}
              </div>

              {/* Статус - всегда справа */}
              <div className="form-control" style={{ width: '48%' }}>
                <label style={{ marginBottom: '2px' }}>Статус:</label>
                <select
                  name="status"
                  value={movie.status}
                  onChange={handleStatusChange}
                  className="hover-select"
                >
                  <option value="toWatch">Запланировано</option>
                  <option value="watching">Смотрим</option>
                  <option value="watched">Просмотрено</option>
                  <option value="cancelled">Отменено</option>
                </select>
              </div>
            </div>
            
            {/* Нижняя часть полей дат */}
            {isWatchedStatus && (
              <div className="form-row" style={{ marginBottom: '4px' }}>
                {/* При статусе "Просмотрено" показываем обе даты */}
                <div className="form-control" style={{ width: '48%' }}>
                  <label style={{ marginBottom: '2px' }}>Добавлено:</label>
                  <input
                    type="date"
                    name="dateAdded"
                    value={movie.dateAdded.slice(0, 10)}
                    onChange={handleInputChange}
                    className="date-input"
                  />
                </div>
                
                <div className="form-control" style={{ width: '48%' }}>
                  <label style={{ marginBottom: '2px' }}>Просмотрено:</label>
                  <input
                    type="date"
                    name="dateWatched"
                    value={movie.dateWatched ? movie.dateWatched.slice(0, 10) : ''}
                    onChange={handleInputChange}
                    className="date-input"
                    required={isWatchedStatus}
                  />
                </div>
              </div>
            )}
            
            <div className="form-row" style={{ marginBottom: '0', marginTop: isWatchedStatus ? '15px' : '25px', display: 'flex', alignItems: 'center' }}>
              <div className="form-control type-selector" style={{ marginRight: '15px' }}>
                <label className="radio-label" style={{ marginTop: '0' }}>
                  <input
                    type="radio"
                    name="contentType"
                    value="movie"
                    checked={!movie.isSeries}
                    onChange={handleTypeChange}
                  />
                  Фильм
                </label>
                <label className="radio-label" style={{ marginTop: '0' }}>
                  <input
                    type="radio"
                    name="contentType"
                    value="series"
                    checked={movie.isSeries}
                    onChange={handleTypeChange}
                  />
                  Сериал
                </label>
              </div>
              
              {/* Добавляем поле Сезон сразу после радиокнопок, только если выбран Сериал */}
              {movie.isSeries && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', marginRight: '5px' }}>Сезон:</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="number"
                      name="seasons"
                      min="1"
                      max="99"
                      value={movie.seasons || ''}
                      onChange={handleInputChange}
                      style={{...numberInputStyle, width: '35px'}}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <button 
                        type="button" 
                        onClick={() => handleNumberStep('seasons', 1, 1, 99)}
                        style={upButtonStyle}
                      >
                        <FontAwesomeIcon icon={faChevronUp} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleNumberStep('seasons', -1, 1, 99)}
                        style={downButtonStyle}
                      >
                        <FontAwesomeIcon icon={faChevronDown} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* А теперь отдельная строка для Серий и Длительности серии, только если выбран Сериал */}
            {movie.isSeries ? (
              <div className="form-row" style={{ marginBottom: '4px', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', marginRight: '5px' }}>Серий:</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="number"
                    name="episodes"
                    min="2"
                    max="300"
                    value={movie.episodes || ''}
                    onChange={handleInputChange}
                    required={movie.isSeries}
                    style={{...numberInputStyle, width: '40px'}}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button 
                      type="button" 
                      onClick={() => handleNumberStep('episodes', 1, 2, 300)}
                      style={upButtonStyle}
                    >
                      <FontAwesomeIcon icon={faChevronUp} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleNumberStep('episodes', -1, 2, 300)}
                      style={downButtonStyle}
                    >
                      <FontAwesomeIcon icon={faChevronDown} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', marginRight: '5px' }}>Длит. серии:</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="number"
                    name="episodeDuration"
                    min="1"
                    max="150"
                    value={movie.episodeDuration || ''}
                    onChange={handleInputChange}
                    required={movie.isSeries}
                    style={{...numberInputStyle, width: '40px'}}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button 
                      type="button" 
                      onClick={() => handleNumberStep('episodeDuration', 1, 1, 150)}
                      style={upButtonStyle}
                    >
                      <FontAwesomeIcon icon={faChevronUp} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleNumberStep('episodeDuration', -1, 1, 150)}
                      style={downButtonStyle}
                    >
                      <FontAwesomeIcon icon={faChevronDown} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            ) : (
              <div className="form-row" style={{ marginBottom: '4px', marginTop: '-5px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', marginRight: '5px' }}>Продолжит. (мин.):</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="number"
                    name="duration"
                    min="1"
                    value={movie.duration || ''}
                    onChange={handleInputChange}
                    required={!movie.isSeries}
                    style={{...numberInputStyle, width: '60px'}}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button 
                      type="button" 
                      onClick={() => handleNumberStep('duration', 5, 1, 999)}
                      style={upButtonStyle}
                    >
                      <FontAwesomeIcon icon={faChevronUp} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleNumberStep('duration', -5, 1, 999)}
                      style={downButtonStyle}
                    >
                      <FontAwesomeIcon icon={faChevronDown} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-right-panel" style={{ position: 'relative' }}>
          {/* Обертка для верхней части правой панели, которая скроллится */}
          <div className="form-right-panel-content" style={{ marginBottom: '270px' }}>
            {/* Название и Год выпуска в одной строке */}
            <div className="form-row title-year-row">
              <div className="form-control title-control">
                <input
                  type="text"
                  name="title"
                  value={movie.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Введите название фильма"
                />
              </div>
              
              <div className="form-control year-control" style={{ width: '80px !important', maxWidth: '80px !important' }}>
                <select 
                  name="year"
                  value={movie.year || currentYear}
                  onChange={handleInputChange}
                  className="hover-select"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Теги в отдельной строке */}
            <div className="form-row">
              <div className="form-control">
                <label>Теги:</label>
                <TagSelector 
                  selectedTags={movie.tags} 
                  onTagsChange={(newTags) => setMovie(prev => ({ ...prev, tags: newTags }))}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-control">
                <label>Описание:</label>
                <textarea
                  name="description"
                  value={movie.description}
                  onChange={handleInputChange}
                  className="description-textarea"
                ></textarea>
              </div>
            </div>
            
            {/* Добавляем блок с трейлером и кадрами в горизонтальном расположении по аналогии с ViewMovie.js */}
            <div className="form-row media-container-row" style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              gap: '15px',
              marginTop: '30px',
              marginBottom: '20px',
              justifyContent: 'space-between',
              paddingRight: '15px'
            }}>
              {/* Секция для предпросмотра трейлера */}
              <div style={{ 
                width: '45%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '5px' }}>
                  <label style={{ 
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>Трейлер:</label>
                </div>
                
                <input
                  type="text"
                  name="trailerUrl"
                  value={movie.trailerUrl}
                  onChange={handleInputChange}
                  placeholder="Вставьте URL YouTube, Vimeo или Rutube"
                  style={{ 
                    width: '100%', 
                    padding: '6px 8px', 
                    borderRadius: 'var(--border-radius)', 
                    border: '1px solid var(--gray-color)', 
                    fontSize: '13px',
                    marginBottom: '5px'
                  }}
                />
                
                <div style={{ 
                  width: '100%',
                  height: '145px',
                  borderRadius: '4px', 
                  overflow: 'hidden',
                  backgroundColor: 'rgba(245, 245, 245, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed var(--gray-color)'
                }}>
                  {movie.trailerUrl ? (
                    <div style={{ width: '100%', height: '100%', fontSize: '13px', color: 'var(--dark-gray)', textAlign: 'center' }}>
                      <div style={{ paddingTop: '60px' }}>
                        URL трейлера указан. Будет доступен при просмотре фильма.
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--dark-gray)', textAlign: 'center' }}>
                      Укажите URL трейлера в поле выше
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--dark-gray)', marginTop: '3px', width: '100%' }}>
                  Поддерживаются YouTube, Vimeo и Rutube
                </div>
              </div>
              
              {/* Секция для кадров из фильма в сетке 2×2 */}
              <div style={{ 
                width: '50%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label style={{ 
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>Кадры из фильма:</label>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label htmlFor="image-upload" style={{ 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      color: 'var(--primary-color)'
                    }}>
                      <FontAwesomeIcon icon={faImage} />
                      Добавить
                    </label>
                    <button 
                      type="button"
                      onClick={handleAddVideoLink}
                      style={{ 
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '12px',
                        color: 'var(--primary-color)'
                      }}
                    >
                      <FontAwesomeIcon icon={faVideo} />
                      Видео
                    </button>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      multiple
                      onChange={handleAddImage}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                
                <div style={{ 
                  width: '100%',
                  height: '180px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gridTemplateRows: 'repeat(2, 1fr)',
                  gap: '10px'
                }}>
                  {movie.images && movie.images.filter(media => isImageMedia(media)).length > 0 ? (
                    renderMovieImagesGrid()
                  ) : (
                    <>
                      <div style={{ 
                        gridColumn: '1 / 3', 
                        gridRow: '1 / 3', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px dashed var(--gray-color)',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(245, 245, 245, 0.3)',
                        color: 'var(--dark-gray)',
                        fontSize: '13px'
                      }}>
                        Добавьте кадры из фильма
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => dispatch({ type: 'CLOSE_MODAL' })}
        >
          <FontAwesomeIcon icon={faTimes} /> Отмена
        </button>
        <button type="submit" className="btn btn-primary">
          <FontAwesomeIcon icon={faSave} /> Сохранить
        </button>
      </div>
    </form>
  </Modal>
);
};

export default MovieForm;