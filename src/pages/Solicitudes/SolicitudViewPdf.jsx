import React, { useRef, useEffect } from 'react';
import { message } from 'antd';
import { jsPDF } from 'jspdf';
import logo from '../../assets/logo.png';
import logoMaigas from '../../assets/LOGO_MAIGAS_ALTA.png';
import { formatRut, formatDate } from './constants';

// Constantes para colores
const COLORS = {
    primary: [200, 0, 0],
    secondary: [40, 40, 40],
    text: [0, 0, 0],
    lightText: [80, 80, 80],
    background: [255, 255, 255],
};

const SolicitudViewPdf = ({ solicitud, tecnicoAsignado, estadoAsignado, garantiaActiva, onFinish }) => {
    const contentRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleExportPDF();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const getLabel = (value, defaultText = 'N/A') => {
        if (value === null || value === undefined) return defaultText;
        return String(value);
    };

    const createPdfDocument = () => {
        return new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'letter',
            compress: true
        });
    };

    const addHeaderToPdf = (pdf, pageWidth) => {
        const margin = 50;

        // Fondo del encabezado
        pdf.setFillColor(248, 248, 248);
        pdf.rect(0, 0, pageWidth, 120, 'F');

        // Línea divisoria
        pdf.setDrawColor(...COLORS.primary);
        pdf.setLineWidth(2);
        pdf.line(0, 120, pageWidth, 120);

        // Logo principal
        const logoSize = 60;
        const logoX = margin;
        const logoY = 25;
        pdf.addImage(logo, 'PNG', logoX, logoY, logoSize, logoSize);

        // Logo Maigas
        const logoMaigasWidth = 80;
        const logoMaigasHeight = 30;
        const logoMaigasX = pageWidth - margin - logoMaigasWidth;
        pdf.addImage(logoMaigas, 'PNG', logoMaigasX, logoY + 10, logoMaigasWidth, logoMaigasHeight);

        // Títulos
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...COLORS.text);
        pdf.setFontSize(18);
        pdf.text('INFORME SERVICIO TÉCNICO', pageWidth / 2, logoY + 25, { align: 'center' });

        pdf.setFontSize(16);
        pdf.text(`OT N° ${solicitud.id}`, pageWidth / 2, logoY + 50, { align: 'center' });

        // Información de la empresa
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...COLORS.lightText);
        pdf.text('Servicio Técnico MAIGAS', logoX, logoY + logoSize + 8);
        pdf.text('Santiago, Chile', logoX, logoY + logoSize + 17);
        pdf.text('serviciotecnico@maigas.cl', logoX, logoY + logoSize + 26);

        // Fecha del informe
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...COLORS.secondary);
        const infoX = pageWidth - margin;
        pdf.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, infoX, logoY + logoSize + 17, { align: 'right' });

        return 130;
    };

    const drawSectionTitle = (pdf, title, y, pageWidth, margin) => {
        pdf.setFillColor(...COLORS.primary);
        pdf.rect(margin, y, pageWidth - margin * 2, 22, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255);
        pdf.text(title, margin + 15, y + 15);

        pdf.setFillColor(255, 255, 255);
        pdf.circle(margin + 8, y + 11, 2, 'F');

        return y + 30;
    };

    const drawLabelValue = (pdf, label, value, y, margin, pageWidth) => {
        const valueStr = String(value || 'N/A');

        // Fondo alternado para mejorar legibilidad
        if (y % 40 < 20 && pageWidth) {
            pdf.setFillColor(248, 248, 248);
            pdf.rect(margin, y - 12, pageWidth - margin * 2, 20, 'F');
        }

        // Etiqueta
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...COLORS.secondary);
        pdf.text(label, margin + 15, y);

        // Valor
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...COLORS.text);
        const valueX = margin + 150;
        pdf.text(valueStr, valueX, y);

        return y + 20;
    };

    const addClienteSection = (pdf, startY, pageWidth, margin) => {
        let y = drawSectionTitle(pdf, 'INFORMACIÓN DEL CLIENTE', startY, pageWidth, margin);

        // RUT del cliente
        let rutMostrar = 'N/A';
        if (solicitud.codaux) {
            rutMostrar = formatRut(solicitud.codaux);
        }

        y = drawLabelValue(pdf, 'RUT Cliente:', rutMostrar, y, margin, pageWidth);
        y = drawLabelValue(pdf, 'Nombre Cliente:', getLabel(solicitud.nomaux), y, margin, pageWidth);

        if (solicitud.tipo_cliente) {
            y = drawLabelValue(pdf, 'Tipo de Cliente:', getLabel(solicitud.tipo_cliente), y, margin, pageWidth);
        }

        if (solicitud.nombre) {
            y = drawLabelValue(pdf, 'Contacto:', getLabel(solicitud.nombre), y, margin, pageWidth);
        }

        if (solicitud.telefono) {
            y = drawLabelValue(pdf, 'Teléfono:', getLabel(solicitud.telefono), y, margin, pageWidth);
        }

        if (solicitud.mail) {
            y = drawLabelValue(pdf, 'Email:', getLabel(solicitud.mail), y, margin, pageWidth);
        }

        y = drawLabelValue(pdf, 'Dirección:', getLabel(solicitud.dir_visita), y, margin, pageWidth);

        return y + 5;
    };

    const addProblemaSection = (pdf, startY, pageWidth, margin) => {
        let y = drawSectionTitle(pdf, 'DETALLE DEL PROBLEMA Y EQUIPO', startY, pageWidth, margin);

        y = drawLabelValue(pdf, 'Tipo de Solicitud:', getLabel(solicitud.tipo), y, margin, pageWidth);

        if (solicitud.prioridad) {
            y = drawLabelValue(pdf, 'Prioridad:', getLabel(solicitud.prioridad), y, margin, pageWidth);
        }

        // Descripción del problema
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...COLORS.secondary);
        pdf.text('Descripción:', margin + 15, y);

        const descX = margin + 150;
        const maxWidth = pageWidth - descX - margin;

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...COLORS.text);
        const desc = pdf.splitTextToSize(getLabel(solicitud.desc_motivo), maxWidth);
        pdf.text(desc, descX, y);

        y += desc.length * 13 + 5;

        // Datos del producto
        if (solicitud.codprod) {
            y = drawLabelValue(pdf, 'Código Producto:', getLabel(solicitud.codprod), y, margin, pageWidth);
        }

        if (solicitud.desprod) {
            y = drawLabelValue(pdf, 'Descripción Prod.:', getLabel(solicitud.desprod), y, margin, pageWidth);
        }

        y = drawLabelValue(pdf, 'N° Serie:', getLabel(solicitud.nro_serie), y, margin, pageWidth);

        return y + 5;
    };

    const addTecnicoSection = (pdf, startY, pageWidth, margin) => {
        let y = drawSectionTitle(pdf, 'INFORMACIÓN DE AGENDAMIENTO', startY, pageWidth, margin);
        const tecnico = tecnicoAsignado || {};

        y = drawLabelValue(pdf, 'Técnico Asignado:', tecnico.nombre_completo || 'No asignado', y, margin, pageWidth);

        if (tecnicoAsignado) {
            if (tecnico.especialidad) {
                y = drawLabelValue(pdf, 'Especialidad:', getLabel(tecnico.especialidad), y, margin, pageWidth);
            }
            if (tecnico.tipo_tecnico) {
                y = drawLabelValue(pdf, 'Tipo:', getLabel(tecnico.tipo_tecnico), y, margin, pageWidth);
            }
        }

        if (solicitud.fecha_agendamiento) {
            y = drawLabelValue(pdf, 'Fecha Agendamiento:', formatDate(solicitud.fecha_agendamiento), y, margin, pageWidth);
        }

        y = drawLabelValue(pdf, 'Área de Trabajo:', getLabel(solicitud.area_trab), y, margin, pageWidth);

        if (solicitud.ejecucion) {
            y = drawLabelValue(pdf, 'Estado de Ejecución:', getLabel(solicitud.ejecucion), y, margin, pageWidth);
        }

        // Seguimiento
        y = drawLabelValue(pdf, 'Cliente Contactado:', solicitud.cliente_contactado === 'S' ? 'Sí' : 'No', y, margin, pageWidth);
        y = drawLabelValue(pdf, 'Distribuidor Contactado:', solicitud.distribuidor_contactado === 'S' ? 'Sí' : 'No', y, margin, pageWidth);
        y = drawLabelValue(pdf, 'Técnico Confirmado:', solicitud.tecnico_confirmado === 'S' ? 'Sí' : 'No', y, margin, pageWidth);
        y = drawLabelValue(pdf, 'Reporte Enviado:', solicitud.reporte_enviado === 'S' ? 'Sí' : 'No', y, margin, pageWidth);

        // Estado
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...COLORS.secondary);
        pdf.text('Estado Actual:', margin + 15, y);

        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...COLORS.primary);
        const estadoText = estadoAsignado ? estadoAsignado.nombre : getLabel(solicitud.estado);
        pdf.text(String(estadoText), margin + 150, y);

        if (solicitud.motivo_estado) {
            y += 20;
            y = drawLabelValue(pdf, 'Motivo del Estado:', getLabel(solicitud.motivo_estado), y, margin, pageWidth);
        }

        return y + 25;
    };

    const addAdminSection = (pdf, startY, pageWidth, pageHeight, margin) => {
        let y = drawSectionTitle(pdf, 'INFORMACIÓN ADMINISTRATIVA', startY, pageWidth, margin);

        y = drawLabelValue(pdf, 'N° Factura:', solicitud.factura ? String(solicitud.factura) : 'N/A', y, margin, pageWidth);

        if (solicitud.factura_dist) {
            y = drawLabelValue(pdf, 'Factura Distribuidor:', String(solicitud.factura_dist), y, margin, pageWidth);
        }

        y = drawLabelValue(pdf, 'Fecha Factura:', solicitud.fecha_fact ? formatDate(solicitud.fecha_fact) : 'N/A', y, margin, pageWidth);

        if (solicitud.facturable) {
            y = drawLabelValue(pdf, 'Facturable:', getLabel(solicitud.facturable), y, margin, pageWidth);
        }

        // Estado de garantía
        if (y % 40 < 20) {
            pdf.setFillColor(248, 248, 248);
            pdf.rect(margin, y - 12, pageWidth - margin * 2, 20, 'F');
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...COLORS.secondary);
        pdf.text('Estado Garantía:', margin + 15, y);

        if (solicitud.fecha_fact) {
            pdf.setTextColor(garantiaActiva ? COLORS.secondary[0] : COLORS.primary[0], 0, 0);
            pdf.text(garantiaActiva ? 'Garantía activa' : 'Garantía vencida', margin + 150, y);
        } else {
            pdf.text('N/A', margin + 150, y);
        }

        y += 30;

        // Sección para resolución técnica (MODIFICACIÓN INICIA AQUÍ)
        const resolutionTitleY = y;
        y = drawSectionTitle(pdf, 'RESOLUCIÓN TÉCNICA', y, pageWidth, margin);
        y += 5;
        pdf.setDrawColor(...COLORS.lightText);
        pdf.setLineWidth(0.5);

        const text = getLabel(solicitud.resolucion_tecnica, ''); // Asume que tienes un campo 'resolucion_tecnica'
        const maxWidth = pageWidth - margin * 2;
        const lineHeight = 15;
        const splittedText = pdf.splitTextToSize(text, maxWidth - 10); // небольшой отступ

        const startYRect = y;
        const rectHeight = splittedText.length * lineHeight + 10;
        pdf.rect(margin, startYRect, maxWidth, rectHeight, 'S');

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...COLORS.text);
        let currentY = y + 5;
        splittedText.forEach(line => {
            // MODIFICACIÓN: Calcular el espacio disponible considerando el footer
            if (currentY + lineHeight > pageHeight - 50) {
                pdf.addPage();
                addHeaderToPdf(pdf, pageWidth); // Re-add header
                // MODIFICACIÓN: Resetear Y después del encabezado
                currentY = 130 + 10; // Después del header + un pequeño margen
            }
            pdf.text(line, margin + 5, currentY);
            currentY += lineHeight;
        });

        // MODIFICACIÓN: Actualizar y después de agregar el texto
        y = currentY + 10;

        // Sección para firmas
        const firmaOffset = 120;
        pdf.setDrawColor(...COLORS.secondary);
        pdf.setLineWidth(0.5);

        // MODIFICACIÓN: Asegurar que las firmas no se superpongan si la resolución es larga
        const firmaY = Math.max(y + 20, pageHeight - 80); // Asegura espacio para el footer
        y = firmaY - 20; // Ajusta y para la línea de firma

        pdf.line(margin + 50, y, margin + 50 + firmaOffset, y);
        pdf.setTextColor(...COLORS.text);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text('Firma del Cliente', margin + 50 + (firmaOffset / 2), y + 15, { align: 'center' });

        pdf.line(pageWidth - margin - 50 - firmaOffset, y, pageWidth - margin - 50, y);
        pdf.text('Firma del Técnico', pageWidth - margin - 50 - (firmaOffset / 2), y + 15, { align: 'center' });
    };

    const addFooterToPdf = (pdf, pageWidth, pageHeight, margin, pageNumber) => {
        pdf.setFillColor(248, 248, 248);
        pdf.rect(0, pageHeight - 50, pageWidth, 50, 'F');

        pdf.setDrawColor(...COLORS.primary);
        pdf.setLineWidth(1);
        pdf.line(0, pageHeight - 50, pageWidth, pageHeight - 50);

        pdf.setFontSize(8);
        pdf.setTextColor(...COLORS.lightText);
        pdf.text('Servicio Técnico MAIGAS', pageWidth / 2, pageHeight - 35, { align: 'center' });
        pdf.text('Teléfono: +56 2 2222 3333 • Email: serviciotecnico@maigas.cl • www.maigas.cl', pageWidth / 2, pageHeight - 23, { align: 'center' });

        pdf.setTextColor(...COLORS.primary);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Página ${pageNumber}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
    };

    const handleExportPDF = async () => {
        try {
            message.loading({ content: 'Generando PDF...', key: 'pdfLoading' });

            const pdf = createPdfDocument();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 50;

            let y = addHeaderToPdf(pdf, pageWidth);
            y = addClienteSection(pdf, y, pageWidth, margin);
            y = addProblemaSection(pdf, y, pageWidth, margin);
            y = addTecnicoSection(pdf, y, pageWidth, margin);
            addAdminSection(pdf, y, pageWidth, pageHeight, margin);
            addFooterToPdf(pdf, pageWidth, pageHeight, margin, pdf.internal.getNumberOfPages());

            pdf.save(`solicitud_${solicitud.id}.pdf`);

            message.success({ content: 'PDF generado correctamente', key: 'pdfLoading' });
            if (onFinish) onFinish();
        } catch (error) {
            console.error('Error al generar PDF:', error);
            message.error({ content: 'Error al generar el PDF: ' + error.message, key: 'pdfLoading' });
            if (onFinish) onFinish();
        }
    };

    return (
        <div className="pdf-container" ref={contentRef}>
            <div className="documento-carta">
                <div className="loading-container">
                    <div className="loading-icon"></div>
                    <div className="loading-message">Generando PDF...</div>
                </div>
            </div>
            <style jsx="true">{`
                .pdf-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 9999;
                    background: rgba(255, 255, 255, 0.95);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .loading-icon {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(200, 0, 0, 0.3);
                    border-radius: 50%;
                    border-top: 3px solid #c80000;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }
                .loading-message {
                    font-size: 20px;
                    font-weight: 600;
                    color: #c80000;
                    font-family: 'Helvetica', sans-serif;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default SolicitudViewPdf;