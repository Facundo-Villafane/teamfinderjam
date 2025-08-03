// src/utils/certificateGenerator.js - Versión restaurada con diseño elegante + QR + múltiples participantes
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

/**
 * Genera código QR usando la librería qrcode
 */
const generateQRCodeWithLibrary = (text) => {
  return new Promise((resolve, reject) => {
    try {
      QRCode.toDataURL(text, {
        width: 100,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      }).then(url => {
        resolve(url);
      }).catch(err => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Agrega un código QR discreto al PDF
 */
const addQRCodeToPDF = async (pdf, gameLink, pageWidth, pageHeight) => {
  try {
    if (!gameLink || !gameLink.trim()) {
      return;
    }
    
    console.log('Generando QR para:', gameLink);
    
    const qrDataURL = await generateQRCodeWithLibrary(gameLink);
    
    // Posición del QR (esquina inferior derecha, más discreto)
    const qrSize = 20; // Más pequeño
    const margin = 15;
    const qrX = pageWidth - qrSize - margin;
    const qrY = pageHeight - qrSize - margin - 15;
    
    // Fondo blanco sutil para el QR
    pdf.setFillColor(255, 255, 255, 0.9);
    pdf.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 1, 1, 'F');
    
    // Agregar el QR
    pdf.addImage(qrDataURL, 'PNG', qrX, qrY, qrSize, qrSize);
    
    // Texto discreto
    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Jugar', qrX + (qrSize / 2), qrY + qrSize + 4, { align: 'center' });
    
    console.log('QR agregado exitosamente');
    
  } catch (error) {
    console.error('Error generando QR code:', error);
  }
};

/**
 * Detecta si un certificado es de reconocimiento
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

/**
 * Carga y agrega el logo en la esquina superior derecha
 */
const loadAndAddLogo = async (pdf, logoUrl, pageWidth, pageHeight) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const originalWidth = 390;
        const originalHeight = 328;
        const aspectRatio = originalWidth / originalHeight;
        
        const logoHeight = 28;
        const logoWidth = logoHeight * aspectRatio;
        
        const logoX = pageWidth - logoWidth - 20;
        const logoY = 15;
        
        pdf.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
        resolve();
      } catch (error) {
        console.error('Error adding logo:', error);
        resolve();
      }
    };
    
    img.onerror = () => {
      console.warn('Could not load logo, continuing without it');
      resolve();
    };
    
    img.src = logoUrl;
  });
};

/**
 * Información específica para cada categoría de reconocimiento
 */
const getCategoryRecognitionInfo = (category) => {
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
        pdf.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);
        resolve();
      } catch (error) {
        console.error('Error adding background image:', error);
        reject(error);
      }
    };
    
    img.onerror = () => {
      console.warn('Could not load background image, using fallback');
      resolve();
    };
    
    img.src = imageUrl;
  });
};

/**
 * Crea un fondo de respaldo elegante
 */
const createFallbackBackground = (pdf, pageWidth, pageHeight, isWinner) => {
  if (isWinner) {
    pdf.setFillColor(255, 215, 0);
  } else {
    pdf.setFillColor(59, 130, 246);
  }
  
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Patrón decorativo sutil
  pdf.setFillColor(255, 255, 255, 0.1);
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * pageWidth;
    const y = Math.random() * pageHeight;
    const size = Math.random() * 10 + 5;
    pdf.circle(x, y, size, 'F');
  }
};

/**
 * Agrega información del footer elegantemente
 */
const addFooterInfo = (pdf, certificateData, pageWidth, pageHeight) => {
  const bottomY = pageHeight - 25;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(160, 160, 160);
  
  // Fecha (izquierda)
  const dateText = `Fecha: ${certificateData.date.toLocaleDateString('es-ES')}`;
  pdf.text(dateText, 20, bottomY);
  
  // ID del certificado (derecha, pero no tanto como para interferir con el QR)
  const idText = `ID: ${certificateData.certificateId}`;
  pdf.text(idText, pageWidth - 80, bottomY, { align: 'right' });
};

/**
 * CERTIFICADOS DE RECONOCIMIENTO - DISEÑO ELEGANTE RESTAURADO
 */
const addRecognitionCertificateText = (pdf, certificateData, pageWidth, pageHeight, centerX) => {
  const categoryInfo = getCategoryRecognitionInfo(certificateData.category);
  
  // 1. TÍTULO LIMPIO Y MODERNO
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CERTIFICADO DE RECONOCIMIENTO', centerX, 30, { align: 'center' });
  
  // Subtítulo de categoría con línea sutil
  pdf.setFontSize(16);
  pdf.setTextColor(232, 93, 4);
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
  
  let gameNameSize = 28;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(gameNameSize);
  
  let textWidth = pdf.getTextWidth(displayName);
  while (textWidth > pageWidth - 80 && gameNameSize > 20) {
    gameNameSize -= 2;
    pdf.setFontSize(gameNameSize);
    textWidth = pdf.getTextWidth(displayName);
  }
  
  const gameTextY = 85;
  pdf.setTextColor(255, 117, 143); // Rosa claro
  pdf.text(displayName, centerX, gameTextY, { align: 'center' });
  
  // 4. NOMBRE DEL CREADOR (si es diferente del juego)
  let yPosition = gameTextY + 20;
  
  if (certificateData.gameName && certificateData.userName) {
    pdf.setFontSize(13);
    pdf.setTextColor(180, 180, 180);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Creado por:', centerX, yPosition, { align: 'center' });
    
    yPosition += 12;
    
    const creatorNameSize = 20;
    pdf.setFontSize(creatorNameSize);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(146, 248, 207); // Verde claro
    pdf.text(certificateData.userName, centerX, yPosition, { align: 'center' });
    
    yPosition += 20;
  }
  
  // 5. MÚLTIPLES PARTICIPANTES (si los hay)
  if (certificateData.participants && certificateData.participants.length > 1) {
    pdf.setFontSize(13);
    pdf.setTextColor(180, 180, 180);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Equipo:', centerX, yPosition, { align: 'center' });
    
    yPosition += 12;
    
    certificateData.participants.forEach((participant, index) => {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(146, 248, 207);
      pdf.text(participant.name, centerX, yPosition, { align: 'center' });
      yPosition += 10;
    });
    
    yPosition += 10;
  }
  
  // 6. DESCRIPCIÓN LIMPIA
  pdf.setFontSize(13);
  pdf.setTextColor(190, 190, 190);
  pdf.setFont('helvetica', 'normal');
  
  categoryInfo.description.forEach((line, index) => {
    if (line === '') {
      yPosition += 5;
      return;
    }
    
    // Destacar líneas importantes
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
  
  // 7. FIRMA FINAL ELEGANTE
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
 * CERTIFICADOS DE PARTICIPACIÓN - DISEÑO ELEGANTE RESTAURADO
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
  
  // Texto dinámico según si hay múltiples participantes
  const introText = certificateData.participants && certificateData.participants.length > 1 
    ? 'Este certificado se otorga al equipo:'
    : 'Este certificado se otorga a:';
  
  pdf.text(introText, centerX, 70, { align: 'center' });
  
  // 4. NOMBRES DE PARTICIPANTES
  let nameTextY = 88;
  
  if (certificateData.participants && certificateData.participants.length > 1) {
    // Múltiples participantes
    certificateData.participants.forEach((participant, index) => {
      const participantNameSize = 24; // Más pequeño para múltiples nombres
      pdf.setFontSize(participantNameSize);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(146, 248, 207); // Verde claro
      pdf.text(participant.name, centerX, nameTextY, { align: 'center' });
      nameTextY += 15;
    });
    nameTextY -= 5; // Ajustar el espacio
  } else {
    // Participante único
    const participantNameSize = 30;
    pdf.setFontSize(participantNameSize);
    pdf.setFont('helvetica', 'bold');
    
    let nameWidth = pdf.getTextWidth(certificateData.userName);
    let adjustedSize = participantNameSize;
    
    while (nameWidth > pageWidth - 60 && adjustedSize > 20) {
      adjustedSize -= 2;
      pdf.setFontSize(adjustedSize);
      nameWidth = pdf.getTextWidth(certificateData.userName);
    }
    
    pdf.setTextColor(146, 248, 207); // Verde claro
    pdf.text(certificateData.userName, centerX, nameTextY, { align: 'center' });
    nameTextY += 25;
  }
  
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
  
  let yPosition = nameTextY;
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
 * CERTIFICADOS PERSONALIZADOS (Manual Certificate Creator)
 */
const addCustomCertificateText = (pdf, certificateData, pageWidth, pageHeight, centerX) => {
  // 1. TÍTULO PERSONALIZADO
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.text(certificateData.customTitle || certificateData.title, centerX, 35, { align: 'center' });
  
  // 2. SUBTÍTULO (si existe)
  let yPosition = 50;
  if (certificateData.customSubtitle || certificateData.subtitle) {
    pdf.setFontSize(16);
    pdf.setTextColor(220, 220, 220);
    pdf.setFont('helvetica', 'normal');
    pdf.text(certificateData.customSubtitle || certificateData.subtitle, centerX, yPosition, { align: 'center' });
    yPosition += 20;
  }
  
  // 3. NOMBRES DE PARTICIPANTES
  if (certificateData.participants && certificateData.participants.length > 0) {
    if (certificateData.participants.length === 1) {
      // Un solo participante
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(146, 248, 207);
      pdf.text(certificateData.participants[0].name, centerX, yPosition + 15, { align: 'center' });
      yPosition += 35;
    } else {
      // Múltiples participantes
      pdf.setFontSize(13);
      pdf.setTextColor(180, 180, 180);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Otorgado a:', centerX, yPosition, { align: 'center' });
      yPosition += 15;
      
      certificateData.participants.forEach((participant) => {
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(146, 248, 207);
        pdf.text(participant.name, centerX, yPosition, { align: 'center' });
        yPosition += 14;
      });
      yPosition += 10;
    }
  }
  
  // 4. CONTENIDO PRINCIPAL PERSONALIZADO
  if (certificateData.customMainText || certificateData.mainText) {
    const mainTextLines = (certificateData.customMainText || certificateData.mainText).split('\n');
    
    pdf.setFontSize(13);
    pdf.setTextColor(190, 190, 190);
    pdf.setFont('helvetica', 'normal');
    
    mainTextLines.forEach((line) => {
      if (line.trim() === '') {
        yPosition += 6;
        return;
      }
      
      pdf.text(line.trim(), centerX, yPosition, { align: 'center' });
      yPosition += 9;
    });
  }
  
  // 5. FIRMA PERSONALIZADA
  yPosition += 15;
  
  const signatureText = certificateData.customSignature || certificateData.signature || 'Organización';
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(220, 220, 220);
  
  const signatureWidth = pdf.getTextWidth(signatureText);
  
  // Línea elegante sobre la firma
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  pdf.line(centerX - signatureWidth/2 - 10, yPosition - 5, centerX + signatureWidth/2 + 10, yPosition - 5);
  
  pdf.text(signatureText, centerX, yPosition + 5, { align: 'center' });
};

/**
 * Función principal de texto - Determina qué tipo de certificado generar
 */
const addCertificateText = (pdf, certificateData, pageWidth, pageHeight) => {
  const centerX = pageWidth / 2;
  pdf.setFont('helvetica');
  
  console.log('Certificate generation data:', {
    category: certificateData.category,
    isWinner: certificateData.isWinner,
    gameName: certificateData.gameName,
    customTitle: certificateData.customTitle,
    participants: certificateData.participants,
    isRecognition: isRecognitionCertificate(certificateData)
  });
  
  // PRIMERO: Verificar si es certificado de reconocimiento
  if (isRecognitionCertificate(certificateData)) {
    addRecognitionCertificateText(pdf, certificateData, pageWidth, pageHeight, centerX);
  }
  // SEGUNDO: Verificar si es un certificado personalizado
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
 * Función principal para generar certificado con diseño elegante restaurado
 */
export const generateCertificatePDF = async (certificateData, backgroundImageUrl = null) => {
  try {
    console.log('Generating certificate with data:', certificateData);

    // Crear nuevo PDF en formato horizontal
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 1. Cargar imagen de fondo si se proporciona
    if (backgroundImageUrl) {
      try {
        await loadBackgroundImage(pdf, backgroundImageUrl, pageWidth, pageHeight);
      } catch (error) {
        console.warn('Could not load background image, using fallback');
        createFallbackBackground(pdf, pageWidth, pageHeight, certificateData.isWinner);
      }
    } else {
      createFallbackBackground(pdf, pageWidth, pageHeight, certificateData.isWinner);
    }

    // 2. Cargar y agregar logo
    const logoUrl = '/images/logo-jam.png';
    await loadAndAddLogo(pdf, logoUrl, pageWidth, pageHeight);

    // 3. Agregar texto del certificado
    addCertificateText(pdf, certificateData, pageWidth, pageHeight);
    
    // 4. Agregar código QR si hay link del juego (discretamente)
    if (certificateData.gameLink) {
      await addQRCodeToPDF(pdf, certificateData.gameLink, pageWidth, pageHeight);
    }

    // 5. Generar nombre de archivo descriptivo
    const typePrefix = certificateData.isWinner || certificateData.category !== 'participation' ? 
      'reconocimiento' : 'participacion';
    
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
 * Función para generar certificado con fondo personalizado
 */
export const generateCertificateWithCustomBackground = async (certificateData) => {
  try {
    const backgroundImageUrl = '/images/certificate-background.png';
    await generateCertificatePDF(certificateData, backgroundImageUrl);
  } catch (error) {
    console.error('Error generating certificate with custom background:', error);
    // Fallback: generar sin imagen de fondo pero conservar el logo
    await generateCertificatePDF(certificateData, null);
  }
};

/**
 * Función helper para preparar datos de certificado con soporte para múltiples participantes
 */
export const prepareCertificateData = (certificate, userProfile, additionalParticipants = []) => {
  // Preparar lista de participantes
  let participants = [];
  
  if (additionalParticipants && additionalParticipants.length > 0) {
    // Si hay participantes adicionales, incluir al usuario principal también
    participants = [
      { name: userProfile?.fullName || 'Participante', userId: userProfile?.uid },
      ...additionalParticipants.map(p => ({ name: p.name, userId: p.userId }))
    ];
  } else if (userProfile?.fullName) {
    // Solo el usuario principal
    participants = [{ name: userProfile.fullName, userId: userProfile.uid }];
  }

  return {
    userName: userProfile?.fullName || 'Participante',
    jamName: certificate.jamName,
    category: certificate.category,
    isWinner: certificate.isWinner,
    date: certificate.awardedDate,
    certificateId: certificate.id,
    gameName: certificate.gameName || null,
    gameLink: certificate.gameLink || null,
    theme: certificate.theme || null,
    participants: participants,
    // Campos personalizados
    customTitle: certificate.customTitle || null,
    customSubtitle: certificate.customSubtitle || null,
    customMainText: certificate.customMainText || null,
    customSignature: certificate.customSignature || null
  };
};