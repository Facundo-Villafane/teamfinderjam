import React, { useState } from 'react'

// Importar hooks personalizados (uno por uno para debuggear)
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

  // ===== ACCIONES DE JAM (implementadas directamente) =====
  
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

  const handleDeleteJam = async (jamId, jams) => {
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

  const handleToggleActive = async (jamId, jams) => {
    try {
      const jam = jams.find(j => j.id === jamId)
      const newActiveState = !jam.active
      
      if (newActiveState) {
        await setActiveJam(jamId)
      } else {
        await setActiveJam(null)
      }
      
      await logAdminAction(user.uid, 'toggle_jam_active', { 
        jamId, 
        jamName: jam?.name, 
        newState: newActiveState 
      })
      
      await loadAllData()
    } catch (error) {
      console.error('Error toggling jam active:', error)
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
        return <OverviewTab stats={stats} jams={jams} onRefresh={loadAllData} />
      
      case 'jams':
        return (
          <JamsTab
            jams={jams}
            onCreateJam={handleCreateJam}
            onEditJam={handleEditJam}
            onDeleteJam={(jamId) => handleDeleteJam(jamId, jams)}
            onToggleActive={(jamId) => handleToggleActive(jamId, jams)}
          />
        )
      
      case 'moderation':
        return (
          <ModerationTab
            posts={posts}
            onToggleFeatured={(postId) => handleToggleFeatured(postId, posts)}
            onToggleFlagged={(postId) => handleToggleFlagged(postId, posts)}
            onDeletePost={(postId) => handleDeletePost(postId, posts)}
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
            onToggleVoting={(jam) => handleToggleVoting(jam, loadAllData)}
            onSelectWinner={(theme) => handleSelectWinner(theme, loadAllData)}
          />
        )
      
      case 'certificates':
        return (
          <CertificatesTab 
            currentJam={activeJam} 
            onRefresh={loadAllData} 
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
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sección en desarrollo</h3>
            <p className="text-gray-500">Esta funcionalidad estará disponible pronto.</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header de admin */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          ⚙️ Panel de Administración
        </h1>
        <p className="text-gray-300 text-lg">
          Gestiona jams, temas, posts y configuraciones
        </p>
        <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-red-900 border border-red-600">
          <span className="text-red-200 font-semibold">👑 Acceso de Administrador</span>
        </div>
        
        {activeJam && (
          <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-green-900 border border-green-600 ml-4">
            <span className="text-green-200 font-semibold">🎮 Jam Activa: {activeJam.name}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">Cargando datos de admin...</div>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <AdminTabs currentTab={currentTab} onTabChange={setCurrentTab} />
          
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      )}

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