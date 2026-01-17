import React, { useState } from 'react';
import { Car, MaintenanceRecord } from '../types';
import { Plus, Trash2 } from 'lucide-react';
import Modal from './Modal';
import { generateId } from '../utils';

interface MaintenanceProps {
  cars: Car[];
  onAddMaintenanceRecord: (carId: string, record: MaintenanceRecord) => void;
  onDeleteMaintenanceRecord: (carId: string, recordId: string) => void;
}

const Maintenance: React.FC<MaintenanceProps> = ({ cars, onAddMaintenanceRecord, onDeleteMaintenanceRecord }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [newRecord, setNewRecord] = useState<Partial<MaintenanceRecord>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    cost: 0,
    mileage: undefined
  });

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarId || !newRecord.description || !newRecord.date || newRecord.cost === undefined) return;

    const record: MaintenanceRecord = {
      id: generateId(),
      date: newRecord.date,
      description: newRecord.description,
      cost: Number(newRecord.cost),
      mileage: newRecord.mileage ? Number(newRecord.mileage) : undefined
    };

    onAddMaintenanceRecord(selectedCarId, record);
    setIsModalOpen(false);
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      description: '',
      cost: 0,
      mileage: undefined
    });
    setSelectedCarId(null);
  };

  const openAddRecordModal = (carId: string) => {
    setSelectedCarId(carId);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-gold-500">مراقبة الصيانة</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map(car => (
          <div key={car.id} className="bg-black-800 rounded-xl border border-white/10 overflow-hidden hover:border-gold-500/50 transition-all">
            {/* Car Header */}
            <div className="h-32 relative overflow-hidden bg-black-900">
              <img src={car.image} className="w-full h-full object-cover opacity-60" alt={`${car.make} ${car.model}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black-800 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="font-bold text-white text-lg">{car.make} {car.model}</p>
                <p className="text-xs text-gray-400 mt-1">اللوحة: {car.plate}</p>
              </div>
            </div>

            {/* Car Details */}
            <div className="p-4 space-y-3 border-b border-white/5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">العداد الحالي</p>
                  <p className="text-white font-bold">{(car.currentMileage ?? 0).toLocaleString()} كم</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">السعر اليومي</p>
                  <p className="text-gold-500 font-bold">{car.dailyRate} د.ا</p>
                </div>
              </div>
            </div>

            {/* Maintenance History - Always Visible */}
            <div className="p-4 space-y-3 border-b border-white/5 bg-black-900/50">
              {car.maintenanceHistory && car.maintenanceHistory.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-white font-semibold text-sm">سجل الصيانة:</h4>
                  {car.maintenanceHistory.map(record => (
                    <div key={record.id} className="bg-white/10 p-3 rounded-lg text-sm space-y-2 border border-gold-500/20">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="text-white font-semibold">{record.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteMaintenanceRecord(car.id, record.id)}
                          className="text-red-500 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <p className="text-gray-300">📅 {new Date(record.date).toLocaleDateString('ar-SA')}</p>
                        {record.mileage && <p className="text-gray-300">🚗 {record.mileage.toLocaleString()} كم</p>}
                      </div>
                      <p className="text-gold-400 font-bold text-sm">💰 {record.cost.toLocaleString()} د.ا</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">لا توجد سجلات صيانة</p>
              )}
            </div>

            {/* Add Record Button */}
            <div className="p-4 bg-black-900/50">
              <button
                type="button"
                onClick={() => openAddRecordModal(car.id)}
                className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-black-900 px-4 py-2.5 rounded-lg font-bold transition-all"
              >
                <Plus size={18} />
                إضافة سجل صيانة
              </button>
            </div>
          </div>
        ))}
      </div>

      {cars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">لا توجد سيارات في الأسطول</p>
        </div>
      )}

      {/* Add Record Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة سجل صيانة">
        <form onSubmit={handleAddRecord} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-bold mb-2">التاريخ</label>
            <input
              type="date"
              value={newRecord.date || ''}
              onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
              className="w-full px-4 py-2 bg-black-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-bold mb-2">نوع الصيانة (وصف)</label>
            <input
              type="text"
              placeholder="مثال: تغيير الزيت والفلتر، فحص المحرك، إلخ"
              value={newRecord.description || ''}
              onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
              className="w-full px-4 py-2 bg-black-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-gold-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-bold mb-2">التكلفة (د.ا)</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={newRecord.cost || ''}
                onChange={(e) => setNewRecord({ ...newRecord, cost: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-black-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-bold mb-2">المسافة (كم) <span className="text-gray-400">(اختياري)</span></label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={newRecord.mileage || ''}
                onChange={(e) => setNewRecord({ ...newRecord, mileage: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2 bg-black-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-gold-500 text-black-900 px-4 py-2 rounded-lg font-bold hover:bg-gold-600 transition-all"
            >
              حفظ السجل
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Maintenance;