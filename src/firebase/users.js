// src/firebase/users.js - Versión limpia sin duplicaciones
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from './config';

const USERS_COLLECTION = 'users';

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
      users.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(0), // Fecha por defecto si no existe
        updatedAt: data.updatedAt?.toDate() || new Date(0),
        lastGoogleSync: data.lastGoogleSync?.toDate() || null
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
    
    // 2. Obtener usuarios únicos de la colección participants
    try {
      const participantsSnapshot = await getDocs(collection(db, 'participants'));
      const uniqueUserIds = new Set();
      
      participantsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId) {
          uniqueUserIds.add(data.userId);
        }
      });
      
      // Para cada userId encontrado en participants, intentar obtener su perfil
      for (const userId of uniqueUserIds) {
        if (!allUsers.has(userId)) {
          try {
            const userProfile = await getUserProfile(userId);
            if (userProfile) {
              allUsers.set(userId, {
                ...userProfile,
                fromParticipants: true // Marca para identificar origen
              });
            } else {
              // Usuario sin perfil, crear uno básico
              allUsers.set(userId, {
                id: userId,
                displayName: `Usuario ${userId.slice(0, 8)}`,
                email: '',
                fullName: '',
                createdAt: new Date(0),
                updatedAt: new Date(0),
                fromParticipants: true,
                missingProfile: true
              });
            }
          } catch (error) {
            console.error(`Error loading profile for user ${userId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading from participants:', error);
    }
    
    // Convertir Map a Array y ordenar
    const users = Array.from(allUsers.values());
    users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    console.log(`Loaded ${users.length} total users (from collections: users + participants)`);
    return users;
  } catch (error) {
    console.error('Error in comprehensive user loading:', error);
    return [];
  }
};

/**
 * Obtiene todas las jams en las que un usuario ha participado
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Array de participaciones
 */
export const getUserJamHistory = async (userId) => {
  try {
    let participationsSnapshot;
    
    try {
      const participationsQuery = query(
        collection(db, 'participants'),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('joinedAt', 'desc')
      );
      participationsSnapshot = await getDocs(participationsQuery);
    } catch (error) {
      console.warn('orderBy failed for jam history, fetching without order:', error);
      // Si falla el orderBy, obtener sin ordenar
      const participationsQuery = query(
        collection(db, 'participants'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      participationsSnapshot = await getDocs(participationsQuery);
    }
    
    const participations = [];
    
    participationsSnapshot.forEach((doc) => {
      const data = doc.data();
      participations.push({
        id: doc.id,
        ...data,
        joinedAt: data.joinedAt?.toDate() || new Date()
      });
    });

    // Ordenar manualmente por fecha
    participations.sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime());

    return participations;
  } catch (error) {
    console.error('Error getting user jam history:', error);
    return [];
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