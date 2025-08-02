// src/components/admin/ManualCertificateCreator.jsx - Versión mejorada
import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Trophy, 
  Users, 
  Search, 
  Plus, 
  X, 
  Check,
  AlertTriangle,
  Eye,
  Save,
  Edit3,
  Type,
  UserPlus
} from 'lucide-react';
import { 
  FaTrophy, 
  FaPalette, 
  FaBook, 
  FaMusic, 
  FaLightbulb 
} from 'react-icons/fa';
import { getJamParticipants } from '../../firebase/participants';
import { getUserDisplayName, getUserProfile } from '../../firebase/users';
import { createCustomCertificate } from '../../firebase/certificates';
import { auth } from '../../firebase/config';

export const ManualCertificateCreator = ({ currentJam, onSuccess, onCancel }) => {
  const [step, setStep] = useState(1);
  
  const [certificateData, setCertificateData] = useState({
    type: '',
    category: '',
    title: '',
    subtitle: '',
    mainText: '',
    signature: '',
    gameName: '',
    gameLink: '', // Nuevo campo para el link del juego
    isWinner: false
  });
  
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [userProfiles, setUserProfiles] = useState({}); // Para almacenar perfiles completos
  const [customNames, setCustomNames] = useState({}); // Para nombres personalizados
  const [editingName, setEditingName] = useState(null); // ID del usuario siendo editado
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const recognitionCategories = [
    { id: 'originality', name: 'Originalidad', emoji: '🏆' },
    { id: 'creativity', name: 'Creatividad', emoji: '🎨' },
    { id: 'narrative', name: 'Narrativa', emoji: '📖' },
    { id: 'aesthetics', name: 'Dirección de Arte', emoji: '🎨' },
    { id: 'sound', name: 'Música y Sonido', emoji: '🎵' }
  ];

  // Función para obtener el nombre a mostrar (personalizado o original)
  const getDisplayName = (userId) => {
    return customNames[userId] || userNames[userId] || 'Usuario sin nombre';
  };

  // Función para actualizar nombre personalizado
  const updateCustomName = (userId, newName) => {
    setCustomNames(prev => ({
      ...prev,
      [userId]: newName.trim()
    }));
  };

  // Función para iniciar edición de nombre
  const startEditingName = (userId) => {
    setEditingName(userId);
  };

  // Función para guardar nombre editado
  const saveEditedName = (userId, newName) => {
    if (newName.trim()) {
      updateCustomName(userId, newName.trim());
    }
    setEditingName(null);
  };

  // Función para cancelar edición
  const cancelEditingName = () => {
    setEditingName(null);
  };
  const getEnhancedUserName = async (userId) => {
    try {
      // Primero intentar obtener del perfil del usuario
      const userProfile = await getUserProfile(userId);
      
      if (userProfile) {
        // Prioridad: fullName > displayName > name > email > Google display name
        if (userProfile.fullName && userProfile.fullName.trim()) {
          return userProfile.fullName.trim();
        }
        
        if (userProfile.displayName && userProfile.displayName.trim()) {
          return userProfile.displayName.trim();
        }
        
        if (userProfile.name && userProfile.name.trim()) {
          return userProfile.name.trim();
        }
        
        if (userProfile.email) {
          const emailName = userProfile.email.split('@')[0];
          return emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
      }
      
      // Si no hay perfil o está incompleto, intentar obtener de Google
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === userId) {
        if (currentUser.displayName) {
          return currentUser.displayName;
        }
        if (currentUser.email) {
          const emailName = currentUser.email.split('@')[0];
          return emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
      }
      
      // Fallback al método original
      return await getUserDisplayName(userId);
      
    } catch (error) {
      console.error('Error getting enhanced user name:', error);
      return await getUserDisplayName(userId);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (currentJam?.id) {
        await loadParticipants();
      }
    };
    loadData();
  }, [currentJam?.id]); // Solo depender del ID

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const participantsList = await getJamParticipants(currentJam.id);
      setParticipants(participantsList);

      // Cargar nombres y perfiles mejorados
      const namesMap = {};
      const profilesMap = {};
      
      for (const participant of participantsList) {
        // Obtener nombre mejorado
        const enhancedName = await getEnhancedUserName(participant.userId);
        namesMap[participant.userId] = enhancedName;
        
        // Obtener perfil completo para información adicional
        const profile = await getUserProfile(participant.userId);
        if (profile) {
          profilesMap[participant.userId] = profile;
        }
      }
      
      setUserNames(namesMap);
      setUserProfiles(profilesMap);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función mejorada para generar texto de vista previa
  const getPreviewText = () => {
    let text = certificateData.mainText;
    
    if (selectedParticipants.length === 0) {
      text = text.replace(/\[NOMBRE\]/g, '[NOMBRE DEL PARTICIPANTE]');
    } else if (selectedParticipants.length === 1) {
      const userName = getDisplayName(selectedParticipants[0]);
      text = text.replace(/\[NOMBRE\]/g, userName);
    } else {
      // Para múltiples participantes, mostrar TODOS los nombres
      const names = selectedParticipants
        .map(id => getDisplayName(id))
        .filter(name => name && name.trim() !== '' && name !== 'Usuario sin nombre');
      
      let nameText;
      if (names.length === 2) {
        // Dos personas: "Juan y María"
        nameText = names.join(' y ');
      } else if (names.length > 2) {
        // Más de dos: "Juan, María, Carlos y Ana"
        const allButLast = names.slice(0, -1);
        const lastName = names[names.length - 1];
        nameText = allButLast.join(', ') + ' y ' + lastName;
      } else {
        // Fallback por si hay problemas con nombres
        nameText = names.join(', ');
      }
      
      text = text.replace(/\[NOMBRE\]/g, nameText);
    }
    
    return text;
  };

  // Función para obtener información de vista previa de participantes
  const getParticipantsPreviewInfo = () => {
    if (selectedParticipants.length === 0) {
      return 'Ningún participante seleccionado';
    }
    
    if (selectedParticipants.length === 1) {
      const userId = selectedParticipants[0];
      const name = getDisplayName(userId);
      const profile = userProfiles[userId];
      
      return (
        <div className="text-sm">
          <div className="font-medium text-blue-300">{name}</div>
          {profile?.email && (
            <div className="text-gray-400">{profile.email}</div>
          )}
          {profile?.itchUsername && (
            <div className="text-gray-400">itch.io: {profile.itchUsername}</div>
          )}
        </div>
      );
    }
    
    return (
      <div className="text-sm">
        <div className="font-medium text-blue-300 mb-2">
          {selectedParticipants.length} participantes seleccionados:
        </div>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {selectedParticipants.map(userId => (
            <div key={userId} className="text-gray-300 flex items-center gap-2">
              <Check className="w-3 h-3 text-green-400" />
              {getDisplayName(userId)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const templates = {
    participation: {
      title: 'Certificado de Participación',
      subtitle: currentJam?.name || 'Game Jam',
      mainText: `Este certificado se otorga a:\n\n[NOMBRE]\n\nPor haber participado activamente en la creación de un videojuego durante la Game Jam.\n\nSabemos que no es fácil hacer un juego en pocos días. Sabemos que dormir tampoco ayudó.\n\nPero lo lograron. Felicitaciones.`,
      signature: 'Equipo Organizador'
    },
    recognition: {
      title: 'Certificado de Reconocimiento',
      subtitle: currentJam?.name || 'Game Jam',
      mainText: `Este certificado se otorga a:\n\n[NOMBRE]\n\nPor haber creado un juego excepcional que se destaca por su calidad e innovación.\n\nSu trabajo demuestra talento, dedicación y creatividad excepcionales.`,
      signature: 'Jurado de la Game Jam'
    }
  };

  const handleTypeSelection = (type, category = '') => {
    const template = templates[type];
    
    if (template) {
      setCertificateData(prev => ({
        ...prev,
        type,
        category,
        title: template.title + (category ? ` - ${recognitionCategories.find(c => c.id === category)?.name}` : ''),
        subtitle: template.subtitle,
        mainText: template.mainText,
        signature: template.signature,
        isWinner: type === 'recognition'
      }));
    }
    
    setStep(2);
  };

  const updateCertificateData = (field, value) => {
    setCertificateData(prev => ({ ...prev, [field]: value }));
  };

  const toggleParticipantSelection = (userId) => {
    setSelectedParticipants(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const selectAllParticipants = () => {
    const filteredUserIds = filteredParticipants.map(p => p.userId);
    setSelectedParticipants(filteredUserIds);
  };

  const clearSelection = () => {
    setSelectedParticipants([]);
  };

  const handleCreateCertificates = async () => {
    if (selectedParticipants.length === 0) {
      alert('Selecciona al menos un participante');
      return;
    }

    if (!certificateData.title || !certificateData.mainText) {
      alert('Completa el título y contenido del certificado');
      return;
    }

    if (certificateData.type === 'recognition' && selectedParticipants.length > 1 && !certificateData.gameName) {
      alert('Para reconocimientos grupales, especifica el nombre del juego');
      return;
    }

    setLoading(true);
    try {
      const promises = selectedParticipants.map(userId => {
        const participantData = {
          ...certificateData,
          isWinner: certificateData.type === 'recognition',
          gameName: certificateData.type === 'recognition' ? certificateData.gameName : null,
          gameLink: certificateData.type === 'recognition' ? certificateData.gameLink : null
        };
        
        return createCustomCertificate(userId, currentJam.id, participantData);
      });

      await Promise.all(promises);
      
      const typeText = certificateData.type === 'recognition' ? 'reconocimiento' : 'participación';
      alert(`¡${selectedParticipants.length} certificado(s) de ${typeText} creado(s) exitosamente!`);
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating certificates:', error);
      alert('Error al crear certificados. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participants.filter(participant => {
    const userName = getDisplayName(participant.userId);
    const userEmail = userProfiles[participant.userId]?.email || '';
    const searchLower = searchTerm.toLowerCase();
    
    return userName.toLowerCase().includes(searchLower) || 
           userEmail.toLowerCase().includes(searchLower);
  });

  // STEP 1: Selección de tipo
  if (step === 1) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Crear Certificados Personalizados</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-medium">¿Qué tipo de certificado quieres crear?</h4>
          
          <button
            onClick={() => handleTypeSelection('participation')}
            className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-white" />
              <div>
                <h5 className="font-bold text-white">Certificados de Participación</h5>
                <p className="text-blue-200 text-sm">Para todos los participantes de la jam</p>
              </div>
            </div>
          </button>

          <div className="space-y-3">
            <h5 className="text-white font-medium">Certificados de Reconocimiento:</h5>
            {recognitionCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleTypeSelection('recognition', category.id)}
                className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors border border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{category.emoji}</div>
                  <div className="flex-1">
                    <h6 className="font-bold text-white">{category.name}</h6>
                    <p className="text-gray-300 text-sm">Mención especial para juegos destacados</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Edición de contenido
  if (step === 2) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setStep(1)}
              className="text-gray-400 hover:text-white"
            >
              ← Cambiar Tipo
            </button>
            <h3 className="text-lg font-bold text-white">
              Personalizar Contenido
              {certificateData.type === 'recognition' && (
                <span className="text-yellow-400 text-sm ml-2">
                  ({recognitionCategories.find(c => c.id === certificateData.category)?.name})
                </span>
              )}
            </h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario de edición */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Type className="w-4 h-4 inline mr-1" />
                Título del Certificado
              </label>
              <input
                type="text"
                value={certificateData.title}
                onChange={(e) => updateCertificateData('title', e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="Ej: Certificado de Participación"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subtítulo
              </label>
              <input
                type="text"
                value={certificateData.subtitle}
                onChange={(e) => updateCertificateData('subtitle', e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="Ej: Game Jam 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Edit3 className="w-4 h-4 inline mr-1" />
                Contenido Principal
              </label>
              <textarea
                value={certificateData.mainText}
                onChange={(e) => updateCertificateData('mainText', e.target.value)}
                rows={8}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Usa [NOMBRE] donde quieres que aparezca el nombre del participante"
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 Usa <code className="bg-gray-600 px-1 rounded">[NOMBRE]</code> para insertar automáticamente el nombre del participante
              </p>
            </div>

            {/* Campo adicional para reconocimientos grupales */}
            {certificateData.type === 'recognition' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Trophy className="w-4 h-4 inline mr-1" />
                    Nombre del Juego (Para reconocimientos)
                  </label>
                  <input
                    type="text"
                    value={certificateData.gameName}
                    onChange={(e) => updateCertificateData('gameName', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Ej: Super Adventure Game"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Necesario para reconocimientos grupales
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🔗 Link del Juego (Opcional)
                  </label>
                  <input
                    type="url"
                    value={certificateData.gameLink || ''}
                    onChange={(e) => updateCertificateData('gameLink', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="https://tu-usuario.itch.io/tu-juego"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    📱 Se generará un código QR en el certificado para acceso directo
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Firma/Organización
              </label>
              <input
                type="text"
                value={certificateData.signature}
                onChange={(e) => updateCertificateData('signature', e.target.value)}
                placeholder="Ej: Organización de la Game Jam"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Vista previa */}
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Vista Previa
            </h4>
            
            <div className="bg-white p-6 rounded-lg text-black min-h-[400px]">
              <div className="text-center border-4 border-gray-800 p-8 h-full">
                <h1 className="text-2xl font-bold mb-2">{certificateData.title || 'Título del Certificado'}</h1>
                <h2 className="text-lg text-gray-600 mb-6">{certificateData.subtitle || 'Subtítulo'}</h2>
                
                <div className="my-8 text-center">
                  <div className="whitespace-pre-line text-sm leading-relaxed">
                    {getPreviewText() || 'Contenido del certificado...'}
                  </div>
                </div>
                
                <div className="mt-8 pt-4 border-t border-gray-300">
                  <p className="text-sm font-medium">
                    {certificateData.signature || 'Firma/Organización'}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de participantes seleccionados */}
            {selectedParticipants.length > 0 && (
              <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                <h5 className="text-white font-medium mb-2">Participantes:</h5>
                {getParticipantsPreviewInfo()}
                
                {/* Mostrar información del QR si hay gameLink */}
                {certificateData.gameLink && (
                  <div className="mt-3 p-2 bg-blue-900/30 border border-blue-600 rounded">
                    <div className="flex items-center gap-2 text-blue-300">
                      <span className="text-lg">📱</span>
                      <span className="text-sm font-medium">QR Code incluido</span>
                    </div>
                    <p className="text-blue-200 text-xs mt-1">
                      Enlace: {certificateData.gameLink}
                    </p>
                    <p className="text-blue-200 text-xs">
                      Se generará un código QR en la esquina del certificado
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-gray-700 mt-6">
          <button
            onClick={() => setStep(1)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            ← Cambiar Tipo
          </button>
          
          <button
            onClick={() => setStep(3)}
            disabled={!certificateData.title || !certificateData.mainText}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Seleccionar Participantes →
          </button>
        </div>
      </div>
    );
  }

  // STEP 3: Selección de participantes
  if (step === 3) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setStep(2)}
              className="text-gray-400 hover:text-white"
            >
              ← Editar Contenido
            </button>
            <h3 className="text-lg font-bold text-white">
              Seleccionar Participantes
              {certificateData.type === 'recognition' && (
                <span className="text-yellow-400 text-sm ml-2">(Reconocimiento)</span>
              )}
            </h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Búsqueda y controles de selección */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar participantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={selectAllParticipants}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Seleccionar todos ({filteredParticipants.length})
              </button>
              
              {selectedParticipants.length > 0 && (
                <button
                  onClick={clearSelection}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm"
                >
                  <X className="w-4 h-4" />
                  Limpiar selección
                </button>
              )}
            </div>

            <div className="text-white text-sm">
              {selectedParticipants.length} seleccionado(s)
            </div>
          </div>

          {/* Aviso para reconocimientos grupales */}
          {certificateData.type === 'recognition' && selectedParticipants.length > 1 && (
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-300">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Reconocimiento Grupal</span>
              </div>
              <p className="text-yellow-200 text-sm mt-1">
                Se creará un certificado de reconocimiento para cada integrante del equipo.
                {!certificateData.gameName && (
                  <span className="text-red-300"> ⚠️ Asegúrate de especificar el nombre del juego.</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Lista de participantes */}
        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Cargando participantes...</div>
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400">No se encontraron participantes</div>
            </div>
          ) : (
            filteredParticipants.map((participant) => {
              const profile = userProfiles[participant.userId];
              const displayName = getDisplayName(participant.userId);
              const originalName = userNames[participant.userId];
              const isEditing = editingName === participant.userId;
              const hasIncompleteProfile = !originalName || originalName.startsWith('Usuario ');
              
              return (
                <div
                  key={participant.userId}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedParticipants.includes(participant.userId)
                      ? 'bg-blue-900 border-blue-600'
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => !isEditing && toggleParticipantSelection(participant.userId)}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedParticipants.includes(participant.userId)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-400'
                      }`}>
                        {selectedParticipants.includes(participant.userId) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Nombre del participante */}
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                defaultValue={displayName}
                                className="flex-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                placeholder="Nombre para el certificado"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveEditedName(participant.userId, e.target.value);
                                  } else if (e.key === 'Escape') {
                                    cancelEditingName();
                                  }
                                }}
                                onBlur={(e) => saveEditedName(participant.userId, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelEditingName();
                                }}
                                className="text-gray-400 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className={`font-medium ${
                                    hasIncompleteProfile ? 'text-yellow-300' : 'text-white'
                                  }`}>
                                    {displayName}
                                  </p>
                                  {customNames[participant.userId] && (
                                    <span className="px-1.5 py-0.5 bg-green-700 text-green-200 text-xs rounded">
                                      Editado
                                    </span>
                                  )}
                                  {hasIncompleteProfile && (
                                    <span className="px-1.5 py-0.5 bg-yellow-700 text-yellow-200 text-xs rounded">
                                      Perfil incompleto
                                    </span>
                                  )}
                                </div>
                                
                                {/* Email del participante */}
                                {profile?.email && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    📧 {profile.email}
                                  </p>
                                )}
                                
                                {/* Información adicional */}
                                <div className="flex items-center gap-4 mt-1">
                                  <p className="text-xs text-gray-500">
                                    Se unió: {participant.joinedAt.toLocaleDateString()}
                                  </p>
                                  {profile?.itchUsername && (
                                    <p className="text-xs text-gray-500">
                                      itch.io: {profile.itchUsername}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingName(participant.userId);
                                }}
                                className="text-gray-400 hover:text-blue-300 transition-colors"
                                title="Editar nombre para certificado"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Vista previa actualizada */}
        {selectedParticipants.length > 0 && (
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 mb-6">
            <h4 className="text-white font-medium mb-3">Vista Previa del Texto:</h4>
            <div className="bg-gray-800 p-3 rounded text-gray-300 text-sm whitespace-pre-line">
              {getPreviewText()}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-between pt-6 border-t border-gray-700">
          <button
            onClick={() => setStep(2)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            ← Editar Contenido
          </button>

          <button
            onClick={handleCreateCertificates}
            disabled={selectedParticipants.length === 0 || loading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Crear {selectedParticipants.length} Certificado(s)
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return null;
};