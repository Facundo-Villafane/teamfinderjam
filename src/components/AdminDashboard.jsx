// src/components/AdminDashboard.jsx
import React, { useState } from 'react';

// Importar hooks personalizados
import { useAdminData } from '../hooks/useAdminData';
import { useJamActions } from '../hooks/useJamActions';
import { usePostActions } from '../hooks/usePostActions';

// Importar componentes admin específicos
import { AdminHeader } from './admin/AdminHeader';
import { AdminTabs } from './admin/AdminTabs';
import { OverviewTab } from './admin/OverviewTab';
import { JamsTab } from './admin/JamsTab';
import { ModerationTab } from './admin/ModerationTab';
import { JamEditor } from './admin/JamEditor';

const AdminDashboard = ({ user, onClose }) => {
  const [currentTab, setCurrentTab] = useState('overview');
  
  // Usar hooks personalizados para manejar datos y acciones
  const { jams, stats, posts, loading, loadAllData } = useAdminData(user);
  
  const {
    editingJam,
    handleSaveJam,
    handleDeleteJam,
    handleToggleActive,
    handleCreateJam,
    handleEditJam,
    handleCancelEdit
  } = useJamActions(user, loadAllData);

  const {
    handleDeletePost,
    handleToggleFeatured,
    handleToggleFlagged
  } = usePostActions(user, loadAllData);

  const renderTabContent = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewTab stats={stats} jams={jams} />;
      case 'jams':
        return (
          <JamsTab
            jams={jams}
            onCreateJam={handleCreateJam}
            onEditJam={handleEditJam}
            onDeleteJam={(jamId) => handleDeleteJam(jamId, jams)}
            onToggleActive={(jamId) => handleToggleActive(jamId, jams)}
          />
        );
      case 'moderation':
        return (
          <ModerationTab
            posts={posts}
            onToggleFeatured={(postId) => handleToggleFeatured(postId, posts)}
            onToggleFlagged={(postId) => handleToggleFlagged(postId, posts)}
            onDeletePost={(postId) => handleDeletePost(postId, posts)}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto">
      <AdminHeader user={user} onClose={onClose} />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando datos de admin...</div>
        </div>
      ) : (
        <>
          <AdminTabs currentTab={currentTab} onTabChange={setCurrentTab} />
          
          <div className="max-w-7xl mx-auto px-4 py-6">
            {renderTabContent()}
          </div>
        </>
      )}

      {editingJam && (
        <JamEditor
          jam={editingJam.id ? editingJam : null}
          onSave={handleSaveJam}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default AdminDashboard;