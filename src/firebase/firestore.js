// src/firebase/firestore.js
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    query, 
    where, 
    orderBy,
    serverTimestamp
  } from 'firebase/firestore';
  import { db } from './config';
  
  const POSTS_COLLECTION = 'posts';
  
  // Crear un nuevo post
  export const createPost = async (postData) => {
    try {
      const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };
  
  // Actualizar un post
  export const updatePost = async (postId, updates) => {
    try {
      const postRef = doc(db, POSTS_COLLECTION, postId);
      await updateDoc(postRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };
  
  // Eliminar un post
  export const deletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, POSTS_COLLECTION, postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };
  
  // Obtener posts por edición
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
        posts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
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
  
  // Obtener posts por usuario
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
        posts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        });
      });
      
      return posts;
    } catch (error) {
      console.error('Error getting posts by user:', error);
      throw error;
    }
};
  
// NUEVA FUNCIÓN: Obtener todas las jams
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
        jams.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return jams;
    } catch (error) {
      console.error('Error getting jams:', error);
      return [];
    }
  };
  
  // Obtener post específico de usuario por edición
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
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
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