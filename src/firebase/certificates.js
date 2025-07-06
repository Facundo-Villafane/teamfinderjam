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
  
  // Crear certificado de reconocimiento (para ganadores)
  export const createRecognitionCertificate = async (userId, jamId, category) => {
    try {
      // Obtener datos de la jam
      const jamDoc = await getDoc(doc(db, JAMS_COLLECTION, jamId));
      if (!jamDoc.exists()) {
        throw new Error('Jam not found');
      }
      
      const jamData = jamDoc.data();
  
      // Crear certificado de reconocimiento
      const certificateRef = await addDoc(collection(db, CERTIFICATES_COLLECTION), {
        userId,
        jamId,
        jamName: jamData.name,
        category,
        isWinner: true,
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