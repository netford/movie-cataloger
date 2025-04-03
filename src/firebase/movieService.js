import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { db } from "./config";

const MOVIES_COLLECTION = "movies";
const TAGS_COLLECTION = "tags";
const moviesCollection = collection(db, MOVIES_COLLECTION);
const tagsCollection = collection(db, TAGS_COLLECTION);

// ФИЛЬМЫ

// Получение всех фильмов
export const getAllMovies = async () => {
  try {
    const snapshot = await getDocs(moviesCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Ошибка при загрузке фильмов:", error);
    throw error;
  }
};

// Добавление нового фильма
export const addMovie = async (movieData) => {
  try {
    const docRef = await addDoc(moviesCollection, movieData);
    return { id: docRef.id, ...movieData };
  } catch (error) {
    console.error("Ошибка при добавлении фильма:", error);
    throw error;
  }
};

// Обновление фильма
export const updateMovie = async (id, movieData) => {
  try {
    const movieRef = doc(db, MOVIES_COLLECTION, id);
    await updateDoc(movieRef, movieData);
    return { id, ...movieData };
  } catch (error) {
    console.error("Ошибка при обновлении фильма:", error);
    throw error;
  }
};

// Удаление фильма
export const deleteMovie = async (id) => {
  try {
    const movieRef = doc(db, MOVIES_COLLECTION, id);
    await deleteDoc(movieRef);
    return id;
  } catch (error) {
    console.error("Ошибка при удалении фильма:", error);
    throw error;
  }
};

// ТЕГИ

// Получение всех тегов
export const getAllTags = async () => {
  try {
    const snapshot = await getDocs(tagsCollection);
    // Если коллекция не существует или пуста, вернем пустой массив
    if (snapshot.empty) {
      console.log("Коллекция тегов пуста или не существует");
      return [];
    }
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Ошибка при загрузке тегов:", error);
    // Вместо выбрасывания исключения, вернем пустой массив тегов
    return [];
  }
};

// Добавление нового тега
export const addTag = async (tagData) => {
  try {
    const docRef = await addDoc(tagsCollection, tagData);
    return { id: docRef.id, ...tagData };
  } catch (error) {
    console.error("Ошибка при добавлении тега:", error);
    throw error;
  }
};

// Обновление тега
export const updateTag = async (id, tagData) => {
  try {
    const tagRef = doc(db, TAGS_COLLECTION, id);
    await updateDoc(tagRef, tagData);
    return { id, ...tagData };
  } catch (error) {
    console.error("Ошибка при обновлении тега:", error);
    throw error;
  }
};

// Удаление тега
export const deleteTag = async (id) => {
  try {
    const tagRef = doc(db, TAGS_COLLECTION, id);
    await deleteDoc(tagRef);
    return id;
  } catch (error) {
    console.error("Ошибка при удалении тега:", error);
    throw error;
  }
};