// src/scripts/fixDates.js - Script para arreglar fechas en producción

import { collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Convierte un valor a Date de forma segura
 */
const safeConvertToDate = (value) => {
  if (!value) return new Date();
  
  if (value instanceof Date) return value;
  
  if (value.toDate && typeof value.toDate === 'function') {
    return value.toDate();
  }
  
  if (value.seconds && typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000);
  }
  
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  
  if (typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  
  return new Date();
};

/**
 * Arregla fechas en la colección de usuarios
 */
const fixUserDates = async () => {
  try {
    console.log('🔧 Iniciando migración de fechas de usuarios...');
    
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let fixed = 0;
    let processed = 0;
    
    // Usar batch para operaciones más eficientes
    const batchSize = 450; // Límite de Firestore es 500
    let batch = writeBatch(db);
    let batchCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const data = userDoc.data();
      const updates = {};
      let needsUpdate = false;
      
      // Verificar y arreglar createdAt
      if (data.createdAt && typeof data.createdAt === 'string') {
        updates.createdAt = safeConvertToDate(data.createdAt);
        needsUpdate = true;
      } else if (!data.createdAt || (data.createdAt && !data.createdAt.toDate)) {
        updates.createdAt = new Date();
        needsUpdate = true;
      }
      
      // Verificar y arreglar updatedAt
      if (data.updatedAt && typeof data.updatedAt === 'string') {
        updates.updatedAt = safeConvertToDate(data.updatedAt);
        needsUpdate = true;
      } else if (!data.updatedAt || (data.updatedAt && !data.updatedAt.toDate)) {
        updates.updatedAt = new Date();
        needsUpdate = true;
      }
      
      // Verificar lastGoogleSync
      if (data.lastGoogleSync && typeof data.lastGoogleSync === 'string') {
        updates.lastGoogleSync = safeConvertToDate(data.lastGoogleSync);
        needsUpdate = true;
      } else if (data.lastGoogleSync && !data.lastGoogleSync.toDate) {
        updates.lastGoogleSync = safeConvertToDate(data.lastGoogleSync);
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        batch.update(doc(db, 'users', userDoc.id), updates);
        batchCount++;
        fixed++;
        
        console.log(`📝 Usuario ${userDoc.id} marcado para actualización`);
        
        // Ejecutar batch cuando se alcance el límite
        if (batchCount >= batchSize) {
          await batch.commit();
          console.log(`✅ Batch de ${batchCount} usuarios actualizado`);
          batch = writeBatch(db);
          batchCount = 0;
        }
      }
      
      processed++;
    }
    
    // Ejecutar el último batch si tiene elementos
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✅ Último batch de ${batchCount} usuarios actualizado`);
    }
    
    console.log(`🎉 Migración de usuarios completada. ${fixed} de ${processed} usuarios actualizados.`);
    return { fixed, processed };
    
  } catch (error) {
    console.error('❌ Error en migración de usuarios:', error);
    throw error;
  }
};

/**
 * Arregla fechas en la colección de posts
 */
const fixPostDates = async () => {
  try {
    console.log('🔧 Iniciando migración de fechas de posts...');
    
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    let fixed = 0;
    let processed = 0;
    
    const batchSize = 450;
    let batch = writeBatch(db);
    let batchCount = 0;
    
    for (const postDoc of postsSnapshot.docs) {
      const data = postDoc.data();
      const updates = {};
      let needsUpdate = false;
      
      // Verificar y arreglar createdAt
      if (data.createdAt && typeof data.createdAt === 'string') {
        updates.createdAt = safeConvertToDate(data.createdAt);
        needsUpdate = true;
      } else if (!data.createdAt || (data.createdAt && !data.createdAt.toDate)) {
        updates.createdAt = new Date();
        needsUpdate = true;
      }
      
      // Verificar y arreglar updatedAt
      if (data.updatedAt && typeof data.updatedAt === 'string') {
        updates.updatedAt = safeConvertToDate(data.updatedAt);
        needsUpdate = true;
      } else if (!data.updatedAt || (data.updatedAt && !data.updatedAt.toDate)) {
        updates.updatedAt = new Date();
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        batch.update(doc(db, 'posts', postDoc.id), updates);
        batchCount++;
        fixed++;
        
        // Ejecutar batch cuando se alcance el límite
        if (batchCount >= batchSize) {
          await batch.commit();
          console.log(`✅ Batch de ${batchCount} posts actualizado`);
          batch = writeBatch(db);
          batchCount = 0;
        }
      }
      
      processed++;
    }
    
    // Ejecutar el último batch si tiene elementos
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✅ Último batch de ${batchCount} posts actualizado`);
    }
    
    console.log(`🎉 Migración de posts completada. ${fixed} de ${processed} posts actualizados.`);
    return { fixed, processed };
    
  } catch (error) {
    console.error('❌ Error en migración de posts:', error);
    throw error;
  }
};

/**
 * Arregla fechas en la colección de certificados
 */
