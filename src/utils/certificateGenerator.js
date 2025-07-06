// src/utils/certificateGenerator.js - Generador de certificados en PDF
import jsPDF from 'jspdf';

/**
 * Genera un certificado en PDF usando la imagen de fondo personalizada
 * @param {Object} certificateData - Datos del certificado
 * @param {string} certificateData.userName - Nombre completo del usuario
 * @param {string} certificateData.jamName - Nombre de la game jam
 * @param {string} certificateData.category - Categoría del certificado
 * @param {boolean} certificateData.isWinner - Si es certificado de reconocimiento
 * @param {Date} certificateData.date - Fecha de emisión
 * @param {string} certificateData.certificateId - ID único del certificado
 * @param {string} [certificateData.gameName] - Nombre del juego (opcional, para reconocimientos)
 * @param {string} [certificateData.theme] - Tema de la jam (opcional)
 * @param {string} [certificateData.customTitle] - Título personalizado
 * @param {string} [certificateData.customSubtitle] - Subtítulo personalizado
 * @param {string} [certificateData.customMainText] - Contenido personalizado
 * @param {string} [certificateData.customSignature] - Firma personalizada
 * @param {string} backgroundImageUrl - URL de la imagen de fondo
 */
export const generateCertificatePDF = async (certificateData, backgroundImageUrl) => {
  try {
    // Crear nuevo PDF en formato horizontal (landscape)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Dimensiones del PDF (A4 horizontal: 297x210mm)
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Si se proporciona imagen de fondo, cargarla
    if (backgroundImageUrl) {
      await loadBackgroundImage(pdf, backgroundImageUrl, pageWidth, pageHeight);
    } else {
      // Fondo de respaldo si no hay imagen
      createFallbackBackground(pdf, pageWidth, pageHeight, certificateData.isWinner);
    }

    // Agregar texto sobre la imagen
    addCertificateText(pdf, certificateData, pageWidth, pageHeight);

    // Generar nombre del archivo
    const fileName = `certificado-${certificateData.category}-${certificateData.userName.replace(/\s+/g, '-').toLowerCase()}.pdf`;

    // Descargar el PDF
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw new Error('Error al generar el certificado. Intenta de nuevo.');
  }
};

/**
 * Carga la imagen de fondo en el PDF
 */
const loadBackgroundImage = async (pdf, imageUrl, pageWidth, pageHeight) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Agregar imagen como fondo, ocupando toda la página
        pdf.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);
        resolve();
      } catch (error) {
        console.error('Error adding background image:', error);
        reject(error);
      }
    };
    
    img.onerror = () => {
      console.warn('Could not load background image, using fallback');
      resolve(); // Continuar sin imagen de fondo
    };
    
    img.src = imageUrl;
  });
};

/**
 * Crea un fondo de respaldo si no se puede cargar la imagen
 */
const createFallbackBackground = (pdf, pageWidth, pageHeight, isWinner) => {
  // Fondo degradado simulado
  if (isWinner) {
    // Fondo dorado para reconocimientos
    pdf.setFillColor(255, 215, 0);
  } else {
    // Fondo azul para participación
    pdf.setFillColor(59, 130, 246);
  }
  
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Agregar patrón decorativo básico
  pdf.setFillColor(255, 255, 255, 0.1);
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * pageWidth;
    const y = Math.random() * pageHeight;
    const size = Math.random() * 10 + 5;
    pdf.circle(x, y, size, 'F');
  }
};

/**
 * Agrega todo el texto del certificado con el nuevo contenido
 */
const addCertificateText = (pdf, certificateData, pageWidth, pageHeight) => {
  const centerX = pageWidth / 2;
  
  // Configurar fuente
  pdf.setFont('helvetica');
  
  // Verificar si es un certificado personalizado
  if (certificateData.customTitle || certificateData.customMainText) {
    addCustomCertificateText(pdf, certificateData, pageWidth, pageHeight, centerX);
  } else if (certificateData.isWinner) {
    // === CERTIFICADOS DE RECONOCIMIENTO ===
    addRecognitionCertificateText(pdf, certificateData, pageWidth, pageHeight, centerX);
  } else {
    // === CERTIFICADOS DE PARTICIPACIÓN ===
    addParticipationCertificateText(pdf, certificateData, pageWidth, pageHeight, centerX);
  }
  
  // Información inferior común
  addFooterInfo(pdf, certificateData, pageWidth, pageHeight);
};

/**
 * Agrega texto para certificados personalizados
 */
