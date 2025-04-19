import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faTimes, 
  faUpload, 
  faChevronUp, 
  faChevronDown, 
  faPlay, 
  faPlus,
  faLink
} from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import Modal from './Modal';
import TagSelector from '../tags/TagSelector';
import '../../styles/MovieForm.css';
import '../../styles/Tags.css';

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
        watchLink: '', // Поле для ссылки Смотреть/Скачать
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

  // Функция для изменения URL трейлера
  const handleTrailerUrlChange = () => {
    // Запрашиваем ссылку на трейлер, предзаполняя существующим URL
    const trailerUrl = prompt("Введите ссылку на трейлер (YouTube, Vimeo и др.):", movie.trailerUrl || "");
    if (!trailerUrl || !trailerUrl.trim()) return;
    
    // Проверяем, что URL корректный
    try {
      new URL(trailerUrl);
      setMovie(prev => ({ ...prev, trailerUrl: trailerUrl.trim() }));
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
          setMovie(prev => ({ 
            ...prev, 
            images: [...prev.images, compressedImage] 
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

  const handleRemoveTrailer = () => {
    setMovie(prev => ({ ...prev, trailerUrl: '' }));
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

  // Функции для работы с трейлером, аналогичные ViewMovie.js
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const getVimeoEmbedUrl = (url) => {
    if (!url) return null;
    
    const regExp = /vimeo.com\/(\d+)/;
    const match = url.match(regExp);
    
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  };

  const getRutubeEmbedUrl = (url) => {
    if (!url) return null;
    
    const regExp = /rutube.ru\/video\/([a-zA-Z0-9]+)/;
    const match = url.match(regExp);
    
    return match ? `https://rutube.ru/play/embed/${match[1]}` : null;
  };

  const renderTrailerPreview = () => {
    if (!movie.trailerUrl) return null;
    
    const youtubeEmbedUrl = getYoutubeEmbedUrl(movie.trailerUrl);
    const vimeoEmbedUrl = getVimeoEmbedUrl(movie.trailerUrl);
    const rutubeEmbedUrl = getRutubeEmbedUrl(movie.trailerUrl);
    
    if (youtubeEmbedUrl) {
      return (
        <iframe
          title="Трейлер"
          src={youtubeEmbedUrl}
          frameBorder="0"
          allowFullScreen
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        ></iframe>
      );
    } else if (vimeoEmbedUrl) {
      return (
        <iframe
          title="Трейлер"
          src={vimeoEmbedUrl}
          frameBorder="0"
          allowFullScreen
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        ></iframe>
      );
    } else if (rutubeEmbedUrl) {
      return (
        <iframe
          title="Трейлер"
          src={rutubeEmbedUrl}
          frameBorder="0"
          allowFullScreen
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        ></iframe>
      );
    } else {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          color: 'var(--primary-color)'
        }}>
          <FontAwesomeIcon icon={faPlay} size="2x" style={{ marginBottom: '5px' }} />
          <span style={{ fontSize: '14px' }}>Внешнее видео</span>
          <a 
            href={movie.trailerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              fontSize: '12px', 
              marginTop: '5px',
              color: 'var(--primary-color)',
              textDecoration: 'none'
            }}
          >
            Открыть ссылку
          </a>
        </div>
      );
    }
  };
  
  // Определяем, какой режим отображения полей использовать
  const isWatchedStatus = movie.status === 'watched';
  
  // Функция для изменения URL ссылки Смотреть/Скачать
  const handleWatchLinkChange = () => {
    // Запрашиваем ссылку, предзаполняя существующим URL
    const watchLink = prompt("Введите ссылку где смотреть/скачать:", movie.watchLink || "");
    if (watchLink === null) return; // Пользователь нажал "Отмена"
    
    // Проверяем, что URL корректный, если введен
    try {
      if (watchLink.trim()) {
        new URL(watchLink);
      }
      setMovie(prev => ({ ...prev, watchLink: watchLink.trim() }));
    } catch (e) {
      alert("Пожалуйста, введите корректную ссылку");
    }
  };
  
  return (
    <Modal title={isEditMode ? 'Редактирование фильма' : 'Добавление фильма'}>
      <div className="movie-form" style={{ height: 'auto', overflow: 'hidden' }}>
        <div className="compact-form-layout" style={{ height: 'auto', overflow: 'visible', paddingTop: '5px', paddingBottom: '70px' }}>
          <div className="form-left-panel">
            {/* Блок с постером */}
            <div className="form-poster-container" style={{ marginTop: '5px' }}>
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
            
            <div className="form-fields-group" style={{ gap: '2px', marginTop: '-5px' }}>
              <div className="form-row" style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                {/* Левая часть верхней строки: при статусе "Просмотрено" - рейтинг, при других статусах - дата добавления */}
                <div className="form-control" style={{ width: '48%' }}>
                  {isWatchedStatus ? (
                    <>
                      <label style={{ marginBottom: '2px', fontWeight: 'bold', fontSize: '14px' }}>Рейтинг:</label>
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
                      <label style={{ marginBottom: '2px', fontWeight: 'bold', fontSize: '14px' }}>Добавлено:</label>
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
                  <label style={{ marginBottom: '2px', fontWeight: 'bold', fontSize: '14px' }}>Статус:</label>
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
                    <label style={{ marginBottom: '2px', fontWeight: 'bold', fontSize: '14px' }}>Добавлено:</label>
                    <input
                      type="date"
                      name="dateAdded"
                      value={movie.dateAdded.slice(0, 10)}
                      onChange={handleInputChange}
                      className="date-input"
                    />
                  </div>
                  
                  <div className="form-control" style={{ width: '48%' }}>
                    <label style={{ marginBottom: '2px', fontWeight: 'bold', fontSize: '14px' }}>Просмотрено:</label>
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
              
              <div className="form-row" style={{ marginBottom: '0', marginTop: isWatchedStatus ? '8px' : '12px', display: 'flex', alignItems: 'center' }}>
                <div className="form-control type-selector" style={{ marginRight: '15px' }}>
                  <label className="radio-label" style={{ marginTop: '0', fontWeight: 'bold', fontSize: '14px' }}>
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
                    <span style={{ fontSize: '12px', marginRight: '5px', fontWeight: 'bold' }}>Сезон:</span>
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
                  <span style={{ fontSize: '12px', marginRight: '5px', fontWeight: 'bold' }}>Серий:</span>
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
                  <span style={{ fontSize: '12px', marginRight: '5px', fontWeight: 'bold' }}>Длит. серии: </span>
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
                  <span style={{ fontSize: '12px', marginRight: '5px', fontWeight: 'bold' }}>Продолжит. (мин.):</span>
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

            {/* Мои заметки */}
            <div className="form-control" style={{ marginTop: '8px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '3px'
              }}>
                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Мои заметки:</label>
                <span style={{ 
                  fontSize: '11px', 
                  color: 'var(--dark-gray)'
                }}>
                  {movie.notes ? movie.notes.length : 0}/130
                </span>
              </div>
              <textarea
                name="notes"
                value={movie.notes}
                onChange={handleInputChange}
                maxLength={130}
                placeholder="Здесь вы можете добавить свой комментарий"
                style={{ 
                  height: '70px',
                  maxHeight: '70px',
                  width: '100%',
                  resize: 'none',
                  border: '1px solid var(--gray-color)',
                  borderRadius: 'var(--border-radius)',
                  padding: '6px 8px',
                  fontSize: '13px'
                }}
              ></textarea>
            </div>
          </div>
          
          <div className="form-right-panel" style={{ position: 'relative' }}>
            {/* Обертка для верхней части правой панели, которая скроллится */}
            <div className="form-right-panel-content" style={{ marginBottom: '0' }}>
              {/* Название и Год выпуска в одной строке */}
              <div className="form-row title-year-row" style={{ marginTop: '5px' }}>
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
              
              {/* Теги в отдельной строке, поделенной с полем для ссылки */}
              <div className="form-row" style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                gap: '15px'
              }}>
                {/* Теги (слева) */}
                <div className="form-control" style={{ width: '48%' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Теги:</label>
                  <TagSelector 
                    selectedTags={movie.tags} 
                    onTagsChange={(newTags) => setMovie(prev => ({ ...prev, tags: newTags }))}
                  />
                </div>
                
                {/* Поле для ссылки Смотреть/Скачать (справа) */}
                <div className="form-control" style={{ width: '48%' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Смотреть/Скачать:</label>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--gray-color)',
                    borderRadius: '0',
                    padding: '3px 8px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    minHeight: '34px'
                  }} onClick={handleWatchLinkChange}>
                    {movie.watchLink ? (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        width: '100%',
                        overflow: 'hidden'
                      }}>
                        <span style={{ 
                          fontSize: '13px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '85%'
                        }}>
                          {movie.watchLink}
                        </span>
                        <FontAwesomeIcon 
                          icon={faLink} 
                          style={{ 
                            color: 'var(--primary-color)',
                            marginLeft: '5px'
                          }} 
                        />
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: 'var(--gray-color)',
                        width: '100%',
                        fontSize: '13px'
                      }}>
                        <FontAwesomeIcon 
                          icon={faLink} 
                          style={{ marginRight: '8px' }} 
                        />
                        <span>Добавить ссылку</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-control">
                  <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Описание:</label>
                  <textarea
                    name="description"
                    value={movie.description}
                    onChange={handleInputChange}
                    className="description-textarea"
                    style={{
                      maxHeight: '290px',
                      height: '290px',
                      overflowY: 'auto',
                      backgroundColor: 'rgba(245, 245, 245, 0.3)',
                      padding: '10px',
                      borderRadius: '0'
                    }}
                  ></textarea>
                </div>
              </div>
              
              {/* Блок с трейлером и кадрами в горизонтальном расположении */}
              <div className="form-row media-container-row" style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                gap: '15px',
                                  marginTop: '20px',
                marginBottom: '0',
                justifyContent: 'space-between',
                paddingRight: '15px'
              }}>
                {/* Трейлер слева */}
                <div style={{ 
                  width: '45%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    width: '100%', 
                    marginBottom: '5px',
                    alignItems: 'center'
                  }}>
                    <label style={{ 
                      fontWeight: 'bold', 
                      fontSize: '14px',
                      alignSelf: 'flex-start'
                    }}>Трейлер:</label>
                    
                    {movie.trailerUrl && (
                      <button
                        type="button"
                        onClick={handleTrailerUrlChange}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '12px',
                          color: 'var(--primary-color)',
                          cursor: 'pointer',
                          padding: '5px',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <FontAwesomeIcon icon={faPlay} /> Изменить трейлер
                      </button>
                    )}
                  </div>
                  
                  <div style={{ 
                    width: '100%',
                    height: '200px',
                    borderRadius: '4px', 
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: movie.trailerUrl ? '#000' : '#f0f0f0',
                    border: movie.trailerUrl ? 'none' : '1px dashed var(--gray-color)'
                  }}>
                    {movie.trailerUrl ? (
                      <>
                        {renderTrailerPreview()}
                        <button
                          type="button"
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--danger-color)',
                            cursor: 'pointer',
                            zIndex: 5
                          }}
                          onClick={handleRemoveTrailer}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={handleTrailerUrlChange}
                      >
                        <FontAwesomeIcon icon={faPlay} size="2x" style={{ marginBottom: '10px', color: 'var(--primary-color)' }} />
                        <span style={{ color: 'var(--dark-gray)' }}>Добавьте трейлер</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Кадры из фильма в сетке 2×2 */}
                <div style={{ 
                  width: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    width: '100%', 
                    marginBottom: '5px',
                    alignItems: 'center'
                  }}>
                    <label style={{ 
                      fontWeight: 'bold', 
                      fontSize: '14px',
                      alignSelf: 'flex-start'
                    }}>Кадры из фильма:</label>
                    
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      multiple
                      onChange={handleAddImage}
                      style={{ display: 'none' }}
                    />
                  </div>
                  
                  <div style={{ 
                    width: '100%',
                    height: '200px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gridTemplateRows: 'repeat(2, 1fr)',
                    gap: '10px'
                  }}>
                    {movie.images && movie.images.length > 0 ? (
                      movie.images.slice(0, 4).map((imageUrl, index) => (
                        <div key={index} style={{
                          borderRadius: '4px',
                          overflow: 'hidden',
                          width: '100%',
                          height: '100%',
                          position: 'relative'
                        }}>
                          <img 
                            src={imageUrl} 
                            alt={`Кадр ${index + 1}`} 
                            style={{
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover'
                            }}
                          />
                          <button
                            type="button"
                            style={{
                              position: 'absolute',
                              top: '3px',
                              right: '3px',
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--danger-color)',
                              cursor: 'pointer',
                              zIndex: 5
                            }}
                            onClick={() => handleRemoveImage(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : null}
                    
                    {/* Если изображений меньше 4, показываем кнопки добавления */}
                    {movie.images.length < 4 && Array.from({ length: 4 - movie.images.length }).map((_, index) => (
                      <label 
                        key={`add-placeholder-${index}`}
                        htmlFor="image-upload"
                        style={{
                          borderRadius: '4px',
                          border: '1px dashed var(--gray-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          backgroundColor: '#f9f9f9'
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </label>
                    ))}
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
          <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
            <FontAwesomeIcon icon={faSave} /> Сохранить
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MovieForm;