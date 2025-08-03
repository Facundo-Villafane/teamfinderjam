// src/hooks/useThemeActions.js - Hook corregido
import { useState } from 'react';
import {
  createTheme,
  updateTheme,
  deleteTheme,
  getThemesByJam,
  getAdminVotingResults,
  toggleVotingStatus,
  selectWinnerTheme
} from '../firebase/themes';

export const useThemeActions = () => {
  const [themes, setThemes] = useState([]);
  const [votingResults, setVotingResults] = useState({});
  const [editingTheme, setEditingTheme] = useState(null);
  const [currentJamId, setCurrentJamId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar temas cuando cambia la jam activa
  const loadThemeData = async (jamId) => {
    if (!jamId) {
      setThemes([]);
      setVotingResults({});
      return;
    }

    try {
      setLoading(true);
      setCurrentJamId(jamId);
      
      const [themesData, adminResults] = await Promise.all([
        getThemesByJam(jamId),
        getAdminVotingResults(jamId)
      ]);
      
      setThemes(themesData);
      // Para admins, siempre mostrar resultados completos
      setVotingResults(adminResults.results || {});
    } catch (error) {
      console.error('Error loading theme data:', error);
      setThemes([]);
      setVotingResults({});
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo tema
  const handleCreateTheme = () => {
    setEditingTheme({});
  };

  // Editar tema existente
  const handleEditTheme = (theme) => {
    setEditingTheme(theme);
  };

  // Guardar tema (crear o actualizar)
  const handleSaveTheme = async (themeData) => {
    try {
      if (editingTheme && editingTheme.id) {
        // Actualizar tema existente
        await updateTheme(editingTheme.id, themeData);
      } else {
        // Crear nuevo tema
        await createTheme(themeData);
      }
      
      // Recargar datos
      await loadThemeData(currentJamId);
      setEditingTheme(null);
      
      alert('Tema guardado exitosamente!');
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('Error al guardar el tema. Intenta de nuevo.');
    }
  };

  // Eliminar tema
  const handleDeleteTheme = async (themeId) => {
    if (window.confirm('¿Estás seguro de eliminar este tema? También se eliminarán todos los votos asociados.')) {
      try {
        await deleteTheme(themeId);
        await loadThemeData(currentJamId);
        alert('Tema eliminado exitosamente!');
      } catch (error) {
        console.error('Error deleting theme:', error);
        alert('Error al eliminar el tema. Intenta de nuevo.');
      }
    }
  };

  // Cancelar edición
  const handleCancelThemeEdit = () => {
    setEditingTheme(null);
  };

  // ✅ ARREGLADO: Alternar estado de votación
  const handleToggleVoting = async (jam) => {
    try {
      // ✅ Extraer el ID del objeto jam si es necesario
      const jamId = typeof jam === 'string' ? jam : jam?.id;
      
      if (!jamId) {
        console.error('jamId is required for toggleVoting');
        alert('Error: ID de jam no válido');
        return;
      }

      console.log('Toggling voting for jamId:', jamId);
      const newStatus = await toggleVotingStatus(jamId);
      const statusText = newStatus ? 'cerrada' : 'abierta';
      
      alert(`Votación ${statusText} exitosamente!`);
      
      // Recargar datos si es necesario
      if (currentJamId === jamId) {
        await loadThemeData(jamId);
      }
    } catch (error) {
      console.error('Error toggling voting status:', error);
      alert('Error al cambiar el estado de votación. Intenta de nuevo.');
    }
  };

  // ✅ ARREGLADO: Seleccionar ganador
  const handleSelectWinner = async (theme) => {
    try {
      if (!currentJamId) {
        alert('Error: No hay jam activa');
        return;
      }

      if (!theme || !theme.id) {
        alert('Error: Tema no válido');
        return;
      }

      if (window.confirm(`¿Seleccionar "${theme.title}" como tema ganador? Esto cerrará la votación y hará públicos los resultados.`)) {
        await selectWinnerTheme(currentJamId, theme);
        await loadThemeData(currentJamId);
        alert('¡Tema ganador seleccionado exitosamente!');
      }
    } catch (error) {
      console.error('Error selecting winner:', error);
      alert('Error al seleccionar ganador. Intenta de nuevo.');
    }
  };

  return {
    // Estado
    themes,
    votingResults,
    editingTheme,
    loading,
    
    // Funciones de gestión
    loadThemeData,
    handleCreateTheme,
    handleEditTheme,
    handleSaveTheme,
    handleDeleteTheme,
    handleCancelThemeEdit,
    
    // Funciones de votación
    handleToggleVoting,
    handleSelectWinner
  };
};