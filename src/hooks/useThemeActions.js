// src/hooks/useThemeActions.js - Hook actualizado para múltiples votos
import { useState, useEffect } from 'react';
import {
  createTheme,
  updateTheme,
  deleteTheme,
  getThemesByJam,
  getAdminVotingResults,
  toggleVotingStatus,
  selectWinnerTheme
} from '../firebase/themes';

export const useThemeActions = (user) => {
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

  // Alternar estado de votación
  const handleToggleVoting = async (jamId) => {
    try {
      const newStatus = await toggleVotingStatus(jamId);
      const statusText = newStatus ? 'cerrada' : 'abierta';
      alert(`Votación ${statusText} exitosamente!`);
      
      // Recargar datos para reflejar cambios
      await loadThemeData(jamId);
    } catch (error) {
      console.error('Error toggling voting status:', error);
      alert('Error al cambiar el estado de la votación.');
    }
  };

  // Seleccionar tema ganador
  const handleSelectWinner = async (theme) => {
    const voteCount = votingResults[theme.id] || 0;
    
    if (window.confirm(
      `¿Confirmar "${theme.title}" como tema ganador?\n\n` +
      `Este tema tiene ${voteCount} votos.\n` +
      `Esto revelará los resultados a todos los usuarios y cerrará la votación automáticamente.`
    )) {
      try {
        await selectWinnerTheme(currentJamId, theme);
        await loadThemeData(currentJamId);
        alert('Tema ganador seleccionado exitosamente! Los resultados ahora son visibles para todos.');
      } catch (error) {
        console.error('Error selecting winner:', error);
        alert('Error al seleccionar el tema ganador.');
      }
    }
  };

  return {
    themes,
    votingResults,
    editingTheme,
    loading,
    loadThemeData,
    handleCreateTheme,
    handleEditTheme,
    handleSaveTheme,
    handleDeleteTheme,
    handleCancelThemeEdit,
    handleToggleVoting,
    handleSelectWinner
  };
};