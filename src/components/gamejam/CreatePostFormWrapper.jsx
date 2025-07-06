// src/components/gamejam/CreatePostFormWrapper.jsx - Wrapper con participación
import React from 'react';
import { UserPlus, AlertCircle, LogIn } from 'lucide-react';
import { CreatePostForm } from './CreatePostForm';
import { useJamParticipation } from '../../hooks/useJamParticipation';

export const CreatePostFormWrapper = ({
  user,
  currentJam,
  onSignIn,
  ...createPostProps
}) => {
  const {
    isJoined,
    loading: participationLoading,
    joining,
    handleJoinJam,
    canCreatePost,
    getRestrictionMessage
  } = useJamParticipation(user, currentJam);

  // Si no hay usuario
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto bg-gray-800 border border-gray-700 rounded-lg p-8 text-white text-center">
        <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Inicia Sesión para Crear Posts</h2>
        <p className="text-gray-300 mb-6">
          Necesitas una cuenta para buscar compañeros de equipo en la jam
        </p>
        <button
          onClick={onSignIn}
          className="flex items-center gap-2 mx-auto px-6 py-3 rounded-lg font-medium transition-colors text-white"
          style={{ backgroundColor: '#0fc064' }}
        >
          <LogIn className="w-5 h-5" />
          Iniciar Sesión con Google
        </button>
      </div>
    );
  }

  // Si no hay jam activa
  if (!currentJam) {
    return (
      <div className="max-w-4xl mx-auto bg-gray-800 border border-gray-700 rounded-lg p-8 text-white text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-900 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-yellow-400" />
        </div>
        <h2 className="text-2xl font-bold mb-4">No hay Jam Activa</h2>
        <p className="text-gray-300">
          Las publicaciones para buscar equipo aparecerán cuando haya una jam activa
        </p>
      </div>
    );
  }

  // Loading de participación
  if (participationLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-gray-800 border border-gray-700 rounded-lg p-8 text-white text-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-600 border-t-green-500 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-300">Verificando participación en la jam...</p>
      </div>
    );
  }

  // Si no está unido a la jam
  if (!isJoined) {
    return (
      <div className="max-w-4xl mx-auto bg-gray-800 border border-gray-700 rounded-lg p-8 text-white">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-orange-900 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">¡Únete a la Jam para Crear Posts!</h2>
          <p className="text-gray-300 mb-6">
            Solo los participantes de <strong>{currentJam.name}</strong> pueden crear publicaciones para buscar equipo
          </p>
          
          <button
            onClick={handleJoinJam}
            disabled={joining}
            className="flex items-center gap-2 mx-auto px-6 py-3 rounded-lg font-medium transition-colors text-white disabled:opacity-50"
            style={{ backgroundColor: '#0fc064' }}
          >
            <UserPlus className="w-5 h-5" />
            {joining ? 'Uniéndose...' : 'Unirse a la Jam'}
          </button>
        </div>

        {/* Información sobre los beneficios de unirse */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3 text-green-400">Al unirte podrás:</h3>
            <ul className="space-y-2 text-gray-300">
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
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Aparecer en estadísticas de participación
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3 text-blue-400">Información de la Jam:</h3>
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
          </div>
        </div>
      </div>
    );
  }

  // Si puede crear posts, mostrar el formulario normal
  if (canCreatePost()) {
    return <CreatePostForm {...createPostProps} />;
  }

  // Fallback por si hay algún otro caso
  return (
    <div className="max-w-4xl mx-auto bg-gray-800 border border-gray-700 rounded-lg p-8 text-white text-center">
      <div className="w-16 h-16 rounded-full bg-red-900 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Error de Permisos</h2>
      <p className="text-gray-300 mb-4">
        {getRestrictionMessage('crear publicaciones')}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
      >
        Recargar Página
      </button>
    </div>
  );
};