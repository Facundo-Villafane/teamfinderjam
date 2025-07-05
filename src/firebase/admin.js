// src/firebase/admin.js
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
    serverTimestamp,
    getCountFromServer
  } from 'firebase/firestore';
  import { db } from './config';
  
  const JAMS_COLLECTION = 'jams';
  const POSTS_COLLECTION = 'posts';
  
  // ===== GESTIÓN DE JAMS =====
  
  export const createJam = async (jamData) => {
    try {
      const docRef = await addDoc(collection(db, JAMS_COLLECTION), {
        ...jamData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: false
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating jam:', error);
      throw error;
    }
  };
  
  export const updateJam = async (jamId, updates) => {
    try {
      const jamRef = doc(db, JAMS_COLLECTION, jamId);
      await updateDoc(jamRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating jam:', error);
      throw error;
    }
  };
  
  export const deleteJam = async (jamId) => {
    try {
      // Primero eliminar todos los posts asociados
      const postsQuery = query(
        collection(db, POSTS_COLLECTION),
        where('edition', '==', jamId)
      );
      const postsSnapshot = await getDocs(postsQuery);
      
      // Eliminar posts en batch
      const deletePromises = postsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Luego eliminar la jam
      await deleteDoc(doc(db, JAMS_COLLECTION, jamId));
    } catch (error) {
      console.error('Error deleting jam:', error);
      throw error;
    }
  };
  
  export const getAllJams = async () => {
    try {
      const q = query(
        collection(db, JAMS_COLLECTION),
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
      throw error;
    }
  };
  
  export const setActiveJam = async (jamId) => {
    try {
      // Primero desactivar todas las jams
      const allJamsQuery = query(collection(db, JAMS_COLLECTION));
      const allJamsSnapshot = await getDocs(allJamsQuery);
      
      const updatePromises = allJamsSnapshot.docs.map(jamDoc => 
        updateDoc(jamDoc.ref, { active: false })
      );
      await Promise.all(updatePromises);
      
      // Luego activar la jam específica
      if (jamId) {
        const jamRef = doc(db, JAMS_COLLECTION, jamId);
        await updateDoc(jamRef, { 
          active: true,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error setting active jam:', error);
      throw error;
    }
  };
  
  // ===== MODERACIÓN DE POSTS =====
  
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
        posts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return posts;
    } catch (error) {
      console.error('Error getting all posts:', error);
      throw error;
    }
  };
  
  export const deletePostAsAdmin = async (postId) => {
    try {
      await deleteDoc(doc(db, POSTS_COLLECTION, postId));
    } catch (error) {
      console.error('Error deleting post as admin:', error);
      throw error;
    }
  };
  
  export const togglePostFeatured = async (postId, featured) => {
    try {
      const postRef = doc(db, POSTS_COLLECTION, postId);
      await updateDoc(postRef, {
        featured: featured,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error toggling post featured:', error);
      throw error;
    }
  };
  
  export const togglePostFlagged = async (postId, flagged) => {
    try {
      const postRef = doc(db, POSTS_COLLECTION, postId);
      await updateDoc(postRef, {
        flagged: flagged,
        flaggedAt: flagged ? serverTimestamp() : null,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error toggling post flagged:', error);
      throw error;
    }
  };
  
  // ===== ESTADÍSTICAS =====
  
  export const getAdminStats = async () => {
    try {
      // Contar usuarios únicos (basado en posts)
      const postsSnapshot = await getDocs(collection(db, POSTS_COLLECTION));
      const uniqueUsers = new Set();
      postsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.userId) uniqueUsers.add(data.userId);
      });
  
      // Contar posts totales
      const totalPostsSnapshot = await getCountFromServer(collection(db, POSTS_COLLECTION));
      
      // Contar jams totales
      const totalJamsSnapshot = await getCountFromServer(collection(db, JAMS_COLLECTION));
      
      // Contar jams activas
      const activeJamsQuery = query(
        collection(db, JAMS_COLLECTION),
        where('active', '==', true)
      );
      const activeJamsSnapshot = await getDocs(activeJamsQuery);
  
      return {
        totalUsers: uniqueUsers.size,
        totalPosts: totalPostsSnapshot.data().count,
        totalJams: totalJamsSnapshot.data().count,
        activeJams: activeJamsSnapshot.size,
        flaggedPosts: 0, // Se puede calcular con una query adicional
        featuredPosts: 0 // Se puede calcular con una query adicional
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return {
        totalUsers: 0,
        totalPosts: 0,
        totalJams: 0,
        activeJams: 0,
        flaggedPosts: 0,
        featuredPosts: 0
      };
    }
  };
  
  // ===== LOGGING DE ACCIONES =====
  
  export const logAdminAction = async (userId, action, details = {}) => {
    try {
      await addDoc(collection(db, 'admin_logs'), {
        userId,
        action,
        details,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };