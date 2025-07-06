// src/components/admin/ManualCertificateCreator.jsx - Creador completamente manual
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
  Type
} from 'lucide-react';
import { 
  FaTrophy, 
  FaPalette, 
  FaBook, 
  FaMusic, 
  FaLightbulb 
} from 'react-icons/fa';
import { getJamParticipants } from '../../firebase/participants';
import { getUserDisplayName } from '../../firebase/users';
import { createCustomCertificate } from '../../firebase/certificates';

export const ManualCertificateCreator = ({ currentJam, onSuccess, onCancel }) => {
  const [step, setStep] = useState(1); // 1: Tipo, 2: Contenido, 3: Participantes, 4: Vista previa
  
  // Datos del certificado
  const [certificateData, setCertificateData] = useState({
    type: '', // 'participation' | 'recognition'
    category: '',
    title: '',
    subtitle: '',
    mainText: '',
    signature: '',
    gameName: '',
    isWinner: false
  });
  
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const recognitionCategories = [
    { id: 'originality', name: 'Originalidad', emoji: '🏆' },
    { id: 'creativity', name: 'Creatividad', emoji: '🎨' },
    { id: 'narrative', name: 'Narrativa', emoji: '📖' },
    { id: 'aesthetics', name: 'Dirección de Arte', emoji: '🎨' },
    { id: 'sound', name: 'Música y Sonido', emoji: '🎵' }
  ];

  // Plantillas predefinidas
  const templates = {
    participation: {
      title: 'Certificado de Participación',
      subtitle: currentJam?.name || 'Game Jam',
      mainText: `Este certificado se otorga a:\n\n[NOMBRE]\n\nPor haber participado activamente en la creación de un videojuego durante la Game Jam organizada por estudiantes para estudiantes.\n\nSabemos que no es fácil hacer un juego en pocos días. Sabemos que dormir tampoco ayudó. Pero aún así, LO LOGRASTE.\n\nCon admiración y un poquito de envidia,`,
      signature: `Organización de ${currentJam?.name || 'la Game Jam'}`
    },
    recognition: {
      originality: {
        title: '🏆 Certificado – Mención Especial a la Originalidad',
        subtitle: '',
        mainText: `Este certificado reconoce al juego:\n\n[JUEGO]\n\nCreado por: [NOMBRE]\n\nPor destacarse en su enfoque único, inesperado o fuera de lo común.\n\nCuando todos pensaban en una cosa, este equipo fue por otra.\nPorque la originalidad no se fuerza, se nota.`,
        signature: currentJam?.name || 'Game Jam'
      },
      creativity: {
        title: '🎨 Certificado – Mención Especial a la Creatividad', 
        subtitle: '',
        mainText: `Se otorga al juego:\n\n[JUEGO]\n\nCreado por: [NOMBRE]\n\nPor su capacidad para imaginar lo improbable y hacerlo jugable.\nCreatividad no es solo tener ideas... es convertirlas en una experiencia inolvidable.\n\nGracias por demostrar que no hay límites cuando se trata de crear.`,
        signature: currentJam?.name || 'Game Jam'
      },
      narrative: {
        title: '📖 Certificado – Mención Especial a la Narrativa',
        subtitle: '',
        mainText: `Reconociendo al juego:\n\n[JUEGO]\n\nCreado por: [NOMBRE]\n\nPor construir una historia que atrapó, emocionó o hizo pensar.\n\nLa narrativa no siempre necesita palabras,\ny este juego lo entendió perfectamente.`,
        signature: currentJam?.name || 'Game Jam'
      },
      aesthetics: {
        title: '🎨 Certificado – Mención Especial a la Dirección de Arte',
        subtitle: '',
        mainText: `Otorgado al juego:\n\n[JUEGO]\n\nCreado por: [NOMBRE]\n\nPor su identidad visual fuerte, coherente y con carácter.\nColores, formas, estilo… todo encajó para crear una estética inolvidable.\n\nUna oda a los pixeles bien puestos (o mal puestos, con intención).`,
        signature: currentJam?.name || 'Game Jam'
      },
      sound: {
        title: '🎵 Certificado – Mención Especial a la Música y Sonido',
        subtitle: '',
        mainText: `En reconocimiento al juego:\n\n[JUEGO]\n\nCreado por: [NOMBRE]\n\nPor su ambientación sonora envolvente, composiciones memorables\no simplemente por hacer que se nos pegara un tema.\n\nCuando el audio no acompaña: conduce.`,
        signature: currentJam?.name || 'Game Jam'
      }
    }
  };

  useEffect(() => {
    if (currentJam?.id) {
      loadParticipants();
    }
  }, [currentJam?.id]);

  const loadParticipants = async () => {
    if (!currentJam?.id) return;
    
    setLoading(true);
    try {
      const participantsData = await getJamParticipants(currentJam.id);
      setParticipants(participantsData);

      const names = {};
      await Promise.all(
        participantsData.map(async (participant) => {
          try {
            const name = await getUserDisplayName(participant.userId);
            names[participant.userId] = name;
          } catch (error) {
            names[participant.userId] = `Usuario ${participant.userId.slice(0, 8)}`;
          }
        })
      );
      setUserNames(names);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelection = (type) => {
    setCertificateData({
      ...certificateData,
      type,
      isWinner: type !== 'participation'
    });
    
    if (type === 'participation') {
      // Cargar plantilla de participación
      const template = templates.participation;
      setCertificateData(prev => ({
        ...prev,
        title: template.title,
        subtitle: template.subtitle,
        mainText: template.mainText,
        signature: template.signature
      }));
    }
    
    setStep(2);
  };

  const handleCategorySelection = (category) => {
    setCertificateData(prev => ({ ...prev, category }));
    
    // Cargar plantilla de reconocimiento
    const template = templates.recognition[category];
    if (template) {
      setCertificateData(prev => ({
        ...prev,
        title: template.title,
        subtitle: template.subtitle,
        mainText: template.mainText,
        signature: template.signature
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

  const handleCreateCertificates = async () => {
    if (selectedParticipants.length === 0) {
      alert('Selecciona al menos un participante');
      return;
    }

    if (!certificateData.title || !certificateData.mainText) {
      alert('Completa el título y contenido del certificado');
      return;
    }

    setLoading(true);
    try {
      const promises = selectedParticipants.map(userId => 
        createCustomCertificate(userId, currentJam.id, {
          ...certificateData,
          category: certificateData.category || 'participation'
        })
      );

      await Promise.all(promises);
      
      alert(`¡${selectedParticipants.length} certificado(s) creado(s) exitosamente!`);
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating certificates:', error);
      alert('Error al crear certificados. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participants.filter(participant =>
    userNames[participant.userId]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPreviewText = () => {
    let text = certificateData.mainText;
    
    // Reemplazar placeholders
    if (selectedParticipants.length === 1) {
      const userName = userNames[selectedParticipants[0]] || 'Participante';
      text = text.replace(/\[NOMBRE\]/g, userName);
    } else if (selectedParticipants.length > 1) {
      text = text.replace(/\[NOMBRE\]/g, `${selectedParticipants.length} participantes seleccionados`);
    }
    
    if (certificateData.gameName) {
      text = text.replace(/\[JUEGO\]/g, certificateData.gameName);
    }
    
    return text;
  };

  // STEP 1: Selección de tipo
  if (step === 1) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Crear Certificado Personalizado</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-medium">¿Qué tipo de certificado quieres crear?</h4>
          
          {/* Certificado de Participación */}
          <button
            onClick={() => handleTypeSelection('participation')}
            className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-white" />
              <div>
                <h5 className="font-bold text-white">Certificado de Participación</h5>
                <p className="text-blue-200 text-sm">Texto completamente personalizable</p>
              </div>
            </div>
          </button>

          {/* Certificados de Reconocimiento */}
          <div className="space-y-3">
            <h5 className="text-white font-medium">Certificados de Reconocimiento:</h5>
            {recognitionCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelection(category.id)}
                className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors border border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{category.emoji}</div>
                  <div>
                    <h6 className="font-bold text-white">{category.name}</h6>
                    <p className="text-gray-300 text-sm">Para juegos destacados - Texto personalizable</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Personalización del contenido
  if (step === 2) {
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
            <h3 className="text-lg font-bold text-white">Personalizar Certificado</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Título del certificado */}
          <div>
            <label className="block text-white font-medium mb-2">
              <Type className="inline w-4 h-4 mr-2" />
              Título del Certificado
            </label>
            <input
              type="text"
              value={certificateData.title}
              onChange={(e) => updateCertificateData('title', e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Certificado de Participación"
            />
          </div>

          {/* Subtítulo (opcional) */}
          <div>
            <label className="block text-white font-medium mb-2">
              Subtítulo (opcional)
            </label>
            <input
              type="text"
              value={certificateData.subtitle}
              onChange={(e) => updateCertificateData('subtitle', e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Game Jam UTN 2025"
            />
          </div>

          {/* Nombre del juego (solo para reconocimientos) */}
          {certificateData.type !== 'participation' && (
            <div>
              <label className="block text-white font-medium mb-2">
                <Trophy className="inline w-4 h-4 mr-2" />
                Nombre del Juego
              </label>
              <input
                type="text"
                value={certificateData.gameName}
                onChange={(e) => updateCertificateData('gameName', e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Super Adventure Game"
              />
              <p className="text-gray-400 text-sm mt-1">
                Usa [JUEGO] en el texto para que aparezca automáticamente
              </p>
            </div>
          )}

          {/* Contenido principal */}
          <div>
            <label className="block text-white font-medium mb-2">
              <Edit3 className="inline w-4 h-4 mr-2" />
              Contenido del Certificado
            </label>
            <textarea
              value={certificateData.mainText}
              onChange={(e) => updateCertificateData('mainText', e.target.value)}
              rows={12}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Escribe el contenido del certificado aquí..."
            />
            <div className="mt-2 text-sm text-gray-400">
              <p><strong>Placeholders disponibles:</strong></p>
              <p>• <code>[NOMBRE]</code> - Se reemplaza por el nombre del participante</p>
              {certificateData.type !== 'participation' && (
                <p>• <code>[JUEGO]</code> - Se reemplaza por el nombre del juego</p>
              )}
            </div>
          </div>

          {/* Firma */}
          <div>
            <label className="block text-white font-medium mb-2">
              Firma/Organización
            </label>
            <input
              type="text"
              value={certificateData.signature}
              onChange={(e) => updateCertificateData('signature', e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Organización de Game Jam UTN"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={() => setStep(1)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            ← Tipo de Certificado
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
              ← Contenido
            </button>
            <h3 className="text-lg font-bold text-white">Seleccionar Participantes</h3>
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
              placeholder="Buscar participantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Lista de participantes */}
        <div className="space-y-3 mb-6">
          <h4 className="text-white font-medium">
            Participantes ({selectedParticipants.length} seleccionados):
          </h4>
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
          ))}
        </div>

        {/* Vista previa del texto */}
        {selectedParticipants.length > 0 && (
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-6">
            <h5 className="text-white font-medium mb-3">Vista Previa:</h5>
            <div className="bg-gray-900 p-4 rounded text-gray-300 text-sm whitespace-pre-line font-mono">
              <div className="text-center">
                <h6 className="text-lg font-bold text-white mb-2">{certificateData.title}</h6>
                {certificateData.subtitle && (
                  <p className="text-blue-300 mb-4">{certificateData.subtitle}</p>
                )}
                <div className="text-sm">
                  {getPreviewText()}
                </div>
                {certificateData.signature && (
                  <p className="mt-4 text-green-300 italic">{certificateData.signature}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
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
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Crear {selectedParticipants.length} Certificado(s)
          </button>
        </div>
      </div>
    );
  }

  return null;
};