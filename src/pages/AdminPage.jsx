// src/pages/AdminPage.jsx - Versión actualizada con gestión de usuarios
import React, { useState } from 'react'

// Importar hooks personalizados
import { useAdminData } from '../hooks/useAdminData'
import { usePostActions } from '../hooks/usePostActions'
import { useThemeActions } from '../hooks/useThemeActions'

// Importar componentes admin específicos
import { AdminTabs } from '../components/admin/AdminTabs'
import { OverviewTab } from '../components/admin/OverviewTab'
import { JamsTab } from '../components/admin/JamsTab'
import { ModerationTab } from '../components/admin/ModerationTab'
import { JamEditor } from '../components/admin/JamEditor'
import { ThemesTab } from '../components/admin/ThemesTab'
import { ThemeEditor } from '../components/admin/ThemeEditor'
import { CertificatesTab } from '../components/admin/CertificatesTab'
import { UsersTab } from '../components/admin/UsersTab' // NUEVO COMPONENTE
import { MigrationTool } from '../components/admin/MigrationTool'

// Importar funciones directamente para evitar problemas de importación
import {
  createJam,
  updateJam,
  deleteJam,
  setActiveJam,
  logAdminAction
} from '../firebase/admin'

const AdminPage = ({ user }) => {
  const [currentTab, setCurrentTab] = useState('overview')
  const [editingJam, setEditingJam] = useState(null)
  
  // Usar hooks personalizados para manejar datos y acciones
  const { jams, stats, posts, loading, loadAllData } = useAdminData(user)

  const {
    handleDeletePost,
    handleToggleFeatured,
    handleToggleFlagged
  } = usePostActions(user, loadAllData)

  // Hook para temas
  const {
    themes,
    votingResults,
    editingTheme,
    loadThemeData,
    handleCreateTheme,
    handleEditTheme,
    handleSaveTheme,
    handleDeleteTheme,
    handleCancelThemeEdit,
    handleToggleVoting,
    handleSelectWinner
  } = useThemeActions(user)

  // ===== ACCIONES DE JAM =====
  
  const handleSaveJam = async (jamData) => {
    try {
      if (editingJam && editingJam.id) {
        await updateJam(editingJam.id, jamData)
        await logAdminAction(user.uid, 'update_jam', { jamId: editingJam.id, jamName: jamData.name })
      } else {
        const newJamId = await createJam(jamData)
        await logAdminAction(user.uid, 'create_jam', { jamId: newJamId, jamName: jamData.name })
      }
      
      await loadAllData()
      setEditingJam(null)
      alert('Jam saved successfully!')
    } catch (error) {
      console.error('Error saving jam:', error)
      alert('Error saving jam')
    }
  }

  const handleDeleteJam = async (jamId) => {
    if (window.confirm('¿Estás seguro de eliminar esta jam? Esto también eliminará todos los posts asociados.')) {
      try {
        const jam = jams.find(j => j.id === jamId)
        await deleteJam(jamId)
        await logAdminAction(user.uid, 'delete_jam', { jamId, jamName: jam?.name })
        await loadAllData()
        alert('Jam deleted successfully!')
      } catch (error) {
        console.error('Error deleting jam:', error)
        alert('Error deleting jam')
      }
    }
  }

  const handleToggleActive = async (jamId) => {
    try {
      const jam = jams.find(j => j.id === jamId)
      await setActiveJam(jamId)
      await logAdminAction(user.uid, 'toggle_active_jam', { jamId, jamName: jam?.name })
      await loadAllData()
      alert('Jam status updated!')
    } catch (error) {
      console.error('Error toggling jam status:', error)
      alert('Error updating jam status')
    }
  }

  const handleCreateJam = () => {
    setEditingJam({})
  }

  const handleEditJam = (jam) => {
    setEditingJam(jam)
  }

  const handleCancelEdit = () => {
    setEditingJam(null)
  }

  // Obtener jam activa
  const activeJam = jams.find(jam => jam.active) || null

  // Cargar datos de temas cuando cambia la jam activa
  React.useEffect(() => {
    if (activeJam?.id) {
      loadThemeData(activeJam.id)
    }
  }, [activeJam?.id, loadThemeData])

  const renderTabContent = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewTab stats={stats} jams={jams} />
        
      case 'jams':
        return (
          <JamsTab
            jams={jams}
            onCreateJam={handleCreateJam}
            onEditJam={handleEditJam}
            onDeleteJam={handleDeleteJam}
            onToggleActive={handleToggleActive}
          />
        )
        
      case 'moderation':
        return (
          <ModerationTab
            posts={posts}
            onToggleFeatured={handleToggleFeatured}
            onToggleFlagged={handleToggleFlagged}
            onDeletePost={handleDeletePost}
            loading={loading}
          />
        )
        
      case 'themes':
        return (
          <ThemesTab
            currentJam={activeJam}
            themes={themes}
            votingResults={votingResults}
            onCreateTheme={handleCreateTheme}
            onEditTheme={handleEditTheme}
            onDeleteTheme={handleDeleteTheme}
            onToggleVoting={handleToggleVoting}
            onSelectWinner={handleSelectWinner}
          />
        )
        
      case 'certificates':
        return (
          <CertificatesTab
            currentJam={activeJam}
            onRefresh={loadAllData}
          />
        )
        
      case 'users':
        return (
          <UsersTab
            currentJam={activeJam}
          />
        )
        
      case 'migration':
        return (
          <MigrationTool
            currentJam={activeJam}
            onRefresh={loadAllData}
          />
        )
        
      default:
        return <div className="text-white">Pestaña no encontrada</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header del admin */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Panel de Administración</h1>
              <p className="text-sm text-gray-400">
                Bienvenido, {user?.displayName || user?.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {activeJam && (
              <div className="text-right">
                <p className="text-sm text-gray-400">Jam Activa:</p>
                <p className="text-white font-medium">{activeJam.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegación de pestañas */}
      <AdminTabs currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-white text-xl">Cargando datos...</div>
            </div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>

      {/* Modales */}
      {editingJam && (
        <JamEditor
          jam={editingJam.id ? editingJam : null}
          onSave={handleSaveJam}
          onCancel={handleCancelEdit}
        />
      )}

      {editingTheme !== null && (
        <ThemeEditor
          theme={editingTheme.id ? editingTheme : null}
          currentJam={activeJam}
          onSave={handleSaveTheme}
          onCancel={handleCancelThemeEdit}
        />
      )}
    </div>
  )
}

export default AdminPage