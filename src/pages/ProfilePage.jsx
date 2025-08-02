// src/pages/ProfilePage.jsx - Página de perfil con editor y certificados - Versión corregida

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
  X,
  Calendar
} from 'lucide-react';
import { getPostsByUser } from '../firebase/firestore';
import { getUserJamHistory } from '../firebase/participants';
import { isUserJoined } from '../firebase/participants';
import { getUserCertificates } from '../firebase/certificates';
import { isProfileCompleteForCertificates, getUserProfile } from '../firebase/users';
import { ProfileEditor } from '../components/profile/ProfileEditor';
import { generateCertificateWithCustomBackground } from '../utils/certificateGenerator';
import { CertificatePreview } from '../components/certificates/CertificatePreview';
import { safeFormatDate } from '../utils/dateUtils';

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

  // Función formatDate corregida usando safeFormatDate
  const formatDate = (date) => {
    return safeFormatDate(date, 'es-ES', {
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
      // CORRECCIÓN: Manejar fecha usando safeToDate desde utils
      import('../utils/dateUtils').then(({ safeToDate }) => {
        const certificateDate = safeToDate(certificate.awardedDate, new Date());
  
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
  
        return generateCertificateWithCustomBackground(certificateData);
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el certificado. Intenta de nuevo.');
    }
  };

  const handlePreviewCertificate = (certificate) => {
    if (!profileComplete) {
      alert('Completa tu perfil primero para previsualizar certificados');
      setShowEditor(true);
      return;
    }

    setPreviewCertificate(certificate);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acceso Requerido</h2>
          <p className="text-gray-400">Inicia sesión para ver tu perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header del perfil */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {userProfile?.fullName || user.displayName || 'Usuario'}
                </h1>
                <p className="text-gray-400">
                  {userProfile?.displayName && userProfile.displayName !== userProfile?.fullName ? 
                    `@${userProfile.displayName}` : 
                    `@${user.displayName || 'usuario'}`
                  }
                </p>
                {userProfile?.bio && (
                  <p className="text-gray-300 mt-2">{userProfile.bio}</p>
                )}
                <div className="flex items-center space-x-4 mt-2">
                  {stats.memberSince && (
                    <span className="text-sm text-gray-400">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Miembro desde {formatDate(stats.memberSince)}
                    </span>
                  )}
                  {userProfile?.itchUsername && (
                    <a 
                      href={createItchLink(userProfile.itchUsername)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      itch.io
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!profileComplete && (
                <div className="flex items-center text-yellow-400 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Perfil incompleto
                </div>
              )}
              <button
                onClick={() => setShowEditor(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar Perfil</span>
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Posts Totales</p>
                <p className="text-2xl font-bold text-white">{stats.totalPosts}</p>
              </div>
              <Edit3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Jams Participadas</p>
                <p className="text-2xl font-bold text-white">{stats.totalJamsParticipated}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Certificados</p>
                <p className="text-2xl font-bold text-white">{stats.totalCertificates}</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Reconocimientos</p>
                <p className="text-2xl font-bold text-white">{stats.recognitionCertificates}</p>
              </div>
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Certificados */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Mis Certificados
              </h2>
              {!profileComplete && (
                <span className="text-sm text-yellow-400">
                  Completa tu perfil para acceder
                </span>
              )}
            </div>
            
            {userCertificates.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No tienes certificados aún</p>
                <p className="text-gray-500 text-sm">Participa en jams para obtener certificados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userCertificates.map((certificate) => (
                  <div 
                    key={certificate.id}
                    className={`bg-gradient-to-r ${getCertificateGradient(certificate.category)} p-4 rounded-lg`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {certificate.isWinner ? (
                            <Crown className="w-5 h-5 text-yellow-300" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-white" />
                          )}
                          <h3 className="text-white font-semibold">
                            {certificate.isWinner ? 'Reconocimiento' : 'Certificado de Participación'}
                          </h3>
                        </div>
                        
                        <p className="text-white/90 text-sm mb-1">
                          <strong>{certificate.jamName}</strong>
                        </p>
                        
                        {certificate.category !== 'participation' && (
                          <p className="text-white/80 text-sm mb-1">
                            Categoría: {getCategoryName(certificate.category)}
                          </p>
                        )}
                        
                        <p className="text-white/70 text-xs">
                          Otorgado el {formatDate(certificate.awardedDate)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePreviewCertificate(certificate)}
                          disabled={!profileComplete}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Previsualizar"
                        >
                          <Eye className="w-4 h-4 text-white" />
                        </button>
                        
                        <button
                          onClick={() => handleDownloadCertificate(certificate)}
                          disabled={!profileComplete}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Posts Recientes */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Edit3 className="w-5 h-5 mr-2" />
              Posts Recientes
            </h2>
            
            {userPosts.length === 0 ? (
              <div className="text-center py-8">
                <Edit3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No has publicado aún</p>
                <p className="text-gray-500 text-sm">Comparte tus proyectos con la comunidad</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {userPosts.slice(0, 5).map((post) => (
                  <div key={post.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium">{post.edition}</h3>
                      <span className="text-gray-400 text-xs">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {post.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {post.lookingFor?.slice(0, 3).map((skill, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {post.lookingFor?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full">
                          +{post.lookingFor.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {userPosts.length > 5 && (
                  <div className="text-center pt-4">
                    <p className="text-gray-400 text-sm">
                      Y {userPosts.length - 5} posts más...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Historial de Jams */}
        {jamHistory.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Historial de Participación
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jamHistory.map((participation) => (
                <div key={participation.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{participation.jamId}</h3>
                    {participation.isActive ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <p className="text-gray-400 text-sm">
                    Unido el {formatDate(participation.createdAt)}
                  </p>
                  
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs mt-2 ${
                    participation.isActive 
                      ? 'bg-green-600 text-green-100' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {participation.isActive ? 'Activo' : 'Finalizado'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Editor de Perfil */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Editar Perfil</h2>
                <button
                  onClick={() => setShowEditor(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <ProfileEditor
                user={user}
                onSave={handleProfileSave}
                onCancel={() => setShowEditor(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Preview de Certificado */}
      {previewCertificate && (
        <CertificatePreview
          certificate={previewCertificate}
          userName={userProfile?.fullName || user.displayName || 'Participante'}
          onClose={() => setPreviewCertificate(null)}
          onDownload={() => handleDownloadCertificate(previewCertificate)}
          isModal={true}
        />
      )}
    </div>
  );
};

export default ProfilePage;