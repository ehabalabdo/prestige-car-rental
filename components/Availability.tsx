import React, { useMemo } from 'react';
import { Car, Rental, CarStatus, RentalStatus } from '../types';
import { Calendar, AlertCircle } from 'lucide-react';
import { getRentalDisplayStatus } from '../utils';

interface AvailabilityProps {
  cars: Car[];
  rentals: Rental[];
}

const Availability: React.FC<AvailabilityProps> = ({ cars, rentals }) => {
  // Generate next 12 months
  const months = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthNum = date.getMonth() + 1; // 1-12
      result.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        name: `${monthNum}/${date.getFullYear()}`,
        daysInMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
      });
    }
    return result;
  }, []);

  // Check if a car is reserved or in maintenance on a specific date
  const getCarStatus = (carId: string, checkDate: Date) => {
    const car = cars.find(c => c.id === carId);
    
    // Check maintenance
    if (car?.status === CarStatus.MAINTENANCE) {
      return 'maintenance';
    }

    // Check rentals - show both ACTIVE and RESERVED rentals (based on display status)
    for (const rental of rentals) {
      if (rental.carId !== carId) continue;
      
      // Use display status to determine if car is booked
      const displayStatus = getRentalDisplayStatus(rental);
      
      // CRITICAL: Safe date range checking without mutations
      try {
        const checkDate_norm = new Date(checkDate.toISOString().split('T')[0]); // Normalize to midnight UTC
        const startDate_norm = new Date(rental.startDate);
        const endDate_norm = new Date(rental.expectedEndDate || rental.endDate || rental.startDate);
        
        // Normalize all to midnight UTC for date-only comparison
        checkDate_norm.setUTCHours(0, 0, 0, 0);
        startDate_norm.setUTCHours(0, 0, 0, 0);
        endDate_norm.setUTCHours(23, 59, 59, 999);
        
        // Range check: day is booked if checkDate >= startDate AND checkDate <= endDate
        const isInRange = checkDate_norm >= startDate_norm && checkDate_norm <= endDate_norm;
        
        // Return status only if in date range, prioritize 'active' over 'reserved'
        if (isInRange) {
          if (displayStatus === 'active') return 'active';
          if (displayStatus === 'reserved') return 'reserved';
        }
      } catch (error) {
        console.error('Date parsing error in availability check:', error);
        continue;
      }
    }

    return 'available';
  };

  // Get status for entire month
  const getMonthStatus = (carId: string, year: number, month: number) => {
    const statuses = {
      available: 0,
      active: 0,
      reserved: 0,
      maintenance: 0
    };

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const status = getCarStatus(carId, date);
      statuses[status as keyof typeof statuses]++;
    }

    // Return dominant status: Maintenance > Active > Reserved > Available
    if (statuses.maintenance > 0) return 'maintenance';
    if (statuses.active > 0) return 'active'; // Prioritize active rentals (current bookings)
    if (statuses.reserved > daysInMonth * 0.3) return 'reserved'; // More than 30% reserved (future bookings)
    return 'available';
  };

  return (
    <div className="space-y-6">
      <div className="bg-black-800 rounded-[2.5rem] p-8 border border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <Calendar className="text-gold-500" size={32} />
          <h2 className="text-3xl font-bold text-white">جدول التوافر</h2>
        </div>

        {/* Legend */}
        <div className="flex gap-6 mb-8 p-4 bg-black-900/50 rounded-2xl flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
            <span className="text-gray-300 text-sm">متاح</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-600 rounded"></div>
            <span className="text-gray-300 text-sm">مؤجّر حالياً (نشط)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded"></div>
            <span className="text-gray-300 text-sm">محجوز (مستقبلي)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-600 rounded"></div>
            <span className="text-gray-300 text-sm">صيانة</span>
          </div>
        </div>

        {/* Timeline Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right p-4 text-white font-bold sticky right-0 bg-black-800 z-10 min-w-[200px]">
                  السيارة
                </th>
                {months.map((month, idx) => (
                  <th key={idx} className="p-2 text-center text-gray-300 text-sm min-w-[80px]">
                    {month.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => {
                const carName = `${car.brand || car.make} ${car.model}`;
                return (
                  <tr key={car.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 sticky right-0 bg-black-800 z-10">
                      <div className="flex items-center gap-3">
                        <img 
                          src={car.image} 
                          alt={carName}
                          className="w-16 h-10 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-white font-semibold">{carName}</p>
                          <p className="text-gray-400 text-xs">{car.plate}</p>
                        </div>
                      </div>
                    </td>
                    {months.map((month, idx) => {
                      const status = getMonthStatus(car.id, month.year, month.month);
                      const bgColor = 
                        status === 'maintenance' ? 'bg-orange-600' :
                        status === 'active' ? 'bg-green-600' :
                        status === 'reserved' ? 'bg-blue-600' :
                        'bg-gray-600';
                      
                      return (
                        <td key={idx} className="p-2">
                          <div className={`${bgColor} h-8 rounded transition-all hover:opacity-80`}></div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {cars.length === 0 && (
          <div className="text-center py-20">
            <AlertCircle className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg">لا توجد سيارات في النظام</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Availability;
