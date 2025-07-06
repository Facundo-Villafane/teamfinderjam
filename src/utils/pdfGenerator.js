// src/utils/pdfGenerator.js - Generador de certificados en PDF
import jsPDF from 'jspdf';

// Función principal para generar certificado en PDF
export const generateCertificatePDF = async ({
  userName,
  jamName,
  category,
  isWinner,
  date,
  certificateId
}) => {
  try {
    // Crear nuevo documento PDF en orientación horizontal
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Dimensiones del PDF
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Colores
    const primaryColor = '#0fc064';
    const secondaryColor = '#1a1a2e';
    const goldColor = '#FFD700';
    
    // Configurar fuentes
    pdf.setFont('helvetica');
    
    // ===== FONDO Y BORDES =====
    
    // Fondo principal
    pdf.setFillColor(248, 248, 248);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Borde exterior decorativo
    pdf.setDrawColor(15, 192, 100);
    pdf.setLineWidth(3);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
    
    // Borde interior
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(1);
    pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);
    
    // ===== HEADER =====
    
    // Logo/Icono UTN (simulado con texto)
    pdf.setFillColor(15, 192, 100);
    pdf.circle(pageWidth / 2, 35, 12, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('UTN', pageWidth / 2, 40, { align: 'center' });
    
    // Título principal
    pdf.setTextColor(26, 26, 46);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    
    if (isWinner) {
      pdf.text('CERTIFICADO DE RECONOCIMIENTO', pageWidth / 2, 60, { align: 'center' });
      
      // Estrellas decorativas para ganadores
      pdf.setTextColor(255, 215, 0);
      pdf.setFontSize(20);
      pdf.text('★', pageWidth / 2 - 80, 60, { align: 'center' });
      pdf.text('★', pageWidth / 2 + 80, 60, { align: 'center' });
    } else {
      pdf.text('CERTIFICADO DE PARTICIPACIÓN', pageWidth / 2, 60, { align: 'center' });
    }
    
    // Subtítulo
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('UTN Game Jam Hub', pageWidth / 2, 70, { align: 'center' });
    
    // ===== LÍNEA DECORATIVA =====
    
    pdf.setDrawColor(15, 192, 100);
    pdf.setLineWidth(2);
    pdf.line(pageWidth / 2 - 60, 80, pageWidth / 2 + 60, 80);
    
    // ===== CONTENIDO PRINCIPAL =====
    
    // "Se otorga a"
    pdf.setTextColor(80, 80, 80);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Se otorga a:', pageWidth / 2, 100, { align: 'center' });
    
    // Nombre del usuario
    pdf.setTextColor(26, 26, 46);
    pdf.setFontSize(45);
    pdf.setFont('helvetica', 'bold');
    pdf.text(userName, pageWidth / 2, 120, { align: 'center' });
    
    // Línea bajo el nombre
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(1);
    const nameWidth = pdf.getTextWidth(userName);
    pdf.line(
      (pageWidth - nameWidth) / 2 - 10, 
      125, 
      (pageWidth + nameWidth) / 2 + 10, 
      125
    );
    
    // Texto de reconocimiento
    pdf.setTextColor(80, 80, 80);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    
    if (isWinner) {
      pdf.text('Por su destacada participación y reconocimiento en la categoría:', pageWidth / 2, 140, { align: 'center' });
    } else {
      pdf.text('Por su participación en:', pageWidth / 2, 140, { align: 'center' });
    }
    
    // Categoría (si es reconocimiento)
    if (isWinner) {
      pdf.setTextColor(15, 192, 100);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(category.toUpperCase(), pageWidth / 2, 155, { align: 'center' });
    }
    
    // Nombre de la jam
    pdf.setTextColor(26, 26, 46);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(jamName, pageWidth / 2, isWinner ? 170 : 155, { align: 'center' });
    
    // Descripción adicional
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const descriptionY = isWinner ? 185 : 170;
    
    if (isWinner) {
      pdf.text('Reconociendo la excelencia, creatividad e innovación demostrada', pageWidth / 2, descriptionY, { align: 'center' });
      pdf.text('en el desarrollo de videojuegos durante esta competencia.', pageWidth / 2, descriptionY + 8, { align: 'center' });
    } else {
      pdf.text('En reconocimiento a su participación activa y compromiso', pageWidth / 2, descriptionY, { align: 'center' });
      pdf.text('con el desarrollo de videojuegos y la comunidad estudiantil.', pageWidth / 2, descriptionY + 8, { align: 'center' });
    }
    
    // ===== FOOTER =====
    
    const footerY = pageHeight - 60;
    
    // Fecha
    pdf.setTextColor(80, 80, 80);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    pdf.text(`Otorgado el ${formattedDate}`, 40, footerY);
    
    // Línea de firma (simulada)
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(1);
    pdf.line(pageWidth - 120, footerY - 15, pageWidth - 40, footerY - 15);
    
    pdf.setFontSize(10);
    pdf.text('Coordinación UTN Game Jam Hub', pageWidth - 80, footerY - 5, { align: 'center' });
    
    // ID del certificado
    pdf.setTextColor(180, 180, 180);
    pdf.setFontSize(8);
    pdf.text(`ID: ${certificateId}`, pageWidth - 30, pageHeight - 15, { align: 'right' });
    
    // Logo o marca de agua (opcional)
    pdf.setTextColor(240, 240, 240);
    pdf.setFontSize(60);
    pdf.setFont('helvetica', 'bold');
    pdf.text('UTN', pageWidth / 2, pageHeight / 2 + 20, { 
      align: 'center',
      angle: -45 
    });
    
    // ===== ELEMENTOS DECORATIVOS =====
    
    // Decoraciones en las esquinas
    const decorSize = 8;
    
    // Esquina superior izquierda
    pdf.setFillColor(15, 192, 100);
    pdf.circle(25, 25, decorSize / 2, 'F');
    
    // Esquina superior derecha
    pdf.circle(pageWidth - 25, 25, decorSize / 2, 'F');
    
    // Esquina inferior izquierda
    pdf.circle(25, pageHeight - 25, decorSize / 2, 'F');
    
    // Esquina inferior derecha
    pdf.circle(pageWidth - 25, pageHeight - 25, decorSize / 2, 'F');
    
    // Si es ganador, agregar elementos dorados
    if (isWinner) {
      pdf.setFillColor(255, 215, 0);
      
      // Medallones decorativos
      pdf.circle(40, pageHeight / 2, 6, 'F');
      pdf.circle(pageWidth - 40, pageHeight / 2, 6, 'F');
      
      // Texto en medallones
      pdf.setTextColor(26, 26, 46);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('★', 40, pageHeight / 2 + 2, { align: 'center' });
      pdf.text('★', pageWidth - 40, pageHeight / 2 + 2, { align: 'center' });
    }
    
    // ===== GUARDAR PDF =====
    
    const fileName = `Certificado_${userName.replace(/\s+/g, '_')}_${jamName.replace(/\s+/g, '_')}_${category}.pdf`;
    pdf.save(fileName);
    
    console.log('Certificate PDF generated successfully:', fileName);
    
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw new Error('Error al generar el certificado PDF');
  }
};