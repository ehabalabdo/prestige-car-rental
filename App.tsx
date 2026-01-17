import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Cars from './components/Cars';
import Rentals from './components/Rentals';
import History from './components/History';
import Maintenance from './components/Maintenance';
import Availability from './components/Availability';
import InvoicePrint from './components/InvoicePrint';
import Notifications from './components/Notifications';
import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { Car, Rental, CarStatus, RentalStatus, MaintenanceRecord } from './types';
import { getInitialData, formatCurrency, calculateDays } from './utils';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import {
  loadAllDataFromFirestore,
  addCarToFirestore,
  deleteCarFromFirestore,
  updateCarInFirestore,
  addRentalToFirestore,
  deleteRentalFromFirestore,
  addHistoryToFirestore,
  syncAllData,
  resetFirestoreData
} from './firebaseService';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const isValidEmail = /.+@.+\..+/.test(username.trim());
    if (!isValidEmail) {
      setError('صيغة البريد الإلكتروني غير صحيحة');
      setLoading(false);
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, username.trim(), password);
      setLoading(false);
      return;
    } catch (firebaseError: any) {
      console.warn('Firebase Auth failed:', firebaseError.message);
      setError('بيانات الدخول غير صحيحة');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black-900 flex items-center justify-center p-4">
       <div className="w-full max-w-md p-6 md:p-8 bg-black-800 rounded-2xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tighter">PRESTIGE RENTAL</h1>
            <p className="text-gold-500 uppercase tracking-widest text-[10px] md:text-xs">Luxury Fleet Management - Jordan</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
             <div>
                <label className="text-gray-400 text-sm mb-2 block">اسم المستخدم</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none transition-colors"
                  placeholder="admin"
                />
             </div>
             <div>
                <label className="text-gray-400 text-sm mb-2 block">كلمة المرور</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none transition-colors"
                  placeholder="admin"
                />
             </div>
             {error && <p className="text-red-500 text-sm text-center">{error}</p>}
             <button type="submit" disabled={loading} className="w-full bg-gold-500 hover:bg-gold-600 text-black-900 font-bold py-3 rounded-lg transition-all disabled:opacity-50">
                {loading ? 'جارٍ الدخول...' : 'دخول للنظام'}
             </button>
          </form>
       </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [preSelectedCarId, setPreSelectedCarId] = useState<string | null>(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState<{ rental: Rental; car: Car } | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== 'light';
  });
  
  const [cars, setCars] = useState<Car[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [history, setHistory] = useState<Rental[]>([]);

  // تطبيق الثيم على الصفحة
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[auth] state changed:', user ? user.email : 'signed out');
      try {
        if (user) {
          setIsAuthenticated(true);

          try {
            const firestoreData = await loadAllDataFromFirestore();
            console.log('[firestore] load success');
            setCars(firestoreData.cars || []);
            setRentals((firestoreData.rentals || []).map(r => ({
              ...r,
              baseCost: r.baseCost ?? r.totalCost ?? 0,
              fineAmount: r.fineAmount ?? 0,
              totalCost: r.totalCost ?? (r.baseCost ?? 0)
            })));
            setHistory((firestoreData.history || []).map(r => ({
              ...r,
              baseCost: r.baseCost ?? r.totalCost ?? 0,
              fineAmount: r.fineAmount ?? 0,
              totalCost: r.totalCost ?? (r.baseCost ?? 0)
            })));
          } catch (error) {
            console.warn('[firestore] load failed', error);
            setCars([]);
            setRentals([]);
            setHistory([]);
          }
        } else {
          setIsAuthenticated(false);
          setCars([]);
          setRentals([]);
          setHistory([]);
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      syncAllData(cars, rentals, history)
        .then(() => console.log('[firestore] sync success'))
        .catch(err => console.warn('Failed to sync to Firestore:', err));
    }
  }, [cars, isAuthenticated, rentals, history]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Firebase signOut error:', error);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm('تحذير: سيتم حذف جميع البيانات (السيارات، العقود، السجل). هل أنت متأكد؟');
    if (!confirmed) return;

    try {
      await resetFirestoreData();
      localStorage.clear();
      setCars([]);
      setRentals([]);
      setHistory([]);
      console.log('[system] reset complete');
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset system:', error);
    }
  };

  const addCar = (car: Car) => {
    setCars([...cars, car]);
    if (isAuthenticated) {
      addCarToFirestore(car).catch(err => console.warn('Failed to sync car:', err));
    }
  };
  const deleteCar = (id: string) => {
    setCars(cars.filter(c => c.id !== id));
    if (isAuthenticated) {
      deleteCarFromFirestore(id).catch(err => console.warn('Failed to delete car:', err));
    }
  };
  const updateCarStatus = (id: string, status: CarStatus) => {
    const updatedCars = cars.map(c => {
      if (c.id !== id) return c;
      if (c.status === CarStatus.MAINTENANCE && status === CarStatus.AVAILABLE) {
        return { ...c, status, lastMaintenanceMileage: c.currentMileage };
      }
      return { ...c, status };
    });
    setCars(updatedCars);
    const updatedCar = updatedCars.find(c => c.id === id);
    if (updatedCar && isAuthenticated) {
      updateCarInFirestore(updatedCar).catch(err => console.warn('Failed to update car:', err));
    }
  };

  const updateCarDetails = (updatedCar: Car) => {
    setCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
    if (isAuthenticated) {
      updateCarInFirestore(updatedCar).catch(err => console.warn('Failed to update car:', err));
    }
  };

  const addMaintenanceRecord = (carId: string, record: MaintenanceRecord) => {
    const updatedCars = cars.map(c => {
      if (c.id === carId) {
        return {
          ...c,
          maintenanceHistory: [...(c.maintenanceHistory || []), record]
        };
      }
      return c;
    });
    setCars(updatedCars);
    const updatedCar = updatedCars.find(c => c.id === carId);
    if (updatedCar && isAuthenticated) {
      updateCarInFirestore(updatedCar).catch(err => console.warn('Failed to add maintenance record:', err));
    }
  };

  const deleteMaintenanceRecord = (carId: string, recordId: string) => {
    const updatedCars = cars.map(c => {
      if (c.id === carId) {
        return {
          ...c,
          maintenanceHistory: (c.maintenanceHistory || []).filter(r => r.id !== recordId)
        };
      }
      return c;
    });
    setCars(updatedCars);
    const updatedCar = updatedCars.find(c => c.id === carId);
    if (updatedCar && isAuthenticated) {
      updateCarInFirestore(updatedCar).catch(err => console.warn('Failed to delete maintenance record:', err));
    }
  };

  const createRental = (rental: Rental) => {
    // CRITICAL: Check for date overlap with existing rentals
    const newStart = new Date(rental.startDate);
    const newEnd = new Date(rental.endDate);
    
    const hasOverlap = rentals.some(existingRental => {
      // Only check rentals for the same car
      if (existingRental.carId !== rental.carId) return false;
      
      const existingStart = new Date(existingRental.startDate);
      const existingEnd = new Date(existingRental.endDate || existingRental.actualEndDate || existingRental.startDate);
      
      // Check if dates overlap
      return newStart <= existingEnd && newEnd >= existingStart;
    });
    
    if (hasOverlap) {
      alert('السيارة محجوزة خلال هذه الفترة - يرجى اختيار تواريخ أخرى');
      return;
    }
    
    setRentals([...rentals, rental]);
    const updatedCars = cars.map(c => c.id === rental.carId ? { ...c, status: CarStatus.RENTED } : c);
    setCars(updatedCars);
    setPreSelectedCarId(null);
    
    if (isAuthenticated) {
      addRentalToFirestore(rental).catch(err => console.warn('Failed to sync rental:', err));
      const updatedCar = updatedCars.find(c => c.id === rental.carId);
      if (updatedCar) {
        updateCarInFirestore(updatedCar).catch(err => console.warn('Failed to update car:', err));
      }
    }
  };

  const returnRental = (rentalId: string, endMileage: number) => {
    const rental = rentals.find(r => r.id === rentalId);
    if (!rental) return;
    const endDate = new Date().toISOString();
    const completedRental: Rental = {
      ...rental,
      actualEndDate: endDate,
      endMileage,
      status: RentalStatus.COMPLETED
    };
    setHistory([...history, completedRental]);
    setRentals(rentals.filter(r => r.id !== rentalId));
    const car = cars.find(c => c.id === rental.carId);
    if (car) {
       const interval = car.maintenanceIntervalKm ?? 0;
       const lastService = car.lastMaintenanceMileage ?? car.currentMileage ?? 0;
       const exceededMaintenance = interval > 0 && (endMileage - lastService) >= interval;
       const updatedCars = cars.map(c => c.id === rental.carId ? { 
         ...c, 
         status: exceededMaintenance ? CarStatus.MAINTENANCE : CarStatus.AVAILABLE, 
         currentMileage: endMileage 
       } : c);
       setCars(updatedCars);
       
       // CRITICAL: Validate invoice data before generation
       const isValidInvoiceData = 
         completedRental?.startDate && 
         completedRental?.totalCost !== undefined &&
         !isNaN(Number(completedRental.totalCost));
       
       if (isValidInvoiceData) {
         // Open print invoice modal
         setInvoiceToPrint({ rental: completedRental, car });
       } else {
         console.error('Invalid invoice data:', completedRental);
         alert('بيانات الفاتورة غير مكتملة');
       }
       
       if (exceededMaintenance) {
         alert('تنبيه: المركبة تجاوزت عداد الصيانة وتحتاج إلى صيانة');
       }
       
       if (isAuthenticated) {
         addHistoryToFirestore(completedRental).catch(err => console.warn('Failed to sync history:', err));
         deleteRentalFromFirestore(rentalId).catch(err => console.warn('Failed to delete rental:', err));
         const updatedCar = updatedCars.find(c => c.id === rental.carId);
         if (updatedCar) {
           updateCarInFirestore(updatedCar).catch(err => console.warn('Failed to update car:', err));
         }
       }
    }
  };

  const extendRental = (rentalId: string, additionalDays: number) => {
    const updatedRentals = rentals.map(r => {
      if (r.id === rentalId) {
        const car = cars.find(c => c.id === r.carId);
        const dailyRate = car?.dailyRate || 0;
        const currentEndDate = new Date(r.expectedEndDate);
        currentEndDate.setDate(currentEndDate.getDate() + additionalDays);
        const newBaseCost = (r.baseCost || r.totalCost) + (dailyRate * additionalDays);
        const finesTotal = (r.fines || []).reduce((sum, f) => sum + f.amount, 0);
        const updatedRental = {
          ...r,
          expectedEndDate: currentEndDate.toISOString(),
          baseCost: newBaseCost,
          totalCost: newBaseCost + finesTotal
        };
        if (isAuthenticated) addRentalToFirestore(updatedRental).catch(err => console.warn('Failed to sync rental:', err));
        return updatedRental;
      }
      return r;
    });
    setRentals(updatedRentals);
  };

  const handleDashboardAction = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    if (!car) return;
    if (car.status === CarStatus.AVAILABLE) {
      setPreSelectedCarId(carId);
      setActiveTab('rentals');
    } else if (car.status === CarStatus.RENTED) {
      setActiveTab('rentals');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="flex min-h-screen bg-black-900 text-white font-sans overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        onReset={handleReset}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNotificationsClick={() => setIsNotificationsOpen(true)}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        isDarkMode={isDarkMode}
        notificationCount={(() => {
          const maintenanceCount = cars.filter(car => {
            const currentMileage = car.currentMileage ?? 0;
            const lastMaintenance = car.lastMaintenanceMileage ?? 0;
            const interval = car.maintenanceIntervalKm ?? 8000;
            const nextMaintenance = lastMaintenance + interval;
            const remainingKm = nextMaintenance - currentMileage;
            return remainingKm <= 500 && remainingKm >= 0;
          }).length;

          const insuranceCount = cars.filter(car => {
            if (!car.insuranceEndDate) return false;
            const endDate = new Date(car.insuranceEndDate);
            const today = new Date();
            const diffTime = endDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 30;
          }).length;

          return maintenanceCount + insuranceCount;
        })()}
      />
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black-800 border-b border-white/10 z-30 flex items-center justify-between px-4">
        <button onClick={() => setIsSidebarOpen(true)} className="text-gold-500">
            <Menu size={28} />
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Bell size={20} className="text-gold-500" />
            {(() => {
              const maintenanceCount = cars.filter(car => {
                const currentMileage = car.currentMileage ?? 0;
                const lastMaintenance = car.lastMaintenanceMileage ?? 0;
                const interval = car.maintenanceIntervalKm ?? 8000;
                const nextMaintenance = lastMaintenance + interval;
                const remainingKm = nextMaintenance - currentMileage;
                return remainingKm <= 500 && remainingKm >= 0;
              }).length;

              const insuranceCount = cars.filter(car => {
                if (!car.insuranceEndDate) return false;
                const endDate = new Date(car.insuranceEndDate);
                const today = new Date();
                const diffTime = endDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 30;
              }).length;

              const total = maintenanceCount + insuranceCount;
              return total > 0 ? (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {total}
                </span>
              ) : null;
            })()}
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {isDarkMode ? <Sun size={20} className="text-gold-500" /> : <Moon size={20} className="text-gold-500" />}
          </button>
        </div>
        <div className="text-right">
            <p className="text-xs font-bold text-white leading-tight">PRESTIGE RENTAL</p>
            <p className="text-[8px] text-gold-500 tracking-widest text-left uppercase">Jordan Elite</p>
        </div>
      </div>

      <main className={`flex-1 transition-all duration-300 w-full pt-20 lg:pt-8 lg:mr-64 p-4 md:p-8`}>
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              key={`dashboard-${rentals.length}`}
              cars={cars} 
              rentals={rentals} 
              history={history} 
              onCarClick={handleDashboardAction} 
            />
          )}
          {activeTab === 'fleet' && (
            <Cars 
              cars={cars} 
              onAddCar={addCar} 
              onDeleteCar={deleteCar} 
              onUpdateStatus={updateCarStatus}
              onUpdateCar={updateCarDetails}
            />
          )}
          {activeTab === 'rentals' && (
            <Rentals 
              cars={cars} 
              rentals={rentals} 
              onRentCar={createRental} 
              onReturnCar={returnRental}
              onExtendRental={extendRental}
              onUpdateRental={(updatedRental) => {
                setRentals(prev => prev.map(r => r.id === updatedRental.id ? updatedRental : r));
                if (isAuthenticated) {
                  addRentalToFirestore(updatedRental).catch(err => console.warn('Failed to sync rental update:', err));
                }
              }}
              initialSelectedCarId={preSelectedCarId || undefined}
            />
          )}
          {activeTab === 'availability' && <Availability cars={cars} rentals={rentals} />}
          {activeTab === 'history' && <History history={history} cars={cars} />}
          {activeTab === 'maintenance' && <Maintenance cars={cars} onAddMaintenanceRecord={addMaintenanceRecord} onDeleteMaintenanceRecord={deleteMaintenanceRecord} />}
        </div>
      </main>
      
      {/* Invoice Print Modal */}
      {invoiceToPrint && (
        <InvoicePrint 
          rental={invoiceToPrint.rental} 
          car={invoiceToPrint.car}
          onClose={() => setInvoiceToPrint(null)}
        />
      )}

      {/* Notifications Modal */}
      <Notifications 
        cars={cars}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

export default App;