const addCustomCertificateText = (pdf, certificateData, pageWidth, pageHeight, centerX) => {
  let yPosition = 30;
  
  // 1. Título personalizado
  if (certificateData.customTitle) {
    pdf.setFontSize(24);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text(certificateData.customTitle, centerX, yPosition, { align: 'center' });
    yPosition += 20;
  }
  
  // 2. Subtítulo personalizado
  if (certificateData.customSubtitle) {
    pdf.setFontSize(18);
    pdf.setTextColor(0, 252, 100); // Verde del logo
    pdf.setFont('helvetica', 'bold');
    pdf.text(certificateData.customSubtitle, centerX, yPosition, { align: 'center' });
    yPosition += 20;
  }
  
  // 3. Contenido principal personalizado
  if (certificateData.customMainText) {
    let text = certificateData.customMainText;
    
    // Reemplazar placeholders
    text = text.replace(/\[NOMBRE\]/g, certificateData.userName);
    if (certificateData.gameName) {
      text = text.replace(/\[JUEGO\]/g, certificateData.gameName);
    }
    
    // Dividir en líneas y procesar
    const lines = text.split('\n');
    
    pdf.setFontSize(12);
    pdf.setTextColor(200, 200, 200);
    pdf.setFont('helvetica', 'normal');
    
    lines.forEach((line) => {
      if (line.trim() === '') {
        yPosition += 5; // Espacio para líneas vacías
        return;
      }
      
      // Detectar texto que debe ir en negrita
      if (line.includes('LO LOGRASTE') || 
          line.includes('no se fuerza, se nota') ||
          line.includes('no hay límites') ||
          line.includes('lo entendió perfectamente') ||
          line.includes('con intención') ||
          line.includes('conduce') ||
          line.match(/\*\*.*\*\*/)) {
        
        // Procesar texto con énfasis
        const parts = line.split(/(\*\*.*?\*\*|LO LOGRASTE|no se fuerza, se nota|no hay límites|lo entendió perfectamente|con intención|conduce)/);
        let xOffset = 0;
        const startX = centerX - (pdf.getTextWidth(line.replace(/\*\*/g, '')) / 2);
        
        parts.forEach(part => {
          if (part.match(/\*\*.*\*\*|LO LOGRASTE|no se fuerza, se nota|no hay límites|lo entendió perfectamente|con intención|conduce/)) {
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            const cleanText = part.replace(/\*\*/g, '');
            pdf.text(cleanText, startX + xOffset, yPosition);
            xOffset += pdf.getTextWidth(cleanText);
          } else {
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(200, 200, 200);
            pdf.text(part, startX + xOffset, yPosition);
            xOffset += pdf.getTextWidth(part);
          }
        });
      } else {
        // Texto normal centrado
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(200, 200, 200);
        pdf.text(line, centerX, yPosition, { align: 'center' });
      }
      
      yPosition += 8;
    });
  }
  
  // 4. Firma personalizada
  if (certificateData.customSignature) {
    yPosition += 10;
    pdf.setFontSize(13);
    pdf.setTextColor(0, 252, 100);
    pdf.setFont('helvetica', 'bold');
    pdf.text(certificateData.customSignature, centerX, yPosition, { align: 'center' });
  }
};

/**
 * Agrega texto para certificados de participación
 */
