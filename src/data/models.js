// src/data/models.js
export const movieModel = {
    id: "", // уникальный идентификатор
    title: "", // название фильма
    description: "", // описание
    poster: "", // URL постера (или base64)
    tags: [], // массив тегов/жанров
    status: "toWatch", // просмотрено (watched), к просмотру (toWatch), отменено (cancelled)
    rating: null, // рейтинг от 0 до 100
    dateAdded: "", // дата добавления
    dateWatched: null, // дата просмотра
    director: "", // режиссер
    year: null, // год выпуска
    
    // Поля для отслеживания сериалов
    isSeries: false, // флаг, является ли это сериалом
    seasons: 1, // количество сезонов (для сериалов)
    episodes: null, // количество эпизодов (для сериалов)
    episodeDuration: null, // средняя продолжительность эпизода в минутах (для сериалов)
    
    duration: null, // продолжительность в минутах (для обычных фильмов)
    trailerUrl: "", // URL трейлера
    images: [], // дополнительные изображения
    notes: "" // личные заметки
  };