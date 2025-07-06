// src/firebase/users.js - Funciones para gestión de usuarios
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';

const USERS_COLLECTION = 'users';

/**
 * Obtiene el nombre para mostrar de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<string>} Nombre del usuario o fallback
 */
export const getUserDisplayName = async (userId) => {
  try {
    // Primero intentar obtener desde la colección users
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Priorizar displayName, luego name, luego email
      if (userData.displayName) {
        return userData.displayName;
      }
      
      if (userData.name) {
        return userData.name;
      }
      
      if (userData.email) {
        // Obtener la parte antes del @ del email
        const emailName = userData.email.split('@')[0];
        return emailName.charAt(0).toUpperCase() + emailName.slice(1);
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
 * Obtiene información completa de un usuario
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
 * Obtiene información básica de múltiples usuarios
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
 * Obtiene nombres de múltiples usuarios de forma eficiente
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
      ...(!(await getDoc(userRef)).exists() && { createdAt: new Date() })
    };
    
    await setDoc(userRef, updateData, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Obtiene el perfil completo de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<object|null>} Datos completos del perfil o null
 */
export const getUserProfile = async (userId) => {
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
    console.error('Error getting user profile:', error);
    return null;
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
    const requiredFields = ['fullName', 'itchUsername', 'email', 'displayName'];
    
    for (const field of requiredFields) {
      if (!profile[field] || !profile[field].trim()) {
        return false;
      }
    }
    
    // Verificar que el nombre completo tenga al menos 2 palabras
    if (profile.fullName.trim().split(' ').length < 2) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking profile completeness:', error);
    return false;
  }
};