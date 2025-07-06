// src/components/gamejam/CreatePostFormWrapper.jsx - Versión combinada sin dependencias problemáticas
import React from 'react';
import { UserPlus, AlertCircle, LogIn } from 'lucide-react';
import { useJamParticipation } from '../../hooks/useJamParticipation';

// ===== COMPONENTE CREATEPOSTFORM INTEGRADO =====
const CreatePostForm = ({
  currentPost,
  isEditing,
  onFieldChange,
  onSkillToggle,
  onToolToggle,
  onSubmit,
  onCancel,
  submitting,
  skillOptions,
  toolOptions,
  timezoneOptions
}) => {
  return (
    <div className="max-w-4xl mx-auto bg-gray-800 border border-gray-700 rounded-lg p-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isEditing ? 'Editar Publicación' : 'Crear Nueva Publicación'}
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">
            Escribe un resumen breve de lo que estás buscando:
          </label>
          <textarea
            value={currentPost.description}
            onChange={(e) => onFieldChange('description', e.target.value)}
            className="w-full h-32 p-3 bg-gray-700 text-white rounded-lg resize-none border border-gray-600 focus:border-gray-500 focus:outline-none"
            placeholder="Describe tu proyecto y qué tipo de miembros de equipo estás buscando..."
            maxLength={2000}
            required
          />
          <p className="text-gray-400 text-sm mt-1">
            {2000 - currentPost.description.length} caracteres restantes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-semibold">
              Usuario principal de itch.io:
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentPost.username}
                onChange={(e) => onFieldChange('username', e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-gray-500 focus:outline-none pr-20"
                placeholder="tunombre"
                required
              />
              <span className="absolute right-3 top-3 text-gray-400 text-sm">.itch.io</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Solo el nombre de usuario, automáticamente se enlazará a tu perfil
            </p>
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Miembros actuales del equipo (opcional):
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentPost.teamMembers}
                onChange={(e) => onFieldChange('teamMembers', e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-gray-500 focus:outline-none pr-20"
                placeholder="usuario1, usuario2"
              />
              <span className="absolute right-3 top-3 text-gray-400 text-sm">.itch.io</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Separa múltiples usuarios con comas, cada uno será enlazado automáticamente
            </p>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Información de Contacto:
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={currentPost.contactType}
                onChange={(e) => onFieldChange('contactType', e.target.value)}
                className="bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-gray-500 focus:outline-none px-3 py-2"
              >
                <option value="discord">Discord</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
                <option value="email">Email</option>
                <option value="other">Otro</option>
              </select>
              <input
                type="text"
                value={currentPost.contactInfo}
                onChange={(e) => onFieldChange('contactInfo', e.target.value)}
                className="flex-1 p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-gray-500 focus:outline-none"
                placeholder={
                  currentPost.contactType === 'discord' ? 'usuario#1234 o enlace de servidor' :
                  currentPost.contactType === 'whatsapp' ? '+54911234567 o enlace' :
                  currentPost.contactType === 'telegram' ? '@usuario' :
                  currentPost.contactType === 'email' ? 'tu@email.com' :
                  'Tu información de contacto'
                }
                required
              />
            </div>
            <p className="text-gray-400 text-sm">
              Cómo pueden contactarte los interesados en unirse a tu equipo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-semibold">
              Zona horaria preferida:
            </label>
            <select
              value={currentPost.timezone}
              onChange={(e) => onFieldChange('timezone', e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-gray-500 focus:outline-none"
            >
              {timezoneOptions.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Tamaño del equipo actual:
            </label>
            <select
              value={currentPost.memberCount || 1}
              onChange={(e) => onFieldChange('memberCount', parseInt(e.target.value))}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-gray-500 focus:outline-none"
            >
              <option value={1}>1 persona (solo yo)</option>
              <option value={2}>2 personas</option>
              <option value={3}>3 personas</option>
              <option value={4}>4 personas</option>
              <option value={5}>5+ personas</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            ¿Qué roles estás buscando en tu equipo?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {skillOptions.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => onSkillToggle(skill, 'lookingFor')}
                className={`p-2 rounded-lg text-sm transition-colors ${
                  currentPost.lookingFor.includes(skill)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            ¿Qué puedes aportar tú al equipo?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {skillOptions.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => onSkillToggle(skill, 'canDo')}
                className={`p-2 rounded-lg text-sm transition-colors ${
                  currentPost.canDo.includes(skill)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Herramientas que usas (opcional):
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {toolOptions.map(tool => (
              <button
                key={tool}
                type="button"
                onClick={() => onToolToggle(tool)}
                className={`p-2 rounded-lg text-sm transition-colors ${
                  currentPost.tools.includes(tool)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tool}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={onSubmit}
            disabled={submitting || !currentPost.username || !currentPost.description || !currentPost.contactInfo}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            {submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Post')}
          </button>
          <button
            onClick={onCancel}
            disabled={submitting}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== COMPONENTE WRAPPER PRINCIPAL =====
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

  // Si puede crear posts, mostrar el formulario
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