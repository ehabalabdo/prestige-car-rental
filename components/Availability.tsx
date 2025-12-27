import React, { useMemo } from 'react';
import { Car, Rental, CarStatus, RentalStatus } from '../types';
import { Calendar, AlertCircle } from 'lucide-react';
import { getRentalDisplayStatus } from '../utils';

interface AvailabilityProps {
  cars: Car[];
  rentals: Rental[];
}

const Availability: React.FC<AvailabilityProps> = ({ cars, rentals }) => {

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

        {/* Booking Timeline */}
        <div className="space-y-6">
          {cars.length === 0 ? (
            <div className="text-center py-20">
              <AlertCircle className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-gray-400 text-lg">لا توجد سيارات في النظام</p>
            </div>
          ) : (
            cars.map((car) => {
              const carName = `${car.brand || car.make} ${car.model}`;
              const carRentals = rentals.filter(r => r.carId === car.id);
              
              // Sort rentals by start date
              const sortedRentals = [...carRentals].sort((a, b) => 
                a.startDate.localeCompare(b.startDate)
              );

              return (
                <div key={car.id} className="bg-black-900/50 p-6 rounded-2xl border border-white/5">
                  {/* Car Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={car.image} 
                      alt={carName}
                      className="w-20 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg">{carName}</p>
                      <p className="text-gray-400 text-sm">{car.plate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold-500 font-bold">
                        {car.status === CarStatus.MAINTENANCE ? '🔧 صيانة' : '✅ متاح'}
                      </p>
                    </div>
                  </div>

                  {/* Bookings List */}
                  {sortedRentals.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">لا توجد حجوزات</p>
                  ) : (
                    <div className="space-y-3">
                      {sortedRentals.map((rental) => {
                        const displayStatus = getRentalDisplayStatus(rental);
                        const statusColor = displayStatus === 'active' ? 'bg-green-600/20 border-green-600' : 
                                          displayStatus === 'reserved' ? 'bg-blue-600/20 border-blue-600' : 
                                          'bg-gray-600/20 border-gray-600';
                        const statusDot = displayStatus === 'active' ? '🟢' : 
                                        displayStatus === 'reserved' ? '🔵' : '⚪';
                        
                        return (
                          <div key={rental.id} className={`${statusColor} border rounded-lg p-4 flex items-center justify-between`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{statusDot}</span>
                                <p className="text-white font-semibold">{rental.customer.name}</p>
                              </div>
                              <div className="flex gap-6 text-sm text-gray-300">
                                <span>📅 من: <span className="text-white font-mono">{rental.startDate.split('T')[0]}</span></span>
                                <span>📅 إلى: <span className="text-white font-mono">{rental.expectedEndDate.split('T')[0]}</span></span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${displayStatus === 'active' ? 'text-green-400' : displayStatus === 'reserved' ? 'text-blue-400' : 'text-gray-400'}`}>
                                {displayStatus === 'active' ? 'مؤجّر' : displayStatus === 'reserved' ? 'محجوز' : 'منتهي'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Availability;
