import { jsPDF } from 'jspdf';
import { PropertyInput } from './types';
import { formatPrice } from './utils';

export function exportFlyerPdf(flyerText: string, property: PropertyInput): void {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 60;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  const titleLines = doc.splitTextToSize(property.address || 'Property Listing', contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 34 + 10;

  // Price
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129);
  const price = formatPrice(property.listPrice);
  if (price) { doc.text(price, margin, y); y += 30; }
  doc.setTextColor(0, 0, 0);

  // Specs
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  const specs = [
    property.bedrooms && `${property.bedrooms} BD`,
    property.bathrooms && `${property.bathrooms} BA`,
    property.squareFootage && `${property.squareFootage} SF`
  ].filter(Boolean).join('  |  ');
  if (specs) { doc.text(specs, margin, y); y += 30; }

  // Divider
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // Body
  doc.setFontSize(12);
  const bodyLines = doc.splitTextToSize(flyerText, contentWidth);
  doc.text(bodyLines, margin, y);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - margin - 30;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  const agentLine = [property.agentName, property.brokerageName].filter(Boolean).join(' | ');
  if (agentLine) doc.text(agentLine, margin, footerY);

  const filename = `${(property.address || 'listing').replace(/[^a-zA-Z0-9]/g, '_')}_flyer.pdf`;
  doc.save(filename);
}
