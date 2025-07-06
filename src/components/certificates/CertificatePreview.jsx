// src/components/certificates/CertificatePreview.jsx - Vista previa idéntica al PDF
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

  const getCategoryRecognitionInfo = (category) => {
    const categoryMap = {
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
    
    return categoryMap[category] || categoryMap['originality'];
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES');
  };

  const renderCustomContent = () => {
    let text = certificate.customMainText || '';
    
    // Reemplazar placeholders
    text = text.replace(/\[NOMBRE\]/g, userName);
    if (certificate.gameName) {
      text = text.replace(/\[JUEGO\]/g, certificate.gameName);
    }
    
    // Dividir en líneas
    const lines = text.split('\n');
    
    return (
      <div className="relative h-full flex flex-col justify-center items-center text-white p-8">
        {/* Título personalizado */}
        {certificate.customTitle && (
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {certificate.customTitle}
            </h1>
          </div>
        )}

        {/* Subtítulo personalizado */}
        {certificate.customSubtitle && (
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold drop-shadow-lg" 
                style={{ color: '#0fc064' }}>
              {certificate.customSubtitle}
            </h2>
          </div>
        )}

        {/* Contenido principal personalizado */}
        <div className="text-center mb-8 max-w-4xl">
          <div className="text-base md:text-lg text-gray-200 drop-shadow leading-relaxed">
            {lines.map((line, index) => {
              if (line.trim() === '') {
                return <br key={index} />;
              }
              
              // Detectar texto que debe ir en bold
              const boldPhrases = [
                'LO LOGRASTE',
                'no se fuerza, se nota',
                'no hay límites',
                'lo entendió perfectamente',
                'con intención',
                'conduce'
              ];
              
              let processedLine = line;
              
              // Procesar texto con **
              processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
              
              // Procesar frases especiales
              boldPhrases.forEach(phrase => {
                if (line.includes(phrase)) {
                  processedLine = processedLine.replace(
                    phrase, 
                    `<strong class="text-white font-bold">${phrase}</strong>`
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
        </div>

        {/* Firma personalizada */}
        {certificate.customSignature && (
          <div className="text-center">
            <p className="text-lg font-bold drop-shadow" style={{ color: '#0fc064' }}>
              {certificate.customSignature}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderParticipationContent = () => {
    return (
      <div className="relative h-full flex flex-col justify-center items-center text-white p-8">
        {/* Título */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-lg">
            Certificado de Participación
          </h1>
        </div>

        {/* Nombre de la jam */}
        <div className="text-center mb-6">
          <h2 className="text-4xl md:text-5xl font-bold drop-shadow-lg" 
              style={{ color: '#0fc064' }}>
            {certificate.jamName}
          </h2>
        </div>

        {/* "Este certificado se otorga a:" */}
        <div className="text-center mb-4">
          <p className="text-lg text-gray-200 drop-shadow">
            Este certificado se otorga a:
          </p>
        </div>

        {/* Nombre del usuario */}
        <div className="text-center mb-8">
          <h3 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            {userName}
          </h3>
        </div>

        {/* Texto principal */}
        <div className="text-center mb-8 max-w-4xl">
          <div className="text-base md:text-lg text-gray-200 drop-shadow leading-relaxed space-y-2">
            <p>Por haber participado activamente en la creación de un videojuego durante</p>
            <p>la Game Jam organizada por estudiantes para estudiantes.</p>
            <br />
            <p>Sabemos que no es fácil hacer un juego en pocos días.</p>
            <p>Sabemos que dormir tampoco ayudó.</p>
            <p className="text-xl font-bold text-white">Pero aún así, <strong>LO LOGRASTE</strong>.</p>
          </div>
        </div>

        {/* Despedida */}
        <div className="text-center">
          <p className="text-sm italic text-gray-300 drop-shadow mb-2">
            Con admiración y un poquito de envidia,
          </p>
          <p className="text-lg font-bold drop-shadow" style={{ color: '#0fc064' }}>
            Organización de {certificate.jamName}
          </p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // Si tiene contenido personalizado, usarlo
    if (certificate.customTitle || certificate.customMainText) {
      return renderCustomContent();
    }
    
    // Si no, usar el sistema anterior
    return certificate.isWinner ? renderRecognitionContent() : renderParticipationContent();
  };

  const renderRecognitionContent = () => {
    const categoryInfo = getCategoryRecognitionInfo(certificate.category);
    const gameName = userName; // En el futuro se podría usar el nombre del juego

    return (
      <div className="relative h-full flex flex-col justify-center items-center text-white p-8">
        {/* Título con emoji */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 drop-shadow-lg">
            {categoryInfo.emoji} Certificado – Mención Especial a la <strong>{categoryInfo.title}</strong>
          </h1>
        </div>

        {/* Texto introductorio */}
        <div className="text-center mb-4">
          <p className="text-lg text-gray-200 drop-shadow">
            {categoryInfo.introText}
          </p>
        </div>

        {/* Nombre del juego/usuario */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            {gameName}
          </h2>
        </div>

        {/* Descripción específica */}
        <div className="text-center mb-8 max-w-4xl">
          <div className="text-base md:text-lg text-gray-200 drop-shadow leading-relaxed">
            {categoryInfo.description.map((line, index) => {
              if (line === '') {
                return <br key={index} />;
              }
              
              // Resaltar frases especiales
              const boldPhrases = [
                'no se fuerza, se nota',
                'no hay límites',
                'lo entendió perfectamente',
                'con intención',
                'conduce'
              ];
              
              let processedLine = line;
              boldPhrases.forEach(phrase => {
                if (line.includes(phrase)) {
                  processedLine = line.replace(
                    phrase, 
                    `<strong class="text-white font-bold">${phrase}</strong>`
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
        </div>

        {/* Nombre de la jam */}
        <div className="text-center">
          <p className="text-lg font-bold drop-shadow" style={{ color: '#0fc064' }}>
            {certificate.jamName}
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
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
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
        </div>

        {/* Footer del modal */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => onDownload(certificate)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
};