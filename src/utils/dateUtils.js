// src/utils/dateUtils.js - Utilidad para manejar fechas de forma robusta

/**
 * Convierte cualquier formato de fecha a un objeto Date válido
 * @param {any} dateValue - Fecha en cualquier formato
 * @param {Date} fallback - Fecha por defecto si falla la conversión
 * @returns {Date} Objeto Date válido
 */
export const safeToDate = (dateValue, fallback = new Date()) => {
    try {
      // Si es null o undefined
      if (!dateValue) {
        return fallback;
      }
      
      // Si ya es un objeto Date válido
      if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? fallback : dateValue;
      }
      
      // Si es un Timestamp de Firestore
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate();
      }
      
      // Si tiene la estructura de Timestamp {seconds, nanoseconds}
      if (dateValue.seconds && typeof dateValue.seconds === 'number') {
        return new Date(dateValue.seconds * 1000);
      }
      
      // Si es un número (timestamp en milisegundos)
      if (typeof dateValue === 'number') {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? fallback : date;
      }
      
      // Si es un string
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? fallback : date;
      }
      
      // Si no se puede convertir, usar fallback
      console.warn('Could not convert date value:', dateValue);
      return fallback;
      
    } catch (error) {
      console.error('Error converting date:', error, dateValue);
      return fallback;
    }
  };
  
  /**
   * Formatea una fecha de forma segura
   * @param {any} dateValue - Fecha en cualquier formato
   * @param {string} locale - Locale para formatear (default: 'es-ES')
   * @param {object} options - Opciones de formato
   * @returns {string} Fecha formateada
   */
  export const safeFormatDate = (dateValue, locale = 'es-ES', options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) => {
    try {
      const date = safeToDate(dateValue);
      return date.toLocaleDateString(locale, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  };