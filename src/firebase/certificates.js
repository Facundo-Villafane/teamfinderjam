// src/firebase/certificates.js - Sistema de certificados actualizado con gameLink
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

const CERTIFICATES_COLLECTION = 'certificates';
const JAMS_COLLECTION = 'jams';

/**
 * Función mejorada para crear certificados personalizados con gameLink
 */
export const createCustomCertificate = async (userId, jamId, certificateData) => {
  try {
    // Obtener datos de la jam
    const jamDoc = await getDoc(doc(db, JAMS_COLLECTION, jamId));
    if (!jamDoc.exists()) {
      throw new Error('Jam not found');
    }
    
    const jamData = jamDoc.data();

    // Determinar correctamente si es certificado de reconocimiento
    const isRecognitionCert = certificateData.isWinner === true || 
                             certificateData.type === 'recognition' ||
                             (certificateData.category && 
                              certificateData.category !== 'participation' && 
                              certificateData.category !== 'Participación');

    console.log('Creating certificate with gameLink:', {
      userId,
      category: certificateData.category,
      isWinner: isRecognitionCert,
      type: certificateData.type,
      gameName: certificateData.gameName,
      gameLink: certificateData.gameLink
    });

    // Crear certificado con todos los datos incluyendo gameLink
    const certificateRef = await addDoc(collection(db, CERTIFICATES_COLLECTION), {
      userId,
      jamId,
      jamName: jamData.name,
      category: certificateData.category || 'participation',
      isWinner: isRecognitionCert,
      // Campos personalizados del Manual Certificate Creator
      customTitle: certificateData.title || null,
      customSubtitle: certificateData.subtitle || null, 
      customMainText: certificateData.mainText || null,
      customSignature: certificateData.signature || null,
      // Campos para reconocimientos
      gameName: certificateData.gameName || null,
      gameLink: certificateData.gameLink || null, // NUEVO CAMPO
      gameDescription: certificateData.gameDescription || null,
      postId: certificateData.postId || null,
      // Metadatos
      awardedDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return certificateRef.id;
  } catch (error) {
    console.error('Error creating custom certificate:', error);
    throw error;
  }
};

/**
 * Función actualizada para crear certificados de reconocimiento con gameLink
 */
export const createRecognitionCertificate = async (userId, jamId, category, additionalData = {}) => {
  try {
    // Obtener datos de la jam
    const jamDoc = await getDoc(doc(db, JAMS_COLLECTION, jamId));
    if (!jamDoc.exists()) {
      throw new Error('Jam not found');
    }
    
    const jamData = jamDoc.data();

    // Crear certificado de reconocimiento con datos adicionales incluyendo gameLink
    const certificateRef = await addDoc(collection(db, CERTIFICATES_COLLECTION), {
      userId,
      jamId,
      jamName: jamData.name,
      category,
      isWinner: true,
      // Campos para reconocimientos
      gameName: additionalData.gameName || null,
      gameLink: additionalData.gameLink || null, // NUEVO CAMPO
      gameDescription: additionalData.gameDescription || null,
      postId: additionalData.postId || null,
      awardedDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return certificateRef.id;
  } catch (error) {
    console.error('Error creating recognition certificate:', error);
    throw error;
  }
};

// Crear certificado de participación automáticamente
export const createParticipationCertificate = async (userId, jamId) => {
  try {
    // Verificar si ya existe certificado de participación
    const existingQuery = query(
      collection(db, CERTIFICATES_COLLECTION),
      where('userId', '==', userId),
      where('jamId', '==', jamId),
      where('category', '==', 'participation')
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      console.log('Certificate already exists for user:', userId);
      return;
    }

    // Obtener datos de la jam
    const jamDoc = await getDoc(doc(db, JAMS_COLLECTION, jamId));
    if (!jamDoc.exists()) {
      throw new Error('Jam not found');
    }
    
    const jamData = jamDoc.data();

    // Crear certificado de participación
    const certificateRef = await addDoc(collection(db, CERTIFICATES_COLLECTION), {
      userId,
      jamId,
      jamName: jamData.name,
      category: 'participation',
      isWinner: false,
      awardedDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return certificateRef.id;
  } catch (error) {
    console.error('Error creating participation certificate:', error);
    throw error;
  }
};

// Nueva función para crear certificados masivos de participación
export const createMassParticipationCertificates = async (jamId) => {
  try {
    // Obtener todos los participantes de la jam
    const participantsQuery = query(
      collection(db, 'participants'),
      where('jamId', '==', jamId),
      where('isActive', '==', true)
    );
    
    const participantsSnapshot = await getDocs(participantsQuery);
    
    if (participantsSnapshot.empty) {
      throw new Error('No participants found for this jam');
    }

    // Obtener datos de la jam
    const jamDoc = await getDoc(doc(db, JAMS_COLLECTION, jamId));
    if (!jamDoc.exists()) {
      throw new Error('Jam not found');
    }
    
    const jamData = jamDoc.data();
    
    const batch = writeBatch(db);
    let createdCount = 0;

    // Crear certificados para cada participante
    for (const participantDoc of participantsSnapshot.docs) {
      const participantData = participantDoc.data();
      
      // Verificar si ya tiene certificado de participación
      const existingQuery = query(
        collection(db, CERTIFICATES_COLLECTION),
        where('userId', '==', participantData.userId),
        where('jamId', '==', jamId),
        where('category', '==', 'participation')
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (existingSnapshot.empty) {
        // Crear nuevo certificado
        const certificateRef = doc(collection(db, CERTIFICATES_COLLECTION));
        batch.set(certificateRef, {
          userId: participantData.userId,
          jamId,
          jamName: jamData.name,
          category: 'participation',
          isWinner: false,
          awardedDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        createdCount++;
      }
    }

    if (createdCount > 0) {
      await batch.commit();
    }

    return {
      totalParticipants: participantsSnapshot.size,
      certificatesCreated: createdCount,
      message: `Se crearon ${createdCount} certificados de participación de ${participantsSnapshot.size} participantes`
    };
  } catch (error) {
    console.error('Error creating mass participation certificates:', error);
    throw error;
  }
};

// Nueva función para crear certificados masivos de participación con usuarios seleccionados
export const createMassParticipationCertificatesAdvanced = async (jamId, selectedUserIds = null) => {
  try {
    // Obtener participantes
    let participantsToProcess;
    
    if (selectedUserIds && selectedUserIds.length > 0) {
      // Crear certificados solo para usuarios seleccionados
      participantsToProcess = selectedUserIds.map(userId => ({ userId }));
    } else {
      // Obtener todos los participantes
      const participantsQuery = query(
        collection(db, 'participants'),
        where('jamId', '==', jamId),
        where('isActive', '==', true)
      );
      
      const participantsSnapshot = await getDocs(participantsQuery);
      participantsToProcess = participantsSnapshot.docs.map(doc => doc.data());
    }
    
    if (participantsToProcess.length === 0) {
      throw new Error('No participants found');
    }

    // Obtener datos de la jam
    const jamDoc = await getDoc(doc(db, JAMS_COLLECTION, jamId));
    if (!jamDoc.exists()) {
      throw new Error('Jam not found');
    }
    
    const jamData = jamDoc.data();
    
    const batch = writeBatch(db);
    let createdCount = 0;

    // Crear certificados para cada participante seleccionado
    for (const participant of participantsToProcess) {
      // Verificar si ya tiene certificado de participación
      const existingQuery = query(
        collection(db, CERTIFICATES_COLLECTION),
        where('userId', '==', participant.userId),
        where('jamId', '==', jamId),
        where('category', '==', 'participation')
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (existingSnapshot.empty) {
        // Crear nuevo certificado
        const certificateRef = doc(collection(db, CERTIFICATES_COLLECTION));
        batch.set(certificateRef, {
          userId: participant.userId,
          jamId,
          jamName: jamData.name,
          category: 'participation',
          isWinner: false,
          awardedDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        createdCount++;
      }
    }

    if (createdCount > 0) {
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

// Obtener certificados de una jam específica
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
      certificates.push({
        id: doc.id,
        ...data,
        awardedDate: data.awardedDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    return certificates;
  } catch (error) {
    console.error('Error getting jam certificates:', error);
    return [];
  }
};

// Obtener certificados de un usuario específico
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
      certificates.push({
        id: doc.id,
        ...data,
        awardedDate: data.awardedDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    return certificates;
  } catch (error) {
    console.error('Error getting user certificates:', error);
    return [];
  }
};

// Obtener estadísticas de certificados para admin
export const getCertificateStats = async (jamId) => {
  try {
    const certificatesQuery = query(
      collection(db, CERTIFICATES_COLLECTION),
      where('jamId', '==', jamId)
    );
    
    const certificatesSnapshot = await getDocs(certificatesQuery);
    
    const stats = {
      totalCertificates: certificatesSnapshot.size,
      participationCertificates: 0,
      recognitionCertificates: 0,
      categoriesStats: {}
    };

    certificatesSnapshot.forEach((doc) => {
      const data = doc.data();
      
      if (data.isWinner) {
        stats.recognitionCertificates++;
        
        if (!stats.categoriesStats[data.category]) {
          stats.categoriesStats[data.category] = 0;
        }
        stats.categoriesStats[data.category]++;
      } else {
        stats.participationCertificates++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting certificate stats:', error);
    return {
      totalCertificates: 0,
      participationCertificates: 0,
      recognitionCertificates: 0,
      categoriesStats: {}
    };
  }
};

// Eliminar un certificado
export const deleteCertificate = async (certificateId) => {
  try {
    await deleteDoc(doc(db, CERTIFICATES_COLLECTION, certificateId));
    return true;
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw error;
  }
};

// Actualizar un certificado existente
export const updateCertificate = async (certificateId, updateData) => {
  try {
    const certificateRef = doc(db, CERTIFICATES_COLLECTION, certificateId);
    await updateDoc(certificateRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating certificate:', error);
    throw error;
  }
};

// Función helper mejorada para preparar datos de certificado con gameLink
export const prepareCertificateData = (certificate, userProfile) => {
  return {
    userName: userProfile?.fullName || 'Participante',
    jamName: certificate.jamName,
    category: certificate.category,
    isWinner: certificate.isWinner,
    date: certificate.awardedDate,
    certificateId: certificate.id,
    gameName: certificate.gameName || null,
    gameLink: certificate.gameLink || null, // NUEVO CAMPO
    theme: certificate.theme || null,
    // Campos personalizados
    customTitle: certificate.customTitle || certificate.title || null,
    customSubtitle: certificate.customSubtitle || certificate.subtitle || null,
    customMainText: certificate.customMainText || certificate.mainText || null,
    customSignature: certificate.customSignature || certificate.signature || null
  };
};