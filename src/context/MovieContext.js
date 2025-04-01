import React, { createContext, useReducer, useContext, useEffect } from 'react';

// Создаем контекст для фильмов
const MovieContext = createContext();

// Редьюсер для обработки действий
const movieReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_MOVIES':
      return { ...state, movies: action.payload };
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
    modal: null
  };
  
  const [state, dispatch] = useReducer(movieReducer, initialState);
  
  // Загружаем данные из localStorage при монтировании
  useEffect(() => {
    const storedMovies = localStorage.getItem('movies');
    if (storedMovies) {
      dispatch({ type: 'LOAD_MOVIES', payload: JSON.parse(storedMovies) });
    }
    
    const viewMode = localStorage.getItem('viewMode');
    if (viewMode) {
      dispatch({ type: 'SET_VIEW_MODE', payload: viewMode });
    }
  }, []);
  
  // Сохраняем данные в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('movies', JSON.stringify(state.movies));
  }, [state.movies]);
  
  useEffect(() => {
    localStorage.setItem('viewMode', state.viewMode);
  }, [state.viewMode]);
  
  return (
    <MovieContext.Provider value={{ state, dispatch }}>
      {children}
    </MovieContext.Provider>
  );
};

// Хук для использования контекста
export const useMovies = () => useContext(MovieContext);