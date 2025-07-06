// src/firebase/participants.js
import { 
    collection, 
    doc, 
    addDoc, 
    deleteDoc, 
    getDocs, 
    getDoc,
    query, 
    where,
    orderBy,
    serverTimestamp,
    updateDoc
  } from 'firebase/firestore';
  import { db } from './config';
  
  const PARTICIPANTS_COLLECTION = 'participants';
  const JAMS_COLLECTION = 'jams';
  const POSTS_COLLECTION = 'posts';
  
  // ===== GESTIÓN DE PARTICIPANTES =====
  
  // Unirse a una jam
  export const joinJam = async (userId, jamId) => {
    try {
      // Verificar si ya está unido
      const existingParticipant = await getParticipation(userId, jamId);
      if (existingParticipant) {
        return existingParticipant.id; // Ya está unido
      }
  
      // Crear nueva participación
      const docRef = await addDoc(collection(db, PARTICIPANTS_COLLECTION), {
        userId,
        jamId,
        joinedAt: serverTimestamp(),
        isActive: true,
        createdAt: serverTimestamp()
      });
  
      return docRef.id;
    } catch (error) {
      console.error('Error joining jam:', error);
      throw error;
    }
  };
  
  // Salirse de una jam
  export const leaveJam = async (userId, jamId) => {
    try {
      const participation = await getParticipation(userId, jamId);
      if (participation) {
        await deleteDoc(doc(db, PARTICIPANTS_COLLECTION, participation.id));
      }
    } catch (error) {
      console.error('Error leaving jam:', error);
      throw error;
    }
  };
  
  // Verificar si un usuario está unido a una jam
  export const isUserJoined = async (userId, jamId) => {
    try {
      if (!userId || !jamId) return false;
      
      const participation = await getParticipation(userId, jamId);
      return !!participation;
    } catch (error) {
      console.error('Error checking if user joined:', error);
      return false;
    }
  };
  
  // Obtener participación específica
  export const getParticipation = async (userId, jamId) => {
    try {
      const q = query(
        collection(db, PARTICIPANTS_COLLECTION),
        where('userId', '==', userId),
        where('jamId', '==', jamId),
        where('isActive', '==', true)
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
        joinedAt: data.joinedAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date()
      };
    } catch (error) {
      console.error('Error getting participation:', error);
      return null;
    }
  };
  
  // Obtener todos los participantes de una jam
export const getJamParticipants = async (jamId) => {
  try {
    const q = query(
      collection(db, PARTICIPANTS_COLLECTION),
      where('jamId', '==', jamId),
      where('isActive', '==', true),
      orderBy('joinedAt', 'desc')  // ← Agrega esta línea
    );
      
      const querySnapshot = await getDocs(q);
      const participants = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        participants.push({
          id: doc.id,
          ...data,
          joinedAt: data.joinedAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      return participants;
    } catch (error) {
      console.error('Error getting jam participants:', error);
      return [];
    }
  };
  
  // Obtener estadísticas de participación para una jam
  export const getJamParticipationStats = async (jamId) => {
    try {
      const participants = await getJamParticipants(jamId);
      
      return {
        totalParticipants: participants.length,
        recentJoins: participants.filter(p => {
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return p.joinedAt > dayAgo;
        }).length
      };
    } catch (error) {
      console.error('Error getting participation stats:', error);
      return {
        totalParticipants: 0,
        recentJoins: 0
      };
    }
  };
  
  // ===== MIGRACIÓN AUTOMÁTICA =====
  
  // Migrar usuarios existentes que ya tienen posts
  export const migrateExistingUsers = async (jamId) => {
    try {
      console.log(`Iniciando migración para jam: ${jamId}`);
      
      // Obtener todos los posts de esta jam
      const postsQuery = query(
        collection(db, POSTS_COLLECTION),
        where('edition', '==', jamId)
      );
      
      const postsSnapshot = await getDocs(postsQuery);
      const userIds = new Set();
      
      // Recopilar IDs únicos de usuarios
      postsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId) {
          userIds.add(data.userId);
        }
      });
      
      console.log(`Encontrados ${userIds.size} usuarios únicos para migrar`);
      
      // Agregar cada usuario como participante si no está ya
      const migrationPromises = Array.from(userIds).map(async (userId) => {
        try {
          const existingParticipation = await getParticipation(userId, jamId);
          if (!existingParticipation) {
            await joinJam(userId, jamId);
            console.log(`Usuario ${userId} migrado exitosamente`);
          } else {
            console.log(`Usuario ${userId} ya era participante`);
          }
        } catch (error) {
          console.error(`Error migrando usuario ${userId}:`, error);
        }
      });
      
      await Promise.all(migrationPromises);
      console.log('Migración completada');
      
      return {
        totalUsers: userIds.size,
        migrated: true
      };
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  };
  
  // ===== FUNCIONES PARA EL PERFIL =====
  
  // Obtener todas las jams en las que un usuario ha participado
  export const getUserJamParticipations = async (userId) => {
    try {
      const q = query(
        collection(db, PARTICIPANTS_COLLECTION),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const participations = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        participations.push({
          id: doc.id,
          ...data,
          joinedAt: data.joinedAt?.toDate() || new Date()
        });
      });
      
      return participations;
    } catch (error) {
      console.error('Error getting user participations:', error);
      return [];
    }
  };
  
  // Obtener detalles de jams donde participó un usuario
  export const getUserJamHistory = async (userId) => {
    try {
      const participations = await getUserJamParticipations(userId);
      
      if (participations.length === 0) {
        return [];
      }
      
      // Obtener detalles de cada jam
      const jamPromises = participations.map(async (participation) => {
        try {
          const jamDoc = await getDoc(doc(db, JAMS_COLLECTION, participation.jamId));
          if (jamDoc.exists()) {
            return {
              ...jamDoc.data(),
              id: jamDoc.id,
              joinedAt: participation.joinedAt,
              participationId: participation.id
            };
          }
          return null;
        } catch (error) {
          console.error(`Error getting jam ${participation.jamId}:`, error);
          return null;
        }
      });
      
      const jams = await Promise.all(jamPromises);
      return jams.filter(jam => jam !== null);
    } catch (error) {
      console.error('Error getting user jam history:', error);
      return [];
    }
  };
  
  // ===== FUNCIONES DE ADMINISTRACIÓN =====
  
  // Agregar usuario manualmente (para admins)
  export const addUserToJam = async (userId, jamId, adminUserId) => {
    try {
      const participationId = await joinJam(userId, jamId);
      
      // Log de acción administrativa
      console.log(`Admin ${adminUserId} added user ${userId} to jam ${jamId}`);
      
      return participationId;
    } catch (error) {
      console.error('Error adding user to jam:', error);
      throw error;
    }
  };
  
  // Remover usuario manualmente (para admins)
  export const removeUserFromJam = async (userId, jamId, adminUserId) => {
    try {
      await leaveJam(userId, jamId);
      
      // Log de acción administrativa
      console.log(`Admin ${adminUserId} removed user ${userId} from jam ${jamId}`);
    } catch (error) {
      console.error('Error removing user from jam:', error);
      throw error;
    }
  };