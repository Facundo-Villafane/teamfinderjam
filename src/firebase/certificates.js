// src/firebase/certificates.js - Gestión de certificados con manejo robusto de fechas

import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy,
  writeBatch 
} from 'firebase/firestore';
import { db } from './config';
import { safeToDate } from '../utils/dateUtils';

const CERTIFICATES_COLLECTION = 'certificates';

/**
 * Crea un nuevo certificado
 * @param {object} certificateData - Datos del certificado
 * @returns {Promise<string>} ID del certificado creado
 */
export const createCertificate = async (certificateData) => {
  try {
    const certificateWithTimestamp = {
      ...certificateData,
      createdAt: new Date(),
      updatedAt: new Date(),
      awardedDate: certificateData.awardedDate || new Date()
    };
    
    const docRef = await addDoc(collection(db, CERTIFICATES_COLLECTION), certificateWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error('Error creating certificate:', error);
    throw error;
  }
};

/**
 * Actualiza un certificado existente
 * @param {string} certificateId - ID del certificado
 * @param {object} updateData - Datos a actualizar
 * @returns {Promise<void>}
 */
export const updateCertificate = async (certificateId, updateData) => {
  try {
    const certificateRef = doc(db, CERTIFICATES_COLLECTION, certificateId);
    
    const updateWithTimestamp = {
      ...updateData,
      updatedAt: new Date()
    };
    
    await updateDoc(certificateRef, updateWithTimestamp);
  } catch (error) {
    console.error('Error updating certificate:', error);
    throw error;
  }
};

/**
 * Elimina un certificado
 * @param {string} certificateId - ID del certificado
 * @returns {Promise<void>}
 */
export const deleteCertificate = async (certificateId) => {
  try {
    const certificateRef = doc(db, CERTIFICATES_COLLECTION, certificateId);
    await deleteDoc(certificateRef);
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw error;
  }
};

/**
 * Obtiene un certificado específico
 * @param {string} certificateId - ID del certificado
 * @returns {Promise<object|null>} Certificado o null
 */
export const getCertificate = async (certificateId) => {
  try {
    const certificateRef = doc(db, CERTIFICATES_COLLECTION, certificateId);
    const certificateDoc = await getDoc(certificateRef);
    
    if (certificateDoc.exists()) {
      const data = certificateDoc.data();
      return {
        id: certificateDoc.id,
        ...data,
        awardedDate: safeToDate(data.awardedDate, new Date()),
        createdAt: safeToDate(data.createdAt, new Date()),
        updatedAt: safeToDate(data.updatedAt, new Date())
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting certificate:', error);
    return null;
  }
};

/**
 * Obtiene certificados de un usuario específico
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Array de certificados
 */
export const getUserCertificates = async (userId) => {
  try {
    const certificatesQuery = query(
      collection(db, CERTIFICATES_COLLECTION),
      where('userId', '==', userId),
      orderBy('awardedDate', 'desc')
    );
    
    const certificatesSnapshot = await getDocs(certificatesQuery);
    const certificates = [];
    
    certificatesSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Usar manejo robusto de fechas
      const defaultDate = new Date();
      
      certificates.push({
        id: doc.id,
        ...data,
        awardedDate: safeToDate(data.awardedDate, defaultDate),
        createdAt: safeToDate(data.createdAt, defaultDate),
        updatedAt: safeToDate(data.updatedAt, defaultDate)
      });
    });

    return certificates;
  } catch (error) {
    console.error('Error getting user certificates:', error);
    return [];
  }
};

/**
 * Obtiene certificados de una jam específica
 * @param {string} jamId - ID de la jam
 * @returns {Promise<Array>} Array de certificados
 */
export const getJamCertificates = async (jamId) => {
  try {
    const certificatesQuery = query(
      collection(db, CERTIFICATES_COLLECTION),
      where('jamId', '==', jamId),
      orderBy('createdAt', 'desc')
    );
    
    const certificatesSnapshot = await getDocs(certificatesQuery);
    const certificates = [];
    
    certificatesSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Usar manejo robusto de fechas
      const defaultDate = new Date();
      
      certificates.push({
        id: doc.id,
        ...data,
        awardedDate: safeToDate(data.awardedDate, defaultDate),
        createdAt: safeToDate(data.createdAt, defaultDate),
        updatedAt: safeToDate(data.updatedAt, defaultDate)
      });
    });

    return certificates;
  } catch (error) {
    console.error('Error getting jam certificates:', error);
    return [];
  }
};

/**
 * Obtiene todos los certificados (para admin)
 * @returns {Promise<Array>} Array de todos los certificados
 */
