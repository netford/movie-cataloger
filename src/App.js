import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MovieProvider } from './context/MovieContext';
import Header from './components/layout/Header';
import HomePage from './components/pages/HomePage';
import './styles/App.css';

function App() {
  return (
    <MovieProvider>
      <BrowserRouter>
        <div className="app">
          <Header />
          <main className="main-content">
            <HomePage />
          </main>
        </div>
      </BrowserRouter>
    </MovieProvider>
  );
}

export default App;