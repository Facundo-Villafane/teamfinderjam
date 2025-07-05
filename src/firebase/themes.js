// src/firebase/themes.js - Funciones para temas y votos
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
    serverTimestamp,
    writeBatch
  } from 'firebase/firestore';
  import { db } from './config';
  
  const THEMES_COLLECTION = 'themes';
  const VOTES_COLLECTION = 'theme_votes';
  const JAMS_COLLECTION = 'jams';
  
  // ===== GESTIÓN DE TEMAS =====
  
  // Crear nuevo tema
  export const createTheme = async (themeData) => {
    try {
      const docRef = await addDoc(collection(db, THEMES_COLLECTION), {
        ...themeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating theme:', error);
      throw error;
    }
  };
  
  // Actualizar tema
  export const updateTheme = async (themeId, updates) => {
    try {
      const themeRef = doc(db, THEMES_COLLECTION, themeId);
      await updateDoc(themeRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  };
  
  // Eliminar tema
  export const deleteTheme = async (themeId) => {
    try {
      const batch = writeBatch(db);
      
      // Eliminar el tema
      const themeRef = doc(db, THEMES_COLLECTION, themeId);
      batch.delete(themeRef);
      
      // Eliminar todos los votos asociados a este tema
      const votesQuery = query(
        collection(db, VOTES_COLLECTION),
        where('themeId', '==', themeId)
      );
      const votesSnapshot = await getDocs(votesQuery);
      
      votesSnapshot.forEach((voteDoc) => {
        batch.delete(voteDoc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting theme:', error);
      throw error;
    }
  };
  
  // Obtener temas por jam
  export const getThemesByJam = async (jamId) => {
    try {
      const q = query(
        collection(db, THEMES_COLLECTION),
        where('jamId', '==', jamId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const themes = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        themes.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return themes;
    } catch (error) {
      console.error('Error getting themes by jam:', error);
      return [];
    }
  };
  
  // ===== GESTIÓN DE VOTOS =====
  
  // Guardar o actualizar voto de usuario
  export const saveVote = async (userId, jamId, themeId, previousVote = null) => {
    try {
      const batch = writeBatch(db);
      
      // Si había un voto anterior, eliminarlo
      if (previousVote) {
        const previousVoteQuery = query(
          collection(db, VOTES_COLLECTION),
          where('userId', '==', userId),
          where('jamId', '==', jamId)
        );
        const previousVoteSnapshot = await getDocs(previousVoteQuery);
        
        previousVoteSnapshot.forEach((voteDoc) => {
          batch.delete(voteDoc.ref);
        });
      }
      
      // Crear nuevo voto
      const voteRef = doc(collection(db, VOTES_COLLECTION));
      batch.set(voteRef, {
        userId,
        jamId,
        themeId,
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error saving vote:', error);
      throw error;
    }
  };
  
  // Obtener voto de usuario para una jam
  export const getUserVote = async (userId, jamId) => {
    try {
      const q = query(
        collection(db, VOTES_COLLECTION),
        where('userId', '==', userId),
        where('jamId', '==', jamId)
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
        createdAt: data.createdAt?.toDate() || new Date()
      };
    } catch (error) {
      console.error('Error getting user vote:', error);
      return null;
    }
  };
  
  // Obtener resultados de votación para una jam
  export const getVotingResults = async (jamId) => {
    try {
      const q = query(
        collection(db, VOTES_COLLECTION),
        where('jamId', '==', jamId)
      );
      
      const querySnapshot = await getDocs(q);
      const results = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const themeId = data.themeId;
        
        if (results[themeId]) {
          results[themeId]++;
        } else {
          results[themeId] = 1;
        }
      });
      
      return results;
    } catch (error) {
      console.error('Error getting voting results:', error);
      return {};
    }
  };
  
  // ===== ADMINISTRACIÓN DE VOTACIÓN =====
  
  // Alternar estado de votación (abrir/cerrar)
  export const toggleVotingStatus = async (jamId) => {
    try {
      const jamRef = doc(db, JAMS_COLLECTION, jamId);
      const jamSnapshot = await getDoc(jamRef);
      
      if (!jamSnapshot.exists()) {
        throw new Error('Jam no encontrada');
      }
      
      const jamData = jamSnapshot.data();
      const newStatus = !jamData.themeVotingClosed;
      
      await updateDoc(jamRef, {
        themeVotingClosed: newStatus,
        updatedAt: serverTimestamp()
      });
      
      return newStatus;
    } catch (error) {
      console.error('Error toggling voting status:', error);
      throw error;
    }
  };
  
  // Seleccionar tema ganador
  export const selectWinnerTheme = async (jamId, themeData) => {
    try {
      const jamRef = doc(db, JAMS_COLLECTION, jamId);
      
      await updateDoc(jamRef, {
        selectedTheme: themeData,
        themeVotingClosed: true, // Cerrar votación automáticamente
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error selecting winner theme:', error);
      throw error;
    }
  };
  
  // Obtener estadísticas de votación para admin
  export const getVotingStats = async (jamId) => {
    try {
      const [themes, votes] = await Promise.all([
        getThemesByJam(jamId),
        getVotingResults(jamId)
      ]);
      
      const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
      const totalThemes = themes.length;
      
      // Calcular participación única de usuarios
      const votesQuery = query(
        collection(db, VOTES_COLLECTION),
        where('jamId', '==', jamId)
      );
      const votesSnapshot = await getDocs(votesQuery);
      const uniqueVoters = new Set();
      
      votesSnapshot.forEach((doc) => {
        uniqueVoters.add(doc.data().userId);
      });
      
      return {
        totalThemes,
        totalVotes,
        uniqueVoters: uniqueVoters.size,
        votingResults: votes
      };
    } catch (error) {
      console.error('Error getting voting stats:', error);
      return {
        totalThemes: 0,
        totalVotes: 0,
        uniqueVoters: 0,
        votingResults: {}
      };
    }
  };