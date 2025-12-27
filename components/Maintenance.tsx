import React from 'react';
import { Car, CarStatus } from '../types';
import { AlertTriangle, Wrench, CheckCircle } from 'lucide-react';

interface MaintenanceProps {
  cars: Car[];
}

const Maintenance: React.FC<MaintenanceProps> = ({ cars }) => {
  const needsMaintenance = cars.filter(c => (c.currentMileage ?? 0) >= (c.nextMaintenanceMileage ?? 0));
  const inMaintenance = cars.filter(c => c.status === CarStatus.MAINTENANCE);
  const healthy = cars.filter(c => c.status !== CarStatus.MAINTENANCE && (c.currentMileage ?? 0) < (c.nextMaintenanceMileage ?? 0));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <h1 className="text-3xl font-bold text-gold-500">مراقبة الصيانة</h1>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-xl">
               <div className="flex items-center gap-4 mb-2">
                   <div className="p-3 bg-red-500/10 rounded-lg text-red-500"><AlertTriangle size={24}/></div>
                   <h3 className="text-xl font-bold text-white">تنبيهات عاجلة</h3>
               </div>
               <p className="text-gray-400 text-sm">سيارات تجاوزت حد الصيانة</p>
               <p className="text-4xl font-bold text-red-500 mt-4">{needsMaintenance.length}</p>
           </div>
           
           <div className="bg-yellow-900/10 border border-yellow-500/20 p-6 rounded-xl">
                <div className="flex items-center gap-4 mb-2">
                   <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500"><Wrench size={24}/></div>
                   <h3 className="text-xl font-bold text-white">قيد الصيانة</h3>
               </div>
               <p className="text-gray-400 text-sm">سيارات في ورشة الإصلاح حالياً</p>
               <p className="text-4xl font-bold text-yellow-500 mt-4">{inMaintenance.length}</p>
           </div>

           <div className="bg-green-900/10 border border-green-500/20 p-6 rounded-xl">
                <div className="flex items-center gap-4 mb-2">
                   <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><CheckCircle size={24}/></div>
                   <h3 className="text-xl font-bold text-white">حالة سليمة</h3>
               </div>
               <p className="text-gray-400 text-sm">سيارات جاهزة لا تحتاج صيانة</p>
               <p className="text-4xl font-bold text-green-500 mt-4">{healthy.length}</p>
           </div>
       </div>

       {needsMaintenance.length > 0 && (
           <div className="bg-black-800 rounded-xl border border-red-500/30 overflow-hidden">
               <div className="p-4 bg-red-500/10 border-b border-red-500/10">
                   <h2 className="text-red-400 font-bold flex items-center gap-2">
                       <AlertTriangle size={20} />
                       يلزم تغيير الزيت / صيانة دورية
                   </h2>
               </div>
               <div className="p-4">
                   {needsMaintenance.map(car => (
                       <div key={car.id} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                           <div className="flex items-center gap-4">
                               <img src={car.image} className="w-16 h-10 object-cover rounded" alt="" />
                               <div>
                                   <p className="font-bold text-white">{car.make} {car.model}</p>
                                   <p className="text-sm text-gray-400">{car.plate}</p>
                               </div>
                           </div>
                           <div className="text-left">
                               <p className="text-red-500 font-bold">{(car.currentMileage ?? 0).toLocaleString()} كم</p>
                               <p className="text-xs text-gray-500">الحد: {(car.nextMaintenanceMileage ?? 0).toLocaleString()}</p>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       )}
    </div>
  );
};

export default Maintenance;