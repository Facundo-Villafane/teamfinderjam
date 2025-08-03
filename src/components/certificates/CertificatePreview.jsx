// src/components/certificates/CertificatePreview.jsx - Vista previa SINCRONIZADA con el PDF
import React from 'react';
import { X, Download } from 'lucide-react';
import { 
  FaTrophy, 
  FaPalette, 
  FaBook, 
  FaMusic, 
  FaLightbulb,
  FaGamepad 
} from 'react-icons/fa';

export const CertificatePreview = ({ 
  certificate, 
  userName, 
  onClose, 
  onDownload,
  backgroundImageUrl = '/images/certificate-background.png'
}) => {
  if (!certificate) return null;

  /**
   * IMPORTANTE: Esta función debe ser IDÉNTICA a la del certificateGenerator.js
   * para que la preview y el PDF muestren el mismo contenido
   */
  const getCategoryRecognitionInfo = (category) => {
    // Mapear categorías en español a inglés (igual que en PDF)
    const categoryMap = {
      'Originalidad': 'originality',
      'Creatividad': 'creativity', 
      'Narrativa': 'narrative',
      'Narrativa/Concepto': 'narrative',
      'Estética/Arte': 'aesthetics',
      'Dirección de Arte': 'aesthetics',
      'Sonido/Música': 'sound',
      'Música y Sonido': 'sound'
    };
    
    const normalizedCategory = categoryMap[category] || category || 'originality';
    
    const categoryInfo = {
      'originality': {
        emoji: '🏆',
        title: 'Originalidad',
        introText: 'Este certificado reconoce al juego:',
        description: [
          'Por destacarse en su enfoque único, inesperado o fuera de lo común.',
          '',
          'Cuando todos pensaban en una cosa, este equipo fue por otra.',
          'Porque la originalidad no se fuerza, se nota.'
        ]
      },
      'creativity': {
        emoji: '🎨',
        title: 'Creatividad',
        introText: 'Se otorga al juego:',
        description: [
          'Por su capacidad para imaginar lo improbable y hacerlo jugable.',
          'Creatividad no es solo tener ideas... es convertirlas en una experiencia inolvidable.',
          '',
          'Gracias por demostrar que no hay límites cuando se trata de crear.'
        ]
      },
      'narrative': {
        emoji: '📖',
        title: 'Narrativa',
        introText: 'Reconociendo al juego:',
        description: [
          'Por construir una historia que atrapó, emocionó o hizo pensar.',
          '',
          'La narrativa no siempre necesita palabras,',
          'y este juego lo entendió perfectamente.'
        ]
      },
      'aesthetics': {
        emoji: '🎨',
        title: 'Dirección de Arte',
        introText: 'Otorgado al juego:',
        description: [
          'Por su identidad visual fuerte, coherente y con carácter.',
          'Colores, formas, estilo… todo encajó para crear una estética inolvidable.',
          '',
          'Una oda a los pixeles bien puestos (o mal puestos, con intención).'
        ]
      },
      'sound': {
        emoji: '🎵',
        title: 'Música y Sonido',
        introText: 'En reconocimiento al juego:',
        description: [
          'Por su ambientación sonora envolvente, composiciones memorables',
          'o simplemente por hacer que se nos pegara un tema.',
          '',
          'Cuando el audio no acompaña: conduce.'
        ]
      }
    };
    
    return categoryInfo[normalizedCategory] || categoryInfo['originality'];
  };

  /**
   * Detecta si es certificado de reconocimiento (idéntico al PDF)
   */
  const isRecognitionCertificate = (certificateData) => {
    const recognitionCategories = [
      'originality', 'creativity', 'narrative', 'aesthetics', 'sound',
      'Originalidad', 'Creatividad', 'Narrativa', 'Narrativa/Concepto', 
      'Estética/Arte', 'Dirección de Arte', 'Sonido/Música', 'Música y Sonido'
    ];
    
    return certificateData.isWinner === true ||
           recognitionCategories.includes(certificateData.category) ||
           (certificateData.gameName && certificateData.category !== 'participation' && certificateData.category !== 'Participación');
  };

  const getCategoryName = (category) => {
    const names = {
      'participation': 'Participación',
      'originality': 'Originalidad',
      'creativity': 'Creatividad',
      'narrative': 'Narrativa',
      'aesthetics': 'Dirección de Arte',
      'sound': 'Música y Sonido'
    };
    return names[category] || category;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'originality': <FaTrophy className="inline text-yellow-400" />,
      'creativity': <FaPalette className="inline text-pink-400" />,
      'narrative': <FaBook className="inline text-green-400" />,
      'aesthetics': <FaPalette className="inline text-purple-400" />,
      'sound': <FaMusic className="inline text-blue-400" />
    };
    return icons[category] || <FaTrophy className="inline text-yellow-400" />;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES');
  };

  const renderContent = () => {
    // ✅ CORRECCIÓN: MISMA LÓGICA DE PRIORIDADES QUE EL PDF
    
    // PRIORIDAD 1: Verificar si es un certificado personalizado (Manual Certificate Creator)
    if (certificate.customTitle || certificate.customMainText) {
      console.log('Preview: Using CUSTOM certificate template');
      return renderCustomContent();
    }
    // PRIORIDAD 2: Verificar si es certificado de reconocimiento predefinido
    else if (isRecognitionCertificate(certificate)) {
      console.log('Preview: Using RECOGNITION certificate template');
      return renderRecognitionContent();
    } 
    else {
      // PRIORIDAD 3: Certificado de participación por defecto
      console.log('Preview: Using PARTICIPATION certificate template');
      return renderParticipationContent();
    }
  };

  const renderRecognitionContent = () => {
    const categoryInfo = getCategoryRecognitionInfo(certificate.category);
    const displayName = certificate.gameName || userName;

    return (
      <div className="relative h-full flex flex-col justify-center items-center text-white p-8">
        {/* 1. TÍTULO LIMPIO Y MODERNO */}
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            CERTIFICADO DE RECONOCIMIENTO
          </h1>
        </div>

        {/* Subtítulo de categoría */}
        <div className="text-center mb-6">
          <h2 className="text-lg md:text-xl font-normal drop-shadow" 
              style={{ color: '#e85d04' }}>
            Mención Especial a la {categoryInfo.title}
          </h2>
          
          {/* Línea decorativa sutil */}
          <div className="flex items-center justify-center mt-2">
            <div className="w-20 h-px bg-white opacity-50"></div>
          </div>
        </div>

        {/* 2. TEXTO INTRODUCTORIO */}
        <div className="text-center mb-4">
          <p className="text-sm md:text-base text-gray-300 drop-shadow">
            {categoryInfo.introText}
          </p>
        </div>

        {/* 3. NOMBRE DEL JUEGO/USUARIO */}
        <div className="text-center mb-6">
          <h3 className="text-3xl md:text-4xl font-bold drop-shadow-lg" 
              style={{ color: '#ff759f' }}>
            {displayName}
          </h3>
        </div>

        {/* 4. NOMBRE DEL CREADOR (si es diferente del juego) */}
        {certificate.gameName && userName && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-300 mb-1">Creado por:</p>
            <h4 className="text-xl md:text-2xl font-bold drop-shadow" 
                style={{ color: '#92f8cf' }}>
              {userName}
            </h4>
          </div>
        )}

        {/* 5. MÚLTIPLES PARTICIPANTES (si los hay) */}
        {certificate.participants && certificate.participants.length > 1 && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-300 mb-2">
              {certificate.isTeamCertificate ? 'Equipo:' : 'Participantes:'}
            </p>
            <div className="space-y-1">
              {certificate.participants.map((participant, index) => (
                <h4 key={index} className="text-lg font-bold drop-shadow" 
                    style={{ color: '#92f8cf' }}>
                  {participant.name}
                </h4>
              ))}
            </div>
          </div>
        )}

        {/* CASO ESPECIAL: Si es certificado de equipo pero userName no está en la lista */}
        {certificate.isTeamCertificate && certificate.participants && 
         !certificate.participants.some(p => p.name === userName) && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-300 mb-2">Destinatario:</p>
            <h4 className="text-lg font-bold drop-shadow" 
                style={{ color: '#ff759f' }}>
              {userName}
            </h4>
          </div>
        )}

        {/* 6. DESCRIPCIÓN ESPECÍFICA */}
        <div className="text-center mb-8 max-w-4xl">
          <div className="text-sm md:text-base text-gray-300 drop-shadow leading-relaxed">
            {categoryInfo.description.map((line, index) => {
              if (line === '') {
                return <div key={index} className="h-2"></div>;
              }
              
              // Destacar frases importantes
              const isImportantLine = line.includes('originalidad no se fuerza') || 
                                     line.includes('no hay límites') || 
                                     line.includes('perfectamente') ||
                                     line.includes('conduce') ||
                                     line.includes('con intención');
              
              return (
                <p key={index} 
                   className={`mb-2 ${isImportantLine ? 'font-bold text-white' : ''}`}>
                  {line}
                </p>
              );
            })}
          </div>
        </div>

        {/* 7. FIRMA FINAL */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-24 h-px bg-white opacity-50"></div>
          </div>
          <p className="text-base font-bold drop-shadow" style={{ color: '#0fc064' }}>
            Game Jam UTN 2025
          </p>
        </div>
      </div>
    );
  };

  const renderParticipationContent = () => {
    return (
      <div className="relative h-full flex flex-col justify-center items-center text-white p-8">
        {/* 1. TÍTULO LIMPIO */}
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            CERTIFICADO DE PARTICIPACIÓN
          </h1>
        </div>

        {/* 2. NOMBRE DE LA JAM CON LÍNEAS DECORATIVAS */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className="w-4 h-px bg-white opacity-50"></div>
            <h2 className="text-lg md:text-xl text-gray-300 drop-shadow">
              {certificate.jamName}
            </h2>
            <div className="w-4 h-px bg-white opacity-50"></div>
          </div>
        </div>

        {/* 3. "Este certificado se otorga a:" */}
        <div className="text-center mb-4">
          <p className="text-sm md:text-base text-gray-300 drop-shadow">
            {certificate.participants && certificate.participants.length > 1 
              ? 'Este certificado se otorga al equipo:'
              : 'Este certificado se otorga a:'}
          </p>
        </div>

        {/* 4. NOMBRES DE PARTICIPANTES */}
        <div className="text-center mb-8">
          {certificate.participants && certificate.participants.length > 1 ? (
            // Múltiples participantes
            <div className="space-y-2">
              {certificate.participants.map((participant, index) => (
                <h3 key={index} className="text-2xl md:text-3xl font-bold drop-shadow-lg" 
                    style={{ color: '#92f8cf' }}>
                  {participant.name}
                </h3>
              ))}
            </div>
          ) : (
            // Participante único
            <h3 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg" 
                style={{ color: '#92f8cf' }}>
              {userName}
            </h3>
          )}
        </div>

        {/* 5. CONTENIDO PRINCIPAL */}
        <div className="text-center mb-8 max-w-4xl">
          <div className="text-sm md:text-base text-gray-300 drop-shadow leading-relaxed">
            {[
              'Por haber participado activamente en la creación de un videojuego durante',
              'la Game Jam organizada por estudiantes para estudiantes.',
              '',
              'Sabemos que no es fácil hacer un juego en pocos días.',
              'Sabemos que dormir tampoco ayudó.',
              'Pero aún así, LO LOGRASTE.'
            ].map((line, index) => {
              if (line === '') {
                return <div key={index} className="h-2"></div>;
              }
              
              const isHighlight = line === 'Pero aún así, LO LOGRASTE.';
              
              return (
                <div key={index} className="mb-2">
                  {isHighlight && (
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-8 h-px bg-white opacity-50"></div>
                      <div className="w-8 h-px bg-white opacity-50"></div>
                    </div>
                  )}
                  <p className={`${isHighlight ? 'font-bold text-white text-lg' : ''}`}>
                    {line}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Despedida */}
        <div className="text-center mb-4">
          <p className="text-xs md:text-sm text-gray-400 italic drop-shadow">
            Con admiración y un poquito de envidia,
          </p>
        </div>

        {/* 7. FIRMA ELEGANTE */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-32 h-px bg-white opacity-50"></div>
          </div>
          <p className="text-sm md:text-base font-bold text-gray-300 drop-shadow">
            Organización de {certificate.jamName}
          </p>
        </div>
      </div>
    );
  };

  const renderCustomContent = () => {
    // ✅ MEJORADO: Procesar texto personalizado con reemplazo de nombres para equipos
    let text = certificate.customMainText || certificate.mainText || '';
    
    // Manejar reemplazo de nombres para equipos
    if (certificate.participants && certificate.participants.length > 1) {
      const names = certificate.participants.map(p => p.name);
      let nameText;
      
      if (names.length === 2) {
        nameText = names.join(' y ');
      } else if (names.length > 2) {
        const allButLast = names.slice(0, -1);
        const lastName = names[names.length - 1];
        nameText = allButLast.join(', ') + ' y ' + lastName;
      } else {
        nameText = names.join(', ');
      }
      
      text = text.replace(/\[NOMBRE\]/g, nameText);
    } else {
      text = text.replace(/\[NOMBRE\]/g, userName);
    }
    
    // Reemplazar otros placeholders
    if (certificate.gameName) {
      text = text.replace(/\[JUEGO\]/g, certificate.gameName);
    }
    
    const lines = text.split('\n');

    return (
      <div className="relative h-full flex flex-col justify-center items-center text-white p-8">
        {/* 1. TÍTULO PERSONALIZADO */}
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            {certificate.customTitle || certificate.title}
          </h1>
        </div>

        {/* 2. SUBTÍTULO (si existe) */}
        {(certificate.customSubtitle || certificate.subtitle) && (
          <div className="text-center mb-6">
            <h2 className="text-lg md:text-xl text-gray-300 drop-shadow">
              {certificate.customSubtitle || certificate.subtitle}
            </h2>
          </div>
        )}

        {/* 3. CONTENIDO PRINCIPAL PERSONALIZADO */}
        {text && (
          <div className="text-center mb-8 max-w-4xl">
            <div className="text-sm md:text-base text-gray-300 drop-shadow leading-relaxed">
              {lines.map((line, index) => {
                if (line.trim() === '') {
                  return <div key={index} className="h-2"></div>;
                }
                
                // Detectar texto que debe ir en negrita
                const isHighlight = line.includes('LO LOGRASTE') || 
                                   line.includes('lo lograste') ||
                                   line.includes('lo lograron') ||
                                   line.includes('no se fuerza, se nota') ||
                                   line.includes('no hay límites') ||
                                   line.includes('lo entendió perfectamente') ||
                                   line.includes('con intención') ||
                                   line.includes('conduce') ||
                                   line.match(/\*\*.*\*\*/);
                
                if (isHighlight) {
                  // Procesar línea con texto en negrita
                  const parts = line.split(/(\*\*.*?\*\*|LO LOGRASTE|lo lograste|lo lograron|no se fuerza, se nota|no hay límites|lo entendió perfectamente|con intención|conduce)/);
                  
                  return (
                    <p key={index} className="mb-2">
                      {parts.map((part, partIndex) => {
                        if (part.match(/\*\*.*\*\*|LO LOGRASTE|lo lograste|lo lograron|no se fuerza, se nota|no hay límites|lo entendió perfectamente|con intención|conduce/)) {
                          const cleanText = part.replace(/\*\*/g, '');
                          return (
                            <span key={partIndex} className="font-bold text-white">
                              {cleanText}
                            </span>
                          );
                        } else if (part.trim()) {
                          return <span key={partIndex}>{part}</span>;
                        }
                        return null;
                      })}
                    </p>
                  );
                } else {
                  return (
                    <p key={index} className="mb-2">
                      {line.trim()}
                    </p>
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* 4. INFORMACIÓN DE EQUIPO (si aplica) */}
        {certificate.participants && certificate.participants.length > 1 && (
          <div className="text-center mb-6">
            <p className="text-xs text-gray-400 italic">
              Certificado de equipo - {certificate.participants.length} participantes
            </p>
          </div>
        )}

        {/* 5. FIRMA PERSONALIZADA */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-24 h-px bg-white opacity-50"></div>
          </div>
          <p className="text-sm md:text-base font-bold text-gray-300 drop-shadow">
            {certificate.customSignature || certificate.signature || 'Organización'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-auto">
        {/* Header del modal */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Vista Previa del Certificado</h3>
          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Certificado con proporción A4 horizontal */}
        <div className="p-6">
          <div 
            className="relative mx-auto bg-gray-100 shadow-2xl"
            style={{
              aspectRatio: '297/210', // Proporción A4 horizontal
              maxWidth: '100%',
              width: '900px', // Ancho máximo para buena visualización
              backgroundImage: `url(${backgroundImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Overlay para asegurar legibilidad del texto */}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            
            {/* Logo de la jam en esquina superior derecha */}
            <div className="absolute top-4 right-4">
              <img 
                src="/images/logo-jam.png" 
                alt="Logo Game Jam" 
                className="h-8 w-auto opacity-90"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
              />
            </div>
            
            {/* Contenido del certificado */}
            {renderContent()}

            {/* QR Code (si existe gameLink) */}
            {certificate.gameLink && (
              <div className="absolute bottom-4 right-4">
                <div className="bg-white bg-opacity-90 p-1 rounded">
                  <div className="w-5 h-5 bg-gray-300 rounded text-xs flex items-center justify-center">
                    QR
                  </div>
                  <p className="text-xs text-gray-600 text-center mt-1">Jugar</p>
                </div>
              </div>
            )}

            {/* Información del footer */}
            <div className="absolute bottom-4 left-4 right-20">
              <div className="border-t border-gray-400 pt-2 opacity-80">
                <div className="flex justify-between items-center text-xs text-gray-300">
                  <span>Fecha: {formatDate(certificate.awardedDate)}</span>
                  <span>ID: {certificate.id}</span>
                </div>
              </div>
            </div>

            {/* Fallback si no se carga la imagen */}
            <div 
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-green-600 via-green-800 to-black flex items-center justify-center"
              style={{ backgroundImage: 'none' }}
            >
              <p className="text-white text-center">
                Imagen de fondo no disponible<br/>
                <small>Vista previa con colores de respaldo</small>
              </p>
            </div>
          </div>

          {/* Información adicional debajo del certificado */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">Información del Certificado:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 block">Participante:</span>
                <p className="font-medium">{userName}</p>
              </div>
              <div>
                <span className="text-gray-600 block">Tipo:</span>
                <p className="font-medium">
                  {isRecognitionCertificate(certificate) ? 'Reconocimiento' : 'Participación'}
                </p>
              </div>
              <div>
                <span className="text-gray-600 block">Categoría:</span>
                <p className="font-medium">{getCategoryName(certificate.category)}</p>
              </div>
              <div>
                <span className="text-gray-600 block">Fecha:</span>
                <p className="font-medium">{formatDate(certificate.awardedDate)}</p>
              </div>
              {certificate.gameName && (
                <div className="col-span-2">
                  <span className="text-gray-600 block">Juego:</span>
                  <p className="font-medium">{certificate.gameName}</p>
                </div>
              )}
              {certificate.gameLink && (
                <div className="col-span-2">
                  <span className="text-gray-600 block">Enlace del juego:</span>
                  <p className="font-medium text-blue-600 truncate">{certificate.gameLink}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};