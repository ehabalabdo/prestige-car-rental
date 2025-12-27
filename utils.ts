import { Car, Rental, CarStatus } from './types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

// PDF generator via DOM render (html2canvas) to preserve Arabic shaping
export const generateInvoicePDF = async (rental: Rental, car: Car) => {
  const days = calculateDays(rental.startDate, rental.actualEndDate || new Date().toISOString());

  const container = document.createElement('div');
  container.id = 'invoice-print';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // ~A4 width in px at 96dpi
  container.style.background = '#fff';
  container.style.fontFamily = 'Noto Sans Arabic, Arial, sans-serif';
  container.innerHTML = `
    <style>
      #invoice-print * { box-sizing: border-box; }
      #invoice-print .header { background:#111; color:#d4af37; padding:24px; text-align:center; font-size:24px; font-weight:700; }
      #invoice-print .body { padding:32px 40px 48px; color:#111; }
      #invoice-print .row { display:flex; justify-content:space-between; margin-bottom:10px; font-size:14px; }
      #invoice-print .label { color:#555; font-weight:600; }
      #invoice-print .value { color:#000; text-align:right; direction:rtl; }
      #invoice-print .section { margin-top:18px; }
      #invoice-print .total { margin-top:28px; padding-top:12px; border-top:1px solid #444; text-align:right; color:#d4af37; font-size:18px; font-weight:700; }
    </style>
    <div class="header">Vehicle Rental Invoice</div>
    <div class="body">
      <div class="row"><span class="label">Invoice No.</span><span class="value">${rental.id.toUpperCase()}</span></div>
      <div class="row"><span class="label">Date</span><span class="value">${new Date().toLocaleDateString()}</span></div>
      <div class="row"><span class="label">Customer</span><span class="value">${rental.customer.name}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value">${rental.customer.phone}</span></div>
      <div class="row"><span class="label">Car</span><span class="value">${car.make} ${car.model} (${car.year})</span></div>
      <div class="row"><span class="label">Plate</span><span class="value">${car.plate}</span></div>
      <div class="row"><span class="label">Start Date</span><span class="value">${new Date(rental.startDate).toLocaleDateString()}</span></div>
      <div class="row"><span class="label">Return Date</span><span class="value">${rental.actualEndDate ? new Date(rental.actualEndDate).toLocaleDateString() : '-'}</span></div>
      <div class="row"><span class="label">Duration (days)</span><span class="value">${days}</span></div>
      <div class="row"><span class="label">Base Cost</span><span class="value">${formatCurrency(rental.baseCost)}</span></div>
      <div class="row"><span class="label">Fines</span><span class="value">${formatCurrency(rental.fineAmount || 0)}</span></div>
      <div class="total">Total Due: ${formatCurrency(rental.totalCost)}</div>
    </div>
  `;

  document.body.appendChild(container);
  const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = canvas.height * (imgWidth / canvas.width);
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
  pdf.save(`Invoice_${rental.id}.pdf`);
  document.body.removeChild(container);
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