'use client';

import html2canvas from 'html2canvas-pro';
import { PDFDocument, rgb } from 'pdf-lib';

export interface PDFExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Captures an HTML element and converts it to a PDF
 */
export async function exportToPDF(
  element: HTMLElement,
  options: PDFExportOptions
): Promise<void> {
  const {
    filename,
    title,
    subtitle,
    orientation = 'portrait',
  } = options;

  // Capture the element as a canvas
  const canvas = await html2canvas(element, {
    scale: 2, // Higher quality
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Page dimensions (A4)
  const pageWidth = orientation === 'landscape' ? 841.89 : 595.28;
  const pageHeight = orientation === 'landscape' ? 595.28 : 841.89;

  // Margins
  const margin = 40;
  const headerHeight = title ? 80 : 20;

  // Calculate available space for content
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2 - headerHeight;

  // Calculate image dimensions maintaining aspect ratio
  const canvasAspectRatio = canvas.width / canvas.height;
  let imgWidth = contentWidth;
  let imgHeight = contentWidth / canvasAspectRatio;

  // If image is too tall, scale down
  if (imgHeight > contentHeight) {
    imgHeight = contentHeight;
    imgWidth = contentHeight * canvasAspectRatio;
  }

  // Center the image horizontally
  const imgX = margin + (contentWidth - imgWidth) / 2;
  const imgY = margin;

  // Convert canvas to PNG bytes
  const imageBytes = await new Promise<Uint8Array>((resolve) => {
    canvas.toBlob(async (blob) => {
      if (blob) {
        const arrayBuffer = await blob.arrayBuffer();
        resolve(new Uint8Array(arrayBuffer));
      }
    }, 'image/png');
  });

  // Embed the image
  const image = await pdfDoc.embedPng(imageBytes);

  // Add page
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  // Add title if provided
  if (title) {
    page.drawText(title, {
      x: margin,
      y: pageHeight - margin - 20,
      size: 20,
      color: rgb(0.1, 0.1, 0.1),
    });

    if (subtitle) {
      page.drawText(subtitle, {
        x: margin,
        y: pageHeight - margin - 45,
        size: 12,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    // Add generation date
    const dateText = `Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    page.drawText(dateText, {
      x: margin,
      y: pageHeight - margin - 65,
      size: 10,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // Draw the captured image
  page.drawImage(image, {
    x: imgX,
    y: imgY,
    width: imgWidth,
    height: imgHeight,
  });

  // Save and download
  const pdfBytes = await pdfDoc.save();
  // Use slice to create a pure ArrayBuffer for Blob compatibility
  const arrayBuffer = pdfBytes.buffer.slice(
    pdfBytes.byteOffset,
    pdfBytes.byteOffset + pdfBytes.byteLength
  ) as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Hook-friendly wrapper that returns export function with loading state
 */
export function createPDFExporter(elementId: string, options: PDFExportOptions) {
  return async (): Promise<void> => {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }
    await exportToPDF(element, options);
  };
}
