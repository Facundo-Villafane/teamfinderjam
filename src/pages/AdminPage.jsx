import React, { useState } from 'react'

// Importar hooks personalizados
import { useAdminData } from '../hooks/useAdminData'
import { useJamActions } from '../hooks/useJamActions'
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

const AdminPage = ({ user }) => {
  const [currentTab, setCurrentTab] = useState('overview')
  
  // Usar hooks personalizados para manejar datos y acciones
  const { jams, stats, posts, loading, loadAllData } = useAdminData(user)
  
  const {
    editingJam,
    handleSaveJam,
    handleDeleteJam,
    handleToggleActive,
    handleCreateJam,
    handleEditJam,
    handleCancelEdit
  } = useJamActions(user, loadAllData)

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
            onToggleVoting={handleToggleVoting}
            onSelectWinner={handleSelectWinner}
          />
        )
      default:
        return null
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando datos de admin...</div>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <AdminTabs currentTab={currentTab} onTabChange={setCurrentTab} />
          
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      )}

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