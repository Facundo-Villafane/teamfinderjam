// src/firebase/users.js - Gestión de usuarios con manejo robusto de fechas

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { auth, db } from './config';
import { safeToDate } from '../utils/dateUtils';

const USERS_COLLECTION = 'users';

/**
 * Obtiene el perfil de un usuario específico
 * @param {string} userId - ID del usuario
 * @returns {Promise<object|null>} Perfil del usuario o null
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Usar manejo robusto de fechas
      const profile = {
        id: userId,
        ...userData,
        createdAt: safeToDate(userData.createdAt, new Date()),
        updatedAt: safeToDate(userData.updatedAt, new Date()),
        lastGoogleSync: safeToDate(userData.lastGoogleSync, null)
      };
      
      // Si el usuario actual es el que estamos consultando y no tiene cierta info,
      // intentar obtenerla de Google Auth
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === userId) {
        let needsUpdate = false;
        const updates = { ...profile };
        
        // Actualizar displayName si no existe o está vacío
        if ((!userData.displayName || !userData.displayName.trim()) && 
            currentUser.displayName && currentUser.displayName.trim()) {
          updates.displayName = currentUser.displayName;
          updates.googleDisplayName = currentUser.displayName;
          needsUpdate = true;
        }
        
        // Actualizar email si no existe
        if ((!userData.email || !userData.email.trim()) && 
            currentUser.email && currentUser.email.trim()) {
          updates.email = currentUser.email;
          needsUpdate = true;
        }
        
        // Actualizar foto de perfil si no existe
        if ((!userData.photoURL || !userData.photoURL.trim()) && 
            currentUser.photoURL && currentUser.photoURL.trim()) {
          updates.photoURL = currentUser.photoURL;
          updates.googlePhotoURL = currentUser.photoURL;
          needsUpdate = true;
        }
        
        // Si hay actualizaciones, guardarlas
        if (needsUpdate) {
          updates.lastGoogleSync = new Date();
          await setDoc(doc(db, USERS_COLLECTION, userId), updates, { merge: true });
          return updates;
        }
      }
      
      return profile;
    }
    
    // Si no existe el perfil pero es el usuario actual, crear uno básico con info de Google
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId) {
      const basicProfile = {
        id: userId,
        displayName: currentUser.displayName || '',
        googleDisplayName: currentUser.displayName || '',
        email: currentUser.email || '',
        photoURL: currentUser.photoURL || '',
        googlePhotoURL: currentUser.photoURL || '',
        createdAt: new Date(),
        lastGoogleSync: new Date()
      };
      
      // Guardar el perfil básico
      await setDoc(doc(db, USERS_COLLECTION, userId), basicProfile, { merge: true });
      return basicProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Obtiene el nombre para mostrar de un usuario de forma robusta
 * @param {string} userId - ID del usuario
 * @returns {Promise<string>} Nombre del usuario
 */
export const getUserDisplayName = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Prioridad de nombres
      const namePriority = [
        userData.displayName,
        userData.googleDisplayName,
        userData.fullName,
        userData.name,
        userData.firstName && userData.lastName ? 
          `${userData.firstName} ${userData.lastName}` : null,
        userData.firstName,
        userData.email ? userData.email.split('@')[0] : null
      ];
      
      for (const name of namePriority) {
        if (name && typeof name === 'string' && name.trim() && name.trim().length > 1) {
          return name.trim();
        }
      }
    }
    
    // Si no hay información, intentar obtener del auth actual
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId && currentUser.displayName) {
      return currentUser.displayName;
    }
    
    return 'Usuario Anónimo';
  } catch (error) {
    console.error('Error getting user display name:', error);
    return 'Usuario Anónimo';
  }
};

/**
 * Obtiene el mejor nombre disponible para un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<string>} Mejor nombre disponible
 */
export const getBestUserName = async (userId) => {
  try {
    const profile = await getUserProfile(userId);
    
    if (profile) {
      // Prioridad de nombres para certificados y reconocimientos
      const namePriority = [
        profile.fullName,
        profile.displayName,
        profile.googleDisplayName,
        profile.name,
        profile.firstName && profile.lastName ? 
          `${profile.firstName} ${profile.lastName}` : null,
        profile.firstName,
        profile.email ? profile.email.split('@')[0] : null
      ];
      
      for (const name of namePriority) {
        if (name && typeof name === 'string' && name.trim() && name.trim().length > 1) {
          return name.trim();
        }
      }
    }
    
    // Si no hay perfil o nombres válidos, usar getUserDisplayName
    return await getUserDisplayName(userId);
    
  } catch (error) {
    console.error('Error getting best user name:', error);
    return await getUserDisplayName(userId);
  }
};

/**
 * Sincroniza la información del usuario actual con Google Auth
 * @returns {Promise<object|null>} Perfil actualizado o null
 */
export const syncCurrentUserWithGoogle = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }
    
    const userId = currentUser.uid;
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Obtener datos actuales
    const currentDoc = await getDoc(userRef);
    const currentData = currentDoc.exists() ? currentDoc.data() : {};
    
    // Preparar actualizaciones
    const updates = {
      ...currentData,
      email: currentUser.email || currentData.email || '',
      lastGoogleSync: new Date(),
      updatedAt: new Date()
    };
    
    // Actualizar displayName si viene de Google y no existe uno
    if (currentUser.displayName && (!currentData.displayName || !currentData.googleDisplayName)) {
      updates.googleDisplayName = currentUser.displayName;
      if (!currentData.displayName) {
        updates.displayName = currentUser.displayName;
      }
    }
    
    // Actualizar foto si viene de Google
    if (currentUser.photoURL && !currentData.googlePhotoURL) {
      updates.googlePhotoURL = currentUser.photoURL;
      if (!currentData.photoURL) {
        updates.photoURL = currentUser.photoURL;
      }
    }
    
    // Si es primera vez, marcar como creado
    if (!currentDoc.exists()) {
      updates.createdAt = new Date();
    }
    
    // Guardar actualizaciones
    await setDoc(userRef, updates, { merge: true });
    
    return {
      id: userId,
      ...updates
    };
    
  } catch (error) {
    console.error('Error syncing user with Google:', error);
    return null;
  }
};

/**
 * Actualiza el perfil completo de un usuario
 * @param {string} userId - ID del usuario
 * @param {object} profileData - Datos del perfil a actualizar
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    console.log('=== DEBUG: updateUserProfile ===');
    console.log('userId:', userId);
    console.log('profileData:', profileData);
    console.log('Current user:', auth.currentUser);
    console.log('Auth UID:', auth.currentUser?.uid);
    console.log('UIDs match:', auth.currentUser?.uid === userId);
    
    // Verificar autenticación
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }
    
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Verificar si el documento existe
    const existingDoc = await getDoc(userRef);
    console.log('Document exists:', existingDoc.exists());
    console.log('Existing data:', existingDoc.data());
    
    // Datos a guardar con timestamps
    const updateData = {
      ...profileData,
      updatedAt: new Date(),
      // Si es la primera vez, agregar createdAt
      ...(!existingDoc.exists() && { createdAt: new Date() })
    };
    
    console.log('Final updateData:', updateData);
    
    await setDoc(userRef, updateData, { merge: true });
    console.log('Profile updated successfully');
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

/**
 * Verifica si un usuario tiene el perfil completo para certificados
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>} True si el perfil está completo
 */
export const isProfileCompleteForCertificates = async (userId) => {
  try {
    const profile = await getUserProfile(userId);
    
    if (!profile) return false;
    
    // Verificar campos requeridos para certificados
    const requiredFields = ['email'];
    
    for (const field of requiredFields) {
      if (!profile[field] || !profile[field].trim()) {
        return false;
      }
    }
    
    // Verificar que tenga al menos un nombre válido
    const hasValidName = profile.fullName || 
                        profile.displayName || 
                        profile.googleDisplayName || 
                        profile.name ||
                        (profile.firstName && profile.lastName);
    
    if (!hasValidName) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking profile completeness:', error);
    return false;
  }
};

/**
 * Obtiene todos los usuarios (función para admin) - Versión robusta
 * @returns {Promise<Array>} Array con todos los usuarios
 */
