export enum CarStatus {
  AVAILABLE = 'متاح',
  RENTED = 'مؤجر',
  MAINTENANCE = 'صيانة'
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  dailyRate: number;
  currentMileage: number;
  nextMaintenanceMileage: number;
  image: string;
  status: CarStatus;
}

export interface Customer {
  name: string;
  phone: string;
  nationalId: string;
}

export enum RentalStatus {
  ACTIVE = 'جاري',
  COMPLETED = 'منتهي',
  CANCELLED = 'ملغي'
}

export interface Rental {
  id: string;
  carId: string;
  customer: Customer;
  startDate: string; // ISO String
  expectedEndDate: string; // ISO String
  actualEndDate?: string; // ISO String
  startMileage: number;
  endMileage?: number;
  totalCost: number;
  status: RentalStatus;
}

export interface DashboardStats {
  totalCars: number;
  availableCars: number;
  rentedCars: number;
  totalRevenue: number;
}