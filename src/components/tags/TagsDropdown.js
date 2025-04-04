import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useMovies } from '../../context/MovieContext';
import '../../styles/TagsDropdown.css';

const TagsDropdown = ({ isOpen, onClose, position }) => {
  const { state, dispatch, addTagToFirestore, updateTagInFirestore, deleteTagFromFirestore } = useMovies();
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const dropdownRef = useRef(null);
  
  // Обработчик клика вне выпадающего списка для его закрытия
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
  
  // Обработчик добавления нового тега
  const handleAddTag = async () => {
    if (newTagName.trim()) {
      try {
        // Проверяем, существует ли уже такой тег
        const tagExists = state.tags.some(
          tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase()
        );
        
        if (tagExists) {
          alert('Тег с таким названием уже существует');
          return;
        }
        
        // Создаем новый тег на основе модели
        const newTag = {
          name: newTagName.trim(),
          count: 0
        };
        
        await addTagToFirestore(newTag);
        setNewTagName(''); // Очищаем поле ввода
      } catch (error) {
        console.error('Ошибка при добавлении тега:', error);
        alert(`Ошибка при добавлении тега: ${error.message}`);
      }
    }
  };
  
  // Обработчик начала редактирования тега
  const handleEditStart = (tag) => {
    setEditingTag({ ...tag });
  };
  
  // Обработчик изменения имени редактируемого тега
  const handleEditChange = (e) => {
    setEditingTag(prev => ({ ...prev, name: e.target.value }));
  };
  
  // Обработчик сохранения отредактированного тега
  const handleEditSave = async () => {
    if (editingTag && editingTag.name.trim()) {
      try {
        // Проверяем, не совпадает ли новое имя с другими тегами
        const tagExists = state.tags.some(
          tag => tag.id !== editingTag.id && 
                tag.name.toLowerCase() === editingTag.name.trim().toLowerCase()
        );
        
        if (tagExists) {
          alert('Тег с таким названием уже существует');
          return;
        }
        
        // Обновляем тег в Firestore
        await updateTagInFirestore({
          ...editingTag,
          name: editingTag.name.trim()
        });
        
        setEditingTag(null); // Завершаем редактирование
      } catch (error) {
        console.error('Ошибка при обновлении тега:', error);
        alert(`Ошибка при обновлении тега: ${error.message}`);
      }
    }
  };
  
  // Обработчик отмены редактирования
  const handleEditCancel = () => {
    setEditingTag(null);
  };
  
  // Обработчик удаления тега
  const handleDeleteTag = async (tagId) => {
    // Проверяем, используется ли тег в каких-либо фильмах
    const tagInUse = state.movies.some(movie => 
      movie.tags.includes(state.tags.find(t => t.id === tagId)?.name)
    );
    
    if (tagInUse) {
      const confirmDelete = window.confirm(
        'Этот тег используется в фильмах. Вы уверены, что хотите его удалить?'
      );
      
      if (!confirmDelete) return;
    }
    
    try {
      await deleteTagFromFirestore(tagId);
    } catch (error) {
      console.error('Ошибка при удалении тега:', error);
      alert(`Ошибка при удалении тега: ${error.message}`);
    }
  };
  
  // Обработчик клавиш для поля ввода нового тега
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newTagName.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // Обработчик клика по тегу для фильтрации
  const handleTagClick = (tagName) => {
    dispatch({ type: 'SET_SEARCH', payload: tagName });
    onClose();
  };
  
  // Если панель закрыта, не рендерим ее
  if (!isOpen) return null;

  // Стили для позиционирования выпадающей панели
  const style = {
    top: position ? `${position.top}px` : '0',
    left: position ? `${position.left}px` : '0',
  };
  
  return (
    <div className="tags-dropdown-overlay">
      <div 
        ref={dropdownRef} 
        className="tags-dropdown" 
        style={style}
      >
        <div className="tags-dropdown-header">
          <h3>Управление тегами</h3>
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="add-tag-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Название нового тега"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="tag-input"
            />
            <button 
              type="button"
              className="btn btn-primary add-tag-btn" 
              onClick={handleAddTag}
              disabled={!newTagName.trim()}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
        
        <div className="tags-list">
          {state.tags.length === 0 ? (
            <div className="no-tags-message">
              <p>Теги не найдены. Добавьте новый тег с помощью формы выше.</p>
            </div>
          ) : (
            <ul className="tags-items">
              {state.tags.map(tag => (
                <li key={tag.id} className="tag-item">
                  {editingTag && editingTag.id === tag.id ? (
                    <div className="tag-edit-form">
                      <input
                        type="text"
                        value={editingTag.name}
                        onChange={handleEditChange}
                        className="tag-edit-input"
                        autoFocus
                      />
                      <div className="tag-edit-actions">
                        <button
                          type="button"
                          className="btn-icon btn-save"
                          onClick={handleEditSave}
                          disabled={!editingTag.name.trim()}
                        >
                          <FontAwesomeIcon icon={faSave} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-cancel"
                          onClick={handleEditCancel}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="tag-view">
                      <span 
                        className="tag-name" 
                        onClick={() => handleTagClick(tag.name)}
                        title="Нажмите, чтобы отфильтровать по этому тегу"
                      >
                        {tag.name}
                      </span>
                      <span className="tag-count">
                        {state.movies.filter(movie => 
                          movie.tags.includes(tag.name)
                        ).length} фильм(ов)
                      </span>
                      <div className="tag-actions">
                        <button
                          type="button"
                          className="btn-icon btn-edit"
                          onClick={() => handleEditStart(tag)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagsDropdown;