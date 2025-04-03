import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { db } from "./config";

const COLLECTION_NAME = "movies";
const moviesCollection = collection(db, COLLECTION_NAME);

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
    const movieRef = doc(db, COLLECTION_NAME, id);
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
    const movieRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(movieRef);
    return id;
  } catch (error) {
    console.error("Ошибка при удалении фильма:", error);
    throw error;
  }
};