export const getAllCertificates = async () => {
  try {
    const certificatesQuery = query(
      collection(db, CERTIFICATES_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const certificatesSnapshot = await getDocs(certificatesQuery);
    const certificates = [];
    
    certificatesSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Usar manejo robusto de fechas
      const defaultDate = new Date();
      
      certificates.push({
        id: doc.id,
        ...data,
        awardedDate: safeToDate(data.awardedDate, defaultDate),
        createdAt: safeToDate(data.createdAt, defaultDate),
        updatedAt: safeToDate(data.updatedAt, defaultDate)
      });
    });

    return certificates;
  } catch (error) {
    console.error('Error getting all certificates:', error);
    return [];
  }
};

/**
 * Crea certificados de participación en masa para una jam
 * @param {string} jamId - ID de la jam
 * @param {string} jamName - Nombre de la jam
 * @param {Array} participants - Array de participantes
 * @returns {Promise<object>} Resultado de la operación
 */
export const createMassParticipationCertificates = async (jamId, jamName, participants) => {
  try {
    // Obtener certificados existentes para esta jam
    const existingCertificates = await getJamCertificates(jamId);
    const existingUserIds = new Set(
      existingCertificates
        .filter(cert => cert.category === 'participation')
        .map(cert => cert.userId)
    );

    // Filtrar participantes que no tienen certificado de participación
    const participantsToProcess = participants.filter(participant => 
      !existingUserIds.has(participant.userId)
    );

    if (participantsToProcess.length === 0) {
      return {
        totalParticipants: participants.length,
        certificatesCreated: 0,
        message: 'Todos los participantes ya tienen certificados de participación'
      };
    }

    // Crear certificados en lotes (Firestore permite máximo 500 operaciones por batch)
    const batchSize = 400; // Usar un número menor para mayor seguridad
    let createdCount = 0;

    for (let i = 0; i < participantsToProcess.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchParticipants = participantsToProcess.slice(i, i + batchSize);

      batchParticipants.forEach(participant => {
        const certificateRef = doc(collection(db, CERTIFICATES_COLLECTION));
        
        const certificateData = {
          userId: participant.userId,
          jamId: jamId,
          jamName: jamName,
          category: 'participation',
          isWinner: false,
          awardedDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          // Datos adicionales del participante si están disponibles
          ...(participant.username && { participantUsername: participant.username })
        };
        
        batch.set(certificateRef, certificateData);
        createdCount++;
      });

      await batch.commit();
    }

    return {
      totalParticipants: participantsToProcess.length,
      certificatesCreated: createdCount,
      message: `Se crearon ${createdCount} certificados de participación de ${participantsToProcess.length} participantes`
    };
  } catch (error) {
    console.error('Error creating mass participation certificates:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de certificados para admin
 * @param {string} jamId - ID de la jam (opcional)
 * @returns {Promise<object>} Estadísticas de certificados
 */
export const getCertificateStats = async (jamId) => {
  try {
    const certificatesQuery = jamId ? 
      query(
        collection(db, CERTIFICATES_COLLECTION),
        where('jamId', '==', jamId)
      ) :
      query(collection(db, CERTIFICATES_COLLECTION));
    
    const certificatesSnapshot = await getDocs(certificatesQuery);
    
    const stats = {
      total: 0,
      participation: 0,
      recognition: 0,
      byCategory: {},
      byJam: {}
    };
    
    certificatesSnapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      
      if (data.category === 'participation') {
        stats.participation++;
      } else {
        stats.recognition++;
      }
      
      // Contar por categoría
      if (!stats.byCategory[data.category]) {
        stats.byCategory[data.category] = 0;
      }
      stats.byCategory[data.category]++;
      
      // Contar por jam
      if (!stats.byJam[data.jamId]) {
        stats.byJam[data.jamId] = {
          jamName: data.jamName,
          total: 0,
          participation: 0,
          recognition: 0
        };
      }
      stats.byJam[data.jamId].total++;
      
      if (data.category === 'participation') {
        stats.byJam[data.jamId].participation++;
      } else {
        stats.byJam[data.jamId].recognition++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting certificate stats:', error);
    return {
      total: 0,
      participation: 0,
      recognition: 0,
      byCategory: {},
      byJam: {}
    };
  }
};

/**
 * Verifica si un usuario tiene un certificado específico
 * @param {string} userId - ID del usuario
 * @param {string} jamId - ID de la jam
 * @param {string} category - Categoría del certificado
 * @returns {Promise<boolean>} True si tiene el certificado
 */
export const userHasCertificate = async (userId, jamId, category) => {
  try {
    const certificatesQuery = query(
      collection(db, CERTIFICATES_COLLECTION),
      where('userId', '==', userId),
      where('jamId', '==', jamId),
      where('category', '==', category)
    );
    
    const certificatesSnapshot = await getDocs(certificatesQuery);
    return !certificatesSnapshot.empty;
  } catch (error) {
    console.error('Error checking user certificate:', error);
    return false;
  }
};