export const getAllUsers = async () => {
  try {
    // Primero intentar con orderBy
    let usersSnapshot;
    let users = [];
    
    try {
      const usersQuery = query(
        collection(db, USERS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      usersSnapshot = await getDocs(usersQuery);
    } catch (error) {
      console.warn('orderBy failed, fetching all users without order:', error);
      // Si falla el orderBy (por campos faltantes), obtener todos sin ordenar
      usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    }
    
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Usar manejo robusto de fechas
      const defaultDate = new Date(0); // Época Unix como fallback
      
      users.push({
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt, defaultDate),
        updatedAt: safeToDate(data.updatedAt, defaultDate),
        lastGoogleSync: safeToDate(data.lastGoogleSync, null)
      });
    });

    // Ordenar manualmente por fecha de creación (más recientes primero)
    users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    console.log(`Loaded ${users.length} users from Firestore`);
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

/**
 * Obtiene todos los usuarios desde múltiples fuentes (función para admin)
 * @returns {Promise<Array>} Array con todos los usuarios únicos
 */
export const getAllUsersComprehensive = async () => {
  try {
    const allUsers = new Map(); // Usar Map para evitar duplicados
    
    // 1. Obtener usuarios de la colección users
    try {
      const usersFromCollection = await getAllUsers();
      usersFromCollection.forEach(user => {
        allUsers.set(user.id, user);
      });
    } catch (error) {
      console.error('Error loading from users collection:', error);
    }
    
    // 2. Obtener usuarios únicos de posts (para usuarios que postearon pero no tienen perfil)
    try {
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      
      postsSnapshot.forEach((doc) => {
        const post = doc.data();
        if (post.userId && !allUsers.has(post.userId)) {
          // Usuario encontrado en posts pero no en colección users
          allUsers.set(post.userId, {
            id: post.userId,
            displayName: post.username || 'Usuario sin perfil',
            email: '',
            missingProfile: true,
            foundInPosts: true,
            createdAt: safeToDate(post.createdAt, new Date(0)),
            updatedAt: safeToDate(post.updatedAt, new Date(0)),
            lastGoogleSync: null
          });
        }
      });
    } catch (error) {
      console.error('Error loading users from posts:', error);
    }
    
    // 3. Obtener usuarios únicos de participantes
    try {
      const participantsSnapshot = await getDocs(collection(db, 'participants'));
      
      participantsSnapshot.forEach((doc) => {
        const participant = doc.data();
        if (participant.userId && !allUsers.has(participant.userId)) {
          // Usuario encontrado en participantes pero no en colección users
          allUsers.set(participant.userId, {
            id: participant.userId,
            displayName: 'Participante sin perfil',
            email: '',
            missingProfile: true,
            foundInParticipants: true,
            createdAt: safeToDate(participant.createdAt, new Date(0)),
            updatedAt: safeToDate(participant.updatedAt, new Date(0)),
            lastGoogleSync: null
          });
        }
      });
    } catch (error) {
      console.error('Error loading users from participants:', error);
    }
    
    // Convertir Map a Array y ordenar
    const usersArray = Array.from(allUsers.values());
    
    // Ordenar: usuarios con perfil primero, luego por fecha de creación
    usersArray.sort((a, b) => {
      if (a.missingProfile && !b.missingProfile) return 1;
      if (!a.missingProfile && b.missingProfile) return -1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    console.log(`Total comprehensive users loaded: ${usersArray.length}`);
    return usersArray;
    
  } catch (error) {
    console.error('Error getting comprehensive users:', error);
    return [];
  }
};

/**
 * Obtiene el historial de participación en jams de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Array con historial de jams
 */
export const getUserJamHistory = async (userId) => {
  try {
    const participantsQuery = query(
      collection(db, 'participants'),
      where('userId', '==', userId)
    );
    
    const participantsSnapshot = await getDocs(participantsQuery);
    const jamHistory = [];
    
    participantsSnapshot.forEach((doc) => {
      const data = doc.data();
      jamHistory.push({
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt, new Date()),
        updatedAt: safeToDate(data.updatedAt, new Date())
      });
    });
    
    return jamHistory;
  } catch (error) {
    console.error('Error getting user jam history:', error);
    return [];
  }
};