// src/utils/certificateGenerator.js - Generador de certificados en PDF
import jsPDF from 'jspdf';

/**
 * Detecta si un certificado es de reconocimiento basado en múltiples criterios
 */
const isRecognitionCertificate = (certificateData) => {
  // Lista de categorías que son reconocimientos
  const recognitionCategories = [
    'originality', 'creativity', 'narrative', 'aesthetics', 'sound',
    'Originalidad', 'Creatividad', 'Narrativa', 'Narrativa/Concepto', 
    'Estética/Arte', 'Dirección de Arte', 'Sonido/Música', 'Música y Sonido'
  ];
  
  // Es reconocimiento si:
  // 1. isWinner es true, O
  // 2. La categoría está en la lista de reconocimientos, O  
  // 3. Tiene gameName (indicativo de reconocimiento)
  return certificateData.isWinner === true ||
         recognitionCategories.includes(certificateData.category) ||
         (certificateData.gameName && certificateData.category !== 'participation' && certificateData.category !== 'Participación');
};

/**
 * Carga y agrega el logo en la esquina superior izquierda
 */
const loadAndAddLogo = async (pdf, logoUrl, pageWidth, pageHeight) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Dimensiones originales de tu logo
        const originalWidth = 390;
        const originalHeight = 328;
        const aspectRatio = originalWidth / originalHeight; // 1.189
        
        // Configuración del logo - MÁS GRANDE y en la DERECHA
        const logoHeight = 28; // Aumentado de 20mm a 28mm
        const logoWidth = logoHeight * aspectRatio; // Mantener proporciones (33.29mm)
        
        // Posición en esquina superior DERECHA
        const logoX = pageWidth - logoWidth - 20; // Desde el borde derecho
        const logoY = 15; // Posición Y (desde arriba)
        
        // Agregar logo en esquina superior derecha manteniendo proporciones
        pdf.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
        resolve();
      } catch (error) {
        console.error('Error adding logo:', error);
        resolve(); // Continuar sin logo si hay error
      }
    };
    
    img.onerror = () => {
      console.warn('Could not load logo, continuing without it');
      resolve(); // Continuar sin logo
    };
    
    img.src = logoUrl;
  });
};

/**
 * Información específica para cada categoría de reconocimiento
 */
const getCategoryRecognitionInfo = (category) => {
  // Mapear categorías en español a inglés
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
  
  // ID del certificado (derecha)
  const idText = `ID: ${certificateData.certificateId}`;
  pdf.text(idText, pageWidth - 20, bottomY, { align: 'right' });
};

/**
 * CERTIFICADOS PERSONALIZADOS (Manual Certificate Creator)
 */
/**
 * CERTIFICADOS DE RECONOCIMIENTO - SOLO TIPOGRAFÍA LIMPIA
 */
const addRecognitionCertificateText = (pdf, certificateData, pageWidth, pageHeight, centerX) => {
  const categoryInfo = getCategoryRecognitionInfo(certificateData.category);
  
  // 1. TÍTULO LIMPIO Y MODERNO
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255); // Blanco limpio
  pdf.setFont('helvetica', 'bold');
  pdf.text('CERTIFICADO DE RECONOCIMIENTO', centerX, 30, { align: 'center' });
  
  // Subtítulo de categoría con línea sutil
  pdf.setFontSize(16);
  pdf.setTextColor(232, 93, 4); // Naranja brillante
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Mención Especial a la ${categoryInfo.title}`, centerX, 45, { align: 'center' });
  
  // Línea decorativa sutil
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  pdf.line(centerX - 80, 50, centerX + 80, 50);
  
  // 2. TEXTO INTRODUCTORIO
  pdf.setFontSize(14);
  pdf.setTextColor(180, 180, 180);
  pdf.setFont('helvetica', 'normal');
  pdf.text(categoryInfo.introText, centerX, 65, { align: 'center' });
  
  // 3. NOMBRE DEL JUEGO - DESTACADO SOLO CON TIPOGRAFÍA
  const displayName = certificateData.gameName || certificateData.userName;
  
  // Tamaño más pequeño para el nombre del juego
  let gameNameSize = 28; // Reducido de 40 a 28
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(gameNameSize);
  
  let textWidth = pdf.getTextWidth(displayName);
  while (textWidth > pageWidth - 80 && gameNameSize > 20) {
    gameNameSize -= 2;
    pdf.setFontSize(gameNameSize);
    textWidth = pdf.getTextWidth(displayName);
  }
  
  const gameTextY = 85;
  
  
  
  // Texto principal en blanco puro
    
    pdf.setTextColor(255, 117, 143); // Rosa claro
  pdf.text(displayName, centerX, gameTextY, { align: 'center' });
  
  // 4. NOMBRE DEL CREADOR - TAMBIÉN SOLO TIPOGRAFÍA
  let yPosition = gameTextY + 20;
  
  if (certificateData.gameName && certificateData.userName) {
    pdf.setFontSize(13);
    pdf.setTextColor(180, 180, 180);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Creado por:', centerX, yPosition, { align: 'center' });
    
    yPosition += 12;
    
    // Tamaño más pequeño para el nombre del creador
    const creatorNameSize = 20; // Reducido de 24 a 20
    pdf.setFontSize(creatorNameSize);
    pdf.setFont('helvetica', 'bold');
    
    // Texto del creador 
    
    pdf.setTextColor(146, 248, 207); // Verde claro
    pdf.text(certificateData.userName, centerX, yPosition, { align: 'center' });
    
    yPosition += 20;
  }
  
  // 5. DESCRIPCIÓN LIMPIA
  pdf.setFontSize(13);
  pdf.setTextColor(190, 190, 190);
  pdf.setFont('helvetica', 'normal');
  
  categoryInfo.description.forEach((line, index) => {
    if (line === '') {
      yPosition += 5;
      return;
    }
    
    // Destacar solo las líneas importantes con texto más blanco
    if (line.includes('originalidad no se fuerza') || 
        line.includes('no hay límites') || 
        line.includes('perfectamente') ||
        line.includes('conduce') ||
        line.includes('con intención')) {
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
    }
    
    pdf.text(line, centerX, yPosition, { align: 'center' });
    yPosition += 8;
    
    // Resetear estilo
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(190, 190, 190);
  });
  
  // 6. FIRMA FINAL ELEGANTE
  yPosition += 15;
  
  const signatureText = `Game Jam UTN 2025`;
  pdf.setFontSize(15);
  pdf.setFont('helvetica', 'bold');
  const signatureWidth = pdf.getTextWidth(signatureText);
  
  // Línea elegante sobre la firma
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  pdf.line(centerX - signatureWidth/2 - 10, yPosition - 5, centerX + signatureWidth/2 + 10, yPosition - 5);
  
  pdf.setTextColor(15, 192, 100);
  pdf.text(signatureText, centerX, yPosition + 5, { align: 'center' });
};

/**
 * CERTIFICADOS DE PARTICIPACIÓN - SOLO TIPOGRAFÍA LIMPIA
 */
const addParticipationCertificateText = (pdf, certificateData, pageWidth, pageHeight, centerX) => {
  // 1. TÍTULO LIMPIO
  pdf.setFontSize(26);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CERTIFICADO DE PARTICIPACIÓN', centerX, 35, { align: 'center' });
  
  // 2. NOMBRE DE LA JAM CON LÍNEAS DECORATIVAS
  pdf.setFontSize(18);
  pdf.setTextColor(220, 220, 220);
  pdf.setFont('helvetica', 'normal');
  
  const jamNameWidth = pdf.getTextWidth(certificateData.jamName);
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  pdf.line(centerX - jamNameWidth/2 - 15, 52, centerX - jamNameWidth/2 - 5, 52);
  pdf.line(centerX + jamNameWidth/2 + 5, 52, centerX + jamNameWidth/2 + 15, 52);
  
  pdf.text(certificateData.jamName, centerX, 52, { align: 'center' });
  
  // 3. "Este certificado se otorga a:"
  pdf.setFontSize(13);
  pdf.setTextColor(180, 180, 180);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Este certificado se otorga a:', centerX, 70, { align: 'center' });
  
  // 4. NOMBRE DEL PARTICIPANTE - SOLO TIPOGRAFÍA
  const participantNameSize = 30; // Reducido de 36 a 30
  pdf.setFontSize(participantNameSize);
  pdf.setFont('helvetica', 'bold');
  
  // Calcular dimensiones del nombre
  let nameWidth = pdf.getTextWidth(certificateData.userName);
  let adjustedSize = participantNameSize;
  
  // Ajustar tamaño si es muy largo
  while (nameWidth > pageWidth - 60 && adjustedSize > 20) {
    adjustedSize -= 2;
    pdf.setFontSize(adjustedSize);
    nameWidth = pdf.getTextWidth(certificateData.userName);
  }
  
  const nameTextY = 88;
  
  
  
  // Texto principal en blanco puro
  pdf.setTextColor(146, 248, 207); // Verde claro
  pdf.text(certificateData.userName, centerX, nameTextY, { align: 'center' });
  
  // 5. CONTENIDO PRINCIPAL LIMPIO
  pdf.setFontSize(13);
  pdf.setTextColor(190, 190, 190);
  pdf.setFont('helvetica', 'normal');
  
  const mainText = [
    'Por haber participado activamente en la creación de un videojuego durante',
    'la Game Jam organizada por estudiantes para estudiantes.',
    '',
    'Sabemos que no es fácil hacer un juego en pocos días.',
    'Sabemos que dormir tampoco ayudó.',
    'Pero aún así, LO LOGRASTE.'
  ];
  
  let yPosition = nameTextY + 25;
  mainText.forEach((line) => {
    if (line === 'Pero aún así, LO LOGRASTE.') {
      // Destacar esta línea con líneas decorativas
      const lineWidth = pdf.getTextWidth(line);
      
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(centerX - lineWidth/2 - 10, yPosition - 3, centerX - lineWidth/2 - 5, yPosition - 3);
      pdf.line(centerX + lineWidth/2 + 5, yPosition - 3, centerX + lineWidth/2 + 10, yPosition - 3);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.setTextColor(255, 255, 255);
    } else if (line === '') {
      yPosition += 6;
      return;
    }
    
    pdf.text(line, centerX, yPosition, { align: 'center' });
    yPosition += 9;
    
    // Reset estilo
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(13);
    pdf.setTextColor(190, 190, 190);
  });
  
  // 6. Despedida
  pdf.setFontSize(11);
  pdf.setTextColor(160, 160, 160);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Con admiración y un poquito de envidia,', centerX, yPosition + 12, { align: 'center' });
  
  // 7. FIRMA ELEGANTE
  pdf.setFontSize(14);
  pdf.setTextColor(220, 220, 220);
  pdf.setFont('helvetica', 'bold');
  
  const signatureText = `Organización de ${certificateData.jamName}`;
  const signatureWidth = pdf.getTextWidth(signatureText);
  
  // Línea elegante sobre la firma
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  pdf.line(centerX - signatureWidth/2 - 10, yPosition + 20, centerX + signatureWidth/2 + 10, yPosition + 20);
  
  pdf.text(signatureText, centerX, yPosition + 28, { align: 'center' });
};

/**
 * Función principal de texto - Determina qué tipo de certificado generar
 */
const addCertificateText = (pdf, certificateData, pageWidth, pageHeight) => {
  const centerX = pageWidth / 2;
  
  // Configurar fuente
  pdf.setFont('helvetica');
  
  console.log('Certificate generation data:', {
    category: certificateData.category,
    isWinner: certificateData.isWinner,
    gameName: certificateData.gameName,
    customTitle: certificateData.customTitle,
    isRecognition: isRecognitionCertificate(certificateData)
  });
  
  // PRIMERO: Verificar si es certificado de reconocimiento
  if (isRecognitionCertificate(certificateData)) {
    addRecognitionCertificateText(pdf, certificateData, pageWidth, pageHeight, centerX);
  }
  // SEGUNDO: Verificar si es un certificado personalizado (Manual Certificate Creator)
  else if (certificateData.customTitle || certificateData.customMainText) {
    addCustomCertificateText(pdf, certificateData, pageWidth, pageHeight, centerX);
  } 
  else {
    // Certificado de participación por defecto
    addParticipationCertificateText(pdf, certificateData, pageWidth, pageHeight, centerX);
  }
  
  // Información inferior común
  addFooterInfo(pdf, certificateData, pageWidth, pageHeight);
};

/**
 * Función principal ACTUALIZADA para generar certificado con logo
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

    // 1. Si se proporciona imagen de fondo, cargarla PRIMERO
    if (backgroundImageUrl) {
      await loadBackgroundImage(pdf, backgroundImageUrl, pageWidth, pageHeight);
    } else {
      // Fondo de respaldo si no hay imagen
      createFallbackBackground(pdf, pageWidth, pageHeight, certificateData.isWinner);
    }

    // 2. Cargar y agregar logo DESPUÉS del fondo
    const logoUrl = '/images/logo-jam.png'; // ← Cambia este nombre por el de tu archivo
    await loadAndAddLogo(pdf, logoUrl, pageWidth, pageHeight);

    // 3. Agregar texto sobre todo lo demás
    addCertificateText(pdf, certificateData, pageWidth, pageHeight);

    // Generar nombre de archivo más descriptivo
    const isRecognition = isRecognitionCertificate(certificateData);
    const typePrefix = isRecognition ? 'reconocimiento' : 'participacion';
    
    // Limpiar categoría para nombre de archivo
    let categoryPart = '';
    if (certificateData.category && certificateData.category !== 'participation') {
      categoryPart = `-${certificateData.category.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')}`;
    }
    
    const userName = certificateData.userName
      .replace(/\s+/g, '-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    
    const fileName = `certificado-${typePrefix}${categoryPart}-${userName}.pdf`;

    console.log('Generated file name:', fileName);

    // Descargar el PDF
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw new Error('Error al generar el certificado. Intenta de nuevo.');
  }
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
 * Función ACTUALIZADA para generar certificado con fondo personalizado Y logo
 */
export const generateCertificateWithCustomBackground = async (certificateData) => {
  try {
    // URLs de las imágenes
    const backgroundImageUrl = '/images/certificate-background.png';
    
    await generateCertificatePDF(certificateData, backgroundImageUrl);
  } catch (error) {
    console.error('Error generating certificate with custom background:', error);
    // Fallback: generar sin imagen de fondo pero conservar el logo
    await generateCertificatePDF(certificateData, null);
  }
};

/**
 * Función helper para preparar datos de certificado
 */
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