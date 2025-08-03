// src/pages/ProfilePage.jsx - Página de perfil con descarga de certificados de equipo corregida
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Crown, 
  CheckCircle, 
  Clock, 
  Play, 
  ExternalLink, 
  Edit3, 
  Users,
  Award,
  Download,
  AlertTriangle,
  Settings,
  Star,
  Eye,
  X
} from 'lucide-react';
import { getPostsByUser } from '../firebase/firestore';
import { getUserJamHistory } from '../firebase/participants';
// Removed unused import: isUserJoined
import { getUserCertificates } from '../firebase/certificates';
import { isProfileCompleteForCertificates, getUserProfile } from '../firebase/users';
import { ProfileEditor } from '../components/profile/ProfileEditor';
import { generateCertificateWithCustomBackground } from '../utils/certificateGenerator';
import { CertificatePreview } from '../components/certificates/CertificatePreview';

const ProfilePage = ({ user }) => {
  const [userPosts, setUserPosts] = useState([]);
  const [jamHistory, setJamHistory] = useState([]);
  const [userCertificates, setUserCertificates] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  // Removed unused state: currentJam, isJoinedCurrentJam
  const [showEditor, setShowEditor] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [previewCertificate, setPreviewCertificate] = useState(null);
  
  // Removed unused admin check

  useEffect(() => {
    if (user) {
      loadUserData();
      checkProfileCompleteness();
    }
  }, [user]);

  const checkProfileCompleteness = async () => {
    if (!user) return;
    
    try {
      const isComplete = await isProfileCompleteForCertificates(user.uid);
      setProfileComplete(isComplete);
      
      // Cargar perfil completo
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error checking profile completeness:', error);
    }
  };

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const [posts, jamHistoryData, certificates] = await Promise.all([
        getPostsByUser(user.uid),
        getUserJamHistory(user.uid),
        getUserCertificates(user.uid)
      ]);

      setUserPosts(posts);
      setJamHistory(jamHistoryData);
      setUserCertificates(certificates);

      // Calcular estadísticas
      setStats({
        totalPosts: posts.length,
        totalJamsParticipated: jamHistoryData.length,
        totalCertificates: certificates.length,
        recognitionCertificates: certificates.filter(cert => cert.isWinner).length
      });

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    
    try {
      if (typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString('es-ES');
      }
      if (date instanceof Date) {
        return date.toLocaleDateString('es-ES');
      }
      return new Date(date).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha no válida';
    }
  };

  const createItchLink = (username) => {
    return `https://${username}.itch.io`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'participation': 'from-blue-600 to-blue-800',
      'originality': 'from-yellow-500 to-orange-600',
      'creativity': 'from-pink-500 to-purple-600',
      'narrative': 'from-green-500 to-emerald-600',
      'aesthetics': 'from-purple-500 to-indigo-600',
      'sound': 'from-cyan-500 to-blue-600'
    };
    return colors[category] || 'from-gray-600 to-gray-800';
  };

  const getCategoryName = (category) => {
    const names = {
      'participation': 'Participación',
      'originality': 'Originalidad',
      'creativity': 'Creatividad',
      'narrative': 'Narrativa/Concepto',
      'aesthetics': 'Estética/Arte',
      'sound': 'Sonido/Música'
    };
    return names[category] || category;
  };

  const handleProfileSave = (newProfileData) => {
    setUserProfile(newProfileData);
    setProfileComplete(true);
    setShowEditor(false);
    // Recargar certificados por si ahora puede acceder a ellos
    loadUserData();
  };

  /**
   * FUNCIÓN CORREGIDA: handleDownloadCertificate con soporte para equipos
   */
  const handleDownloadCertificate = async (certificate) => {
    if (!profileComplete) {
      alert('Completa tu perfil primero para descargar certificados');
      setShowEditor(true);
      return;
    }

    try {
      // CORRECCIÓN: Manejar fecha correctamente independientemente del formato
      let certificateDate;
      
      if (certificate.awardedDate) {
        // Si es un Timestamp de Firestore
        if (certificate.awardedDate.toDate && typeof certificate.awardedDate.toDate === 'function') {
          certificateDate = certificate.awardedDate.toDate();
        }
        // Si es una fecha JavaScript
        else if (certificate.awardedDate instanceof Date) {
          certificateDate = certificate.awardedDate;
        }
        // Si es un string de fecha
        else if (typeof certificate.awardedDate === 'string') {
          certificateDate = new Date(certificate.awardedDate);
        }
        // Si es un número (timestamp)
        else if (typeof certificate.awardedDate === 'number') {
          certificateDate = new Date(certificate.awardedDate);
        }
        // Si tiene seconds y nanoseconds (Timestamp object)
        else if (certificate.awardedDate.seconds) {
          certificateDate = new Date(certificate.awardedDate.seconds * 1000);
        }
        else {
          // Fallback: usar fecha actual
          certificateDate = new Date();
        }
      } else {
        // Si no hay fecha, usar fecha actual
        certificateDate = new Date();
      }

      // ✅ CORRECCIÓN PRINCIPAL: Incluir TODA la información del certificado
      const certificateData = {
        userName: userProfile?.fullName || user.displayName || 'Participante',
        jamName: certificate.jamName,
        category: certificate.category,
        isWinner: certificate.isWinner,
        date: certificateDate,
        certificateId: certificate.id,
        gameName: certificate.gameName || null,
        gameLink: certificate.gameLink || null, // ✅ ESTO ESTABA FALTANDO para el QR
        
        // ✅ ESTO ES LO QUE ESTABA FALTANDO: Información del equipo
        participants: certificate.participants || null,
        isTeamCertificate: certificate.isTeamCertificate || false,
        recipientUserId: certificate.recipientUserId || certificate.userId,
        
        // Campos personalizados si existen
        customTitle: certificate.customTitle || null,
        customSubtitle: certificate.customSubtitle || null,
        customMainText: certificate.customMainText || null,
        customSignature: certificate.customSignature || null
      };

      console.log('Profile certificate data with team info:', {
        userName: certificateData.userName,
        participants: certificateData.participants,
        isTeamCertificate: certificateData.isTeamCertificate,
        hasTeamInfo: !!(certificate.participants && certificate.participants.length > 1),
        originalCertificate: certificate
      });

      await generateCertificateWithCustomBackground(certificateData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el certificado. Intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      {/* Header del perfil */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{userProfile?.fullName || user.displayName || 'Usuario'}</h1>
              <p className="text-gray-400">{user.email}</p>
              {userProfile?.itchUsername && (
                <a 
                  href={createItchLink(userProfile.itchUsername)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {userProfile.itchUsername}.itch.io
                </a>
              )}
            </div>
          </div>

          {profileComplete ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-900 border border-green-600">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-200 font-semibold">Perfil Completo</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-900 border border-yellow-600">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-200 font-semibold">Perfil Incompleto</span>
            </div>
          )}
        </div>

        {/* Botón de editar perfil */}
        <button
          onClick={() => setShowEditor(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Editar Perfil
        </button>
      </div>

      {/* Alerta si el perfil está incompleto */}
      {!profileComplete && (
        <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div className="text-yellow-200">
              <p className="font-semibold mb-2">Completa tu perfil para acceder a certificados</p>
              <p className="text-sm mb-3">
                Para poder ver y descargar tus certificados, necesitas completar:
              </p>
              <ul className="text-sm space-y-1 mb-3">
                <li>• Nombre completo (aparecerá en los certificados)</li>
                <li>• Usuario de itch.io (para verificar participación)</li>
                <li>• Email de contacto</li>
              </ul>
              <button
                onClick={() => setShowEditor(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Completar Ahora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas del usuario */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold mb-2" style={{ color: '#0fc064' }}>
            {stats.totalPosts}
          </div>
          <p className="text-gray-300">Publicaciones</p>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold mb-2" style={{ color: '#8B5CF6' }}>
            {stats.totalJamsParticipated}
          </div>
          <p className="text-gray-300">Jams Participadas</p>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold mb-2" style={{ color: '#F59E0B' }}>
            {stats.totalCertificates}
          </div>
          <p className="text-gray-300">Certificados</p>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold mb-2" style={{ color: '#EF4444' }}>
            {stats.recognitionCertificates}
          </div>
          <p className="text-gray-300">Reconocimientos</p>
        </div>
      </div>

      {/* Certificados */}
      {userCertificates.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Award className="w-6 h-6" />
            Mis Certificados
          </h2>
          
          <div className="grid gap-4">
            {userCertificates.map((certificate) => (
              <div
                key={certificate.id}
                className={`relative p-6 rounded-lg bg-gradient-to-r ${getCategoryColor(certificate.category)} text-white overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {certificate.isWinner ? (
                        <Star className="w-6 h-6 text-yellow-300" />
                      ) : (
                        <Award className="w-6 h-6 text-white" />
                      )}
                      <div>
                        <h3 className="font-bold text-lg">
                          {certificate.isWinner ? 'Reconocimiento' : 'Participación'}
                        </h3>
                        <p className="text-sm opacity-90">{getCategoryName(certificate.category)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewCertificate(certificate)}
                        className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                        title="Vista previa"
                      >
                        <Eye className="w-4 h-4 text-gray-800" />
                      </button>
                      
                      <button
                        onClick={() => handleDownloadCertificate(certificate)}
                        className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                        title="Descargar PDF"
                        disabled={!profileComplete}
                      >
                        <Download className="w-4 h-4 text-gray-800" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">{certificate.jamName}</p>
                    {certificate.gameName && (
                      <p className="text-sm opacity-75">Juego: {certificate.gameName}</p>
                    )}
                    {certificate.participants && certificate.participants.length > 1 && (
                      <div className="text-sm opacity-75">
                        <p className="font-medium">Equipo:</p>
                        <p>{certificate.participants.map(p => p.name).join(', ')}</p>
                      </div>
                    )}
                    <p className="text-sm opacity-75">
                      Emitido el {formatDate(certificate.awardedDate)}
                    </p>
                    {!profileComplete && (
                      <p className="text-xs bg-yellow-600 bg-opacity-50 rounded p-2 mt-2">
                        Completa tu perfil para descargar
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial de jams */}
      {jamHistory.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Users className="w-6 h-6" />
            Historial de Game Jams
          </h2>
          
          <div className="grid gap-4">
            {jamHistory.slice(0, 5).map((jam) => (
              <div key={jam.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-white">{jam.name}</h3>
                    <p className="text-gray-300">{jam.description}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {formatDate(jam.startDate)} - {formatDate(jam.endDate)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {jam.isActive && (
                      <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                        Activa
                      </span>
                    )}
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publicaciones recientes */}
      {userPosts.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Play className="w-6 h-6" />
            Mis Publicaciones
          </h2>
          
          <div className="grid gap-4">
            {userPosts.slice(0, 5).map((post) => (
              <div key={post.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white mb-2">{post.title}</h3>
                    <p className="text-gray-300 mb-3">{post.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{formatDate(post.createdAt?.toDate())}</span>
                      {post.username && (
                        <a 
                          href={createItchLink(post.username)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {post.username}.itch.io
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {userPosts.length > 5 && (
              <p className="text-gray-400 text-sm text-center">
                Y {userPosts.length - 5} publicaciones más...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mensaje si no hay actividad */}
      {userPosts.length === 0 && jamHistory.length === 0 && userCertificates.length === 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">¡Aún no hay actividad!</h3>
          <p className="text-gray-300 mb-4">
            Participa en una jam y crea tu primera publicación para buscar equipo
          </p>
        </div>
      )}

      {/* Modal del editor de perfil */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <ProfileEditor
              user={user}
              onCancel={() => setShowEditor(false)}
              onSave={handleProfileSave}
            />
          </div>
        </div>
      )}

      {/* Modal de vista previa de certificado */}
      {previewCertificate && (
        <CertificatePreview
          certificate={previewCertificate}
          userName={userProfile?.fullName || user.displayName || 'Participante'}
          onClose={() => setPreviewCertificate(null)}
          onDownload={() => handleDownloadCertificate(previewCertificate)}
        />
      )}
    </div>
  );
};

export default ProfilePage;