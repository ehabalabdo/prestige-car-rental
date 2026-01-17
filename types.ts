export enum CarStatus {
  AVAILABLE = 'متاح',
  RENTED = 'مؤجر',
  MAINTENANCE = 'صيانة'
}

export interface MaintenanceRecord {
  id: string;
  date: string; // ISO String
  description: string;
  cost: number;
  mileage?: number;
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
  nextMaintenanceMileage: number; // legacy
  maintenanceIntervalKm?: number; // e.g., 8000
  lastMaintenanceMileage?: number; // mileage at last service
  image: string;
  status: CarStatus;
  maintenanceHistory?: MaintenanceRecord[];
  insuranceStartDate?: string; // ISO String
  insuranceEndDate?: string; // ISO String
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
  startTime?: string; // Time in HH:mm format
  expectedEndDate: string; // ISO String
  expectedEndTime?: string; // Time in HH:mm format
  actualEndDate?: string; // ISO String
  actualEndTime?: string; // Time in HH:mm format
  startMileage: number;
  endMileage?: number;
  baseCost: number;
  fines?: Array<{ id: string; amount: number; date: string; note?: string }>;
  payments?: Array<{ id: string; amount: number; date: string; note?: string }>;
  totalCost: number;
  status: RentalStatus;
}

export interface DashboardStats {
  totalCars: number;
  availableCars: number;
  rentedCars: number;
  totalRevenue: number;
}