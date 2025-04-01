import React from 'react';
import { useMovies } from '../../context/MovieContext';
import FilterBar from '../movies/FilterBar';
import MovieGrid from '../movies/MovieGrid';
import MovieList from '../movies/MovieList';
import ViewMovie from '../modals/ViewMovie';
import MovieForm from '../modals/MovieForm';
import '../../styles/HomePage.css';

const HomePage = () => {
  const { state } = useMovies();
  
  // Определяем, какой модальный компонент нужно отобразить
  const renderModal = () => {
    if (!state.modal) return null;
    
    switch (state.modal.type) {
      case 'view':
        return <ViewMovie movieId={state.modal.movieId} />;
      case 'add':
        return <MovieForm />;
      case 'edit':
        return <MovieForm movieId={state.modal.movieId} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="home-page">
      <FilterBar />
      
      <div className="content-container">
        {state.viewMode === 'cards' ? (
          <MovieGrid />
        ) : (
          <MovieList />
        )}
      </div>
      
      {/* Рендерим нужный модальный компонент */}
      {renderModal()}
    </div>
  );
};

export default HomePage;