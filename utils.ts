import { Car, CarStatus } from './types';

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