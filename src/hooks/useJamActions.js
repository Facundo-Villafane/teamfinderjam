// src/hooks/useJamActions.js
import { useState } from 'react';
import {
  createJam,
  updateJam,
  deleteJam,
  setActiveJam,
  logAdminAction
} from '../firebase/admin';

export const useJamActions = (user, loadAllData) => {
  const [editingJam, setEditingJam] = useState(null);

  const handleSaveJam = async (jamData) => {
    try {
      if (editingJam && editingJam.id) {
        await updateJam(editingJam.id, jamData);
        await logAdminAction(user.uid, 'update_jam', { jamId: editingJam.id, jamName: jamData.name });
      } else {
        const newJamId = await createJam(jamData);
        await logAdminAction(user.uid, 'create_jam', { jamId: newJamId, jamName: jamData.name });
      }
      
      await loadAllData();
      setEditingJam(null);
      alert('Jam saved successfully!');
    } catch (error) {
      console.error('Error saving jam:', error);
      alert('Error saving jam');
    }
  };

  const handleDeleteJam = async (jamId, jams) => {
    if (window.confirm('¿Estás seguro de eliminar esta jam? Esto también eliminará todos los posts asociados.')) {
      try {
        const jam = jams.find(j => j.id === jamId);
        await deleteJam(jamId);
        await logAdminAction(user.uid, 'delete_jam', { jamId, jamName: jam?.name });
        await loadAllData();
        alert('Jam deleted successfully!');
      } catch (error) {
        console.error('Error deleting jam:', error);
        alert('Error deleting jam');
      }
    }
  };

  const handleToggleActive = async (jamId, jams) => {
    try {
      const jam = jams.find(j => j.id === jamId);
      const newActiveState = !jam.active;
      
      if (newActiveState) {
        await setActiveJam(jamId);
      } else {
        await setActiveJam(null);
      }
      
      await logAdminAction(user.uid, 'toggle_jam_active', { 
        jamId, 
        jamName: jam?.name, 
        newState: newActiveState 
      });
      
      await loadAllData();
    } catch (error) {
      console.error('Error toggling jam active:', error);
      alert('Error updating jam status');
    }
  };

  const handleCreateJam = () => {
    setEditingJam({});
  };

  const handleEditJam = (jam) => {
    setEditingJam(jam);
  };

  const handleCancelEdit = () => {
    setEditingJam(null);
  };

  return {
    editingJam,
    handleSaveJam,
    handleDeleteJam,
    handleToggleActive,
    handleCreateJam,
    handleEditJam,
    handleCancelEdit
  };
};