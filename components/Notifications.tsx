import React from 'react';
import { Car } from '../types';
import { Bell, X, AlertTriangle, Wrench } from 'lucide-react';
import Modal from './Modal';

interface NotificationsProps {
  cars: Car[];
  isOpen: boolean;
  onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ cars, isOpen, onClose }) => {
  // السيارات التي تحتاج صيانة (عندما يكون العداد الحالي قريب من موعد الصيانة التالي)
  const carsNeedingMaintenance = cars.filter(car => {
    const currentMileage = car.currentMileage ?? 0;
    const lastMaintenance = car.lastMaintenanceMileage ?? 0;
    const interval = car.maintenanceIntervalKm ?? 8000;
    const nextMaintenance = lastMaintenance + interval;
    const remainingKm = nextMaintenance - currentMileage;
    
    // تنبيه إذا بقي 500 كم أو أقل للصيانة القادمة
    return remainingKm <= 500 && remainingKm >= 0;
  });

  // السيارات التي انتهى تأمينها أو سينتهي خلال 30 يوم
  const carsWithInsuranceIssues = cars.filter(car => {
    if (!car.insuranceEndDate) return false;
    
    const endDate = new Date(car.insuranceEndDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // تنبيه إذا انتهى التأمين أو سينتهي خلال 30 يوم
    return diffDays <= 30;
  });

  const totalNotifications = carsNeedingMaintenance.length + carsWithInsuranceIssues.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="الإشعارات والتنبيهات">
      <div className="space-y-4">
        {totalNotifications === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex p-6 bg-green-500/10 rounded-full text-green-500 mb-4">
              <Bell size={48} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">لا توجد تنبيهات</h3>
            <p className="text-gray-400">جميع السيارات في حالة جيدة</p>
          </div>
        ) : (
          <>
            {/* السيارات التي تحتاج صيانة */}
            {carsNeedingMaintenance.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wrench size={18} className="text-yellow-500" />
                  <h3 className="text-lg font-bold text-white">سيارات تحتاج صيانة ({carsNeedingMaintenance.length})</h3>
                </div>
                <div className="space-y-2">
                  {carsNeedingMaintenance.map(car => {
                    const currentMileage = car.currentMileage ?? 0;
                    const lastMaintenance = car.lastMaintenanceMileage ?? 0;
                    const interval = car.maintenanceIntervalKm ?? 8000;
                    const nextMaintenance = lastMaintenance + interval;
                    const remainingKm = nextMaintenance - currentMileage;
                    
                    return (
                      <div key={car.id} className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={car.image} alt={car.model} className="w-16 h-10 object-cover rounded-lg" />
                            <div>
                              <p className="font-bold text-white">{car.make} {car.model}</p>
                              <p className="text-xs text-gray-400 font-mono">{car.plate}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-yellow-400 font-bold text-sm">متبقي {remainingKm.toLocaleString()} كم</p>
                            <p className="text-xs text-gray-400">العداد الحالي: {currentMileage.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* السيارات مع مشاكل التأمين */}
            {carsWithInsuranceIssues.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={18} className="text-orange-500" />
                  <h3 className="text-lg font-bold text-white">تنبيهات التأمين ({carsWithInsuranceIssues.length})</h3>
                </div>
                <div className="space-y-2">
                  {carsWithInsuranceIssues.map(car => {
                    const endDate = new Date(car.insuranceEndDate!);
                    const today = new Date();
                    const diffTime = endDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const isExpired = diffDays < 0;
                    
                    return (
                      <div key={car.id} className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={car.image} alt={car.model} className="w-16 h-10 object-cover rounded-lg" />
                            <div>
                              <p className="font-bold text-white">{car.make} {car.model}</p>
                              <p className="text-xs text-gray-400 font-mono">{car.plate}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            {isExpired ? (
                              <p className="text-red-500 font-bold text-sm">انتهى منذ {Math.abs(diffDays)} يوم</p>
                            ) : (
                              <p className="text-orange-400 font-bold text-sm">ينتهي خلال {diffDays} يوم</p>
                            )}
                            <p className="text-xs text-gray-400">
                              {endDate.toLocaleDateString('ar-JO')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default Notifications;
