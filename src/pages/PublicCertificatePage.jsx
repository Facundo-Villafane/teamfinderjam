// src/pages/PublicCertificatePage.jsx - Página pública para mostrar certificados
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  Award, 
  Download, 
  Share2, 
  Eye, 
  ExternalLink, 
  Users, 
  Calendar,
  Trophy,
  ArrowLeft,
  Copy,
  CheckCircle
} from 'lucide-react';
import { getCertificate } from '../firebase/certificates';
import { getUserProfile } from '../firebase/users';
import { generateCertificateWithCustomBackground } from '../utils/certificateGenerator';
import { CertificatePreview } from '../components/certificates/CertificatePreview';

const PublicCertificatePage = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    loadCertificate();
  }, [certificateId]);

  // Actualizar metadatos del documento para SEO
  useEffect(() => {
    if (certificate) {
      const categoryName = getCategoryName(certificate.category);
      const certificateType = certificate.isWinner ? 'Reconocimiento' : 'Participación';
      
      // Título de la página
      document.title = `Certificado de ${certificateType} - ${certificate.jamName}`;
      
      // Metadescripción
      const description = `Certificado oficial de ${certificateType}${certificate.isWinner ? ` - ${categoryName}` : ''} emitido para la Game Jam "${certificate.jamName}"${certificate.gameName ? ` por el juego "${certificate.gameName}"` : ''}`;
      
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = description;

      // Open Graph tags
      const setMetaTag = (property, content) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      setMetaTag('og:title', `Certificado de ${certificateType} - Game Jam UTN`);
      setMetaTag('og:description', description);
      setMetaTag('og:type', 'website');
      setMetaTag('og:url', window.location.href);
    }

    // Cleanup al desmontar
    return () => {
      document.title = 'TeamFinder - Game Jam UTN';
    };
  }, [certificate]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar certificado
      const cert = await getCertificate(certificateId);
      if (!cert) {
        setError('Certificado no encontrado');
        return;
      }

      setCertificate(cert);

      // Cargar perfil del usuario principal (para certificados individuales)
      if (cert.userId) {
        try {
          const profile = await getUserProfile(cert.userId);
          setUserProfile(profile);
        } catch (profileError) {
          console.warn('Could not load user profile:', profileError);
          // Continuar sin perfil si hay error
        }
      }

    } catch (error) {
      console.error('Error loading certificate:', error);
      setError('Error al cargar el certificado');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    
    try {
      if (typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      if (date instanceof Date) {
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha no válida';
    }
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

  const getCategoryColor = (category, isWinner) => {
    if (isWinner) {
      const colors = {
        'originality': 'from-yellow-500 to-orange-600',
        'creativity': 'from-pink-500 to-purple-600',
        'narrative': 'from-green-500 to-emerald-600',
        'aesthetics': 'from-purple-500 to-indigo-600',
        'sound': 'from-cyan-500 to-blue-600'
      };
      return colors[category] || 'from-yellow-500 to-orange-600';
    }
    return 'from-blue-600 to-blue-800';
  };

  const handleDownloadCertificate = async () => {
    if (!certificate) return;

    try {
      // Determinar el nombre a mostrar
      let displayName;
      if (certificate.participants && certificate.participants.length > 1) {
        // Para equipos, usar todos los nombres
        displayName = certificate.participants.map(p => p.name).join(', ');
      } else if (userProfile) {
        displayName = userProfile.fullName || userProfile.displayName || 'Participante';
      } else {
        displayName = 'Participante';
      }

      // Manejar fecha correctamente
      let certificateDate;
      if (certificate.awardedDate) {
        if (certificate.awardedDate.toDate && typeof certificate.awardedDate.toDate === 'function') {
          certificateDate = certificate.awardedDate.toDate();
        } else if (certificate.awardedDate instanceof Date) {
          certificateDate = certificate.awardedDate;
        } else if (typeof certificate.awardedDate === 'string') {
          certificateDate = new Date(certificate.awardedDate);
        } else if (typeof certificate.awardedDate === 'number') {
          certificateDate = new Date(certificate.awardedDate);
        } else if (certificate.awardedDate.seconds) {
          certificateDate = new Date(certificate.awardedDate.seconds * 1000);
        } else {
          certificateDate = new Date();
        }
      } else {
        certificateDate = new Date();
      }

      const certificateData = {
        userName: displayName,
        jamName: certificate.jamName,
        category: certificate.category,
        isWinner: certificate.isWinner,
        date: certificateDate,
        certificateId: certificate.id,
        gameName: certificate.gameName || null,
        gameLink: certificate.gameLink || null,
        
        // Información del equipo
        participants: certificate.participants || null,
        isTeamCertificate: certificate.isTeamCertificate || false,
        recipientUserId: certificate.recipientUserId || certificate.userId,
        
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const categoryName = getCategoryName(certificate.category);
    const certificateType = certificate.isWinner ? 'Reconocimiento' : 'Participación';
    
    let text = `🏆 Certificado de ${certificateType}`;
    if (certificate.isWinner) {
      text += ` - ${categoryName}`;
    }
    text += ` en la Game Jam "${certificate.jamName}"!`;
    
    if (certificate.gameName) {
      text += ` 🎮 Juego: "${certificate.gameName}"`;
    }
    
    text += ` #GameJam #IndieDev #GameDevelopment`;

    let shareUrl;
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        const whatsappText = `${text}\n\n${url}`;
        shareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando certificado...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Award className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Certificado no encontrado</h1>
          <p className="text-gray-300 mb-6">
            {error || 'El certificado que buscas no existe o ha sido eliminado.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </button>
            
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-400" />
              <span className="font-semibold">Certificado Oficial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Certificado */}
        <div className={`relative p-8 rounded-xl bg-gradient-to-r ${getCategoryColor(certificate.category, certificate.isWinner)} text-white overflow-hidden mb-8`}>
          <div className="relative z-10">
            {/* Header del certificado */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                {certificate.isWinner ? (
                  <Trophy className="w-12 h-12 text-yellow-300" />
                ) : (
                  <Award className="w-12 h-12 text-white" />
                )}
              </div>
              
              <h1 className="text-4xl font-bold mb-2">
                {certificate.isWinner ? 'Certificado de Reconocimiento' : 'Certificado de Participación'}
              </h1>
              <p className="text-xl opacity-90">{getCategoryName(certificate.category)}</p>
            </div>

            {/* Información del certificado */}
            <div className="bg-black bg-opacity-20 rounded-lg p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Detalles del Certificado</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Emitido el {formatDate(certificate.awardedDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>Game Jam: {certificate.jamName}</span>
                    </div>
                    {certificate.gameName && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        <span>Juego: {certificate.gameName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    {certificate.participants && certificate.participants.length > 1 ? 'Equipo' : 'Participante'}
                  </h3>
                  <div className="space-y-2">
                    {certificate.participants && certificate.participants.length > 1 ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4" />
                          <span>{certificate.participants.length} miembros</span>
                        </div>
                        {certificate.participants.map((participant, index) => (
                          <div key={index} className="font-medium">
                            • {participant.name}
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="font-medium">
                        {userProfile?.fullName || 'Participante'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ID del certificado */}
            <div className="text-center">
              <p className="text-sm opacity-75">ID del Certificado: {certificate.id}</p>
            </div>
          </div>

          {/* Patrón de fondo decorativo */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-white transform rotate-12 scale-150"></div>
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Acciones</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Columna izquierda - Visualización */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-300">Visualización</h3>
              
              <button
                onClick={() => setShowPreview(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Eye className="w-5 h-5" />
                Ver vista previa del certificado
              </button>
              
              <button
                onClick={handleDownloadCertificate}
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                Descargar PDF
              </button>
            </div>

            {/* Columna derecha - Compartir */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-300">Compartir</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-400 hover:bg-blue-500 rounded-lg transition-colors text-sm"
                >
                  <span className="font-bold">𝕏</span>
                  X
                </button>
                
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                >
                  <span className="font-bold">in</span>
                  LinkedIn
                </button>
                
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors text-sm"
                >
                  <span className="font-bold">💬</span>
                  WhatsApp
                </button>
                
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                >
                  {linkCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {linkCopied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center text-gray-400">
          <p className="text-sm">
            Este certificado ha sido emitido oficialmente por la organización de la Game Jam.
          </p>
          <p className="text-xs mt-2">
            Verificable mediante el ID único del certificado
          </p>
        </div>
      </div>

      {/* Modal de vista previa */}
      {showPreview && certificate && (
        <CertificatePreview
          certificate={certificate}
          userName={
            certificate.participants && certificate.participants.length > 1
              ? certificate.participants.map(p => p.name).join(', ')
              : (userProfile?.fullName || 'Participante')
          }
          onClose={() => setShowPreview(false)}
          onDownload={handleDownloadCertificate}
        />
      )}
    </div>
  );
};

export default PublicCertificatePage;