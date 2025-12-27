import React, { useState } from 'react';
import { Car, CarStatus } from '../types';
import { Plus, Fuel, Gauge, Trash2, Pencil } from 'lucide-react';
import Modal from './Modal';
import { generateId, formatCurrency } from '../utils';

interface CarsProps {
  cars: Car[];
  onAddCar: (car: Car) => void;
  onDeleteCar: (id: string) => void;
  onUpdateStatus: (id: string, status: CarStatus) => void;
  onUpdateCar: (car: Car) => void;
}

const Cars: React.FC<CarsProps> = ({ cars, onAddCar, onDeleteCar, onUpdateStatus, onUpdateCar }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCar, setNewCar] = useState<Partial<Car>>({
    status: CarStatus.AVAILABLE,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
    currentMileage: undefined
  });
  const [editingCarId, setEditingCarId] = useState<string | null>(null);

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingCarId(null);
    setNewCar({ status: CarStatus.AVAILABLE, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800', currentMileage: undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCar.make || !newCar.model || newCar.dailyRate === undefined || newCar.currentMileage === undefined) return;

    const mileage = Number(newCar.currentMileage);
    if (Number.isNaN(mileage)) return;

    if (editingCarId) {
      const existing = cars.find(c => c.id === editingCarId);
      if (!existing) {
        resetForm();
        return;
      }
      const updatedCar: Car = {
        ...existing,
        make: newCar.make,
        model: newCar.model,
        year: newCar.year || existing.year,
        plate: newCar.plate || existing.plate,
        color: newCar.color || existing.color,
        dailyRate: Number(newCar.dailyRate),
        currentMileage: mileage,
        nextMaintenanceMileage: mileage + 10000,
        image: newCar.image || existing.image
      };
      onUpdateCar(updatedCar);
      resetForm();
      return;
    }

    const car: Car = {
      id: generateId(),
      make: newCar.make,
      model: newCar.model,
      year: newCar.year || new Date().getFullYear(),
      plate: newCar.plate || '---',
      color: newCar.color || 'أسود',
      dailyRate: Number(newCar.dailyRate),
      currentMileage: mileage,
      nextMaintenanceMileage: mileage + 10000,
      image: newCar.image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
      status: CarStatus.AVAILABLE
    };
    onAddCar(car);
    resetForm();
  };

  const handleEditClick = (car: Car) => {
    setEditingCarId(car.id);
    setNewCar({ ...car });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gold-500">الأسطول الملكي</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gold-500 text-black-900 px-6 py-3 rounded-lg font-bold hover:bg-gold-600 transition-all w-full md:w-auto justify-center"
        >
          <Plus size={20} />
          إضافة سيارة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div key={car.id} className="group bg-black-800 rounded-xl overflow-hidden border border-white/5 hover:border-gold-500/50 transition-all shadow-lg relative flex flex-col">
             <div className="absolute top-4 right-4 z-10">
                <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    car.status === CarStatus.AVAILABLE ? 'bg-green-500 text-black' :
                    car.status === CarStatus.RENTED ? 'bg-blue-500 text-white' :
                    'bg-red-500 text-white'
                }`}>
                    {car.status}
                </span>
             </div>
            <div className="h-52 overflow-hidden relative">
              <img src={car.image} alt={car.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black-800 via-transparent to-transparent" />
              <div className="absolute bottom-4 right-4 text-white">
                 <h3 className="text-2xl font-bold leading-tight">{car.make}</h3>
                 <p className="text-gold-500 text-sm">{car.model} - {car.year}</p>
              </div>
            </div>
            
            <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
              <div className="flex justify-between text-xs text-gray-400 bg-black-900/50 p-3 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                   <Gauge size={14} className="text-gold-500" />
                   <span>{(car.currentMileage ?? 0).toLocaleString()} كم</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full border border-gray-600" style={{ backgroundColor: car.color }}></div>
                   <span>{car.color}</span>
                </div>
                <div className="text-gray-500 font-mono">
                  {car.plate}
                </div>
              </div>
              
              <div className="flex justify-between items-center border-t border-white/10 pt-5">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase">Daily Rate</span>
                    <span className="text-xl font-bold text-white">{formatCurrency(car.dailyRate)}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEditClick(car)} className="text-gray-500 hover:text-gold-500 transition-colors" title="تعديل بيانات السيارة">
                    <Pencil size={20} />
                  </button>
                    {car.status === CarStatus.MAINTENANCE ? (
                         <button onClick={() => onUpdateStatus(car.id, CarStatus.AVAILABLE)} className="bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black-900 text-[10px] font-bold px-3 py-1.5 rounded transition-all">إرجاع للخدمة</button>
                    ) : (
                         <button onClick={() => onUpdateStatus(car.id, CarStatus.MAINTENANCE)} className="text-gray-500 hover:text-gold-500 transition-colors" title="إرسال للصيانة">
                            <Fuel size={20} />
                         </button>
                    )}
                    <button onClick={() => onDeleteCar(car.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                        <Trash2 size={20} />
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

        <Modal isOpen={isModalOpen} onClose={resetForm} title={editingCarId ? 'تعديل بيانات السيارة' : 'إضافة سيارة للأسطول - عمان'}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">الماركة</label>
                    <input required type="text" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                        value={newCar.make || ''} onChange={e => setNewCar({...newCar, make: e.target.value})} placeholder="مثال: Mercedes" />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">الموديل</label>
                    <input required type="text" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                        value={newCar.model || ''} onChange={e => setNewCar({...newCar, model: e.target.value})} placeholder="مثال: G-Wagon" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">السنة</label>
                    <input required type="number" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                      value={newCar.year ?? ''} onChange={e => setNewCar({...newCar, year: Number(e.target.value)})} />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">رقم اللوحة</label>
                    <input required type="text" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                        value={newCar.plate || ''} onChange={e => setNewCar({...newCar, plate: e.target.value})} placeholder="مثال: 10-12345" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">اللون</label>
                    <input type="text" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                        value={newCar.color || ''} onChange={e => setNewCar({...newCar, color: e.target.value})} />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">السعر اليومي (د.أ)</label>
                    <input required type="number" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                    value={newCar.dailyRate ?? ''} onChange={e => setNewCar({...newCar, dailyRate: Number(e.target.value)})} />
                </div>
            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1 text-sm">العداد الحالي (كم)</label>
                  <input required type="number" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                    value={newCar.currentMileage ?? ''} onChange={e => {
                      const mileageValue = e.target.value === '' ? undefined : Number(e.target.value);
                      setNewCar({...newCar, currentMileage: mileageValue});
                    }} placeholder="مثال: 35000" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-sm">الحالة</label>
                  <input type="text" disabled className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white opacity-60" value={newCar.status || CarStatus.AVAILABLE} />
                </div>
              </div>
            <div>
                 <label className="block text-gray-400 mb-1 text-sm">رابط صورة السيارة</label>
                 <input type="text" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                        value={newCar.image} onChange={e => setNewCar({...newCar, image: e.target.value})} placeholder="URL لصورة السيارة" />
            </div>
              <button type="submit" className="w-full bg-gold-500 text-black-900 font-bold py-4 rounded-lg hover:bg-gold-600 transition-all mt-4 text-lg shadow-xl shadow-gold-500/20">
                {editingCarId ? 'حفظ التعديلات' : 'إضافة للأسطول'}
            </button>
        </form>
      </Modal>
    </div>
  );
};

export default Cars;