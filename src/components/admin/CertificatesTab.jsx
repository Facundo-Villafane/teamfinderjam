// src/components/admin/CertificatesTab.jsx - Gestión de certificados mejorada
import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Download, 
  Plus, 
  Users, 
  Star, 
  Trash2, 
  FileText,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Gift,
  Zap,
  Eye,
  X
} from 'lucide-react';
import {
  getJamCertificates,
  getCertificateStats,
  createMassParticipationCertificates,
  createRecognitionCertificate,
  deleteCertificate
} from '../../firebase/certificates';
import { getUserDisplayName, getUserProfile } from '../../firebase/users';
import { getJamParticipants } from '../../firebase/participants';
import { generateCertificateWithCustomBackground } from '../../utils/certificateGenerator';
import { CertificatePreview } from '../certificates/CertificatePreview';
import { ManualCertificateCreator } from './ManualCertificateCreator';

export const CertificatesTab = ({ currentJam, onRefresh }) => {
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [creatingMass, setCreatingMass] = useState(false);
  const [showCreateRecognition, setShowCreateRecognition] = useState(false);
  const [showAdvancedCreator, setShowAdvancedCreator] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [participants, setParticipants] = useState([]);
  const [userNames, setUserNames] = useState({}); // Cache de nombres de usuarios
  const [previewCertificate, setPreviewCertificate] = useState(null);

  // Categorías de reconocimiento
  const recognitionCategories = [
    { id: 'originality', name: 'Originalidad', icon: '💡', color: 'bg-yellow-500' },
    { id: 'creativity', name: 'Creatividad', icon: '✨', color: 'bg-purple-500' },
    { id: 'narrative', name: 'Narrativa/Concepto', icon: '📖', color: 'bg-green-500' },
    { id: 'aesthetics', name: 'Estética/Arte', icon: '🎨', color: 'bg-pink-500' },
    { id: 'sound', name: 'Sonido/Música', icon: '🎵', color: 'bg-indigo-500' }
  ];

  useEffect(() => {
    if (currentJam?.id) {
      loadCertificatesData();
      loadParticipants();
    }
  }, [currentJam?.id]);

  const loadParticipants = async () => {
    if (!currentJam?.id) return;
    
    try {
      const participantsData = await getJamParticipants(currentJam.id);
      setParticipants(participantsData);
      
      // Cargar nombres de todos los participantes
      const namesCache = {};
      await Promise.all(
        participantsData.map(async (participant) => {
          try {
            const name = await getUserDisplayName(participant.userId);
            namesCache[participant.userId] = name;
          } catch (error) {
            console.error(`Error loading name for user ${participant.userId}:`, error);
            namesCache[participant.userId] = `Usuario ${participant.userId.slice(0, 8)}`;
          }
        })
      );
      setUserNames(namesCache);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const loadCertificatesData = async () => {
    if (!currentJam?.id) return;

    try {
      setLoading(true);
      const [certificatesData, statsData] = await Promise.all([
        getJamCertificates(currentJam.id),
        getCertificateStats(currentJam.id)
      ]);
      
      setCertificates(certificatesData);
      setStats(statsData);
      
      // Cargar nombres de usuarios para certificados existentes
      const userIds = [...new Set(certificatesData.map(cert => cert.userId))];
      const namesCache = { ...userNames };
      
      await Promise.all(
        userIds.map(async (userId) => {
          if (!namesCache[userId]) {
            try {
              const name = await getUserDisplayName(userId);
              namesCache[userId] = name;
            } catch (error) {
              console.error(`Error loading name for user ${userId}:`, error);
              namesCache[userId] = `Usuario ${userId.slice(0, 8)}`;
            }
          }
        })
      );
      
      setUserNames(namesCache);
    } catch (error) {
      console.error('Error loading certificates data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    return userNames[userId] || `Usuario ${userId.slice(0, 8)}`;
  };

  const getCategoryName = (category) => {
    const categoryMap = recognitionCategories.find(cat => cat.id === category);
    return categoryMap ? categoryMap.name : category;
  };

  const getCategoryIcon = (category) => {
    const categoryMap = recognitionCategories.find(cat => cat.id === category);
    return categoryMap ? categoryMap.icon : '🏆';
  };

  const handleCreateMassCertificates = async () => {
    if (!currentJam?.id) return;

    const confirmed = window.confirm(
      `¿Crear certificados de participación para todos los participantes de "${currentJam.name}"?\n\n` +
      'Solo se crearán certificados para usuarios que aún no tengan uno.'
    );

    if (!confirmed) return;

    try {
      setCreatingMass(true);
      const result = await createMassParticipationCertificates(currentJam.id);
      
      alert(result.message);
      await loadCertificatesData();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error creating mass certificates:', error);
      alert('Error al crear certificados masivos. Intenta de nuevo.');
    } finally {
      setCreatingMass(false);
    }
  };

  const handleCreateRecognition = async () => {
    if (!selectedUser || !selectedCategory) {
      alert('Selecciona un usuario y una categoría');
      return;
    }

    try {
      await createRecognitionCertificate(selectedUser, currentJam.id, selectedCategory);
      alert('Certificado de reconocimiento creado exitosamente!');
      
      setShowCreateRecognition(false);
      setSelectedUser('');
      setSelectedCategory('');
      await loadCertificatesData();
    } catch (error) {
      console.error('Error creating recognition certificate:', error);
      alert('Error al crear certificado de reconocimiento.');
    }
  };

  const handleDeleteCertificate = async (certificateId) => {
    if (!window.confirm('¿Estás seguro de eliminar este certificado?')) return;

    try {
      await deleteCertificate(certificateId);
      alert('Certificado eliminado exitosamente');
      await loadCertificatesData();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      alert('Error al eliminar certificado');
    }
  };

  const handlePreviewCertificate = (certificate) => {
    setPreviewCertificate(certificate);
  };

  const handleDownloadCertificate = async (certificate) => {
    try {
      // Obtener información completa del usuario
      const userProfile = await getUserProfile(certificate.userId);
      
      if (!userProfile || !userProfile.fullName) {
        alert('El usuario debe completar su perfil para generar certificados válidos');
        return;
      }

      const certificateData = {
        userName: userProfile.fullName,
        jamName: certificate.jamName,
        category: getCategoryName(certificate.category),
        isWinner: certificate.isWinner,
        date: certificate.awardedDate,
        certificateId: certificate.id,
        gameName: certificate.gameName || null,
        // Campos personalizados
        customTitle: certificate.customTitle || null,
        customSubtitle: certificate.customSubtitle || null,
        customMainText: certificate.customMainText || null,
        customSignature: certificate.customSignature || null
      };

      await generateCertificateWithCustomBackground(certificateData);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Error al generar el certificado. Intenta de nuevo.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header y estadísticas principales */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Gestión de Certificados</h3>
              <p className="text-gray-400 text-sm">
                {currentJam ? `Game Jam: ${currentJam.name}` : 'Selecciona una Game Jam'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleCreateMassCertificates}
              disabled={creatingMass || !currentJam}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingMass ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Users className="w-4 h-4" />
              )}
              {creatingMass ? 'Creando...' : 'Crear Certificados Masivos'}
            </button>
            
            <button
              onClick={() => setShowAdvancedCreator(true)}
              disabled={!currentJam}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Crear Certificado Personalizado
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Certificados</p>
                <p className="text-2xl font-bold text-white">{stats.totalCertificates || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Participación</p>
                <p className="text-2xl font-bold text-white">{stats.participationCertificates || 0}</p>
              </div>
              <Award className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Reconocimientos</p>
                <p className="text-2xl font-bold text-white">{stats.recognitionCertificates || 0}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Información sobre certificados */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="font-semibold text-white mb-4">Tipos de Certificados</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-white mb-2">Certificados de Participación</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Se otorgan automáticamente a todos los participantes</li>
              <li>• Reconocen la participación activa en la jam</li>
              <li>• Válidos para portafolios profesionales</li>
              <li>• Descargables en formato PDF profesional</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-white mb-2">Certificados de Reconocimiento</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Para participantes destacados en categorías específicas</li>
              <li>• Basados en votaciones de la comunidad</li>
              <li>• Incluyen categoría específica del reconocimiento</li>
              <li>• Diseño especial con elementos dorados</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Estadísticas por categoría */}
      {Object.keys(stats.categoriesStats || {}).length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h4 className="font-semibold text-white mb-4">Reconocimientos por Categoría</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {recognitionCategories.map((category) => {
              const count = stats.categoriesStats?.[category.id] || 0;
              
              return (
                <div key={category.id} className="text-center">
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <p className="text-sm font-medium text-white">{category.name}</p>
                  <p className="text-lg font-bold text-gray-300">{count}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de certificados */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="font-semibold text-white mb-4">Certificados Emitidos</h4>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando certificados...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No hay certificados emitidos aún</p>
            <p className="text-gray-500 text-sm">Crea certificados masivos para todos los participantes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      cert.isWinner ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}>
                      {cert.isWinner ? (
                        <Star className="w-5 h-5 text-white" />
                      ) : (
                        <Award className="w-5 h-5 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="font-medium text-white">
                        {cert.isWinner ? 'Reconocimiento' : 'Participación'} - {getCategoryName(cert.category)}
                      </h5>
                      <p className="text-sm text-gray-300">
                        Participante: {getUserName(cert.userId)}
                      </p>
                      {cert.gameName && (
                        <p className="text-sm text-blue-300">
                          Juego: {cert.gameName}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        Emitido: {cert.awardedDate.toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(cert.category)}</span>
                    
                    {/* Botón de vista previa */}
                    <button
                      onClick={() => handlePreviewCertificate(cert)}
                      className="p-2 text-blue-400 hover:bg-blue-900 hover:bg-opacity-20 rounded-lg transition-colors"
                      title="Vista previa del certificado"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCertificate(cert.id)}
                      className="p-2 text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-lg transition-colors"
                      title="Eliminar certificado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Creador manual de certificados */}
      {showAdvancedCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl">
            <ManualCertificateCreator
              currentJam={currentJam}
              onSuccess={() => {
                setShowAdvancedCreator(false);
                loadCertificatesData();
              }}
              onCancel={() => setShowAdvancedCreator(false)}
            />
          </div>
        </div>
      )}

      {/* Modal para crear reconocimiento (método anterior - mantener como backup) */}
      {showCreateRecognition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Crear Certificado de Reconocimiento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participante
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar participante...</option>
                  {participants.map((participant) => (
                    <option key={participant.userId} value={participant.userId}>
                      {getUserName(participant.userId)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar categoría...</option>
                  {recognitionCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateRecognition}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Crear Certificado
              </button>
              <button
                onClick={() => {
                  setShowCreateRecognition(false);
                  setSelectedUser('');
                  setSelectedCategory('');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista previa */}
      {previewCertificate && (
        <CertificatePreview
          certificate={previewCertificate}
          userName={getUserName(previewCertificate.userId)}
          onClose={() => setPreviewCertificate(null)}
          onDownload={handleDownloadCertificate}
        />
      )}
    </div>
  );
};