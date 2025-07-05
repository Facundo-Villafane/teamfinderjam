// src/hooks/useJams.js - Hook simplificado (solo jam activa)
import { useState, useEffect } from 'react';
import { getAllJams } from '../firebase/firestore';

export const useJams = () => {
  const [currentJam, setCurrentJam] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadActiveJam = async () => {
    try {
      setLoading(true);
      const allJams = await getAllJams();
      
      if (allJams.length > 0) {
        // Buscar la jam activa
        const activeJam = allJams.find(jam => jam.active);
        if (activeJam) {
          setCurrentJam(activeJam);
        } else {
          // Si no hay activa, usar la primera
          setCurrentJam(allJams[0]);
        }
      } else {
        // Fallback si no hay jams en Firebase
        const fallbackJam = {
          id: 'julio-2025', 
          name: 'Julio 2025', 
          active: true,
          description: 'Default game jam - Create your first jam in admin dashboard!',
          theme: 'TBD',
          startDate: '2025-07-11',
          endDate: '2025-07-13'
        };
        setCurrentJam(fallbackJam);
      }
    } catch (error) {
      console.error('Error loading active jam:', error);
      // Fallback en caso de error
      const fallbackJam = {
        id: 'julio-2025', 
        name: 'Julio 2025', 
        active: true,
        description: 'Default game jam - Create your first jam in admin dashboard!',
        theme: 'TBD',
        startDate: '2025-07-11',
        endDate: '2025-07-13'
      };
      setCurrentJam(fallbackJam);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveJam();
  }, []);

  return {
    currentJam,
    loading,
    refreshJam: loadActiveJam
  };
};