// src/components/certificates/CertificatePreview.jsx - Versión corregida
import React from 'react';
import { Download, X } from 'lucide-react';
import { safeFormatDate } from '../../utils/dateUtils';

export const CertificatePreview = ({ 
  certificate, 
  userName, 
  onClose, 
  onDownload,
  isModal = false // Nuevo prop para controlar si es un modal independiente
}) => {
  // URL de la imagen de fondo
  const backgroundImageUrl = '/images/certificate-bg.png';

  const formatDate = (date) => {
    return safeFormatDate(date, 'es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const renderContent = () => {
    const isRecognition = certificate.isWinner || certificate.category !== 'participation';
    
    if (certificate.customTitle || certificate.customMainText) {
      // Certificado personalizado
      return (
        <div className="text-center text-white h-full flex flex-col justify-center p-8">
          <div className="space-y-6">
            {certificate.customTitle && (
              <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg">
                {certificate.customTitle}
              </h1>
            )}
            
            {certificate.customSubtitle && (
              <h2 className="text-xl md:text-2xl font-medium drop-shadow">
                {certificate.customSubtitle}
              </h2>
            )}
            
            <div className="text-2xl md:text-3xl font-bold drop-shadow-lg">
              {userName}
            </div>
            
            {certificate.customMainText && (
              <div className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed drop-shadow">
                {certificate.customMainText.split('\n').map((line, index) => {
                  let processedLine = line;
                  
                  // Resaltar frases especiales
                  const highlightPhrases = [userName, certificate.jamName];
                  highlightPhrases.forEach(phrase => {
                    if (phrase && processedLine.includes(phrase)) {
                      processedLine = line.replace(
                        phrase, 
                        `<strong class="text-yellow-300 font-bold">${phrase}</strong>`
                      );
                    }
                  });

                  return (
                    <p key={index} 
                       dangerouslySetInnerHTML={{ __html: processedLine }} 
                       className="mb-2" />
                  );
                })}
              </div>
            )}
            
            {certificate.customSignature && (
              <div className="mt-8">
                <p className="text-lg font-medium drop-shadow">
                  {certificate.customSignature}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    } else if (isRecognition) {
      // Certificado de reconocimiento estándar
      return (
        <div className="text-center text-white h-full flex flex-col justify-center p-8">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg">
              Certificado de Reconocimiento
            </h1>
            
            <h2 className="text-xl md:text-2xl font-medium drop-shadow">
              {getCategoryName(certificate.category)}
            </h2>
            
            <div className="text-2xl md:text-3xl font-bold drop-shadow-lg">
              {userName}
            </div>
            
            <div className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed drop-shadow">
              <p className="mb-4">
                Por su destacada participación y excelencia en la categoría de{' '}
                <strong className="text-yellow-300">{getCategoryName(certificate.category)}</strong>{' '}
                durante la{' '}
                <strong className="text-yellow-300">{certificate.jamName}</strong>
              </p>
              
              {certificate.gameName && (
                <p className="mb-4">
                  Con el proyecto:{' '}
                  <strong className="text-yellow-300">{certificate.gameName}</strong>
                </p>
              )}
              
              <p>
                Se otorga el presente reconocimiento como testimonio de su creatividad,
                dedicación y talento excepcional.
              </p>
            </div>
            
            <div className="mt-8">
              <p className="text-lg font-medium drop-shadow">
                Game Jam Chile
              </p>
              <p className="text-sm opacity-90">
                Comunidad de Desarrollo de Videojuegos
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      // Certificado de participación estándar
      return (
        <div className="text-center text-white h-full flex flex-col justify-center p-8">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg">
              Certificado de Participación
            </h1>
            
            <div className="text-2xl md:text-3xl font-bold drop-shadow-lg">
              {userName}
            </div>
            
            <div className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed drop-shadow">
              <p className="mb-4">
                Ha participado exitosamente en la{' '}
                <strong className="text-yellow-300">{certificate.jamName}</strong>,
                demostrando compromiso, creatividad y pasión por el desarrollo de videojuegos.
              </p>
              
              <p>
                Se otorga el presente certificado como reconocimiento a su valiosa
                contribución a la comunidad de desarrollo de videojuegos.
              </p>
            </div>
            
            <div className="mt-8">
              <p className="text-lg font-medium drop-shadow">
                Game Jam Chile
              </p>
              <p className="text-sm opacity-90">
                Comunidad de Desarrollo de Videojuegos
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  const certificateContent = (
    <>
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
          
          {/* Contenido del certificado */}
          {renderContent()}

          {/* Información del footer */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="border-t border-gray-400 pt-3 opacity-80">
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
                {certificate.isWinner ? 'Reconocimiento' : 'Participación'}
              </p>
            </div>
            <div>
              <span className="text-gray-600 block">Game Jam:</span>
              <p className="font-medium">{certificate.jamName}</p>
            </div>
            <div>
              <span className="text-gray-600 block">Categoría:</span>
              <p className="font-medium">{getCategoryName(certificate.category)}</p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 mt-6">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          )}
          {onDownload && (
            <button
              onClick={() => onDownload(certificate)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
          )}
        </div>
      </div>
    </>
  );

  // Si isModal es true, renderizar con modal propio
  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-auto">
          {/* Header del modal */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Vista Previa del Certificado</h3>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
          {certificateContent}
        </div>
      </div>
    );
  }

  // Si no es modal, solo renderizar el contenido
  return <div className="bg-white rounded-lg">{certificateContent}</div>;
};