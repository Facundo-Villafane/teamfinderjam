// src/utils/certificateGenerator.js - Versión corregida sin duplicaciones
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

/**
 * Versión mejorada usando la librería qrcode (recomendada)
 * Instalar con: npm install qrcode
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
 * Agrega un código QR al PDF
 */
const addQRCodeToPDF = async (pdf, gameLink, pageWidth, pageHeight) => {
  try {
    if (!gameLink || !gameLink.trim()) {
      return; // No hay link, no agregar QR
    }
    
    console.log('Generando QR para:', gameLink);
    
    // Generar el código QR
    const qrDataURL = await generateQRCodeWithLibrary(gameLink);
    
    // Posición del QR (esquina inferior derecha)
    const qrSize = 25;
    const margin = 10;
    const qrX = pageWidth - qrSize - margin;
    const qrY = pageHeight - qrSize - margin - 20; // Espacio para el texto
    
    // Agregar fondo blanco para el QR
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 8, 2, 2, 'F');
    
    // Agregar el QR al PDF
    pdf.addImage(qrDataURL, 'PNG', qrX, qrY, qrSize, qrSize);
    
    // Agregar texto explicativo
    pdf.setFontSize(8);
    pdf.setTextColor(80, 80, 80);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Escanea para jugar', qrX + (qrSize / 2), qrY + qrSize + 5, { align: 'center' });
    
    console.log('QR agregado exitosamente');
    
  } catch (error) {
    console.error('Error generando QR code:', error);
    // No fallar el certificado si no se puede generar el QR
  }
};

/**
 * Función principal mejorada para generar certificado
 */
export const generateCertificatePDF = async (certificateData, backgroundImageUrl = null) => {
  try {
    console.log('Generating certificate with data:', certificateData);

    // Crear nuevo documento PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Cargar imagen de fondo si se proporciona
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

    // Agregar texto del certificado
    addCertificateText(pdf, certificateData, pageWidth, pageHeight);
    
    // Agregar código QR si hay link del juego
    if (certificateData.gameLink) {
      await addQRCodeToPDF(pdf, certificateData.gameLink, pageWidth, pageHeight);
    }

    // Generar nombre de archivo
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
 * Crea un fondo de respaldo si no se puede cargar la imagen
 */
const createFallbackBackground = (pdf, pageWidth, pageHeight, isWinner) => {
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
 * Detecta si es un certificado de reconocimiento
 */
const isRecognitionCertificate = (certificateData) => {
  return certificateData.isWinner || 
         certificateData.category === 'originality' ||
         certificateData.category === 'creativity' ||
         certificateData.category === 'narrative' ||
         certificateData.category === 'aesthetics' ||
         certificateData.category === 'sound' ||
         certificateData.gameName;
};

/**
 * Función principal para agregar texto al certificado
 */
const addCertificateText = (pdf, certificateData, pageWidth, pageHeight) => {
  const centerX = pageWidth / 2;
  
  pdf.setFont('helvetica');
  
  console.log('Certificate generation data:', {
    category: certificateData.category,
    isWinner: certificateData.isWinner,
    gameName: certificateData.gameName,
    gameLink: certificateData.gameLink,
    customTitle: certificateData.customTitle,
    isRecognition: isRecognitionCertificate(certificateData)
  });
  
  // Verificar si es un certificado personalizado
  if (certificateData.customTitle || certificateData.customMainText) {
    addCustomCertificateText(pdf, certificateData, pageWidth, pageHeight, centerX);
  } 
  else if (isRecognitionCertificate(certificateData)) {
    addRecognitionCertificateText(pdf, certificateData, pageWidth, pageHeight, centerX);
  } else {
    addParticipationCertificateText(pdf, certificateData, pageWidth, pageHeight, centerX);
  }
  
  addFooterInfo(pdf, certificateData, pageWidth, pageHeight);
};

/**
 * Agrega texto para certificados personalizados
 */
const addCustomCertificateText = (pdf, certificateData, pageWidth, pageHeight, centerX) => {
  let yPosition = 30;
  
  // Título personalizado
  if (certificateData.customTitle || certificateData.title) {
    pdf.setFontSize(24);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text(certificateData.customTitle || certificateData.title, centerX, yPosition, { align: 'center' });
    yPosition += 20;
  }
  
  // Subtítulo personalizado
  if (certificateData.customSubtitle || certificateData.subtitle) {
    pdf.setFontSize(18);
    pdf.setTextColor(0, 252, 100);
    pdf.setFont('helvetica', 'bold');
    pdf.text(certificateData.customSubtitle || certificateData.subtitle, centerX, yPosition, { align: 'center' });
    yPosition += 20;
  }
  
  // Contenido principal personalizado
  if (certificateData.customMainText || certificateData.mainText) {
    let text = certificateData.customMainText || certificateData.mainText;
    
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
        yPosition += 5;
        return;
      }
      
      // Detectar si la línea contiene múltiples nombres (para ajustar formato)
      const hasMultipleNames = line.includes(' y ') && line.includes(',');
      const isNameLine = line.includes(certificateData.userName) && certificateData.userName.includes(' y ');
      
      if (line.includes('LO LOGRASTE') || 
          line.includes('lo lograste') ||
          line.includes('lo lograron') ||
          line.includes('no se fuerza, se nota') ||
          line.includes('no hay límites') ||
          line.includes('lo entendió perfectamente') ||
          line.includes('con intención') ||
          line.includes('conduce') ||
          line.match(/\*\*.*\*\*/)) {
        
        const parts = line.split(/(\*\*.*?\*\*|LO LOGRASTE|lo lograste|lo lograron|no se fuerza, se nota|no hay límites|lo entendió perfectamente|con intención|conduce)/);
        let xOffset = 0;
        const startX = centerX - (pdf.getTextWidth(line.replace(/\*\*/g, '')) / 2);
        
        parts.forEach(part => {
          if (part.match(/\*\*.*\*\*|LO LOGRASTE|lo lograste|lo lograron|no se fuerza, se nota|no hay límites|lo entendió perfectamente|con intención|conduce/)) {
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
      } else if (isNameLine || hasMultipleNames) {
        // Para líneas con múltiples nombres, usar un tamaño de fuente ligeramente menor si es muy largo
        const textWidth = pdf.getTextWidth(line);
        if (textWidth > pageWidth - 60) {
          pdf.setFontSize(10);
        }
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(200, 200, 200);
        pdf.text(line, centerX, yPosition, { align: 'center' });
        
        // Restaurar tamaño de fuente
        pdf.setFontSize(12);
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(200, 200, 200);
        pdf.text(line, centerX, yPosition, { align: 'center' });
      }
      
      yPosition += 8;
    });
  }
  
  // Firma personalizada
  if (certificateData.customSignature || certificateData.signature) {
    yPosition += 10;
    pdf.setFontSize(13);
    pdf.setTextColor(0, 252, 100);
    pdf.setFont('helvetica', 'bold');
    pdf.text(certificateData.customSignature || certificateData.signature, centerX, yPosition, { align: 'center' });
  }
};

/**
 * Agrega texto para certificados de reconocimiento
 */
const addRecognitionCertificateText = (pdf, certificateData, pageWidth, pageHeight, centerX) => {
  // Título con emoji
  pdf.setFontSize(24);
  pdf.setTextColor(255, 215, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.text('🏆 CERTIFICADO DE RECONOCIMIENTO', centerX, 25, { align: 'center' });
  
  // Subtítulo de categoría
  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  const categoryName = getCategoryName(certificateData.category);
  pdf.text(`Mención Especial a la ${categoryName}`, centerX, 40, { align: 'center' });
  
  // Nombre del juego destacado
  const displayName = certificateData.gameName || certificateData.userName;
  
  let gameNameSize = 42;
  pdf.setFont('helvetica', 'bold');
  
  let testWidth = pdf.getTextWidth(displayName);
  while (testWidth > pageWidth - 80 && gameNameSize > 20) {
    gameNameSize -= 2;
    pdf.setFontSize(gameNameSize);
    testWidth = pdf.getTextWidth(displayName);
  }
  
  pdf.setFontSize(gameNameSize);
  pdf.setTextColor(255, 255, 255);
  pdf.text(displayName, centerX, 65, { align: 'center' });
  
  // Contenido descriptivo
  pdf.setFontSize(12);
  pdf.setTextColor(200, 200, 200);
  pdf.setFont('helvetica', 'normal');
  
  const recognitionText = [
    'Se otorga este reconocimiento por crear un juego excepcional',
    'que se destaca por su calidad, creatividad e innovación.',
    '',
    'Tu trabajo demuestra talento y dedicación excepcionales.'
  ];
  
  let yPosition = 85;
  recognitionText.forEach((line) => {
    if (line === '') {
      yPosition += 8;
      return;
    }
    pdf.text(line, centerX, yPosition, { align: 'center' });
    yPosition += 8;
  });
  
  // Información del link del juego (si existe)
  if (certificateData.gameLink) {
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(180, 180, 180);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Escanea el código QR para jugar', centerX, yPosition, { align: 'center' });
  }
  
  // Firma
  pdf.setFontSize(13);
  pdf.setTextColor(0, 252, 100);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Jurado de ${certificateData.jamName}`, centerX, yPosition + 20, { align: 'center' });
};

/**
 * Agrega texto para certificados de participación
 */
const addParticipationCertificateText = (pdf, certificateData, pageWidth, pageHeight, centerX) => {
  // Título
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Certificado de Participación', centerX, 30, { align: 'center' });
  
  // Nombre de la jam
  pdf.setFontSize(28);
  pdf.setTextColor(0, 252, 100);
  pdf.setFont('helvetica', 'bold');
  pdf.text(certificateData.jamName, centerX, 50, { align: 'center' });
  
  // "Este certificado se otorga a:"
  pdf.setFontSize(12);
  pdf.setTextColor(220, 220, 220);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Este certificado se otorga a:', centerX, 70, { align: 'center' });
  
  // Nombre del participante
  pdf.setFontSize(32);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  
  const nameWidth = pdf.getTextWidth(certificateData.userName);
  if (nameWidth > pageWidth - 40) {
    pdf.setFontSize(24);
  }
  
  pdf.text(certificateData.userName, centerX, 90, { align: 'center' });
  
  // Párrafo principal
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
  mainText.forEach((line) => {
    if (line === 'Pero aún así, LO LOGRASTE.') {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
    } else if (line === '') {
      yPosition += 8;
      return;
    }
    
    pdf.text(line, centerX, yPosition, { align: 'center' });
    yPosition += 8;
    
    if (line === 'Pero aún así, LO LOGRASTE.') {
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(200, 200, 200);
    }
  });
  
  // Despedida
  pdf.setFontSize(11);
  pdf.setTextColor(180, 180, 180);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Con admiración y un poquito de envidia,', centerX, yPosition + 15, { align: 'center' });
  
  // Firma
  pdf.setFontSize(13);
  pdf.setTextColor(0, 252, 100);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Organización de ${certificateData.jamName}`, centerX, yPosition + 28, { align: 'center' });
};

/**
 * Agrega información del footer
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
 * Obtiene el nombre de la categoría
 */
const getCategoryName = (category) => {
  const categories = {
    'originality': 'Originalidad',
    'creativity': 'Creatividad', 
    'narrative': 'Narrativa',
    'aesthetics': 'Dirección de Arte',
    'sound': 'Música y Sonido'
  };
  
  return categories[category] || 'Excelencia';
};

/**
 * Función principal para generar certificado con imagen personalizada
 */
export const generateCertificateWithCustomBackground = async (certificateData) => {
  try {
    const backgroundImageUrl = '/images/certificate-background.png';
    await generateCertificatePDF(certificateData, backgroundImageUrl);
  } catch (error) {
    console.error('Error generating certificate with custom background:', error);
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
    gameLink: certificate.gameLink || null, // Nuevo campo
    theme: certificate.theme || null,
    // Campos personalizados
    customTitle: certificate.customTitle || certificate.title || null,
    customSubtitle: certificate.customSubtitle || certificate.subtitle || null,
    customMainText: certificate.customMainText || certificate.mainText || null,
    customSignature: certificate.customSignature || certificate.signature || null
  };
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