import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import '../../styles/TagSelector.css';

const TagSelector = ({ selectedTags, onTagsChange }) => {
  const { state, dispatch, addTagToFirestore } = useMovies();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Фильтрованные теги для предложений
  const filteredTags = inputValue
    ? state.tags
        .filter(tag => 
          tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTags.includes(tag.name)
        )
        .sort((a, b) => {
          // Сначала показываем теги, которые начинаются с введенного текста
          const aStartsWith = a.name.toLowerCase().startsWith(inputValue.toLowerCase());
          const bStartsWith = b.name.toLowerCase().startsWith(inputValue.toLowerCase());
          
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
        inputRef.current && 
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Обработчик добавления тега
  const handleAddTag = (tagName) => {
    if (!tagName.trim()) return;
    
    // Проверяем, не выбран ли уже этот тег
    if (selectedTags.includes(tagName.trim())) {
      setInputValue('');
      return;
    }
    
    // Добавляем тег к выбранным
    onTagsChange([...selectedTags, tagName.trim()]);
    setInputValue('');
    setShowSuggestions(false);
  };
  
  // Обработчик удаления тега
  const handleRemoveTag = (tagName) => {
    const updatedTags = selectedTags.filter(tag => tag !== tagName);
    onTagsChange(updatedTags);
  };
  
  // Обработчик создания нового тега, если его нет в списке
  const handleCreateTag = async () => {
    if (!inputValue.trim()) return;
    
    // Проверяем, существует ли уже такой тег
    const existingTag = state.tags.find(
      tag => tag.name.toLowerCase() === inputValue.trim().toLowerCase()
    );
    
    if (existingTag) {
      // Если тег существует, просто добавляем его к выбранным
      handleAddTag(existingTag.name);
    } else {
      // Создаем новый тег
      try {
        const newTag = {
          name: inputValue.trim(),
          count: 1
        };
        
        const createdTag = await addTagToFirestore(newTag);
        
        // Добавляем новый тег к выбранным
        onTagsChange([...selectedTags, createdTag.name]);
        setInputValue('');
      } catch (error) {
        console.error('Ошибка при создании тега:', error);
      }
    }
  };
  
  // Обработчик клика по тегу в списке предложений
  const handleTagClick = (tagName) => {
    handleAddTag(tagName);
  };
  
  // Обработчик нажатия клавиш
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (filteredTags.length > 0) {
        // Если есть предложения, выбираем первый тег
        handleAddTag(filteredTags[0].name);
      } else if (inputValue.trim()) {
        // Если предложений нет, создаем новый тег
        handleCreateTag();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };
  
  return (
    <div className="tag-selector">
      <div className="tags-container">
        {selectedTags.map((tag, index) => (
          <div key={index} className="tag">
            <span>{tag}</span>
            <button
              type="button"
              className="tag-remove"
              onClick={() => handleRemoveTag(tag)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
        
        <div className="tag-input-container">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="+ Добавить тег"
            className="tag-input"
          />
          
          {inputValue.trim() && (
            <button
              type="button"
              className="add-tag-btn"
              onClick={handleCreateTag}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          )}
          
          {showSuggestions && filteredTags.length > 0 && (
            <div ref={suggestionsRef} className="tag-suggestions">
              {filteredTags.map(tag => (
                <div
                  key={tag.id}
                  className="tag-suggestion-item"
                  onClick={() => handleTagClick(tag.name)}
                >
                  {tag.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagSelector;