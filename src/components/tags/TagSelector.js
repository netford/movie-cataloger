import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import '../../styles/TagSelector.css';

const TagSelector = ({ selectedTags, onTagsChange }) => {
  const { state, addTagToFirestore } = useMovies();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const dropdownRef = useRef(null);
  
  // Обработчик клика вне выпадающего списка для его закрытия
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);
  
  // Обработчик добавления существующего тега
  const handleAddExistingTag = (tagName) => {
    if (!selectedTags.includes(tagName)) {
      onTagsChange([...selectedTags, tagName]);
    }
    setIsDropdownOpen(false);
  };
  
  // Обработчик создания нового тега
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    // Проверяем, существует ли уже такой тег
    const existingTag = state.tags.find(
      tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase()
    );
    
    if (existingTag) {
      // Если тег существует, просто добавляем его к выбранным
      handleAddExistingTag(existingTag.name);
    } else {
      // Создаем новый тег
      try {
        const newTag = {
          name: newTagName.trim(),
          count: 1
        };
        
        const createdTag = await addTagToFirestore(newTag);
        
        // Добавляем новый тег к выбранным
        onTagsChange([...selectedTags, createdTag.name]);
      } catch (error) {
        console.error('Ошибка при создании тега:', error);
      }
    }
    
    // Очищаем поле ввода и скрываем его
    setNewTagName('');
    setShowNewTagInput(false);
    setIsDropdownOpen(false);
  };
  
  // Обработчик удаления тега
  const handleRemoveTag = (tagName) => {
    const updatedTags = selectedTags.filter(tag => tag !== tagName);
    onTagsChange(updatedTags);
  };
  
  // Обработчик нажатия клавиш в поле ввода нового тега
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newTagName.trim()) {
      e.preventDefault();
      handleCreateTag();
    } else if (e.key === 'Escape') {
      setShowNewTagInput(false);
      setNewTagName('');
    }
  };
  
  // Получаем список доступных тегов (исключая уже выбранные)
  const availableTags = state.tags.filter(tag => !selectedTags.includes(tag.name));
  
  return (
    <div className="tag-selector-compact">
      {/* Отображение уже выбранных тегов */}
      <div className="tags-container">
        <button 
          type="button"
          className="btn-tag-selector"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="btn-text">Теги</span>
          <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
        </button>
        
        {selectedTags.map((tag, index) => (
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
      
      {/* Выпадающий список тегов */}
      {isDropdownOpen && (
        <div className="tags-dropdown" ref={dropdownRef}>
          {showNewTagInput ? (
            <div className="new-tag-form">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Введите название нового тега"
                className="new-tag-input"
                autoFocus
              />
              <div className="tag-form-actions">
                <button
                  type="button"
                  className="btn-create-tag"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                >
                  Создать
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowNewTagInput(false)}
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              {availableTags.length > 0 ? (
                <div className="available-tags-dropdown">
                  {availableTags.map(tag => (
                    <div 
                      key={tag.id} 
                      className="dropdown-tag-item"
                      onClick={() => handleAddExistingTag(tag.name)}
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-tags-message">Нет доступных тегов</div>
              )}
              <div className="dropdown-footer">
                <button 
                  className="btn-add-new-tag"
                  onClick={() => setShowNewTagInput(true)}
                >
                  <FontAwesomeIcon icon={faPlus} /> Создать новый тег
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TagSelector;