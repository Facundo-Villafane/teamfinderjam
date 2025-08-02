// src/firebase/users.js - Versión mejorada con soporte para cuentas de Google
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './config';

const USERS_COLLECTION = 'users';

/**
 * Obtiene el nombre para mostrar de un usuario con soporte mejorado para Google
 * @param {string} userId - ID del usuario
 * @returns {Promise<string>} Nombre del usuario o fallback
 */
export const getUserDisplayName = async (userId) => {
  try {
    // Primero intentar obtener desde la colección users
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Priorizar fullName > displayName > name > email > googleDisplayName
      if (userData.fullName && userData.fullName.trim()) {
        return userData.fullName.trim();
      }
      
      if (userData.displayName && userData.displayName.trim()) {
        return userData.displayName.trim();
      }
      
      if (userData.name && userData.name.trim()) {
        return userData.name.trim();
      }
      
      // Si hay información de Google guardada
      if (userData.googleDisplayName && userData.googleDisplayName.trim()) {
        return userData.googleDisplayName.trim();
      }
      
      if (userData.email) {
        // Obtener la parte antes del @ del email
        const emailName = userData.email.split('@')[0];
        return emailName.charAt(0).toUpperCase() + emailName.slice(1);
      }
    }
    
    // Si el usuario actual es el que estamos buscando, usar info de Auth
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId) {
      if (currentUser.displayName && currentUser.displayName.trim()) {
        // Guardar el displayName de Google para futuras consultas
        await updateUserGoogleInfo(userId, {
          googleDisplayName: currentUser.displayName,
          email: currentUser.email
        });
        return currentUser.displayName.trim();
      }
      
      if (currentUser.email) {
        const emailName = currentUser.email.split('@')[0];
        const nameFromEmail = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        
        // Guardar para futuras consultas
        await updateUserGoogleInfo(userId, {
          email: currentUser.email,
          nameFromEmail: nameFromEmail
        });
        
        return nameFromEmail;
      }
    }
    
    // Fallback: Usuario + primeros 8 caracteres del ID
    return `Usuario ${userId.slice(0, 8)}`;
    
  } catch (error) {
    console.error('Error getting user display name:', error);
    return `Usuario ${userId.slice(0, 8)}`;
  }
};

/**
 * Función auxiliar para actualizar información de Google del usuario
 * @param {string} userId - ID del usuario
 * @param {object} googleInfo - Información de Google a guardar
 */
const updateUserGoogleInfo = async (userId, googleInfo) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const updateData = {
      ...googleInfo,
      lastGoogleUpdate: new Date()
    };
    
    await setDoc(userRef, updateData, { merge: true });
  } catch (error) {
    console.error('Error updating Google info:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
};

/**
 * Obtiene información completa de un usuario con datos de Google actualizados
 * @param {string} userId - ID del usuario
 * @returns {Promise<object|null>} Datos del usuario o null
 */
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (userDoc.exists()) {
      return {
        id: userId,
        ...userDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Obtiene el perfil completo de un usuario con información mejorada
 * @param {string} userId - ID del usuario
 * @returns {Promise<object|null>} Datos completos del perfil o null
 */
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Si el usuario actual es el que estamos consultando y no tiene cierta info,
      // intentar obtenerla de Google Auth
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === userId) {
        let needsUpdate = false;
        const updates = { ...userData };
        
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
          return {
            id: userId,
            ...updates
          };
        }
      }
      
      return {
        id: userId,
        ...userData
      };
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
 * Obtiene información básica de múltiples usuarios con optimización
 * @param {string[]} userIds - Array de IDs de usuarios
 * @returns {Promise<object>} Objeto con userId como clave y datos como valor
 */
export const getMultipleUsersData = async (userIds) => {
  try {
    const users = {};
    
    // Procesar en lotes para evitar demasiadas consultas simultáneas
    const batchSize = 10;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (userId) => {
        const userData = await getUserData(userId);
        return { userId, userData };
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ userId, userData }) => {
        users[userId] = userData;
      });
    }
    
    return users;
  } catch (error) {
    console.error('Error getting multiple users data:', error);
    return {};
  }
};

/**
 * Obtiene nombres de múltiples usuarios de forma eficiente con soporte Google
 * @param {string[]} userIds - Array de IDs de usuarios
 * @returns {Promise<object>} Objeto con userId como clave y nombre como valor
 */
export const getMultipleUserNames = async (userIds) => {
  try {
    const names = {};
    
    // Procesar en lotes
    const batchSize = 10;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (userId) => {
        const name = await getUserDisplayName(userId);
        return { userId, name };
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ userId, name }) => {
        names[userId] = name;
      });
    }
    
    return names;
  } catch (error) {
    console.error('Error getting multiple user names:', error);
    return {};
  }
};

/**
 * Obtiene el mejor nombre disponible para un usuario con fallbacks mejorados
 * @param {string} userId - ID del usuario
 * @returns {Promise<string>} El mejor nombre disponible
 */
export const getBestUserName = async (userId) => {
  try {
    // Obtener perfil completo
    const profile = await getUserProfile(userId);
    
    if (profile) {
      // Prioridad de nombres
      const namePriority = [
        profile.fullName,
        profile.displayName,
        profile.googleDisplayName,
        profile.name,
        profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : null,
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
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Datos a guardar con timestamps
    const updateData = {
      ...profileData,
      updatedAt: new Date(),
      // Si es la primera vez, agregar createdAt
      ...(!((await getDoc(userRef)).exists()) && { createdAt: new Date() })
    };
    
    await setDoc(userRef, updateData, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
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