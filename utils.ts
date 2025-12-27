import { Car, Rental, CarStatus } from './types';
import html2pdf from 'html2pdf.js';

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

// PDF generator using html2pdf.js (HTML → Canvas → PDF) to preserve Arabic/RTL
export const generateInvoicePDF = async (rental: Rental, car: Car) => {
  const days = calculateDays(rental.startDate, rental.actualEndDate || new Date().toISOString());

  const existing = document.getElementById('invoice-print');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'invoice-print';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.background = '#fff';
  container.style.direction = 'rtl';
  container.style.textAlign = 'right';
  container.style.fontFamily = 'Cairo, Tajawal, sans-serif';

  container.innerHTML = `
    <style>
      #invoice-print * { box-sizing: border-box; }
      #invoice-print .header { background:#111; color:#d4af37; padding:24px; text-align:center; font-size:24px; font-weight:700; }
      #invoice-print .body { padding:32px 40px 48px; color:#111; }
      #invoice-print .row { display:flex; justify-content:space-between; margin-bottom:10px; font-size:14px; gap:12px; }
      #invoice-print .label { color:#555; font-weight:600; }
      #invoice-print .value { color:#000; }
      #invoice-print .total { margin-top:28px; padding-top:12px; border-top:1px solid #444; text-align:right; color:#d4af37; font-size:18px; font-weight:700; }
    </style>
    <div class="header">فاتورة تأجير مركبة</div>
    <div class="body">
      <div class="row"><span class="label">رقم الفاتورة</span><span class="value">${rental.id.toUpperCase()}</span></div>
      <div class="row"><span class="label">التاريخ</span><span class="value">${new Date().toLocaleDateString()}</span></div>
      <div class="row"><span class="label">العميل</span><span class="value">${rental.customer.name}</span></div>
      <div class="row"><span class="label">الهاتف</span><span class="value">${rental.customer.phone}</span></div>
      <div class="row"><span class="label">المركبة</span><span class="value">${car.make} ${car.model} (${car.year})</span></div>
      <div class="row"><span class="label">رقم اللوحة</span><span class="value">${car.plate}</span></div>
      <div class="row"><span class="label">تاريخ الاستلام</span><span class="value">${new Date(rental.startDate).toLocaleDateString()}</span></div>
      <div class="row"><span class="label">تاريخ التسليم</span><span class="value">${rental.actualEndDate ? new Date(rental.actualEndDate).toLocaleDateString() : '-'}</span></div>
      <div class="row"><span class="label">المدة (يوم)</span><span class="value">${days}</span></div>
      <div class="row"><span class="label">التكلفة قبل المخالفات</span><span class="value">${formatCurrency(rental.baseCost)}</span></div>
      <div class="section">
        <div class="row"><span class="label">المخالفات</span><span class="value">${formatCurrency((rental.fines || []).reduce((s,f)=>s+(f.amount||0),0))}</span></div>
        ${(rental.fines || []).map(f => `<div class="row"><span class="label">- ${new Date(f.date).toLocaleDateString()}${f.note ? ' — ' + f.note : ''}</span><span class="value">${formatCurrency(f.amount)}</span></div>`).join('')}
      </div>
      <div class="section">
        <div class="row"><span class="label">الدفعات</span><span class="value">${formatCurrency((rental.payments || []).reduce((s,p)=>s+(p.amount||0),0))}</span></div>
        ${(rental.payments || []).map(p => `<div class="row"><span class="label">- ${new Date(p.date).toLocaleDateString()}${p.note ? ' — ' + p.note : ''}</span><span class="value">${formatCurrency(p.amount)}</span></div>`).join('')}
      </div>
      <div class="row"><span class="label">الإجمالي قبل الدفعات</span><span class="value">${formatCurrency(rental.totalCost)}</span></div>
      <div class="row"><span class="label">المسدّد</span><span class="value">${formatCurrency((rental.payments || []).reduce((s,p)=>s+(p.amount||0),0))}</span></div>
      <div class="row"><span class="label">المتبقي</span><span class="value">${formatCurrency(rental.totalCost - (rental.payments || []).reduce((s,p)=>s+(p.amount||0),0))}</span></div>
      <div class="total">الإجمالي المستحق: ${formatCurrency(rental.totalCost - (rental.payments || []).reduce((s,p)=>s+(p.amount||0),0))}</div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const opts = {
      margin: 10,
      filename: `Invoice_${rental.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opts).from(container).save();
  } catch (error) {
    console.error('Invoice generation failed:', error);
    alert('فشل إنشاء الفاتورة. يرجى المحاولة مرة أخرى.');
  } finally {
    setTimeout(() => container.remove(), 100);
  }
};

export const generatePaymentReceiptPDF = async (rental: Rental, car: Car, payment: { id?: string; amount: number; date: string; note?: string }) => {
  const existing = document.getElementById('payment-receipt-print');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'payment-receipt-print';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '594px';
  container.style.background = '#fff';
  container.style.direction = 'rtl';
  container.style.textAlign = 'right';
  container.style.fontFamily = 'Cairo, Tajawal, sans-serif';

  container.innerHTML = `
    <style>
      #payment-receipt-print * { box-sizing: border-box; }
      #payment-receipt-print .header { background:#111; color:#d4af37; padding:20px; text-align:center; font-size:20px; font-weight:700; }
      #payment-receipt-print .body { padding:24px 28px 32px; color:#111; }
      #payment-receipt-print .row { display:flex; justify-content:space-between; margin-bottom:10px; font-size:14px; gap:12px; }
      #payment-receipt-print .label { color:#555; font-weight:600; }
      #payment-receipt-print .value { color:#000; }
      #payment-receipt-print .total { margin-top:16px; padding-top:12px; border-top:1px solid #444; text-align:right; color:#d4af37; font-size:16px; font-weight:700; }
    </style>
    <div class="header">سند قبض دفعة</div>
    <div class="body">
      <div class="row"><span class="label">رقم العقد</span><span class="value">${rental.id.toUpperCase()}</span></div>
      <div class="row"><span class="label">تاريخ السند</span><span class="value">${new Date(payment.date).toLocaleDateString()}</span></div>
      <div class="row"><span class="label">العميل</span><span class="value">${rental.customer.name}</span></div>
      <div class="row"><span class="label">الهاتف</span><span class="value">${rental.customer.phone}</span></div>
      <div class="row"><span class="label">المركبة</span><span class="value">${car.make} ${car.model} (${car.year}) — ${car.plate}</span></div>
      ${payment.note ? `<div class="row"><span class="label">ملاحظة</span><span class="value">${payment.note}</span></div>` : ''}
      <div class="total">المبلغ المقبوض: ${formatCurrency(payment.amount)}</div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const opts = {
      margin: 10,
      filename: `Receipt_${rental.id}_${payment.id || generateId()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
    };

    await html2pdf().set(opts).from(container).save();
  } catch (error) {
    console.error('Receipt generation failed:', error);
    alert('فشل إنشاء السند. يرجى المحاولة مرة أخرى.');
  } finally {
    setTimeout(() => container.remove(), 100);
  }
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