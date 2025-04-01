import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faPlus, faUpload, faFilm } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import Modal from './Modal';
import { v4 as uuidv4 } from 'uuid';
import '../../styles/MovieForm.css';

const MovieForm = ({ movieId = null }) => {
  const { state, dispatch } = useMovies();
  const isEditMode = Boolean(movieId);
  
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
        dateWatched: null,
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
  const [newTag, setNewTag] = useState('');
  
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
      updates.dateWatched = new Date().toISOString();
    }
    
    setMovie(prev => ({ ...prev, ...updates }));
  };
  
  const handleRatingChange = (e) => {
    const rating = Number(e.target.value);
    setMovie(prev => ({ ...prev, rating }));
  };
  
  const handleTagAdd = () => {
    if (newTag.trim() && !movie.tags.includes(newTag.trim())) {
      setMovie(prev => ({ 
        ...prev, 
        tags: [...prev.tags, newTag.trim()] 
      }));
      setNewTag('');
    }
  };
  
  const handleTagRemove = (tagToRemove) => {
    setMovie(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };
  
  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMovie(prev => ({ ...prev, poster: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddImage = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMovie(prev => ({ 
            ...prev, 
            images: [...prev.images, reader.result] 
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
  
  const handleKeyDown = (e) => {
    // Добавление тега по Enter
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      handleTagAdd();
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const movieData = {
      ...movie,
      id: isEditMode ? movie.id : uuidv4()
    };
    
    if (isEditMode) {
      dispatch({ type: 'UPDATE_MOVIE', payload: movieData });
    } else {
      dispatch({ type: 'ADD_MOVIE', payload: movieData });
    }
    
    dispatch({ type: 'CLOSE_MODAL' });
  };
  
  return (
    <Modal title={isEditMode ? 'Редактирование фильма' : 'Добавление фильма'}>
      <form className="movie-form" onSubmit={handleSubmit}>
        <div className="form-layout">
          <div className="form-column form-column-left">
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
            
            <div className="form-group">
              <label>Рейтинг: {movie.rating}/100</label>
              <input
                type="range"
                name="rating"
                min="0"
                max="100"
                value={movie.rating}
                onChange={handleRatingChange}
                className="rating-slider"
              />
            </div>
            
            <div className="form-group">
              <label>Статус:</label>
              <select
                name="status"
                value={movie.status}
                onChange={handleStatusChange}
              >
                <option value="watched">Просмотрено</option>
                <option value="toWatch">Планирую посмотреть</option>
                <option value="cancelled">Отменён</option>
              </select>
            </div>
            
            {movie.status === 'watched' && (
              <div className="form-group">
                <label>Дата просмотра:</label>
                <input
                  type="date"
                  name="dateWatched"
                  value={movie.dateWatched ? movie.dateWatched.slice(0, 10) : ''}
                  onChange={handleInputChange}
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Дата добавления:</label>
              <input
                type="date"
                name="dateAdded"
                value={movie.dateAdded.slice(0, 10)}
                disabled
              />
            </div>
            
            <div className="form-group">
              <label>Тип контента:</label>
              <div className="type-selector">
                <label>
                  <input
                    type="radio"
                    name="contentType"
                    value="movie"
                    checked={!movie.isSeries}
                    onChange={handleTypeChange}
                  />
                  Фильм
                </label>
                <label>
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
            
            {movie.isSeries ? (
              // Поля для сериала
              <>
                <div className="form-group">
                  <label>Количество сезонов:</label>
                  <input
                    type="number"
                    name="seasons"
                    min="1"
                    value={movie.seasons || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Количество серий:</label>
                  <input
                    type="number"
                    name="episodes"
                    min="1"
                    value={movie.episodes || ''}
                    onChange={handleInputChange}
                    required={movie.isSeries}
                  />
                </div>
                
                <div className="form-group">
                  <label>Длительность серии (мин.):</label>
                  <input
                    type="number"
                    name="episodeDuration"
                    min="1"
                    value={movie.episodeDuration || ''}
                    onChange={handleInputChange}
                    required={movie.isSeries}
                  />
                </div>
              </>
            ) : (
              // Поле для фильма
              <div className="form-group">
                <label>Продолжительность (мин.):</label>
                <input
                  type="number"
                  name="duration"
                  min="1"
                  value={movie.duration || ''}
                  onChange={handleInputChange}
                  required={!movie.isSeries}
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Год выпуска:</label>
              <input
                type="number"
                name="year"
                value={movie.year || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Режиссёр:</label>
              <input
                type="text"
                name="director"
                value={movie.director}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="form-column form-column-right">
            <div className="form-group">
              <label>Название:</label>
              <input
                type="text"
                name="title"
                value={movie.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Теги/жанры:</label>
              <div className="tags-container">
                {movie.tags.map((tag, index) => (
                  <div key={index} className="tag">
                    <span>{tag}</span>
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => handleTagRemove(tag)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div className="add-tag">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="+ Добавить тег"
                  />
                  <button
                    type="button"
                    className="add-tag-btn"
                    onClick={handleTagAdd}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>Описание:</label>
              <textarea
                name="description"
                value={movie.description}
                onChange={handleInputChange}
                rows="5"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>URL трейлера:</label>
              <input
                type="text"
                name="trailerUrl"
                value={movie.trailerUrl}
                onChange={handleInputChange}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            
            <div className="form-group">
              <label>Кадры из фильма:</label>
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
                <label className="add-image" htmlFor="image-upload">
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
            
            <div className="form-group">
              <label>Мои заметки:</label>
              <textarea
                name="notes"
                value={movie.notes}
                onChange={handleInputChange}
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
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