import { Car, CarStatus } from './types';

// ================== DATA SANITIZATION LAYER ==================
// CRITICAL: These helpers prevent undefined values from crashing Firestore and PDF generation

/**
 * Ensures value is always a valid string, never undefined or null
 * Used before Firestore writes and PDF rendering
 */
export const safeString = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return String(value);
};

/**
 * Ensures value is always a valid number, never NaN or undefined
 * Fallback to 0 if invalid
 * Used for prices, mileage, and calculations
 */
export const safeNumber = (value: any): number => {
  if (value === null || value === undefined) {
    return 0;
  }
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }
  return num;
};

/**
 * Ensures date is always valid ISO string or empty string
 * PREVENTS: RangeError: date value is not finite
 * Used before Intl.DateTimeFormat or @react-pdf/renderer Date rendering
 */
export const safeDate = (value: any): string => {
  if (!value) {
    return '';
  }
  
  try {
    // Handle Firestore Timestamp
    if (value.seconds !== undefined) {
      const date = new Date(value.seconds * 1000);
      if (isNaN(date.getTime())) return '';
      return date.toISOString();
    }
    
    // Handle Date object or string
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString();
  } catch (error) {
    console.warn('safeDate: Invalid date value', value, error);
    return '';
  }
};

/**
 * Formats date safely for display - NEVER crashes
 * Returns empty string if date is invalid
 */
export const formatDateSafe = (value: any): string => {
  const dateStr = safeDate(value);
  if (!dateStr) return '';
  
  try {
    return new Intl.DateTimeFormat('ar-JO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateStr));
  } catch (error) {
    console.warn('formatDateSafe: Formatting failed', value, error);
    return '';
  }
};

/**
 * Formats date with numeric month (1-12) instead of month name
 * Returns format: DD/MM/YYYY
 */
export const formatDateNumeric = (value: any): string => {
  const dateStr = safeDate(value);
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1; // 0-based to 1-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.warn('formatDateNumeric: Formatting failed', value, error);
    return '';
  }
};

/**
 * Removes all undefined values from object before Firestore write
 * PREVENTS: Firestore "Unsupported field value: undefined"
 */
export const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item)).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    });
    return cleaned;
  }
  
  return obj;
};

// ================== EXISTING HELPERS ==================

export const formatCurrency = (amount: number) => {
  const safeAmount = safeNumber(amount);
  return new Intl.NumberFormat('ar-JO', {
    style: 'currency',
    currency: 'JOD',
    maximumFractionDigits: 2
  }).format(safeAmount);
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const calculateDays = (start: string, end: string) => {
  const startDate = safeDate(start);
  const endDate = safeDate(end);
  
  if (!startDate || !endDate) return 1;
  
  const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 1;
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