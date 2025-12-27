import React from 'react';
import { Car, Rental, CarStatus } from '../types';
import { CarFront, Banknote, CalendarCheck, Activity, CheckCircle2, Clock, AlertTriangle, ChevronLeft, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils';
import { formatDateNumeric } from '@/utils/date';


interface DashboardProps {
  cars?: Car[];
  rentals?: Rental[];
  history?: Rental[];
  onCarClick: (carId: string) => void;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; subtext?: string; trend?: string }> = ({ title, value, icon, subtext, trend }) => (
  <div className="bg-black-800 p-6 rounded-2xl border border-white/5 hover:border-gold-500/50 transition-all shadow-xl group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-4 bg-gold-500/5 rounded-2xl text-gold-500 group-hover:bg-gold-500 group-hover:text-black-900 transition-all duration-500">
        {icon}
      </div>
      {trend && <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{trend}</span>}
    </div>
    <div>
      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white font-sans">{value}</h3>
      {subtext && <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
        {subtext}
      </p>}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ cars = [], rentals = [], history = [], onCarClick }) => {
  const totalRevenue = (history ?? []).reduce((acc, curr) => acc + (curr?.totalCost ?? 0), 0);
  const activeRentalsCount = rentals?.length ?? 0;
  const availableCarsCount = (cars ?? []).filter(c => c.status === CarStatus.AVAILABLE).length;
  const maintenanceCount = (cars ?? []).filter(c => c.status === CarStatus.MAINTENANCE).length;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-gold-500 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <ShieldCheck size={32} className="text-black-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">برستيج لتأجير السيارات الفاخرة</h1>
              <p className="text-gray-500 text-xs uppercase tracking-widest font-bold text-gold-500/80">PRESTIGE LUXURY RENTAL - JORDAN</p>
            </div>
        </div>
        <div className="bg-black-800 px-5 py-2.5 rounded-2xl border border-white/5 text-[10px] text-gold-500 font-bold shadow-inner">
          {formatDateNumeric(new Date())}
        </div>
      </header>

      {/* Fleet Overview Section - MOVED TO TOP */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gold-500 rounded-full"></div>
                إدارة الأسطول السريعة
            </h2>
            <div className="hidden sm:flex gap-5 text-[9px] uppercase font-bold tracking-[0.2em] bg-black-800/80 px-4 py-2 rounded-full border border-white/10">
                <span className="flex items-center gap-2 text-green-500"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span> متاح</span>
                <span className="flex items-center gap-2 text-blue-500"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span> مؤجر</span>
                <span className="flex items-center gap-2 text-red-500"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"></span> صيانة</span>
            </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cars.map(car => (
                <div 
                    key={car.id} 
                    onClick={() => onCarClick(car.id)}
                    className="bg-black-800 rounded-3xl border border-white/5 overflow-hidden group hover:border-gold-500/50 transition-all cursor-pointer relative shadow-2xl transform hover:-translate-y-2 duration-500"
                >
                    <div className="h-40 relative overflow-hidden">
                        <img src={car.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black-800 via-transparent to-transparent opacity-90" />
                        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[9px] font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/20 ${
                            car.status === CarStatus.AVAILABLE ? 'bg-green-500/90 text-black' :
                            car.status === CarStatus.RENTED ? 'bg-blue-500/90 text-white' :
                            'bg-red-500/90 text-white'
                        }`}>
                            {car.status === CarStatus.AVAILABLE ? <CheckCircle2 size={12}/> : 
                             car.status === CarStatus.RENTED ? <Clock size={12}/> : <AlertTriangle size={12}/>}
                            {car.status}
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-base font-bold text-white group-hover:text-gold-500 transition-colors truncate">{car.make} {car.model}</h3>
                            <span className="text-[10px] font-mono text-gray-500 bg-black-900 px-2 py-0.5 rounded border border-white/5">{car.plate}</span>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <div>
                                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">السعر الأساسي</p>
                                <p className="text-base font-bold text-gold-500">{car.dailyRate} د.أ</p>
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">العداد</p>
                                <p className="text-xs font-mono text-white bg-black-900/50 px-2 py-1 rounded-lg">{(car.currentMileage ?? 0).toLocaleString()} كم</p>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center text-gold-500 text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                            {car.status === CarStatus.AVAILABLE ? 'اضغط لتأجير السيارة' : 'عرض وإدارة العقد'}
                            <ChevronLeft size={14} className="mr-2" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Stats Grid - MOVED DOWN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        <StatCard 
          title="حجم الأسطول" 
          value={cars.length.toString()} 
          icon={<CarFront size={28} />} 
          subtext={`${availableCarsCount} سيارة متاحة`}
        />
        <StatCard 
          title="عقود نشطة" 
          value={activeRentalsCount.toString()} 
          icon={<CalendarCheck size={28} />} 
          trend="Live"
        />
        <StatCard 
          title="إجمالي الدخل" 
          value={formatCurrency(totalRevenue)} 
          icon={<Banknote size={28} />} 
          subtext="إيرادات السجل"
        />
        <StatCard 
          title="تنبيهات الصيانة" 
          value={maintenanceCount.toString()} 
          icon={<Activity size={28} />} 
        />
      </div>
    </div>
  );
};

export default Dashboard;