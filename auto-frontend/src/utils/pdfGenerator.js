import { jsPDF } from 'jspdf';

const removeDiacritics = (text = '') =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const generateShippingLabel = (data = {}) => {
  const {
    customer = {},
    atelier = {
      name: 'Derstronik Electronic',
      address: 'Soseaua Balcani 53, Chisinau',
      phone: '+373 69 857 294'
    }
  } = data;

  const trackingNumber =
    data.trackingNumber || generateTrackingNumber();

  const serviceName =
    data.serviceName || 'Reparatie electronica auto';

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [148, 105]
  });

  // BORDER
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.5);
  doc.rect(2, 2, 144, 101);

  // HEADER
  doc.setFillColor(220, 38, 38);
  doc.rect(2, 2, 144, 12, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DERSTRONIK ELECTRONIC', 74, 10, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Service reparatii electronice auto', 74, 14, { align: 'center' });

  // DESTINATAR
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DESTINATAR:', 5, 22);

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(5, 24, 68, 22, 2, 2, 'F');
  doc.roundedRect(5, 24, 68, 22, 2, 2, 'S');

  doc.text(removeDiacritics(atelier.name), 7, 31);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(removeDiacritics(atelier.address), 7, 38);
  doc.text(`Tel: ${atelier.phone}`, 7, 43);

  // EXPEDITOR
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EXPEDITOR:', 75, 22);

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(75, 24, 68, 32, 2, 2, 'F');
  doc.roundedRect(75, 24, 68, 32, 2, 2, 'S');

  doc.text(removeDiacritics(customer.name || 'Nume client'), 77, 31);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  doc.text(
    removeDiacritics(customer.address || 'Adresa client'),
    77,
    38
  );

  doc.text(`Tel: ${customer.phone || 'Telefon'}`, 77, 43);

  if (customer.email) {
    doc.text(`Email: ${customer.email}`, 77, 48);
  }

  // LINE
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.3);
  doc.line(5, 60, 143, 60);

  // DETALII
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALII EXPEDIERE:', 5, 67);

  doc.setFillColor(250, 250, 250);
  doc.roundedRect(5, 69, 138, 20, 2, 2, 'F');
  doc.roundedRect(5, 69, 138, 20, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  doc.text(
    `Serviciu: ${removeDiacritics(serviceName)}`,
    7,
    76
  );

  doc.text(
    `Data expedierii: ${new Date().toLocaleDateString('ro-RO')}`,
    7,
    83
  );

  // ===== COD DE BARE (corect pozitionat) =====
  let x = 60;
  const barcodeY = 78;

  for (let i = 0; i < 35; i++) {
    const width = i % 3 === 0 ? 1.2 : 0.6;
    doc.rect(x, barcodeY, width, 10, 'F');
    x += 1.6;
  }

  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text(trackingNumber, 74, 90, { align: 'center' });

  // TRACKING BLUE BAND
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(5, 92, 138, 10, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`NR URMARIRE: ${trackingNumber}`, 74, 99, { align: 'center' });

  return { doc, trackingNumber };
};

const generateTrackingNumber = () => {
  const prefix = 'DER';
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${prefix}-${day}${month}${year}-${random}`;
};

export const downloadShippingLabel = (data) => {
  const { doc, trackingNumber } = generateShippingLabel(data);
  doc.save(`eticheta-${trackingNumber}.pdf`);
};

export const printShippingLabel = (data) => {
  const { doc } = generateShippingLabel(data);
  window.open(doc.output('bloburl'), '_blank');
};