// src/components/GameJamApp.jsx - Simplificado sin EditionSelector
import React, { useState } from 'react';
import { LogIn } from 'lucide-react';

// Importar hooks personalizados
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { usePostForm } from '../hooks/usePostForm';
import { useJams } from '../hooks/useJams';

// Importar componentes
import AdminDashboard from './AdminDashboard';
import { AppHeader } from './gamejam/AppHeader';
import { JamBanner } from './gamejam/JamBanner';
import { Navigation } from './gamejam/Navigation';
import { PostsGrid } from './gamejam/PostsGrid';
import { CreatePostForm } from './gamejam/CreatePostForm';

const GameJamApp = () => {
  const [currentView, setCurrentView] = useState('browse');
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // Configuración
  const adminEmails = ['tu-email@gmail.com', 'admin@example.com']; // CAMBIAR POR TU EMAIL
  
  const skillOptions = [
    '2D Art', '3D Art', 'Code', 'Design & Production', 'Music', 'SFX', 
    'Team Lead', 'Testing & Support', 'Other', 'Vibes', 'Voice Acting'
  ];

  const toolOptions = [
    'Unity', 'Unreal Engine', 'Godot', 'GameMaker', 'Construct', 'Phaser',
    'Blender', 'Maya', 'Photoshop', 'Aseprite', 'FL Studio', 'Audacity'
  ];

  const timezoneOptions = [
    'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6',
    'UTC-5', 'UTC-4', 'UTC-3: Halifax, São Paulo, Buenos Aires', 'UTC-2',
    'UTC-1', 'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5',
    'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
  ];

  // Usar hooks personalizados
  const { user, loading, handleSignIn, handleSignOut } = useAuth();
  const { currentJam, loading: jamLoading, refreshJam } = useJams();
  const { posts, userPost, handleSavePost, handleDeletePost } = usePosts(user, currentJam?.id);
  const {
    newPost,
    editingPost,
    submitting,
    setSubmitting,
    resetForm,
    handleFieldChange,
    handleSkillToggle,
    handleToolToggle,
    handleEditPost,
    handleCancelEdit
  } = usePostForm();

  const isAdmin = user && adminEmails.includes(user.email);

  // Handlers
  const handleCreatePostClick = () => {
    if (!user) {
      if (window.confirm('You need to sign in to create a post. Would you like to sign in now?')) {
        handleSignIn();
      }
      return;
    }
    setCurrentView('create');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const success = await handleSavePost(editingPost || newPost, !!editingPost, editingPost);
    
    if (success) {
      resetForm();
      handleCancelEdit();
      setCurrentView('browse');
    }
    setSubmitting(false);
  };

  const handleEditPostClick = (post) => {
    handleEditPost(post);
    setCurrentView('create');
  };

  const handleSignOutClick = () => {
    handleSignOut();
    setCurrentView('browse');
    handleCancelEdit();
  };

  const handleCancelEditClick = () => {
    handleCancelEdit();
    setCurrentView('browse');
  };

  const handleCloseAdmin = () => {
    setShowAdminDashboard(false);
    refreshJam(); // Refrescar la jam activa cuando se cierre el admin
  };

  // Loading state
  if (loading || jamLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 to-orange-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Admin dashboard
  if (showAdminDashboard && isAdmin) {
    return <AdminDashboard user={user} onClose={handleCloseAdmin} />;
  }

  // Main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 to-orange-950 p-4">
      <div className="max-w-6xl mx-auto">
        <AppHeader
          user={user}
          isAdmin={isAdmin}
          onSignIn={handleSignIn}
          onSignOut={handleSignOutClick}
          onOpenAdmin={() => setShowAdminDashboard(true)}
        />

        <JamBanner jam={currentJam} />

        <Navigation
          currentView={currentView}
          onViewChange={setCurrentView}
          userPost={userPost}
          user={user}
          onCreatePostClick={handleCreatePostClick}
        />

        {currentView === 'browse' ? (
          <PostsGrid
            posts={posts}
            user={user}
            currentJam={currentJam}
            onEditPost={handleEditPostClick}
            onDeletePost={handleDeletePost}
          />
        ) : user ? (
          <CreatePostForm
            currentPost={editingPost || newPost}
            isEditing={!!editingPost}
            onFieldChange={handleFieldChange}
            onSkillToggle={handleSkillToggle}
            onToolToggle={handleToolToggle}
            onSubmit={handleSubmit}
            onCancel={handleCancelEditClick}
            submitting={submitting}
            skillOptions={skillOptions}
            toolOptions={toolOptions}
            timezoneOptions={timezoneOptions}
          />
        ) : (
          <div className="text-center text-orange-200 py-12">
            <p className="text-xl mb-4">You need to sign in to create a post</p>
            <button
              onClick={handleSignIn}
              className="flex items-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mx-auto"
            >
              <LogIn className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameJamApp;