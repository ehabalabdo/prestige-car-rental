import { Car, Rental, CarStatus } from './types';
import jsPDF from 'jspdf';

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

// Simple PDF Generator using jsPDF
export const generateInvoicePDF = (rental: Rental, car: Car) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });
  
  // Header
  doc.setFillColor(17, 17, 17); // #111111
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(212, 175, 55); // #d4af37
  doc.setFontSize(22);
  doc.text("PRESTIGE CAR RENTAL - JORDAN", 105, 20, { align: "center" });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text("INVOICE / RECEIPT - FATOORAH", 105, 30, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  
  let y = 60;
  const addLine = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 80, y);
    y += 10;
  };

  addLine("Invoice ID", rental.id.toUpperCase());
  addLine("Date", new Date().toLocaleDateString());
  y += 5;
  addLine("Customer Name", rental.customer.name);
  addLine("Phone", rental.customer.phone);
  y += 5;
  addLine("Car", `${car.make} ${car.model} (${car.year})`);
  addLine("Plate Number", car.plate);
  y += 5;
  addLine("Start Date", new Date(rental.startDate).toLocaleDateString());
  addLine("End Date", rental.actualEndDate ? new Date(rental.actualEndDate).toLocaleDateString() : '-');
  
  const days = calculateDays(rental.startDate, rental.actualEndDate || new Date().toISOString());
  addLine("Duration", `${days} Days`);
  addLine("Daily Rate", `${car.dailyRate} JOD`);
  
  y += 10;
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`TOTAL AMOUNT: ${rental.totalCost} JOD`, 190, y, { align: "right" });

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