import React, { useRef, useEffect } from 'react';
import { useMovies } from '../../context/MovieContext';
import '../../styles/SortDropdown.css';

const sortOptions = [
  { label: 'По названию (А-Я)', field: 'title', direction: 'asc' },
  { label: 'По названию (Я-А)', field: 'title', direction: 'desc' },
  { label: 'По дате добавления (сначала новые)', field: 'dateAdded', direction: 'desc' },
  { label: 'По дате добавления (сначала старые)', field: 'dateAdded', direction: 'asc' },
  { 
    label: 'По рейтингу (по убыванию)', 
    field: 'rating', 
    direction: 'desc',
    filterRated: true
  },
  { 
    label: 'По рейтингу (по возрастанию)', 
    field: 'rating', 
    direction: 'asc',
    filterRated: true
  },
  { 
    label: 'По дате просмотра (сначала новые)', 
    field: 'dateWatched', 
    direction: 'desc',
    filterStatus: 'watched'
  },
  { 
    label: 'По дате просмотра (сначала старые)', 
    field: 'dateWatched', 
    direction: 'asc',
    filterStatus: 'watched'
  }
];

const SortDropdown = ({ isOpen, onClose, position }) => {
  const { state, dispatch } = useMovies();
  const dropdownRef = useRef(null);
  
  // Обработчик изменения сортировки
  const handleSortChange = (option) => {
    // Устанавливаем сортировку
    dispatch({
      type: 'SET_SORT',
      payload: { field: option.field, direction: option.direction }
    });
    
    // Если выбрана сортировка по дате просмотра, то устанавливаем фильтр "просмотрено"
    if (option.filterStatus) {
      dispatch({
        type: 'SET_FILTER',
        payload: option.filterStatus
      });
    }
    
    // Если выбрана сортировка по рейтингу, то устанавливаем специальный фильтр в поиске
    if (option.filterRated) {
      // Сбрасываем фильтр категории (для отображения всех с рейтингом)
      dispatch({
        type: 'SET_FILTER',
        payload: 'all'
      });
      
      // Устанавливаем специальный поисковый запрос для фильтрации
      dispatch({
        type: 'SET_SEARCH',
        payload: '_HAS_RATING_'
      });
    } else if (!option.filterStatus) {
      // Если это не фильтр по статусу и не по рейтингу, сбрасываем специальный поиск
      const currentSearch = state.search;
      if (currentSearch === '_HAS_RATING_') {
        dispatch({
          type: 'SET_SEARCH',
          payload: ''
        });
      }
    }
    
    onClose();
  };
  
  // Закрываем дропдаун при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="sort-dropdown"
      ref={dropdownRef}
      style={{
        top: `${position?.top}px`,
        left: `${position?.left}px`
      }}
    >
      <div className="sort-dropdown-header">Сортировка</div>
      <div className="sort-dropdown-options">
        {sortOptions.map((option, index) => (
          <div 
            key={index}
            className="sort-option"
            onClick={() => handleSortChange(option)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SortDropdown; 