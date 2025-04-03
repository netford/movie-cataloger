import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { getAllMovies, addMovie, updateMovie, deleteMovie } from '../firebase/movieService';

// Создаем контекст для фильмов
const MovieContext = createContext();

// Редьюсер для обработки действий
const movieReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_MOVIES':
      return { ...state, movies: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'ADD_MOVIE':
      return { ...state, movies: [...state.movies, action.payload] };
    case 'UPDATE_MOVIE':
      return { 
        ...state, 
        movies: state.movies.map(movie => 
          movie.id === action.payload.id ? action.payload : movie
        ) 
      };
    case 'DELETE_MOVIE':
      return { 
        ...state, 
        movies: state.movies.filter(movie => movie.id !== action.payload) 
      };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'OPEN_MODAL':
      return { ...state, modal: action.payload };
    case 'CLOSE_MODAL':
      return { ...state, modal: null };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// Провайдер контекста
export const MovieProvider = ({ children }) => {
  // Начальное состояние
  const initialState = {
    movies: [],
    filter: 'all', // all, watched, toWatch, cancelled
    search: '',
    viewMode: 'cards', // cards, list
    sortBy: { field: 'dateAdded', direction: 'desc' },
    modal: null,
    isLoading: true,
    error: null
  };
  
  const [state, dispatch] = useReducer(movieReducer, initialState);
  
  // Загружаем данные из Firestore при монтировании
  useEffect(() => {
    const fetchMovies = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const movies = await getAllMovies();
        dispatch({ type: 'LOAD_MOVIES', payload: movies });
      } catch (error) {
        console.error("Ошибка при загрузке фильмов:", error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Не удалось загрузить фильмы. Пожалуйста, попробуйте позже.' 
        });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    fetchMovies();
    
    // Загружаем настройки из localStorage
    const viewMode = localStorage.getItem('viewMode');
    if (viewMode) {
      dispatch({ type: 'SET_VIEW_MODE', payload: viewMode });
    }
  }, []);
  
  // Сохраняем настройки интерфейса в localStorage
  useEffect(() => {
    localStorage.setItem('viewMode', state.viewMode);
  }, [state.viewMode]);
  
  // Методы для работы с Firestore
  const addMovieToFirestore = async (movieData) => {
    try {
      // Удаляем id из данных перед отправкой в Firestore (он генерируется автоматически)
      const { id, ...movieWithoutId } = movieData;
      const newMovie = await addMovie(movieWithoutId);
      dispatch({ type: 'ADD_MOVIE', payload: newMovie });
      return newMovie;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Не удалось добавить фильм. Пожалуйста, попробуйте позже.' 
      });
      throw error;
    }
  };
  
  const updateMovieInFirestore = async (movieData) => {
    try {
      // Извлекаем id и отправляем остальные данные
      const { id, ...updates } = movieData;
      await updateMovie(id, updates);
      dispatch({ type: 'UPDATE_MOVIE', payload: movieData });
      return movieData;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Не удалось обновить фильм. Пожалуйста, попробуйте позже.' 
      });
      throw error;
    }
  };
  
  const deleteMovieFromFirestore = async (id) => {
    try {
      await deleteMovie(id);
      dispatch({ type: 'DELETE_MOVIE', payload: id });
      return id;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Не удалось удалить фильм. Пожалуйста, попробуйте позже.' 
      });
      throw error;
    }
  };
  
  // Расширенное значение контекста с методами Firestore
  const contextValue = {
    state,
    dispatch,
    addMovieToFirestore,
    updateMovieInFirestore,
    deleteMovieFromFirestore
  };
  
  return (
    <MovieContext.Provider value={contextValue}>
      {children}
    </MovieContext.Provider>
  );
};

// Хук для использования контекста
export const useMovies = () => useContext(MovieContext);