const fixCertificateDates = async () => {
  try {
    console.log('🔧 Iniciando migración de fechas de certificados...');
    
    const certificatesSnapshot = await getDocs(collection(db, 'certificates'));
    let fixed = 0;
    let processed = 0;
    
    const batchSize = 450;
    let batch = writeBatch(db);
    let batchCount = 0;
    
    for (const certDoc of certificatesSnapshot.docs) {
      const data = certDoc.data();
      const updates = {};
      let needsUpdate = false;
      
      // Verificar y arreglar awardedDate
      if (data.awardedDate && typeof data.awardedDate === 'string') {
        updates.awardedDate = safeConvertToDate(data.awardedDate);
        needsUpdate = true;
      } else if (!data.awardedDate || (data.awardedDate && !data.awardedDate.toDate)) {
        updates.awardedDate = new Date();
        needsUpdate = true;
      }
      
      // Verificar y arreglar createdAt
      if (data.createdAt && typeof data.createdAt === 'string') {
        updates.createdAt = safeConvertToDate(data.createdAt);
        needsUpdate = true;
      } else if (!data.createdAt || (data.createdAt && !data.createdAt.toDate)) {
        updates.createdAt = new Date();
        needsUpdate = true;
      }
      
      // Verificar y arreglar updatedAt
      if (data.updatedAt && typeof data.updatedAt === 'string') {
        updates.updatedAt = safeConvertToDate(data.updatedAt);
        needsUpdate = true;
      } else if (!data.updatedAt || (data.updatedAt && !data.updatedAt.toDate)) {
        updates.updatedAt = new Date();
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        batch.update(doc(db, 'certificates', certDoc.id), updates);
        batchCount++;
        fixed++;
        
        // Ejecutar batch cuando se alcance el límite
        if (batchCount >= batchSize) {
          await batch.commit();
          console.log(`✅ Batch de ${batchCount} certificados actualizado`);
          batch = writeBatch(db);
          batchCount = 0;
        }
      }
      
      processed++;
    }
    
    // Ejecutar el último batch si tiene elementos
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✅ Último batch de ${batchCount} certificados actualizado`);
    }
    
    console.log(`🎉 Migración de certificados completada. ${fixed} de ${processed} certificados actualizados.`);
    return { fixed, processed };
    
  } catch (error) {
    console.error('❌ Error en migración de certificados:', error);
    throw error;
  }
};

/**
 * Ejecuta la migración completa de todas las colecciones
 */
const runFullDateMigration = async () => {
  try {
    console.log('🚀 Iniciando migración completa de fechas...');
    
    const startTime = Date.now();
    
    // Ejecutar migraciones en serie para evitar sobrecarga
    const userResults = await fixUserDates();
    const postResults = await fixPostDates();
    const certResults = await fixCertificateDates();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    const totalFixed = userResults.fixed + postResults.fixed + certResults.fixed;
    const totalProcessed = userResults.processed + postResults.processed + certResults.processed;
    
    console.log('\n🎊 MIGRACIÓN COMPLETADA 🎊');
    console.log('============================');
    console.log(`⏱️  Duración: ${duration.toFixed(2)} segundos`);
    console.log(`📊 Total procesado: ${totalProcessed} documentos`);
    console.log(`✅ Total actualizado: ${totalFixed} documentos`);
    console.log('============================');
    console.log(`👥 Usuarios: ${userResults.fixed}/${userResults.processed}`);
    console.log(`📝 Posts: ${postResults.fixed}/${postResults.processed}`);
    console.log(`🏆 Certificados: ${certResults.fixed}/${certResults.processed}`);
    console.log('============================\n');
    
    return {
      success: true,
      totalFixed,
      totalProcessed,
      duration,
      details: {
        users: userResults,
        posts: postResults,
        certificates: certResults
      }
    };
    
  } catch (error) {
    console.error('💥 Error en migración completa:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Función principal para ejecutar migración (solo admins)
 */
export const runDateMigration = async (user, options = {}) => {
  const adminEmails = ['facundo.tnd@gmail.com', 'admin@example.com'];
  
  if (!user || !adminEmails.includes(user.email)) {
    console.error('❌ Solo admins pueden ejecutar la migración');
    alert('Solo administradores pueden ejecutar la migración.');
    return;
  }
  
  const confirmMessage = `
⚠️  MIGRACIÓN DE FECHAS ⚠️

Esta operación afectará la base de datos en producción.

Se actualizarán las fechas en las siguientes colecciones:
• Usuarios (users)
• Posts (posts) 
• Certificados (certificates)

¿Estás seguro de continuar?
  `.trim();
  
  if (!confirm(confirmMessage)) {
    console.log('🚫 Migración cancelada por el usuario');
    return;
  }
  
  // Confirmación adicional
  const doubleConfirm = confirm('⚠️ CONFIRMACIÓN FINAL: Esta acción no se puede deshacer. ¿Continuar?');
  
  if (!doubleConfirm) {
    console.log('🚫 Migración cancelada en confirmación final');
    return;
  }
  
  console.log('🎬 Iniciando migración autorizada por:', user.email);
  
  // Ejecutar migración específica o completa
  if (options.usersOnly) {
    return await fixUserDates();
  } else if (options.postsOnly) {
    return await fixPostDates();
  } else if (options.certificatesOnly) {
    return await fixCertificateDates();
  } else {
    return await runFullDateMigration();
  }
};

// Exportar funciones individuales para uso específico
export { fixUserDates, fixPostDates, fixCertificateDates, runFullDateMigration };