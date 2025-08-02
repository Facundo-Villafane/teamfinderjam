// src/firebase/firestore.js - Funciones principales de Firestore con manejo robusto de fechas

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './config';
import { safeToDate } from '../utils/dateUtils';

const POSTS_COLLECTION = 'posts';

/**
 * Crear un nuevo post
 * @param {object} postData - Datos del post
 * @returns {Promise<string>} ID del post creado
 */
export const createPost = async (postData) => {
  try {
    const postWithTimestamp = {
      ...postData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, POSTS_COLLECTION), postWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

/**
 * Actualizar un post existente
 * @param {string} postId - ID del post
 * @param {object} updateData - Datos a actualizar
 * @returns {Promise<void>}
 */
export const updatePost = async (postId, updateData) => {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    
    const updateWithTimestamp = {
      ...updateData,
      updatedAt: new Date()
    };
    
    await updateDoc(postRef, updateWithTimestamp);
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

/**
 * Eliminar un post
 * @param {string} postId - ID del post
 * @returns {Promise<void>}
 */
export const deletePost = async (postId) => {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await deleteDoc(postRef);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

/**
 * Obtener todos los posts
 * @returns {Promise<Array>} Array de posts
 */
export const getAllPosts = async () => {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Usar manejo robusto de fechas
      const defaultDate = new Date();
      
      posts.push({
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt, defaultDate),
        updatedAt: safeToDate(data.updatedAt, defaultDate)
      });
    });
    
    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
};

/**
 * Obtener posts por edición/jam
 * @param {string} edition - Nombre de la edición/jam
 * @returns {Promise<Array>} Array de posts
 */
export const getPostsByEdition = async (edition) => {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('edition', '==', edition),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Usar manejo robusto de fechas
      const defaultDate = new Date();
      
      posts.push({
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt, defaultDate),
        updatedAt: safeToDate(data.updatedAt, defaultDate)
      });
    });
    
    return posts;
  } catch (error) {
    console.error('Error getting posts by edition:', error);
    // Si es un error de índice faltante o permisos, devolver array vacío
    if (error.code === 'failed-precondition' || error.code === 'permission-denied') {
      return [];
    }
    throw error;
  }
};

/**
 * Obtener posts por usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Array de posts
 */
export const getPostsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Usar manejo robusto de fechas
      const defaultDate = new Date();
      
      posts.push({
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt, defaultDate),
        updatedAt: safeToDate(data.updatedAt, defaultDate)
      });
    });
    
    return posts;
  } catch (error) {
    console.error('Error getting posts by user:', error);
    throw error;
  }
};

/**
 * Obtener post específico de usuario por edición
 * @param {string} userId - ID del usuario
 * @param {string} edition - Nombre de la edición
 * @returns {Promise<object|null>} Post o null
 */
export const getUserPostByEdition = async (userId, edition) => {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('userId', '==', userId),
      where('edition', '==', edition)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    // Usar manejo robusto de fechas
    const defaultDate = new Date();
    
    return {
      id: doc.id,
      ...data,
      createdAt: safeToDate(data.createdAt, defaultDate),
      updatedAt: safeToDate(data.updatedAt, defaultDate)
    };
  } catch (error) {
    console.error('Error getting user post by edition:', error);
    // Si es error de permisos o índice, devolver null
    if (error.code === 'failed-precondition' || error.code === 'permission-denied') {
      return null;
    }
    throw error;
  }
};

/**
 * Obtener un post específico por ID
 * @param {string} postId - ID del post
 * @returns {Promise<object|null>} Post o null
 */
export const getPost = async (postId) => {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const data = postDoc.data();
      
      // Usar manejo robusto de fechas
      const defaultDate = new Date();
      
      return {
        id: postDoc.id,
        ...data,
        createdAt: safeToDate(data.createdAt, defaultDate),
        updatedAt: safeToDate(data.updatedAt, defaultDate)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting post:', error);
    return null;
  }
};

/**
 * Obtener todas las jams
 * @returns {Promise<Array>} Array de jams
 */
export const getAllJams = async () => {
  try {
    const q = query(
      collection(db, 'jams'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const jams = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Usar manejo robusto de fechas
      const defaultDate = new Date();
      
      jams.push({
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt, defaultDate),
        updatedAt: safeToDate(data.updatedAt, defaultDate)
      });
    });
    
    return jams;
  } catch (error) {
    console.error('Error getting jams:', error);
    return [];
  }
};

/**
 * Obtener jam activa
 * @returns {Promise<object|null>} Jam activa o null
 */
export const getActiveJam = async () => {
  try {
    const q = query(
      collection(db, 'jams'),
      where('isActive', '==', true),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    // Usar manejo robusto de fechas
    const defaultDate = new Date();
    
    return {
      id: doc.id,
      ...data,
      createdAt: safeToDate(data.createdAt, defaultDate),
      updatedAt: safeToDate(data.updatedAt, defaultDate)
    };
  } catch (error) {
    console.error('Error getting active jam:', error);
    return null;
  }
};

/**
 * Obtener jam por ID
 * @param {string} jamId - ID de la jam
 * @returns {Promise<object|null>} Jam o null
 */
export const getJam = async (jamId) => {
  try {
    const jamRef = doc(db, 'jams', jamId);
    const jamDoc = await getDoc(jamRef);
    
    if (jamDoc.exists()) {
      const data = jamDoc.data();
      
      // Usar manejo robusto de fechas
      const defaultDate = new Date();
      
      return {
        id: jamDoc.id,
        ...data,
        createdAt: safeToDate(data.createdAt, defaultDate),
        updatedAt: safeToDate(data.updatedAt, defaultDate)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting jam:', error);
    return null;
  }
};

/**
 * Buscar posts por texto
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} Array de posts que coinciden
 */
export const searchPosts = async (searchTerm) => {
  try {
    // Nota: Firestore no tiene búsqueda de texto completa nativa
    // Esta es una implementación básica que busca en el campo description
    const posts = await getAllPosts();
    
    const filteredPosts = posts.filter(post => 
      post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.edition?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filteredPosts;
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
};

/**
 * Obtener estadísticas generales
 * @returns {Promise<object>} Estadísticas generales
 */
export const getGeneralStats = async () => {
  try {
    const [posts, jams] = await Promise.all([
      getAllPosts(),
      getAllJams()
    ]);
    
    // Calcular usuarios únicos
    const uniqueUsers = new Set(posts.map(post => post.userId));
    
    // Calcular ediciones únicas
    const uniqueEditions = new Set(posts.map(post => post.edition));
    
    return {
      totalPosts: posts.length,
      totalUsers: uniqueUsers.size,
      totalJams: jams.length,
      totalEditions: uniqueEditions.size,
      activeJam: jams.find(jam => jam.isActive) || null
    };
  } catch (error) {
    console.error('Error getting general stats:', error);
    return {
      totalPosts: 0,
      totalUsers: 0,
      totalJams: 0,
      totalEditions: 0,
      activeJam: null
    };
  }
};