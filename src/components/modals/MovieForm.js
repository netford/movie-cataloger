import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faPlus, faUpload, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import Modal from './Modal';
import '../../styles/MovieForm.css';

const MovieForm = ({ movieId = null }) => {
  const { state, dispatch, addMovieToFirestore, updateMovieInFirestore, addTagToFirestore } = useMovies();
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
        dateWatched: today, // Устанавливаем текущую дату по умолчанию
        director: '',
        year: new Date().getFullYear(),
        isSeries: false,
        seasons: 1,
        episodes: null,
        episodeDuration: null,
        duration: 120,
        trailerUrl: '',
        images: [],
        notes: ''
      };
  
  const [movie, setMovie] = useState(initialMovie);
  const [newTagName, setNewTagName] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const tagInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Фильтрованные теги для предложений
  const filteredTags = newTagName
    ? state.tags
        .filter(tag => 
          tag.name.toLowerCase().includes(newTagName.toLowerCase()) &&
          !movie.tags.includes(tag.name)
        )
        .sort((a, b) => {
          // Сначала показываем теги, которые начинаются с введенного текста
          const aStartsWith = a.name.toLowerCase().startsWith(newTagName.toLowerCase());
          const bStartsWith = b.name.toLowerCase().startsWith(newTagName.toLowerCase());
          
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          return a.name.localeCompare(b.name);
        })
    : [];
  
  // Закрытие выпадающего списка при клике вне него
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        tagInputRef.current && 
        !tagInputRef.current.contains(event.target)
      ) {
        setShowTagSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
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
    
    // Если статус изменился на "просмотрено", устанавливаем дату просмотра
    if (status === 'watched' && !movie.dateWatched) {
      updates.dateWatched = today;
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
  
  // Обработчик добавления нового тега
  const handleAddTag = async (tagNameParam) => {
    const tagName = tagNameParam || newTagName;
    
    if (!tagName.trim()) return;
    
    // Проверяем, не выбран ли уже этот тег
    if (movie.tags.includes(tagName.trim())) {
      setNewTagName('');
      return;
    }
    
    // Проверяем, существует ли уже такой тег в системе
    const existingTag = state.tags.find(
      tag => tag.name.toLowerCase() === tagName.trim().toLowerCase()
    );
    
    if (existingTag) {
      // Если тег существует, просто добавляем его к выбранным
      setMovie(prev => ({ 
        ...prev, 
        tags: [...prev.tags, existingTag.name] 
      }));
    } else {
      // Создаем новый тег
      try {
        const newTag = {
          name: tagName.trim(),
          count: 1
        };
        
        const createdTag = await addTagToFirestore(newTag);
        
        // Добавляем новый тег к выбранным
        setMovie(prev => ({ 
          ...prev, 
          tags: [...prev.tags, createdTag.name] 
        }));
      } catch (error) {
        console.error('Ошибка при создании тега:', error);
      }
    }
    
    setNewTagName('');
    setShowTagSuggestions(false);
  };
  
  // Обработчик удаления тега
  const handleRemoveTag = (tagName) => {
    const updatedTags = movie.tags.filter(tag => tag !== tagName);
    setMovie(prev => ({ ...prev, tags: updatedTags }));
  };

  // Обработчик нажатия клавиш в поле ввода тега
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (filteredTags.length > 0) {
        // Если есть предложения, выбираем первый тег
        handleAddTag(filteredTags[0].name);
      } else if (newTagName.trim()) {
        // Если предложений нет, создаем новый тег
        handleAddTag();
      }
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
    }
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
  
  return (
    <Modal title={isEditMode ? 'Редактирование фильма' : 'Добавление фильма'}>
      <form className="movie-form" onSubmit={handleSubmit}>
        <div className="compact-form-layout">
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
            
            <div className="form-fields-group">
              <div className="form-row">
                <div className="form-control">
                  <label>Рейтинг:</label>
                  <div className="rating-number-input">
                    <input
                      type="number"
                      name="rating"
                      min="0"
                      max="100"
                      value={movie.rating}
                      onChange={handleRatingChange}
                      className="rating-input"
                    />
                    <div className="rating-controls">
                      <button 
                        type="button" 
                        className="rating-btn" 
                        onClick={() => handleRatingStep(5)}
                      >
                        <FontAwesomeIcon icon={faChevronUp} />
                      </button>
                      <button 
                        type="button" 
                        className="rating-btn" 
                        onClick={() => handleRatingStep(-5)}
                      >
                        <FontAwesomeIcon icon={faChevronDown} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="form-control">
                  <label>Статус:</label>
                  <select
                    name="status"
                    value={movie.status}
                    onChange={handleStatusChange}
                  >
                    <option value="toWatch">Запланировано</option>
                    <option value="watching">Смотрим</option>
                    <option value="watched">Просмотрено</option>
                    <option value="cancelled">Отменено</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-control">
                  <label>Добавлено:</label>
                  <input
                    type="date"
                    name="dateAdded"
                    value={movie.dateAdded.slice(0, 10)}
                    onChange={handleInputChange}
                    className="date-input"
                  />
                </div>
                
                <div className="form-control">
                  <label>Просмотрено:</label>
                  <input
                    type="date"
                    name="dateWatched"
                    value={movie.dateWatched ? movie.dateWatched.slice(0, 10) : ''}
                    onChange={handleInputChange}
                    className="date-input"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-control type-selector">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="contentType"
                      value="movie"
                      checked={!movie.isSeries}
                      onChange={handleTypeChange}
                    />
                    Фильм
                  </label>
                  <label className="radio-label">
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
              </div>
              
              <div className="left-panel-bottom">
                {movie.isSeries ? (
                  <div className="series-details">
                    <div className="form-row">
                      <div className="form-control">
                        <label>Сезонов:</label>
                        <input
                          type="number"
                          name="seasons"
                          min="1"
                          value={movie.seasons || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="form-control">
                        <label>Серий:</label>
                        <input
                          type="number"
                          name="episodes"
                          min="1"
                          value={movie.episodes || ''}
                          onChange={handleInputChange}
                          required={movie.isSeries}
                        />
                      </div>
                      
                      <div className="form-control">
                        <label>Длит. серии:</label>
                        <input
                          type="number"
                          name="episodeDuration"
                          min="1"
                          value={movie.episodeDuration || ''}
                          onChange={handleInputChange}
                          required={movie.isSeries}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="form-row">
                    <div className="form-control">
                      <label>Продолжительность (мин):</label>
                      <input
                        type="number"
                        name="duration"
                        min="1"
                        value={movie.duration || ''}
                        onChange={handleInputChange}
                        required={!movie.isSeries}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-right-panel">
            {/* Название и Год выпуска в одной строке */}
            <div className="form-row title-year-row">
              <div className="form-control title-control">
                <label>Название:</label>
                <input
                  type="text"
                  name="title"
                  value={movie.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-control year-control">
                <label>Год выпуска:</label>
                <select 
                  name="year"
                  value={movie.year || currentYear}
                  onChange={handleInputChange}
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Теги в отдельной строке */}
            <div className="form-row">
              <div className="form-control tags-control">
                <label>Теги:</label>
                <div className="tag-input-row">
                  <div className="tag-input-container">
                    <input
                      ref={tagInputRef}
                      type="text"
                      value={newTagName}
                      onChange={(e) => {
                        setNewTagName(e.target.value);
                        setShowTagSuggestions(!!e.target.value.trim());
                      }}
                      onFocus={() => setShowTagSuggestions(!!newTagName.trim())}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Введите тег"
                      className="tag-input"
                    />
                    {newTagName.trim() && (
                      <button
                        type="button"
                        className="add-tag-btn"
                        onClick={() => handleAddTag()}
                        title="Добавить тег"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    )}
                    
                    {/* Выпадающий список с подсказками тегов */}
                    {showTagSuggestions && filteredTags.length > 0 && (
                      <div ref={suggestionsRef} className="tag-suggestions">
                        {filteredTags.map(tag => (
                          <div
                            key={tag.id}
                            className="tag-suggestion-item"
                            onClick={() => {
                              handleAddTag(tag.name);
                              setShowTagSuggestions(false);
                            }}
                          >
                            {tag.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="tags-content">
                    {movie.tags.length === 0 ? (
                      <div className="tags-hint">
                        Добавьте теги для удобной категоризации фильма
                      </div>
                    ) : (
                      <div className="tags-container">
                        {movie.tags.map((tag, index) => (
                          <div key={index} className="tag">
                            <span>{tag}</span>
                            <button
                              type="button"
                              className="tag-remove"
                              onClick={() => handleRemoveTag(tag)}
                              title="Удалить тег"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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
            
            <div className="form-row">
              <div className="form-control">
                <label>URL трейлера:</label>
                <input
                  type="text"
                  name="trailerUrl"
                  value={movie.trailerUrl}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-control">
                <div className="images-label-row">
                  <label>Кадры из фильма:</label>
                </div>
                <div className="images-container">
                  {movie.images.map((img, index) => (
                    <div key={index} className="movie-image">
                      <img src={img} alt={`Кадр ${index + 1}`} />
                      <button
                        type="button"
                        className="image-remove"
                        onClick={() => handleRemoveImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <label htmlFor="image-upload" className="add-image-placeholder">
                    <FontAwesomeIcon icon={faPlus} />
                  </label>
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
            </div>
            
            <div className="form-row">
              <div className="form-control">
                <label>Мои заметки:</label>
                <textarea
                  name="notes"
                  value={movie.notes}
                  onChange={handleInputChange}
                  className="notes-textarea"
                ></textarea>
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