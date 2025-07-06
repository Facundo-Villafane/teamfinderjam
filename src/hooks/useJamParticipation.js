// src/hooks/useJamParticipation.js
import { useState, useEffect, useCallback } from 'react';
import {
  joinJam,
  isUserJoined,
  getJamParticipationStats,
  leaveJam
} from '../firebase/participants';

export const useJamParticipation = (user, currentJam) => {
  const [isJoined, setIsJoined] = useState(false);
  const [participationStats, setParticipationStats] = useState({
    totalParticipants: 0,
    recentJoins: 0
  });
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // Verificar si el usuario está unido a la jam actual
  const checkParticipation = useCallback(async () => {
    if (!user || !currentJam?.id) {
      setIsJoined(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const joined = await isUserJoined(user.uid, currentJam.id);
      setIsJoined(joined);
    } catch (error) {
      console.error('Error checking participation:', error);
      setIsJoined(false);
    } finally {
      setLoading(false);
    }
  }, [user, currentJam?.id]);

  // Cargar estadísticas de participación
  const loadParticipationStats = useCallback(async () => {
    if (!currentJam?.id) return;

    try {
      const stats = await getJamParticipationStats(currentJam.id);
      setParticipationStats(stats);
    } catch (error) {
      console.error('Error loading participation stats:', error);
    }
  }, [currentJam?.id]);

  // Unirse a la jam
  const handleJoinJam = async () => {
    if (!user || !currentJam?.id || joining) return false;

    try {
      setJoining(true);
      await joinJam(user.uid, currentJam.id);
      setIsJoined(true);
      
      // Recargar estadísticas
      await loadParticipationStats();
      
      return true;
    } catch (error) {
      console.error('Error joining jam:', error);
      alert('Error al unirse a la jam. Intenta de nuevo.');
      return false;
    } finally {
      setJoining(false);
    }
  };

  // Salirse de la jam
  const handleLeaveJam = async () => {
    if (!user || !currentJam?.id || joining) return false;

    if (!window.confirm('¿Estás seguro de que quieres salirte de esta jam?')) {
      return false;
    }

    try {
      setJoining(true);
      await leaveJam(user.uid, currentJam.id);
      setIsJoined(false);
      
      // Recargar estadísticas
      await loadParticipationStats();
      
      return true;
    } catch (error) {
      console.error('Error leaving jam:', error);
      alert('Error al salir de la jam. Intenta de nuevo.');
      return false;
    } finally {
      setJoining(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    checkParticipation();
  }, [checkParticipation]);

  useEffect(() => {
    loadParticipationStats();
  }, [loadParticipationStats]);

  // Funciones para verificar permisos
  const canCreatePost = () => {
    return user && isJoined;
  };

  const canVote = () => {
    return user && isJoined;
  };

  // Función para obtener mensaje de restricción
  const getRestrictionMessage = (action = 'realizar esta acción') => {
    if (!user) {
      return `Necesitas iniciar sesión para ${action}`;
    }
    if (!isJoined) {
      return `Necesitas unirte a la jam para ${action}`;
    }
    return '';
  };

  return {
    // Estado
    isJoined,
    loading,
    joining,
    participationStats,
    
    // Acciones
    handleJoinJam,
    handleLeaveJam,
    
    // Verificaciones
    canCreatePost,
    canVote,
    getRestrictionMessage,
    
    // Recarga manual
    refreshParticipation: checkParticipation,
    refreshStats: loadParticipationStats
  };
};