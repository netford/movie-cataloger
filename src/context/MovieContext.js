import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { 
  getAllMovies, 
  addMovie, 
  updateMovie, 
  deleteMovie,
  getAllTags,
  addTag,
  updateTag,
  deleteTag
} from '../firebase/movieService';

// Создаем контекст для фильмов
const MovieContext = createContext();

// Редьюсер для обработки действий
const movieReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_MOVIES':
      return { ...state, movies: action.payload, isLoading: false };
    case 'LOAD_TAGS':
      return { ...state, tags: action.payload };
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
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.payload] };
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map(tag =>
          tag.id === action.payload.id ? action.payload : tag
        )
      };
    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter(tag => tag.id !== action.payload)
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
    tags: [],
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
    const fetchData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Загрузка фильмов
        const movies = await getAllMovies();
        dispatch({ type: 'LOAD_MOVIES', payload: movies });
        
        // Загрузка тегов
        let tags = [];
        try {
          tags = await getAllTags();
        } catch (error) {
          console.error("Не удалось загрузить теги:", error);
          tags = []; // Если произошла ошибка, используем пустой массив тегов
        }
        dispatch({ type: 'LOAD_TAGS', payload: tags });
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Не удалось загрузить данные. Пожалуйста, попробуйте позже.' 
        });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    fetchData();
    
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
  
  // Методы для работы с Firestore - ФИЛЬМЫ
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
  
  // Методы для работы с Firestore - ТЕГИ
  const addTagToFirestore = async (tagData) => {
    try {
      // Подготавливаем данные для отправки в Firestore
      const tagToAdd = { ...tagData };
      // Удаляем id только если он существует
      if ('id' in tagToAdd) {
        const { id, ...tagWithoutId } = tagToAdd;
        const newTag = await addTag(tagWithoutId);
        dispatch({ type: 'ADD_TAG', payload: newTag });
        return newTag;
      } else {
        // Если id не было, отправляем как есть
        const newTag = await addTag(tagToAdd);
        dispatch({ type: 'ADD_TAG', payload: newTag });
        return newTag;
      }
    } catch (error) {
      console.error('Ошибка при добавлении тега в Firestore:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Не удалось добавить тег. Пожалуйста, попробуйте позже.'
      });
      throw error;
    }
  };
  
  const updateTagInFirestore = async (tagData) => {
    try {
      // Извлекаем id и отправляем остальные данные
      const { id, ...updates } = tagData;
      await updateTag(id, updates);
      dispatch({ type: 'UPDATE_TAG', payload: tagData });
      return tagData;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Не удалось обновить тег. Пожалуйста, попробуйте позже.'
      });
      throw error;
    }
  };
  
  const deleteTagFromFirestore = async (id) => {
    try {
      await deleteTag(id);
      dispatch({ type: 'DELETE_TAG', payload: id });
      return id;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Не удалось удалить тег. Пожалуйста, попробуйте позже.'
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
    deleteMovieFromFirestore,
    addTagToFirestore,
    updateTagInFirestore,
    deleteTagFromFirestore
  };
  
  return (
    <MovieContext.Provider value={contextValue}>
      {children}
    </MovieContext.Provider>
  );
};

// Хук для использования контекста
export const useMovies = () => useContext(MovieContext);