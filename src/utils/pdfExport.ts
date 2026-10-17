import { jsPDF } from 'jspdf';

export interface NoteMetadata {
  chapterName: string;
  studentClass?: string;
  board?: string;
  subject?: string;
  language?: string;
  level?: string;
  length?: string;
  learningPurpose?: string;
  examFocus?: string;
  generatedAt?: string;
}

export function downloadNotesAsPdf(title: string, content: string, meta?: NoteMetadata) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Primary brand colors
  const primaryColor = [37, 99, 235]; // Blue 600
  const secondaryColor = [30, 41, 59]; // Slate 800
  const lightBg = [241, 245, 249]; // Slate 100
  const accentColor = [14, 165, 233]; // Sky 500

  function checkNewPage(neededSpace: number = 10) {
    if (cursorY + neededSpace > pageHeight - margin - 12) {
      doc.addPage();
      cursorY = margin;
      drawHeaderFooter();
    }
  }

  function drawHeaderFooter() {
    // Top subtle bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 4, 'F');

    // Bottom footer
    const totalPages = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('VidyaAI Smart Notes • Academic Companion', margin, pageHeight - 8);
    doc.text(`Page ${totalPages}`, pageWidth - margin - 12, pageHeight - 8);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
  }

  // Draw header for first page
  drawHeaderFooter();

  // Document Title Banner
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, cursorY, contentWidth, 26, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, cursorY, contentWidth, 26, 3, 3, 'S');

  // Title Text
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  const safeTitle = (title || 'Smart Academic Notes').slice(0, 75);
  doc.text(safeTitle, margin + 5, cursorY + 9);

  // Metadata badges
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const metaParts = [];
  if (meta?.studentClass) metaParts.push(`Class: ${meta.studentClass}`);
  if (meta?.board) metaParts.push(`Board: ${meta.board}`);
  if (meta?.subject) metaParts.push(`Subject: ${meta.subject}`);
  const levelText = meta?.level || meta?.length;
  if (levelText) metaParts.push(`Level: ${levelText}`);
  const purposeText = meta?.learningPurpose || meta?.examFocus;
  if (purposeText) metaParts.push(`Purpose: ${purposeText}`);
  if (meta?.language) metaParts.push(`Lang: ${meta.language}`);
  const metaLine = metaParts.length > 0 ? metaParts.join('  |  ') : 'Comprehensive Student Study Notes';
  doc.text(metaLine, margin + 5, cursorY + 17);

  const dateStr = meta?.generatedAt ? new Date(meta.generatedAt).toLocaleDateString() : new Date().toLocaleDateString();
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Created on: ${dateStr}`, margin + 5, cursorY + 22);

  cursorY += 34;

  // Process markdown lines into readable PDF formatting
  const rawLines = content.split('\n');

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    if (!line) {
      cursorY += 3;
      continue;
    }

    // Main section header ##
    if (line.startsWith('## ')) {
      checkNewPage(18);
      const text = line.replace(/^##\s*/, '').replace(/\*\*/g, '');
      
      // Section accent bar
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(margin, cursorY, 3, 7, 'F');

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(text, margin + 6, cursorY + 5.5);
      cursorY += 10;
      continue;
    }

    // Sub section header ###
    if (line.startsWith('### ')) {
      checkNewPage(14);
      const text = line.replace(/^###\s*/, '').replace(/\*\*/g, '');
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(text, margin + 3, cursorY + 5);
      cursorY += 8;
      continue;
    }

    // Bullet points
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      checkNewPage(8);
      const text = line.replace(/^[-*•]\s*/, '').replace(/\*\*/g, '');
      const wrapped = doc.splitTextToSize(text, contentWidth - 8);

      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.circle(margin + 2.5, cursorY + 2.5, 0.9, 'F');

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      for (let j = 0; j < wrapped.length; j++) {
        doc.text(wrapped[j], margin + 6, cursorY + 3.5);
        cursorY += 5;
        if (j < wrapped.length - 1) checkNewPage(6);
      }
      cursorY += 1.5;
      continue;
    }

    // Numbered list item: 1. or 2.
    const numMatch = line.match(/^(\d+\.)\s*(.*)/);
    if (numMatch) {
      checkNewPage(8);
      const numPrefix = numMatch[1];
      const restText = numMatch[2].replace(/\*\*/g, '');
      const wrapped = doc.splitTextToSize(restText, contentWidth - 10);

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(numPrefix, margin + 2, cursorY + 3.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      for (let j = 0; j < wrapped.length; j++) {
        doc.text(wrapped[j], margin + 9, cursorY + 3.5);
        cursorY += 5;
        if (j < wrapped.length - 1) checkNewPage(6);
      }
      cursorY += 1.5;
      continue;
    }

    // Code block or equation
    if (line.startsWith('```') || line.endsWith('```')) {
      continue;
    }

    // Standard paragraph or table line
    checkNewPage(7);
    const cleanLine = line.replace(/\*\*/g, '').replace(/\|/g, '  |  ');
    const wrapped = doc.splitTextToSize(cleanLine, contentWidth);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    for (let j = 0; j < wrapped.length; j++) {
      doc.text(wrapped[j], margin, cursorY + 3.5);
      cursorY += 5;
      if (j < wrapped.length - 1) checkNewPage(6);
    }
  }

  // Update total page count on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 8);
  }

  const safeFilename = (title || 'VidyaAI_Smart_Notes')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40) + '.pdf';
  doc.save(safeFilename);
}
