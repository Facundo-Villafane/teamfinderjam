// src/firebase/themes.js - Sistema de múltiples votos actualizado
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
  
  // Constantes para el sistema de votación
  const MAX_VOTES_PER_USER = 4;
  
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
  
  // ===== SISTEMA DE MÚLTIPLES VOTOS =====
  
  // Obtener votos del usuario para una jam
  export const getUserVotes = async (userId, jamId) => {
    try {
      const q = query(
        collection(db, VOTES_COLLECTION),
        where('userId', '==', userId),
        where('jamId', '==', jamId)
      );
      
      const querySnapshot = await getDocs(q);
      const votes = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        votes.push({
          id: doc.id,
          themeId: data.themeId,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      return votes;
    } catch (error) {
      console.error('Error getting user votes:', error);
      return [];
    }
  };
  
  // Verificar si el usuario puede votar por más temas
  export const canUserVoteMore = async (userId, jamId) => {
    try {
      const userVotes = await getUserVotes(userId, jamId);
      return userVotes.length < MAX_VOTES_PER_USER;
    } catch (error) {
      console.error('Error checking if user can vote more:', error);
      return false;
    }
  };
  
  // Obtener votos restantes del usuario
  export const getRemainingVotes = async (userId, jamId) => {
    try {
      const userVotes = await getUserVotes(userId, jamId);
      return Math.max(0, MAX_VOTES_PER_USER - userVotes.length);
    } catch (error) {
      console.error('Error getting remaining votes:', error);
      return 0;
    }
  };
  
  // Agregar voto (sin reemplazar votos existentes)
  export const addVote = async (userId, jamId, themeId) => {
    try {
      // Verificar que no haya votado ya por este tema
      const existingVoteQuery = query(
        collection(db, VOTES_COLLECTION),
        where('userId', '==', userId),
        where('jamId', '==', jamId),
        where('themeId', '==', themeId)
      );
      const existingVoteSnapshot = await getDocs(existingVoteQuery);
      
      if (!existingVoteSnapshot.empty) {
        throw new Error('Ya has votado por este tema');
      }
      
      // Verificar que no haya excedido el límite de votos
      const canVote = await canUserVoteMore(userId, jamId);
      if (!canVote) {
        throw new Error(`Solo puedes votar por ${MAX_VOTES_PER_USER} temas máximo`);
      }
      
      // Crear nuevo voto
      const voteRef = await addDoc(collection(db, VOTES_COLLECTION), {
        userId,
        jamId,
        themeId,
        createdAt: serverTimestamp()
      });
      
      return voteRef.id;
    } catch (error) {
      console.error('Error adding vote:', error);
      throw error;
    }
  };
  
  // Remover voto específico
  export const removeVote = async (userId, jamId, themeId) => {
    try {
      const voteQuery = query(
        collection(db, VOTES_COLLECTION),
        where('userId', '==', userId),
        where('jamId', '==', jamId),
        where('themeId', '==', themeId)
      );
      const voteSnapshot = await getDocs(voteQuery);
      
      if (voteSnapshot.empty) {
        throw new Error('No se encontró el voto para eliminar');
      }
      
      // Eliminar el voto
      const voteDoc = voteSnapshot.docs[0];
      await deleteDoc(voteDoc.ref);
    } catch (error) {
      console.error('Error removing vote:', error);
      throw error;
    }
  };
  
  // Función auxiliar para compatibilidad (mantener la función saveVote existente)
  export const saveVote = async (userId, jamId, themeId, isRemoving = false) => {
    if (isRemoving) {
      return await removeVote(userId, jamId, themeId);
    } else {
      return await addVote(userId, jamId, themeId);
    }
  };
  
  // ===== RESULTADOS DE VOTACIÓN =====
  
  // Obtener resultados de votación (solo visible cuando se selecciona ganador)
  export const getVotingResults = async (jamId) => {
    try {
      // Verificar si la jam ya tiene un ganador seleccionado
      const jamRef = doc(db, JAMS_COLLECTION, jamId);
      const jamDoc = await getDoc(jamRef);
      
      if (!jamDoc.exists()) {
        return {};
      }
      
      const jamData = jamDoc.data();
      
      // Solo mostrar resultados si hay un tema ganador seleccionado
      if (!jamData.selectedTheme) {
        return {}; // Retorna vacío para ocultar resultados
      }
      
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
  
  // Obtener resultados completos para admin (siempre visible)
  export const getAdminVotingResults = async (jamId) => {
    try {
      const q = query(
        collection(db, VOTES_COLLECTION),
        where('jamId', '==', jamId)
      );
      
      const querySnapshot = await getDocs(q);
      const results = {};
      const votersList = new Set();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const themeId = data.themeId;
        
        // Contar votos por tema
        if (results[themeId]) {
          results[themeId]++;
        } else {
          results[themeId] = 1;
        }
        
        // Contar votantes únicos
        votersList.add(data.userId);
      });
      
      return {
        results,
        totalVotes: querySnapshot.size,
        uniqueVoters: votersList.size
      };
    } catch (error) {
      console.error('Error getting admin voting results:', error);
      return {
        results: {},
        totalVotes: 0,
        uniqueVoters: 0
      };
    }
  };
  
  // ===== ADMINISTRACIÓN DE VOTACIÓN =====
  
  // Alternar estado de votación (abrir/cerrar)
  export const toggleVotingStatus = async (jamId) => {
    try {
      // ✅ Validación defensiva para asegurar que jamId es un string
      if (!jamId || typeof jamId !== 'string') {
        console.error('toggleVotingStatus: jamId must be a valid string, received:', typeof jamId, jamId);
        throw new Error('jamId debe ser un string válido');
      }

      console.log('toggleVotingStatus: Processing jamId:', jamId);
      
      const jamRef = doc(db, JAMS_COLLECTION, jamId);
      const jamSnapshot = await getDoc(jamRef);
      
      if (!jamSnapshot.exists()) {
        throw new Error('Jam no encontrada');
      }
      
      const jamData = jamSnapshot.data();
      
      // ✅ CORREGIDO: Usar themeVotingClosed consistentemente
      // true = cerrada, false = abierta
      const currentlyClosed = jamData.themeVotingClosed || false;
      const newStatus = !currentlyClosed; // Alternar el estado
      
      console.log('toggleVotingStatus: Currently closed:', currentlyClosed, '-> New status (closed):', newStatus);
      
      await updateDoc(jamRef, {
        themeVotingClosed: newStatus,
        updatedAt: serverTimestamp()
      });
      
      // Retornar el nuevo estado (si está cerrada)
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
        themeVotingClosed: true, // ✅ Cerrar votación automáticamente
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
      const [themes, adminResults] = await Promise.all([
        getThemesByJam(jamId),
        getAdminVotingResults(jamId)
      ]);
      
      return {
        totalThemes: themes.length,
        totalVotes: adminResults.totalVotes,
        uniqueVoters: adminResults.uniqueVoters,
        maxVotesPerUser: MAX_VOTES_PER_USER,
        votingResults: adminResults.results
      };
    } catch (error) {
      console.error('Error getting voting stats:', error);
      return {
        totalThemes: 0,
        totalVotes: 0,
        uniqueVoters: 0,
        maxVotesPerUser: MAX_VOTES_PER_USER,
        votingResults: {}
      };
    }
  };
  
  // Función para compatibilidad (getUserVote -> getUserVotes)
  export const getUserVote = async (userId, jamId) => {
    const votes = await getUserVotes(userId, jamId);
    return votes.length > 0 ? { themeId: votes[0].themeId } : null;
  };