const addParticipationCertificateText = (pdf, certificateData, pageWidth, pageHeight, centerX) => {
  // 1. Título "Certificado de Participación"
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Certificado de Participación', centerX, 30, { align: 'center' });
  
  // 2. Nombre de la jam (destacado)
  pdf.setFontSize(28);
  pdf.setTextColor(0, 252, 100); // Verde del logo
  pdf.setFont('helvetica', 'bold');
  pdf.text(certificateData.jamName, centerX, 50, { align: 'center' });
  
  // 3. "Este certificado se otorga a:"
  pdf.setFontSize(14);
  pdf.setTextColor(220, 220, 220);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Este certificado se otorga a:', centerX, 70, { align: 'center' });
  
  // 4. Nombre del participante (muy destacado)
  pdf.setFontSize(32);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  
  // Ajustar tamaño si el nombre es muy largo
  const nameWidth = pdf.getTextWidth(certificateData.userName);
  if (nameWidth > pageWidth - 40) {
    pdf.setFontSize(24);
  }
  
  pdf.text(certificateData.userName, centerX, 90, { align: 'center' });
  
  // 5. Párrafo principal (dividido en líneas)
  pdf.setFontSize(12);
  pdf.setTextColor(200, 200, 200);
  pdf.setFont('helvetica', 'normal');
  
  const mainText = [
    'Por haber participado activamente en la creación de un videojuego durante',
    'la Game Jam organizada por estudiantes para estudiantes.',
    '',
    'Sabemos que no es fácil hacer un juego en pocos días.',
    'Sabemos que dormir tampoco ayudó.',
    'Pero aún así, LO LOGRASTE.'
  ];
  
  let yPosition = 110;
  mainText.forEach((line, index) => {
    if (line === 'Pero aún así, LO LOGRASTE.') {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
    } else if (line === '') {
      yPosition += 3; // Espacio extra
      return;
    }
    
    pdf.text(line, centerX, yPosition, { align: 'center' });
    yPosition += 8;
    
    // Resetear estilo después de "LO LOGRASTE"
    if (line === 'Pero aún así, LO LOGRASTE.') {
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(200, 200, 200);
    }
  });
  
  // 6. Despedida
  pdf.setFontSize(11);
  pdf.setTextColor(180, 180, 180);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Con admiración y un poquito de envidia,', centerX, yPosition + 15, { align: 'center' });
  
  // 7. Firma de la organización
  pdf.setFontSize(13);
  pdf.setTextColor(0, 252, 100);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Organización de ${certificateData.jamName}`, centerX, yPosition + 28, { align: 'center' });
};

/**
 * Agrega texto para certificados de reconocimiento
 */
const addRecognitionCertificateText = (pdf, certificateData, pageWidth, pageHeight, centerX) => {
  // Obtener emoji y textos específicos por categoría
  const categoryInfo = getCategoryRecognitionInfo(certificateData.category);
  
  // 1. Emoji + Título
  pdf.setFontSize(20);
  pdf.setTextColor(255, 215, 0); // Dorado
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${categoryInfo.emoji} Certificado – Mención Especial a la ${categoryInfo.title}`, centerX, 30, { align: 'center' });
  
  // 2. Texto inicial
  pdf.setFontSize(14);
  pdf.setTextColor(220, 220, 220);
  pdf.setFont('helvetica', 'normal');
  pdf.text(categoryInfo.introText, centerX, 50, { align: 'center' });
  
  // 3. Nombre del juego/participante (destacado)
  pdf.setFontSize(28);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  
  // Para reconocimientos, usamos el nombre del juego si está disponible
  const gameName = certificateData.gameName || certificateData.userName;
  pdf.text(gameName, centerX, 75, { align: 'center' });
  
  // 4. Descripción específica de la categoría
  pdf.setFontSize(12);
  pdf.setTextColor(200, 200, 200);
  pdf.setFont('helvetica', 'normal');
  
  let yPosition = 95;
  categoryInfo.description.forEach((line, index) => {
    if (line === '') {
      yPosition += 5;
      return;
    }
    
    // Detectar texto que debe ir en bold
    if (line.includes('no se fuerza, se nota') || 
        line.includes('no hay límites') ||
        line.includes('lo entendió perfectamente') ||
        line.includes('con intención') ||
        line.includes('conduce')) {
      
      const parts = line.split(/(\bno se fuerza, se nota\b|\bno hay límites\b|\blo entendió perfectamente\b|\bcon intención\b|\bconduce\b)/);
      let xOffset = 0;
      const startX = centerX - (pdf.getTextWidth(line) / 2);
      
      parts.forEach(part => {
        if (part.match(/no se fuerza, se nota|no hay límites|lo entendió perfectamente|con intención|conduce/)) {
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(255, 255, 255);
        }
        
        pdf.text(part, startX + xOffset, yPosition);
        xOffset += pdf.getTextWidth(part);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(200, 200, 200);
      });
    } else {
      pdf.text(line, centerX, yPosition, { align: 'center' });
    }
    
    yPosition += 8;
  });
  
  // 5. Información de la jam
  pdf.setFontSize(11);
  pdf.setTextColor(0, 252, 100);
  pdf.setFont('helvetica', 'bold');
  pdf.text(certificateData.jamName, centerX, yPosition + 15, { align: 'center' });
};

/**
 * Información específica para cada categoría de reconocimiento
 */
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

/**
 * Agrega información del footer (fecha, tema, ID)
 */
const addFooterInfo = (pdf, certificateData, pageWidth, pageHeight) => {
  const bottomY = pageHeight - 25;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(160, 160, 160);
  
  // Fecha (izquierda)
  const dateText = `Fecha: ${certificateData.date.toLocaleDateString('es-ES')}`;
  pdf.text(dateText, 20, bottomY);
  
  // Tema (centro) - se podría agregar en el futuro
  // const themeText = certificateData.theme ? `Tema: ${certificateData.theme}` : '';
  // pdf.text(themeText, pageWidth / 2, bottomY, { align: 'center' });
  
  // ID del certificado (derecha)
  const idText = `ID: ${certificateData.certificateId}`;
  pdf.text(idText, pageWidth - 20, bottomY, { align: 'right' });
  
  // Línea superior al footer
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.2);
  pdf.line(20, bottomY - 8, pageWidth - 20, bottomY - 8);
};

/**
 * Función auxiliar para cargar imagen desde URL y convertir a base64
 */
export const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

/**
 * Función principal para generar certificado con imagen personalizada
 */
export const generateCertificateWithCustomBackground = async (certificateData) => {
  try {
    // URL de tu imagen de fondo (deberás subirla a tu proyecto)
    // Puedes ponerla en public/images/ y referenciarla así:
    const backgroundImageUrl = '/images/certificate-background.png';
    
    await generateCertificatePDF(certificateData, backgroundImageUrl);
  } catch (error) {
    console.error('Error generating certificate with custom background:', error);
    // Fallback: generar sin imagen de fondo
    await generateCertificatePDF(certificateData, null);
  }
};

// Función helper para preparar datos de certificado
export const prepareCertificateData = (certificate, userProfile) => {
  return {
    userName: userProfile?.fullName || 'Participante',
    jamName: certificate.jamName,
    category: certificate.category,
    isWinner: certificate.isWinner,
    date: certificate.awardedDate,
    certificateId: certificate.id,
    gameName: certificate.gameName || null,
    theme: certificate.theme || null,
    // Campos personalizados
    customTitle: certificate.customTitle || null,
    customSubtitle: certificate.customSubtitle || null,
    customMainText: certificate.customMainText || null,
    customSignature: certificate.customSignature || null
  };
};