// src/firebase/certificates.js - Sistema de certificados
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
  
  // ===== GESTIÓN DE CERTIFICADOS =====
  
  // Crear certificado completamente personalizado
export const createCustomCertificate = async (userId, jamId, certificateData) => {
  try {
    // Obtener datos de la jam
    const jamDoc = await getDoc(doc(db, JAMS_COLLECTION, jamId));
    if (!jamDoc.exists()) {
      throw new Error('Jam not found');
    }
    
    const jamData = jamDoc.data();

    // Crear certificado personalizado
    const certificateRef = await addDoc(collection(db, CERTIFICATES_COLLECTION), {
      userId,
      jamId,
      jamName: jamData.name,
      category: certificateData.category || 'participation',
      isWinner: certificateData.isWinner || false,
      
      // Campos personalizados
      customTitle: certificateData.title,
      customSubtitle: certificateData.subtitle || null,
      customMainText: certificateData.mainText,
      customSignature: certificateData.signature || null,
      gameName: certificateData.gameName || null,
      
      // Campos estándar
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
  
  // Actualizar la función createRecognitionCertificate
export const createRecognitionCertificate = async (userId, jamId, category, additionalData = {}) => {
  try {
    // Obtener datos de la jam
    const jamDoc = await getDoc(doc(db, JAMS_COLLECTION, jamId));
    if (!jamDoc.exists()) {
      throw new Error('Jam not found');
    }
    
    const jamData = jamDoc.data();

    // Crear certificado de reconocimiento con datos adicionales
    const certificateRef = await addDoc(collection(db, CERTIFICATES_COLLECTION), {
      userId,
      jamId,
      jamName: jamData.name,
      category,
      isWinner: true,
      // Nuevos campos para reconocimientos
      gameName: additionalData.gameName || null,
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

// Nueva función para crear certificados masivos de participación
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
          gameName: null,
          gameDescription: null,
          postId: null,
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
      message: `Se crearon ${createdCount} certificados de participación de ${participantsToProcess.length} participantes seleccionados`
    };
  } catch (error) {
    console.error('Error creating mass participation certificates:', error);
    throw error;
  }
};

// Nueva función para obtener certificados con información adicional
export const getJamCertificatesDetailed = async (jamId) => {
  try {
    const q = query(
      collection(db, CERTIFICATES_COLLECTION),
      where('jamId', '==', jamId),
      orderBy('awardedDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const certificates = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      certificates.push({
        id: doc.id,
        ...data,
        awardedDate: data.awardedDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });
    
    return certificates;
  } catch (error) {
    console.error('Error getting detailed jam certificates:', error);
    return [];
  }
};
  
  // Obtener certificados de un usuario
  export const getUserCertificates = async (userId) => {
    try {
      const q = query(
        collection(db, CERTIFICATES_COLLECTION),
        where('userId', '==', userId),
        orderBy('awardedDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const certificates = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        certificates.push({
          id: doc.id,
          ...data,
          awardedDate: data.awardedDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      return certificates;
    } catch (error) {
      console.error('Error getting user certificates:', error);
      return [];
    }
  };
  
  // Obtener todos los certificados de una jam (para admin)
  export const getJamCertificates = async (jamId) => {
    try {
      const q = query(
        collection(db, CERTIFICATES_COLLECTION),
        where('jamId', '==', jamId),
        orderBy('awardedDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const certificates = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        certificates.push({
          id: doc.id,
          ...data,
          awardedDate: data.awardedDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      return certificates;
    } catch (error) {
      console.error('Error getting jam certificates:', error);
      return [];
    }
  };
  
  // Eliminar certificado
  export const deleteCertificate = async (certificateId) => {
    try {
      await deleteDoc(doc(db, CERTIFICATES_COLLECTION, certificateId));
    } catch (error) {
      console.error('Error deleting certificate:', error);
      throw error;
    }
  };
  
  // Crear certificados de participación masivamente para todos los participantes de una jam
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