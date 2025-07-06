// src/components/profile/ProfileEditor.jsx - Editor de datos personales
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  User, 
  Mail, 
  ExternalLink, 
  AlertTriangle,
  CheckCircle,
  Edit3,
  Info
} from 'lucide-react';
import { updateUserProfile, getUserProfile } from '../../firebase/users';

export const ProfileEditor = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    fullName: '',
    email: '',
    itchUsername: '',
    bio: '',
    country: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUserProfile();
  }, [user?.uid]);

  const loadUserProfile = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const profile = await getUserProfile(user.uid);
      setFormData({
        displayName: profile?.displayName || user.displayName || '',
        fullName: profile?.fullName || '',
        email: profile?.email || user.email || '',
        itchUsername: profile?.itchUsername || '',
        bio: profile?.bio || '',
        country: profile?.country || '',
        city: profile?.city || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre completo (requerido para certificados)
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido para emitir certificados';
    } else if (formData.fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Ingresa tu nombre y apellido';
    }

    // Validar nombre de usuario de itch.io (requerido para certificados)
    if (!formData.itchUsername.trim()) {
      newErrors.itchUsername = 'El usuario de itch.io es requerido para verificar participación';
    } else if (!/^[a-zA-Z0-9-_]+$/.test(formData.itchUsername)) {
      newErrors.itchUsername = 'Solo letras, números, guiones y guiones bajos';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar nombre para mostrar
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'El nombre para mostrar es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      await updateUserProfile(user.uid, formData);
      alert('Perfil actualizado exitosamente');
      if (onSave) onSave(formData);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error al guardar el perfil. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const isProfileComplete = () => {
    return formData.fullName.trim() && 
           formData.itchUsername.trim() && 
           formData.email.trim() && 
           formData.displayName.trim();
  };

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full"></div>
          <span className="ml-3 text-gray-400">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <Edit3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Editar Perfil</h3>
            <p className="text-gray-400 text-sm">
              Completa tu información para acceder a certificados
            </p>
          </div>
        </div>
      </div>

      {/* Alerta de datos requeridos para certificados */}
      <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div className="text-yellow-200 text-sm">
            <p className="font-semibold mb-2">Datos requeridos para certificados:</p>
            <ul className="space-y-1">
              <li>• <strong>Nombre completo:</strong> aparecerá en tus certificados oficiales</li>
              <li>• <strong>Usuario de itch.io:</strong> para verificar tu participación en las jams</li>
              <li>• <strong>Email:</strong> para notificaciones importantes</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre para mostrar */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre para mostrar *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  errors.displayName 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:ring-blue-500'
                }`}
                placeholder="Tu nombre de usuario"
              />
            </div>
            {errors.displayName && (
              <p className="text-red-400 text-sm mt-1">{errors.displayName}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              Como apareces en el TeamFinder y comentarios
            </p>
          </div>

          {/* Nombre completo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre completo * 
              <span className="text-yellow-400 ml-1">📜</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                errors.fullName 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="Juan Pérez"
            />
            {errors.fullName && (
              <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              Aparecerá en tus certificados oficiales
            </p>
          </div>
        </div>

        {/* Email y itch.io */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:ring-blue-500'
                }`}
                placeholder="tu@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Usuario de itch.io */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Usuario de itch.io * 
              <span className="text-yellow-400 ml-1">🎮</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.itchUsername}
                onChange={(e) => handleChange('itchUsername', e.target.value.toLowerCase())}
                className={`w-full pr-20 pl-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  errors.itchUsername 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:ring-blue-500'
                }`}
                placeholder="tunombre"
              />
              <span className="absolute right-3 top-2.5 text-gray-400 text-sm">.itch.io</span>
            </div>
            {errors.itchUsername && (
              <p className="text-red-400 text-sm mt-1">{errors.itchUsername}</p>
            )}
            {formData.itchUsername && !errors.itchUsername && (
              <div className="flex items-center gap-2 mt-1">
                <ExternalLink className="w-3 h-3 text-blue-400" />
                <a 
                  href={`https://${formData.itchUsername}.itch.io`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs"
                >
                  Ver perfil: {formData.itchUsername}.itch.io
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Ubicación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              País (opcional)
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Argentina"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ciudad (opcional)
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buenos Aires"
            />
          </div>
        </div>

        {/* Biografía */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Biografía (opcional)
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Cuéntanos sobre ti, tus habilidades, experiencia..."
          />
          <p className="text-gray-400 text-xs mt-1">
            {formData.bio.length}/500 caracteres
          </p>
        </div>

        {/* Estado de completitud */}
        <div className={`border rounded-lg p-4 ${
          isProfileComplete() 
            ? 'bg-green-900 bg-opacity-30 border-green-600' 
            : 'bg-yellow-900 bg-opacity-30 border-yellow-600'
        }`}>
          <div className="flex items-center gap-2">
            {isProfileComplete() ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            )}
            <span className={`font-medium ${
              isProfileComplete() ? 'text-green-200' : 'text-yellow-200'
            }`}>
              {isProfileComplete() 
                ? '¡Perfil completo! Puedes acceder a certificados' 
                : 'Completa los datos marcados (*) para acceder a certificados'
              }
            </span>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};