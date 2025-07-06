// src/pages/ProfilePage.jsx - Página de perfil con editor y certificados
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
import { isUserJoined } from '../firebase/participants';
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
  const [currentJam, setCurrentJam] = useState(null);
  const [isJoinedCurrentJam, setIsJoinedCurrentJam] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [previewCertificate, setPreviewCertificate] = useState(null);
  
  const adminEmails = ['facundo.tnd@gmail.com', 'admin@example.com'];
  const isAdmin = user && adminEmails.includes(user.email);

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
      
      // Cargar posts del usuario
      const posts = await getPostsByUser(user.uid);
      setUserPosts(posts);

      // Cargar historial de jams
      const history = await getUserJamHistory(user.uid);
      setJamHistory(history);

      // Cargar certificados del usuario
      const certificates = await getUserCertificates(user.uid);
      setUserCertificates(certificates);

      // Calcular estadísticas
      const uniqueJamsFromPosts = new Set(posts.map(post => post.edition));
      const uniqueJamsFromParticipation = history.length;
      
      const totalJamsParticipated = Math.max(
        uniqueJamsFromPosts.size,
        uniqueJamsFromParticipation
      );

      setStats({
        totalPosts: posts.length,
        totalJamsParticipated,
        totalCertificates: certificates.length,
        recognitionCertificates: certificates.filter(cert => cert.isWinner).length,
        memberSince: user.metadata?.creationTime ? 
          new Date(user.metadata.creationTime) : null
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createItchLink = (username) => {
    if (!username) return null;
    if (username.includes('http')) return username;
    const cleanUsername = username.replace('.itch.io', '');
    return `https://${cleanUsername}.itch.io`;
  };

  const formatDate = (date) => {
    if (!date) return 'Desconocido';
    
    let dateObj;
    
    // Manejar diferentes tipos de fecha
    if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else if (date.seconds) {
      dateObj = new Date(date.seconds * 1000);
    } else {
      return 'Fecha inválida';
    }
    
    // Verificar que la fecha sea válida
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }
    
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCertificateGradient = (category) => {
    const colors = {
      'participation': 'from-blue-600 to-indigo-600',
      'originality': 'from-yellow-600 to-orange-600',
      'creativity': 'from-purple-600 to-pink-600',
      'narrative': 'from-green-600 to-emerald-600',
      'aesthetics': 'from-rose-600 to-pink-600',
      'sound': 'from-indigo-600 to-purple-600'
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
  
      // Preparar datos del certificado
      const certificateData = {
        userName: userProfile?.fullName || user.displayName || 'Participante',
        jamName: certificate.jamName,
        category: certificate.category, // NO transformar aquí
        isWinner: certificate.isWinner, // Usar el valor original
        date: certificateDate,
        certificateId: certificate.id,
        gameName: certificate.gameName || null,
        // Campos personalizados si existen
        customTitle: certificate.customTitle || null,
        customSubtitle: certificate.customSubtitle || null,
        customMainText: certificate.customMainText || null,
        customSignature: certificate.customSignature || null
      };
  
      console.log('Profile certificate data:', {
        ...certificateData,
        originalDate: certificate.awardedDate,
        processedDate: certificateDate
      }); // Para debug
  
      await generateCertificateWithCustomBackground(certificateData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el certificado. Intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Cargando perfil...</div>
      </div>
    );
  }

  // Si está en modo editor, mostrar solo el editor
  if (showEditor) {
    return (
      <div className="space-y-8">
        <ProfileEditor 
          user={user} 
          onSave={handleProfileSave}
          onCancel={() => setShowEditor(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header del perfil */}
      <div className="text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white mx-auto mb-4" 
             style={{ backgroundColor: '#0fc064' }}>
          {(userProfile?.displayName || user.displayName)?.charAt(0) || <User className="w-12 h-12" />}
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          {userProfile?.displayName || user.displayName || 'Usuario'}
        </h1>
        <p className="text-gray-300 text-lg mb-4">{user.email}</p>
        
        {isAdmin && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-900 border border-yellow-600 mb-4">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-200 font-semibold">Administrador</span>
          </div>
        )}

        {/* Estado del perfil */}
        <div className="mb-4">
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
        <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <div className="text-3xl font-bold mb-2 text-blue-400">
            {stats.totalCertificates}
          </div>
          <p className="text-gray-300">Certificados</p>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold mb-2 text-yellow-400">
            {stats.recognitionCertificates}
          </div>
          <p className="text-gray-300">Reconocimientos</p>
        </div>
      </div>

      {/* Sección de certificados */}
      {userCertificates.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="w-6 h-6" style={{ color: '#0fc064' }} />
            Mis Certificados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userCertificates.map((certificate) => (
              <div 
                key={certificate.id} 
                className={`rounded-lg p-6 bg-gradient-to-br ${getCertificateGradient(certificate.category)} text-white`}
              >
                <div className="flex items-start justify-between mb-4">
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
            ))}
          </div>
        </div>
      )}

      {/* Historial de jams */}
      {jamHistory.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-6 h-6" style={{ color: '#8B5CF6' }} />
            Historial de Participaciones
          </h2>
          
          <div className="space-y-4">
            {jamHistory.slice(0, 5).map((jam) => (
              <div key={jam.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{jam.name}</h3>
                    <p className="text-gray-300 text-sm">
                      Te uniste el {formatDate(jam.joinedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {formatDate(jam.startDate)} - {formatDate(jam.endDate)}
                    </p>
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
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Edit3 className="w-6 h-6" style={{ color: '#0fc064' }} />
            Publicaciones Recientes
          </h2>
          
          <div className="space-y-4">
            {userPosts.slice(0, 5).map((post) => (
              <div key={post.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">{post.edition}</h3>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {post.description}
                    </p>
                    
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

      {/* Modal de vista previa de certificado */}
      {previewCertificate && (
        <CertificatePreview
          certificate={previewCertificate}
          userName={userProfile?.fullName || user.displayName || 'Participante'}
          onClose={() => setPreviewCertificate(null)}
          onDownload={handleDownloadCertificate}
        />
      )}
    </div>
  );
};

export default ProfilePage;