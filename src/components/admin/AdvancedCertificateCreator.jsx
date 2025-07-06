// src/components/admin/AdvancedCertificateCreator.jsx - Creador avanzado de certificados
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
  Save
} from 'lucide-react';
import { 
  FaTrophy, 
  FaPalette, 
  FaBook, 
  FaMusic, 
  FaLightbulb 
} from 'react-icons/fa';
import { getPostsByEdition } from '../../firebase/firestore';
import { getJamParticipants } from '../../firebase/participants';
import { getUserDisplayName } from '../../firebase/users';
import { createRecognitionCertificate } from '../../firebase/certificates';

export const AdvancedCertificateCreator = ({ currentJam, onSuccess, onCancel }) => {
  const [step, setStep] = useState(1); // 1: Tipo, 2: Selección, 3: Confirmación
  const [certificateType, setCertificateType] = useState(''); // 'participation' | category
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [customGameName, setCustomGameName] = useState('');
  const [posts, setPosts] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const recognitionCategories = [
    { id: 'originality', name: 'Originalidad', icon: <FaTrophy className="text-yellow-500" />, emoji: '🏆' },
    { id: 'creativity', name: 'Creatividad', icon: <FaPalette className="text-pink-500" />, emoji: '🎨' },
    { id: 'narrative', name: 'Narrativa', icon: <FaBook className="text-green-500" />, emoji: '📖' },
    { id: 'aesthetics', name: 'Dirección de Arte', icon: <FaPalette className="text-purple-500" />, emoji: '🎨' },
    { id: 'sound', name: 'Música y Sonido', icon: <FaMusic className="text-blue-500" />, emoji: '🎵' }
  ];

  useEffect(() => {
    if (currentJam?.id && step === 2) {
      loadData();
    }
  }, [currentJam?.id, step]);

  const loadData = async () => {
    if (!currentJam?.id) return;
    
    setLoading(true);
    try {
      // Cargar posts de la jam
      const jamPosts = await getPostsByEdition(currentJam.id);
      setPosts(jamPosts);

      // Cargar participantes
      const jamParticipants = await getJamParticipants(currentJam.id);
      setParticipants(jamParticipants);

      // Cargar nombres de usuarios
      const allUserIds = [
        ...new Set([
          ...jamPosts.map(post => post.userId),
          ...jamParticipants.map(p => p.userId)
        ])
      ];

      const names = {};
      await Promise.all(
        allUserIds.map(async (userId) => {
          try {
            const name = await getUserDisplayName(userId);
            names[userId] = name;
          } catch (error) {
            names[userId] = `Usuario ${userId.slice(0, 8)}`;
          }
        })
      );
      setUserNames(names);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelection = (type) => {
    setCertificateType(type);
    setStep(2);
  };

  const handleGameSelection = (post) => {
    setSelectedGame(post);
    setCustomGameName(post.title || '');
    
    // Auto-seleccionar al creador del post
    setSelectedParticipants([post.userId]);
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

  const handleCreateCertificates = async () => {
    if (!certificateType || selectedParticipants.length === 0) {
      alert('Selecciona un tipo de certificado y al menos un participante');
      return;
    }

    setLoading(true);
    try {
      const promises = selectedParticipants.map(userId => 
        createRecognitionCertificate(userId, currentJam.id, certificateType, {
          gameName: customGameName,
          gameDescription: selectedGame?.description || '',
          postId: selectedGame?.id || null
        })
      );

      await Promise.all(promises);
      
      alert(`¡${selectedParticipants.length} certificado(s) de ${recognitionCategories.find(c => c.id === certificateType)?.name} creado(s) exitosamente!`);
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating certificates:', error);
      alert('Error al crear certificados. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userNames[post.userId]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredParticipants = participants.filter(participant =>
    userNames[participant.userId]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryInfo = (categoryId) => {
    return recognitionCategories.find(cat => cat.id === categoryId);
  };

  // Step 1: Selección de tipo
  if (step === 1) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Crear Certificados</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-medium">¿Qué tipo de certificado quieres crear?</h4>
          
          {/* Certificados de Participación */}
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

          {/* Certificados de Reconocimiento */}
          <div className="space-y-3">
            <h5 className="text-white font-medium">Certificados de Reconocimiento:</h5>
            {recognitionCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleTypeSelection(category.id)}
                className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors border border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{category.emoji}</div>
                  <div className="flex-1">
                    <h6 className="font-bold text-white">{category.name}</h6>
                    <p className="text-gray-300 text-sm">Mención especial para juegos destacados</p>
                  </div>
                  {category.icon}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Selección de juego/participantes
  if (step === 2) {
    const isParticipationCertificate = certificateType === 'participation';
    const categoryInfo = getCategoryInfo(certificateType);

    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setStep(1)}
              className="text-gray-400 hover:text-white"
            >
              ← Volver
            </button>
            <h3 className="text-lg font-bold text-white">
              {isParticipationCertificate 
                ? 'Certificados de Participación' 
                : `Reconocimiento: ${categoryInfo?.name}`
              }
            </h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={isParticipationCertificate ? "Buscar participantes..." : "Buscar juegos o participantes..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando datos...</p>
          </div>
        ) : isParticipationCertificate ? (
          // Lista de participantes para certificados de participación
          <div className="space-y-3">
            <h4 className="text-white font-medium">Seleccionar participantes:</h4>
            {filteredParticipants.map((participant) => (
              <div 
                key={participant.userId}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedParticipants.includes(participant.userId)
                    ? 'bg-blue-900 border-blue-600'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
                onClick={() => toggleParticipantSelection(participant.userId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedParticipants.includes(participant.userId)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-400'
                    }`}>
                      {selectedParticipants.includes(participant.userId) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{userNames[participant.userId]}</p>
                      <p className="text-sm text-gray-400">
                        Se unió el {participant.joinedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Lista de juegos para certificados de reconocimiento
          <div className="space-y-4">
            <h4 className="text-white font-medium">Seleccionar juego ganador:</h4>
            
            {selectedGame && (
              <div className="bg-green-900 border border-green-600 rounded-lg p-4 mb-4">
                <h5 className="text-green-200 font-bold mb-2">Juego seleccionado:</h5>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-green-200 mb-1">Nombre del juego:</label>
                    <input
                      type="text"
                      value={customGameName}
                      onChange={(e) => setCustomGameName(e.target.value)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Nombre del juego premiado"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-green-200 mb-2">Participantes que recibirán el certificado:</label>
                    <div className="space-y-2">
                      {participants.map((participant) => (
                        <div 
                          key={participant.userId}
                          className={`p-2 rounded border cursor-pointer transition-colors ${
                            selectedParticipants.includes(participant.userId)
                              ? 'bg-green-800 border-green-500'
                              : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          }`}
                          onClick={() => toggleParticipantSelection(participant.userId)}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              selectedParticipants.includes(participant.userId)
                                ? 'bg-green-600 border-green-600'
                                : 'border-gray-400'
                            }`}>
                              {selectedParticipants.includes(participant.userId) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="text-white text-sm">{userNames[participant.userId]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-3">
              {filteredPosts.map((post) => (
                <div 
                  key={post.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedGame?.id === post.id
                      ? 'bg-blue-900 border-blue-600'
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                  onClick={() => handleGameSelection(post)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 mt-1 ${
                      selectedGame?.id === post.id
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-400'
                    }`}>
                      {selectedGame?.id === post.id && (
                        <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h6 className="font-medium text-white">{post.title || 'Sin título'}</h6>
                          <p className="text-sm text-gray-300 mb-2">
                            Por: {userNames[post.userId]}
                          </p>
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {post.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {selectedParticipants.length} participante(s) seleccionado(s)
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateCertificates}
              disabled={selectedParticipants.length === 0 || loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Crear Certificados
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};