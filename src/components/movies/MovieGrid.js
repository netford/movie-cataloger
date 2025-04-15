import React, { useMemo } from 'react';
import { useMovies } from '../../context/MovieContext';
import MovieCard from './MovieCard';
import '../../styles/MovieGrid.css';

const MovieGrid = () => {
  const { state } = useMovies();
  
  // Фильтруем и сортируем фильмы в соответствии с текущими настройками
  const filteredMovies = useMemo(() => {
    let result = [...state.movies];
    
    // Применяем фильтр категории
    if (state.filter !== 'all') {
      result = result.filter(movie => movie.status === state.filter);
    }
    
    // Применяем поисковый запрос или специальный фильтр "Без тегов"
    if (state.search) {
      if (state.search === '_NO_TAGS_') {
        // Специальный случай для фильтрации фильмов без тегов
        result = result.filter(movie => !movie.tags || movie.tags.length === 0);
      } else {
        // Обычная фильтрация по поисковому запросу
        const searchLower = state.search.toLowerCase();
        result = result.filter(movie => 
          movie.title.toLowerCase().includes(searchLower) ||
          movie.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
    }
    
    // Применяем сортировку
    const { field, direction } = state.sortBy;
    result.sort((a, b) => {
      // Обрабатываем случай с null или undefined значениями
      if (a[field] == null && b[field] == null) return 0;
      if (a[field] == null) return direction === 'asc' ? 1 : -1;
      if (b[field] == null) return direction === 'asc' ? -1 : 1;
      
      // Сортируем строки без учета регистра
      if (typeof a[field] === 'string' && typeof b[field] === 'string') {
        const aValue = a[field].toLowerCase();
        const bValue = b[field].toLowerCase();
        return direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Сортируем числа и даты
      return direction === 'asc'
        ? a[field] - b[field]
        : b[field] - a[field];
    });
    
    return result;
  }, [state.movies, state.filter, state.search, state.sortBy]);
  
  if (filteredMovies.length === 0) {
    return (
      <div className="no-movies-message">
        <p>Фильмы не найдены. Попробуйте изменить параметры поиска или добавьте новый фильм.</p>
      </div>
    );
  }
  
  return (
    <div className="movie-grid">
      {filteredMovies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default MovieGrid;