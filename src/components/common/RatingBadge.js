import React from 'react';

// Компонент для отображения рейтинга с цветовой градацией
const RatingBadge = ({ rating }) => {
  // Если рейтинг не указан, возвращаем прочерк
  if (!rating && rating !== 0) return '—';
  
  // Округляем рейтинг до целого числа
  const ratingValue = Math.round(rating / 10);
  
  // Определяем цвет на основе рейтинга
  const getColorClass = () => {
    if (rating >= 80) return 'rating-excellent'; // Зеленый
    if (rating >= 60) return 'rating-good';      // Голубой
    if (rating >= 40) return 'rating-average';   // Желтый
    if (rating >= 20) return 'rating-below';     // Оранжевый
    return 'rating-poor';                        // Красный
  };
  
  return (
    <div className={`rating-circle ${getColorClass()}`}>
      {ratingValue}
    </div>
  );
};

export default RatingBadge; 