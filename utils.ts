import { Car, Rental, CarStatus } from './types';
import jsPDF from 'jspdf';
import arabicFontUrl from './fonts/NotoSansArabic-Regular.ttf?url';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-JO', {
    style: 'currency',
    currency: 'JOD',
    maximumFractionDigits: 2
  }).format(amount);
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const calculateDays = (start: string, end: string) => {
  const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 1;
};

let cachedArabicFontBase64: string | null = null;

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

const ensureArabicFont = async (doc: jsPDF) => {
  if (!cachedArabicFontBase64) {
    const res = await fetch(arabicFontUrl);
    const buffer = await res.arrayBuffer();
    cachedArabicFontBase64 = arrayBufferToBase64(buffer);
  }
  doc.addFileToVFS('NotoSansArabic-Regular.ttf', cachedArabicFontBase64 as string);
  doc.addFont('NotoSansArabic-Regular.ttf', 'NotoSansArabic', 'normal');
  doc.setFont('NotoSansArabic', 'normal');
};

const isArabicText = (value: string) => /[\u0600-\u06FF]/.test(value);

// PDF Generator with Arabic-capable font (labels بالإنجليزي، القيم تُعرض حسب اللغة المُدخلة)
export const generateInvoicePDF = async (rental: Rental, car: Car) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  await ensureArabicFont(doc);
  // نبقي الاتجاه العام من اليسار لليمين؛ القيم التي تحتوي عربية تُكتب مع isInputRtl
  doc.setR2L(false);
  doc.setLanguage('en');

  const writeText = (text: string, x: number, y: number, align: 'left' | 'center' | 'right' = 'left') => {
    const rtl = isArabicText(text);
    doc.text(text, x, y, { align, isInputRtl: rtl });
  };
  
  // Header
  doc.setFillColor(17, 17, 17); // #111111
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(212, 175, 55); // #d4af37
  doc.setFontSize(22);
  writeText('Vehicle Rental Invoice', 105, 20, 'center');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('PRESTIGE CAR RENTAL - JORDAN', 105, 30, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  
  let y = 60;
  const addLine = (label: string, value: string) => {
    doc.setFont('NotoSansArabic', 'normal');
    // label يسار، القيمة يمين لدعم العربية
    writeText(label, 20, y, 'left');
    writeText(value, 190, y, 'right');
    y += 10;
  };

  addLine('Invoice No.', rental.id.toUpperCase());
  addLine('Date', new Date().toLocaleDateString());
  y += 5;
  addLine('Customer', rental.customer.name);
  addLine('Phone', rental.customer.phone);
  y += 5;
  addLine('Car', `${car.make} ${car.model} (${car.year})`);
  addLine('Plate', car.plate);
  y += 5;
  addLine('Start Date', new Date(rental.startDate).toLocaleDateString());
  addLine('Return Date', rental.actualEndDate ? new Date(rental.actualEndDate).toLocaleDateString() : '-');
  
  const days = calculateDays(rental.startDate, rental.actualEndDate || new Date().toISOString());
  addLine('Duration (days)', `${days}`);
  addLine('Base Cost', formatCurrency(rental.baseCost));
  addLine('Fines', formatCurrency(rental.fineAmount || 0));
  
  y += 10;
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 12;
  
  doc.setFont('NotoSansArabic', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(212, 175, 55);
  writeText(`Total Due: ${formatCurrency(rental.totalCost)}`, 190, y, 'right');

  doc.save(`Invoice_${rental.id}.pdf`);
};

const DEFAULT_CARS: Car[] = [
  {
    id: 'car1',
    make: 'Mercedes-Benz',
    model: 'S-Class S500',
    year: 2023,
    plate: '10-55432',
    color: 'Black',
    dailyRate: 150,
    currentMileage: 5200,
    nextMaintenanceMileage: 10000,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
    status: CarStatus.AVAILABLE
  },
  {
    id: 'car2',
    make: 'Range Rover',
    model: 'Vogue HSE',
    year: 2024,
    plate: '22-90120',
    color: 'White',
    dailyRate: 200,
    currentMileage: 1200,
    nextMaintenanceMileage: 5000,
    image: 'https://images.unsplash.com/photo-1606148585254-3b499b3521ca?auto=format&fit=crop&q=80&w=800',
    status: CarStatus.AVAILABLE
  }
];

export const getInitialData = () => {
  const cars = localStorage.getItem('cars');
  const rentals = localStorage.getItem('rentals');
  const history = localStorage.getItem('history');
  
  return {
    cars: cars ? JSON.parse(cars) : DEFAULT_CARS,
    rentals: rentals ? JSON.parse(rentals) : [],
    history: history ? JSON.parse(history) : []
  };
};