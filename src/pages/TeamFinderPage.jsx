import React, { useState } from 'react'
import { LogIn } from 'lucide-react'

// Importar hooks y componentes existentes
import { usePosts } from '../hooks/usePosts'
import { usePostForm } from '../hooks/usePostForm'
import { useJams } from '../hooks/useJams'
import { useAuth } from '../hooks/useAuth'

import { JamBanner } from '../components/gamejam/JamBanner'
import { Navigation } from '../components/gamejam/Navigation'
import { PostsGrid } from '../components/gamejam/PostsGrid'
import { CreatePostForm } from '../components/gamejam/CreatePostForm'

const TeamFinderPage = ({ user }) => {
  const [currentView, setCurrentView] = useState('browse')
  const { handleSignIn } = useAuth()
  
  // Configuración
  const skillOptions = [
    'Arte 2D', 'Arte 3D', 'Programación', 'Diseño y Producción', 'Música', 'Efectos de Sonido', 
    'Líder de Equipo', 'Testing y Soporte', 'Otro', 'Vibes', 'Actuación de Voz'
  ]

  const toolOptions = [
    'Unity', 'Unreal Engine', 'Godot', 'GameMaker', 'Construct', 'Phaser',
    'Blender', 'Maya', 'Photoshop', 'Aseprite', 'FL Studio', 'Audacity'
  ]

  const timezoneOptions = [
    'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6',
    'UTC-5', 'UTC-4', 'UTC-3: Halifax, São Paulo, Buenos Aires', 'UTC-2',
    'UTC-1', 'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5',
    'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
  ]

  // Hooks
  const { currentJam, loading: jamLoading } = useJams()
  const { posts, userPost, handleSavePost, handleDeletePost } = usePosts(user, currentJam?.id)
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
  } = usePostForm()

  // Handlers
  const handleCreatePostClick = () => {
    if (!user) {
      if (window.confirm('Necesitas iniciar sesión para crear una publicación. ¿Te gustaría hacerlo ahora?')) {
        handleSignIn()
      }
      return
    }
    setCurrentView('create')
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const success = await handleSavePost(editingPost || newPost, !!editingPost, editingPost)
    
    if (success) {
      resetForm()
      handleCancelEdit()
      setCurrentView('browse')
    }
    setSubmitting(false)
  }

  const handleEditPostClick = (post) => {
    handleEditPost(post)
    setCurrentView('create')
  }

  const handleCancelEditClick = () => {
    handleCancelEdit()
    setCurrentView('browse')
  }

  if (jamLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Cargando jam...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
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
        <div className="text-center text-gray-300 py-12">
          <p className="text-xl mb-4">Necesitas iniciar sesión para crear una publicación</p>
          <button
            onClick={handleSignIn}
            className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mx-auto"
            style={{ backgroundColor: '#0fc064' }}
          >
            <LogIn className="w-5 h-5" />
            Iniciar sesión con Google
          </button>
        </div>
      )}
    </div>
  )
}

export default TeamFinderPage