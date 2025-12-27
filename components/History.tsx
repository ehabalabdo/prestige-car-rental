import React, { useState } from 'react';
import { Rental, Car } from '../types';
import { Search } from 'lucide-react';
import { formatCurrency, getRentalDisplayStatus, getStatusLabel, getStatusColor, formatDateNumeric } from '../utils';


interface HistoryProps {
  history: Rental[];
  cars: Car[];
}

const History: React.FC<HistoryProps> = ({ history = [], cars = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = (history ?? []).filter(rental => 
    (rental?.customer?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rental?.id ?? '').includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gold-500">الأرشيف والسجلات</h1>
      </div>

      <div className="relative">
         <input 
            type="text" 
            placeholder="بحث باسم العميل أو رقم العقد..."
            className="w-full bg-black-800 border border-white/10 rounded-xl py-3 px-12 text-white focus:border-gold-500 outline-none transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
         />
         <Search className="absolute right-4 top-3.5 text-gray-500" size={20} />
      </div>

      <div className="bg-black-800 rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead className="bg-black-900/50 text-gray-400 text-sm uppercase">
                <tr>
                    <th className="p-4">رقم العقد</th>
                    <th className="p-4">العميل</th>
                    <th className="p-4">السيارة</th>
                    <th className="p-4">تاريخ البدء</th>
                    <th className="p-4">تاريخ الانتهاء</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">التكلفة</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                {filteredHistory.map((rental) => {
                    const car = cars.find(c => c.id === rental?.carId);
                    const startDate = rental?.startDate ? formatDateNumeric(rental.startDate) : '—';
                    const endDate = rental?.actualEndDate ? formatDateNumeric(rental.actualEndDate) : '—';
                    const cost = rental?.totalCost ?? 0;
                    const displayStatus = getRentalDisplayStatus(rental);
                    return (
                    <tr key={rental?.id ?? Math.random()} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-xs font-mono text-gray-500">#{rental?.id ?? '—'}</td>
                        <td className="p-4 font-medium text-white">{rental?.customer?.name ?? '—'}</td>
                        <td className="p-4 text-gray-300">{car ? `${car.make} ${car.model}` : 'محذوفة'}</td>
                        <td className="p-4 text-gray-400">{startDate}</td>
                        <td className="p-4 text-gray-400">{endDate}</td>
                        <td className={`p-4 font-bold ${getStatusColor(displayStatus)}`}>{getStatusLabel(displayStatus)}</td>
                        <td className="p-4 text-gold-500 font-bold">{formatCurrency(cost)}</td>
                    </tr>
                    );
                })}
                {filteredHistory.length === 0 && (
                    <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">لا توجد سجلات مطابقة</td>
                    </tr>
                )}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default History;