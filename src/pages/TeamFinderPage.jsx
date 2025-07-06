import React, { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'

// Importar hooks y componentes existentes
import { usePosts } from '../hooks/usePosts'
import { usePostForm } from '../hooks/usePostForm'
import { useJams } from '../hooks/useJams'
import { useAuth } from '../hooks/useAuth'
import { useJamParticipation } from '../hooks/useJamParticipation'

import { JamBanner } from '../components/gamejam/JamBanner'
import { Navigation } from '../components/gamejam/Navigation'
import { PostsGrid } from '../components/gamejam/PostsGrid'
import { CreatePostFormWrapper } from '../components/gamejam/CreatePostFormWrapper'

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
    'UTC-12: Baker Island, Howland Island',
    'UTC-11: Samoa, Niue, Midway Island',
    'UTC-10: Honolulu, Anchorage, Tahiti',
    'UTC-9: Anchorage, Juneau, Fairbanks',
    'UTC-8: Los Angeles, San Francisco, Vancouver, Seattle',
    'UTC-7: Denver, Phoenix, Calgary, Las Vegas',
    'UTC-6: Chicago, México DF, Guatemala, Winnipeg',
    'UTC-5: Nueva York, Toronto, Miami, Bogotá, Lima',
    'UTC-4: Caracas, La Paz, Santo Domingo, Halifax',
    'UTC-3: Buenos Aires, São Paulo, Montevideo, Santiago',
    'UTC-2: Fernando de Noronha, South Georgia',
    'UTC-1: Azores, Cabo Verde',
    'UTC+0: Londres, Lisboa, Dublin, Casablanca',
    'UTC+1: Madrid, París, Roma, Berlín, Lagos',
    'UTC+2: El Cairo, Atenas, Helsinki, Johannesburgo',
    'UTC+3: Moscú, Estambul, Nairobi, Riyadh',
    'UTC+4: Dubai, Baku, Tbilisi, Mauricio',
    'UTC+5: Karachi, Tashkent, Yekaterinburg',
    'UTC+6: Almaty, Dhaka, Omsk, Bishkek',
    'UTC+7: Bangkok, Jakarta, Ho Chi Minh, Krasnoyarsk',
    'UTC+8: Beijing, Singapur, Manila, Perth, Kuala Lumpur',
    'UTC+9: Tokio, Seúl, Yakutsk, Pyongyang',
    'UTC+10: Sydney, Melbourne, Vladivostok, Port Moresby',
    'UTC+11: Magadan, Norfolk Island, Nueva Caledonia',
    'UTC+12: Auckland, Fiji, Kamchatka, Marshall Islands'
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

  // Hook de participación
  const {
    isJoined,
    loading: participationLoading,
    canCreatePost,
    getRestrictionMessage
  } = useJamParticipation(user, currentJam)

  // Handlers
  const handleCreatePostClick = () => {
    if (!canCreatePost()) {
      const message = getRestrictionMessage('crear publicaciones')
      alert(message)
      return
    }
    setCurrentView('create')
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const success = await handleSavePost(editingPost || newPost, !editingPost, editingPost)
    
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

  // Renderizar contenido principal según participación
  const renderMainContent = () => {
    // Mostrar loading mientras verifica participación
    if (participationLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">Verificando participación...</div>
        </div>
      )
    }

    // Si no puede ver posts, mostrar mensaje informativo
    if (!user || !isJoined) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-white text-center">
          <div className="w-16 h-16 rounded-full bg-orange-900 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-orange-400" />
          </div>
          
          {!user ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Inicia Sesión para Ver Posts</h2>
              <p className="text-gray-300 mb-6">
                Necesitas una cuenta para ver las publicaciones de búsqueda de equipo
              </p>
              <p className="text-gray-400 text-sm">
                👆 Usa el botón "Iniciar Sesión" en el banner de arriba
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Únete a la Jam para Ver Posts</h2>
              <p className="text-gray-300 mb-6">
                Solo los participantes de <strong>{currentJam?.name}</strong> pueden ver y crear publicaciones para buscar equipo
              </p>
              <p className="text-gray-400 text-sm">
                👆 Usa el botón "Unirse a la Jam" en el banner de arriba
              </p>
            </>
          )}

          {/* Información sobre los beneficios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3 text-green-400">Al unirte podrás:</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Ver posts de otros participantes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Crear posts para buscar compañeros
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Votar por los temas de la jam
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Acceso completo a todas las funciones
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3 text-blue-400">Sobre la Jam:</h3>
              {currentJam ? (
                <div className="space-y-2 text-gray-300">
                  <p><strong>Nombre:</strong> {currentJam.name}</p>
                  <p><strong>Fechas:</strong> {currentJam.startDate} → {currentJam.endDate}</p>
                  {currentJam.selectedTheme && (
                    <p><strong>Tema:</strong> {currentJam.selectedTheme.title}</p>
                  )}
                  {currentJam.jamLink && (
                    <p>
                      <strong>Enlace:</strong>{' '}
                      <a 
                        href={currentJam.jamLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Ver página oficial
                      </a>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-300">No hay jam activa en este momento</p>
              )}
            </div>
          </div>
        </div>
      )
    }

    // Si está unido, mostrar contenido normal
    return (
      <>
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
        ) : (
          // ✅ CORREGIDO: Usar CreatePostFormWrapper en lugar de CreatePostForm
          <CreatePostFormWrapper
            user={user}
            currentJam={currentJam}
            onSignIn={handleSignIn}
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
        )}
      </>
    )
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
      <JamBanner jam={currentJam} user={user} onSignIn={handleSignIn} />
      {renderMainContent()}
    </div>
  )
}

export default TeamFinderPage