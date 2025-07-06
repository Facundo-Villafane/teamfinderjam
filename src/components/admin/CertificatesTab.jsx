// src/components/admin/CertificatesTab.jsx - Gestión de certificados
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
  Zap
} from 'lucide-react';
import {
  getJamCertificates,
  getCertificateStats,
  createMassParticipationCertificates,
  createRecognitionCertificate,
  deleteCertificate
} from '../../firebase/certificates';

export const CertificatesTab = ({ currentJam, onRefresh }) => {
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [creatingMass, setCreatingMass] = useState(false);
  const [showCreateRecognition, setShowCreateRecognition] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

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
    }
  }, [currentJam?.id]);

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
    } catch (error) {
      console.error('Error loading certificates data:', error);
    } finally {
      setLoading(false);
    }
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

  const getCategoryIcon = (category) => {
    const cat = recognitionCategories.find(c => c.id === category);
    return cat?.icon || '🏆';
  };

  const getCategoryName = (category) => {
    if (category === 'participation') return 'Participación';
    const cat = recognitionCategories.find(c => c.id === category);
    return cat?.name || category;
  };

  if (!currentJam) {
    return (
      <div className="text-center text-gray-500 py-12">
        <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold mb-2">No hay jam activa</h3>
        <p>Selecciona una jam activa para gestionar certificados</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Gestión de Certificados - {currentJam.name}</h3>
          <div className="flex items-center gap-4 mt-1 text-gray-400">
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              {stats.totalCertificates || 0} certificados emitidos
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {stats.participationCertificates || 0} participación
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {stats.recognitionCertificates || 0} reconocimientos
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCreateMassCertificates}
            disabled={creatingMass}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors font-semibold disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            {creatingMass ? 'Creando...' : 'Crear Certificados Masivos'}
          </button>

          <button
            onClick={() => setShowCreateRecognition(true)}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors font-semibold"
          >
            <Star className="w-4 h-4" />
            Crear Reconocimiento
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Certificados</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalCertificates || 0}
              </p>
            </div>
            <Award className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Participación</p>
              <p className="text-2xl font-bold text-green-400">
                {stats.participationCertificates || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Reconocimientos</p>
              <p className="text-2xl font-bold text-yellow-400">
                {stats.recognitionCertificates || 0}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Categorías Premiadas</p>
              <p className="text-2xl font-bold text-purple-400">
                {Object.keys(stats.categoriesStats || {}).length}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Información sobre certificados */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-green-400" />
          Información sobre Certificados
        </h4>
        
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
                    
                    <div>
                      <h5 className="font-medium text-white">
                        {cert.isWinner ? 'Reconocimiento' : 'Participación'} - {getCategoryName(cert.category)}
                      </h5>
                      <p className="text-sm text-gray-300">
                        Usuario ID: {cert.userId}
                      </p>
                      <p className="text-xs text-gray-400">
                        Emitido: {cert.awardedDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(cert.category)}</span>
                    
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

      {/* Modal para crear reconocimiento */}
      {showCreateRecognition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Crear Certificado de Reconocimiento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  ID del Usuario
                </label>
                <input
                  type="text"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-gray-500 focus:outline-none"
                  placeholder="ID del usuario a reconocer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Categoría de Reconocimiento
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-gray-500 focus:outline-none"
                >
                  <option value="">Selecciona una categoría</option>
                  {recognitionCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateRecognition}
                disabled={!selectedUser || !selectedCategory}
                className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Reconocimiento
              </button>
              <button
                onClick={() => {
                  setShowCreateRecognition(false);
                  setSelectedUser('');
                  setSelectedCategory('');
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};