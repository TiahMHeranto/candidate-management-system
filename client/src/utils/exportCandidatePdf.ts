import jsPDF from 'jspdf';
import type { Candidate } from '../types';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const sanitizeFilename = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase() || 'profil';

/**
 * Build a clean A4 PDF from candidate data (no DOM screenshot).
 * Avoids html2canvas issues with Tailwind v4 oklch colors / dark mode.
 */
export const exportCandidatePdf = async (candidate: Candidate): Promise<void> => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const statusLabel =
    candidate.status === 'validated' ? 'Validé' : 'En attente';

  let y = MARGIN;

  // Brand header bar
  pdf.setFillColor(15, 23, 42); // slate-900
  pdf.rect(0, 0, PAGE_WIDTH, 36, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('TiahMHeranto Company', MARGIN, 16);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(203, 213, 225); // slate-300
  pdf.text('Fiche candidat', MARGIN, 26);

  y = 48;

  // Name + status
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  const nameLines = pdf.splitTextToSize(candidate.name, CONTENT_WIDTH - 40);
  pdf.text(nameLines, MARGIN, y);
  y += nameLines.length * 9 + 4;

  // Status badge
  const badgeW = pdf.getTextWidth(statusLabel) + 8;
  if (candidate.status === 'validated') {
    pdf.setFillColor(209, 250, 229); // emerald-100
    pdf.setTextColor(6, 95, 70);
  } else {
    pdf.setFillColor(254, 243, 199); // amber-100
    pdf.setTextColor(146, 64, 14);
  }
  pdf.roundedRect(MARGIN, y - 5, badgeW, 8, 2, 2, 'F');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text(statusLabel, MARGIN + 4, y);

  y += 16;

  // Divider
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.4);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 12;

  const createdAt = candidate.createdAt
    ? new Date(candidate.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const rows: Array<[string, string]> = [
    ['Email', candidate.email || '—'],
    ['Téléphone', candidate.phone || '—'],
    ['Poste', candidate.position || '—'],
    ['Expérience', `${candidate.experience ?? 0} ans`],
    ['Date d’ajout', createdAt],
  ];

  pdf.setFontSize(11);
  for (const [label, value] of rows) {
    if (y > PAGE_HEIGHT - 40) {
      pdf.addPage();
      y = MARGIN;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.text(label, MARGIN, y);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(15, 23, 42);
    const valueLines = pdf.splitTextToSize(String(value), CONTENT_WIDTH - 45);
    pdf.text(valueLines, MARGIN + 45, y);
    y += Math.max(8, valueLines.length * 6) + 4;
  }

  y += 6;
  pdf.setDrawColor(226, 232, 240);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 12;

  // Skills
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(13);
  pdf.text('Compétences', MARGIN, y);
  y += 10;

  const skills =
    Array.isArray(candidate.skills) && candidate.skills.length > 0
      ? candidate.skills
      : ['Aucune compétence renseignée'];

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(51, 65, 85);

  let x = MARGIN;
  const skillGap = 3;
  const skillPadX = 3;
  const skillH = 8;

  for (const skill of skills) {
    const textW = pdf.getTextWidth(skill);
    const boxW = textW + skillPadX * 2;

    if (x + boxW > PAGE_WIDTH - MARGIN) {
      x = MARGIN;
      y += skillH + 4;
    }

    if (y > PAGE_HEIGHT - 30) {
      pdf.addPage();
      y = MARGIN;
      x = MARGIN;
    }

    pdf.setFillColor(241, 245, 249); // slate-100
    pdf.roundedRect(x, y - 5.5, boxW, skillH, 1.5, 1.5, 'F');
    pdf.setTextColor(30, 41, 59);
    pdf.text(skill, x + skillPadX, y);
    x += boxW + skillGap;
  }

  // Footer on every page
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `TiahMHeranto Company  ·  Page ${i}/${pageCount}`,
      PAGE_WIDTH / 2,
      PAGE_HEIGHT - 10,
      { align: 'center' }
    );
  }

  pdf.save(`candidat-${sanitizeFilename(candidate.name)}.pdf`);
};
