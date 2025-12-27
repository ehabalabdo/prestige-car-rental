
import React, { useState, useEffect } from 'react';
import { Car, Rental, CarStatus, RentalStatus } from '../types';
import { generateId, formatCurrency, calculateDays } from '../utils';
import { formatDateNumeric } from '@/utils/date';

import { User, Phone, Clock, ArrowRightLeft, AlertCircle, Gauge, PlusCircle, Banknote } from 'lucide-react';
import Modal from './Modal';

interface RentalsProps {
  cars: Car[];
  rentals: Rental[];
  onRentCar: (rental: Rental) => void;
  onReturnCar: (rentalId: string, endMileage: number) => void;
  onExtendRental: (rentalId: string, additionalDays: number) => void;
  onUpdateRental: (rental: Rental) => void;
  initialSelectedCarId?: string;
}

const Rentals: React.FC<RentalsProps> = ({ cars, rentals, onRentCar, onReturnCar, onExtendRental, onUpdateRental, initialSelectedCarId }) => {
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isFineModalOpen, setIsFineModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const [selectedCarId, setSelectedCarId] = useState('');
  const [selectedRentalForReturn, setSelectedRentalForReturn] = useState<Rental | null>(null);
  const [selectedRentalForExtend, setSelectedRentalForExtend] = useState<Rental | null>(null);
  const [selectedRentalForFine, setSelectedRentalForFine] = useState<Rental | null>(null);
  const [selectedRentalForPayment, setSelectedRentalForPayment] = useState<Rental | null>(null);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [manualDailyRate, setManualDailyRate] = useState(0);
  const [extensionDays, setExtensionDays] = useState(1);
  const [startMileage, setStartMileage] = useState(0);
  const [returnMileage, setReturnMileage] = useState(0);
  const [fineAmount, setFineAmount] = useState(0);
  const [fineAmountInput, setFineAmountInput] = useState<number>(0);
  const [fineDateInput, setFineDateInput] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [fineNoteInput, setFineNoteInput] = useState<string>('');
  const [paymentAmountInput, setPaymentAmountInput] = useState<number>(0);
  const [paymentDateInput, setPaymentDateInput] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [paymentNoteInput, setPaymentNoteInput] = useState<string>('');

  // Sync initialSelectedCarId if provided
  useEffect(() => {
    if (initialSelectedCarId) {
      setSelectedCarId(initialSelectedCarId);
      const car = cars.find(c => c.id === initialSelectedCarId);
      if (car) {
          setStartMileage(car.currentMileage);
          setManualDailyRate(car.dailyRate);
      }
      setIsRentModalOpen(true);
    }
  }, [initialSelectedCarId, cars]);

  const availableCars = cars.filter(c => c.status === CarStatus.AVAILABLE);
  const selectedCar = cars.find(c => c.id === selectedCarId);

  const handleCarChange = (id: string) => {
    setSelectedCarId(id);
    const car = cars.find(c => c.id === id);
    if (car) {
        setStartMileage(car.currentMileage);
        setManualDailyRate(car.dailyRate);
    }
  };

  const handleRentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCar) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
    if (end < start) {
      alert('تاريخ التسليم يجب أن يكون بعد تاريخ الاستلام');
      return;
    }

    const days = calculateDays(start.toISOString(), end.toISOString());
    const baseCost = manualDailyRate * days;

    const rental: Rental = {
      id: generateId(),
      carId: selectedCar.id,
      customer: {
        name: customerName,
        phone: customerPhone,
        nationalId: '000'
      },
      startDate: start.toISOString(),
      expectedEndDate: end.toISOString(),
      startMileage: Number(startMileage),
      baseCost,
      fines: [],
      payments: [],
      totalCost: baseCost,
      status: RentalStatus.ACTIVE
    };

    onRentCar(rental);
    setIsRentModalOpen(false);
    resetForm();
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRentalForReturn) {
      onReturnCar(selectedRentalForReturn.id, returnMileage);
      setIsReturnModalOpen(false);
      setReturnMileage(0);
      setSelectedRentalForReturn(null);
    }
  };

  const handleExtendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRentalForExtend) {
      onExtendRental(selectedRentalForExtend.id, extensionDays);
      setIsExtendModalOpen(false);
      setSelectedRentalForExtend(null);
      setExtensionDays(1);
    }
  };

  const openReturnModal = (rental: Rental) => {
    setSelectedRentalForReturn(rental);
    setReturnMileage(rental.startMileage + 10); 
    setIsReturnModalOpen(true);
  };

  const openExtendModal = (rental: Rental) => {
    setSelectedRentalForExtend(rental);
    setIsExtendModalOpen(true);
  };

  const openFineModal = (rental: Rental) => {
    setSelectedRentalForFine(rental);
    setFineAmount(rental.fineAmount ?? 0);
    setFineAmountInput(0);
    setFineDateInput(new Date().toISOString().split('T')[0]);
    setFineNoteInput('');
    setIsFineModalOpen(true);
  };

  const openPaymentModal = (rental: Rental) => {
    setSelectedRentalForPayment(rental);
    setPaymentAmountInput(0);
    setPaymentDateInput(new Date().toISOString().split('T')[0]);
    setPaymentNoteInput('');
    setIsPaymentModalOpen(true);
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setSelectedCarId('');
    setStartMileage(0);
    setManualDailyRate(0);
    setFineAmount(0);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(tomorrow.toISOString().split('T')[0]);
  };

  const rentalDays = calculateDays(new Date(startDate).toISOString(), new Date(endDate).toISOString());

  const handleFineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRentalForFine) return;
    const baseCost = selectedRentalForFine.baseCost ?? selectedRentalForFine.totalCost;
    const newFine = { id: generateId(), amount: Number(fineAmountInput) || 0, date: new Date(fineDateInput).toISOString(), note: fineNoteInput || undefined };
    const fines = [...(selectedRentalForFine.fines || []), newFine];
    const finesTotal = fines.reduce((s, f) => s + (f.amount || 0), 0);
    const updatedRental: Rental = {
      ...selectedRentalForFine,
      fines,
      totalCost: baseCost + finesTotal
    };
    onUpdateRental(updatedRental);
    setIsFineModalOpen(false);
    setSelectedRentalForFine(null);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRentalForPayment) return;
    const newPayment = { id: generateId(), amount: Number(paymentAmountInput) || 0, date: new Date(paymentDateInput).toISOString(), note: paymentNoteInput || undefined };
    const payments = [...(selectedRentalForPayment.payments || []), newPayment];
    const updatedRental: Rental = { ...selectedRentalForPayment, payments };
    onUpdateRental(updatedRental);
    setIsPaymentModalOpen(false);
    setSelectedRentalForPayment(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gold-500">العقود النشطة</h1>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Rental Agreement Management</p>
        </div>
        <button 
          onClick={() => {
              resetForm();
              setIsRentModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-l from-gold-500 to-gold-600 text-black-900 px-8 py-4 rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all w-full md:w-auto justify-center shadow-lg"
        >
          <PlusCircle size={20} />
          إنشاء عقد إيجار فوري
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rentals.map((rental) => {
          const car = cars.find(c => c.id === rental.carId);
          return (
            <div key={rental.id} className="bg-black-800 p-6 rounded-[2.5rem] border border-gold-500/10 shadow-2xl relative overflow-hidden group hover:border-gold-500/40 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gold-500/10 rounded-2xl text-gold-500">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{rental.customer.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10}/> {rental.customer.phone}</p>
                  </div>
                </div>
                <div className="text-left">
                    <span className="text-[10px] font-mono text-gray-500 bg-black-900 px-2 py-1 rounded border border-white/5">#{rental.id.toUpperCase()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-black-900/50 p-4 rounded-2xl border border-white/5">
                   <img src={car?.image} className="w-32 h-20 object-cover rounded-xl" alt="" />
                   <div>
                      <p className="text-sm font-bold text-white">{car?.make} {car?.model}</p>
                      <p className="text-[10px] text-gold-500 font-mono">{car?.plate}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black-900/30 p-3 rounded-xl">
                        <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">تاريخ البدء</p>
                        <p className="text-xs text-white flex items-center gap-2"><Clock size={12} className="text-gold-500"/> {formatDateNumeric(rental.startDate)}</p>
                    </div>
                    <div className="bg-black-900/30 p-3 rounded-xl">
                        <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">تاريخ التسليم المتوقع</p>
                        <p className="text-xs text-white flex items-center gap-2"><Clock size={12} className="text-red-500"/> {formatDateNumeric(rental.expectedEndDate)}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <div>
                        <p className="text-[9px] text-gray-500 uppercase font-bold">إجمالي التكلفة</p>
                        <p className="text-lg font-bold text-gold-500">{formatCurrency(rental.totalCost)}</p>
                        <p className="text-[11px] text-gray-400">المخالفات: {formatCurrency((rental.fines || []).reduce((s,f)=>s+(f.amount||0),0))}</p>
                        <p className="text-[11px] text-gray-400">الدفعات: {formatCurrency((rental.payments || []).reduce((s,p)=>s+(p.amount||0),0))}</p>
                        <p className="text-[11px] text-green-400 font-bold">المتبقي: {formatCurrency(rental.totalCost - (rental.payments || []).reduce((s,p)=>s+(p.amount||0),0))}</p>
                    </div>
                      <div className="flex gap-2">
                         <button 
                            onClick={() => openExtendModal(rental)}
                            className="p-2.5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            title="تجديد العقد"
                         >
                             <ArrowRightLeft size={18} />
                         </button>
                         <button 
                           onClick={() => openFineModal(rental)}
                           className="p-2.5 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-xl transition-all"
                           title="إضافة مخالفة"
                         >
                           <AlertCircle size={18} />
                         </button>
                         <button 
                           onClick={() => openPaymentModal(rental)}
                           className="p-2.5 bg-white/5 text-gray-400 hover:text-green-400 hover:bg-white/10 rounded-xl transition-all"
                           title="إضافة دفعة"
                         >
                           <Banknote size={18} />
                         </button>
                         <button 
                            onClick={() => openReturnModal(rental)}
                            className="bg-gold-500 text-black-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gold-600 transition-all"
                         >
                             إغلاق العقد
                         </button>
                    </div>
                </div>

                {(rental.fines || []).length > 0 && (
                  <div className="mt-4 bg-black-900/30 p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase font-bold mb-2">المخالفات المسجلة</p>
                    <div className="space-y-2">
                      {(rental.fines || []).map((fine) => (
                        <div key={fine.id} className="flex justify-between items-center text-xs bg-black-900/40 p-2 rounded-lg">
                          <div className="text-white">
                            <span className="text-gray-400">{formatDateNumeric(fine.date)}</span>
                            <span className="mx-2">•</span>
                            <span className="font-bold text-red-400">{formatCurrency(fine.amount)}</span>
                            {fine.note && <span className="text-gray-400 ml-2">— {fine.note}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(rental.payments || []).length > 0 && (
                  <div className="mt-4 bg-black-900/30 p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase font-bold mb-2">الدفعات المسجلة</p>
                    <div className="space-y-2">
                      {(rental.payments || []).map((pmt) => (
                        <div key={pmt.id} className="text-xs bg-black-900/40 p-2 rounded-lg text-white">
                          <span className="text-gray-400">{formatDateNumeric(pmt.date)}</span>
                          <span className="mx-2">•</span>
                          <span className="font-bold text-green-400">{formatCurrency(pmt.amount)}</span>
                          {pmt.note && <span className="text-gray-400 ml-2">— {pmt.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {rentals.length === 0 && (
          <div className="col-span-full py-20 text-center bg-black-800 rounded-[2.5rem] border border-dashed border-white/10">
              <div className="inline-flex p-6 bg-white/5 rounded-full text-gray-600 mb-4">
                  <AlertCircle size={48} />
              </div>
              <h3 className="text-xl font-bold text-white">لا توجد عقود نشطة حالياً</h3>
              <p className="text-gray-500 mt-2">ابدأ بتأجير سيارة من الأسطول</p>
          </div>
        )}
      </div>

      {/* Rent Modal */}
      <Modal isOpen={isRentModalOpen} onClose={() => { setIsRentModalOpen(false); resetForm(); }} title="عقد إيجار جديد">
        <form onSubmit={handleRentSubmit} className="space-y-5">
            <div>
                <label className="block text-gray-400 mb-1 text-sm">اختر السيارة</label>
                <select 
                    required 
                    className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none"
                    value={selectedCarId}
                    onChange={(e) => handleCarChange(e.target.value)}
                >
                    <option value="">-- اختر من الأسطول المتاح --</option>
                    {availableCars.map(car => (
                        <option key={car.id} value={car.id}>{car.make} {car.model} ({car.plate})</option>
                    ))}
                    {initialSelectedCarId && !availableCars.find(c => c.id === initialSelectedCarId) && selectedCar && (
                        <option value={selectedCar.id}>{selectedCar.make} {selectedCar.model} ({selectedCar.plate})</option>
                    )}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">اسم العميل</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-500" size={18} />
                        <input required type="text" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-gold-500 outline-none" 
                            value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="الاسم الرباعي" />
                    </div>
                </div>
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">رقم الهاتف</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 text-gray-500" size={18} />
                        <input required type="tel" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-gold-500 outline-none" 
                            value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="07XXXXXXXX" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 mb-1 text-sm">تاريخ الاستلام</label>
                <input required type="date" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                  value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 text-sm">تاريخ التسليم</label>
                <input required type="date" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                  value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">السعر اليومي المتفق</label>
                    <input required type="number" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                        value={manualDailyRate} onChange={e => setManualDailyRate(Number(e.target.value))} />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">عداد البداية</label>
                    <div className="relative">
                        <Gauge className="absolute left-3 top-3 text-gray-500" size={18} />
                        <input required type="number" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-gold-500 outline-none" 
                            value={startMileage} onChange={e => setStartMileage(Number(e.target.value))} />
                    </div>
                </div>
            </div>

            <div className="bg-gold-500/5 p-4 rounded-xl border border-gold-500/20 flex justify-between items-center">
                <div className="flex items-center gap-3 text-gold-500">
                    <Banknote size={24} />
                <span className="font-bold">المبلغ الإجمالي المستحق ({rentalDays} يوم)</span>
                </div>
              <span className="text-2xl font-bold text-white">{formatCurrency(manualDailyRate * rentalDays)}</span>
            </div>

            <button type="submit" className="w-full bg-gold-500 text-black-900 font-bold py-4 rounded-lg hover:bg-gold-600 transition-all mt-4 text-lg">
                تأكيد العملية وإصدار العقد
            </button>
        </form>
      </Modal>

      {/* Return Modal */}
      <Modal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} title="إغلاق العقد واستلام المركبة">
          <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div className="bg-white/5 p-4 rounded-xl mb-4">
                  <p className="text-gray-400 text-xs mb-1">السيارة</p>
                  <p className="text-white font-bold">{cars.find(c => c.id === selectedRentalForReturn?.carId)?.make} {cars.find(c => c.id === selectedRentalForReturn?.carId)?.model}</p>
                  <p className="text-xs text-gold-500">عداد البداية: {selectedRentalForReturn?.startMileage.toLocaleString()} كم</p>
              </div>
              <div>
                  <label className="block text-gray-400 mb-1 text-sm">عداد القراءة الحالي (عند الاستلام)</label>
                  <input required type="number" min={selectedRentalForReturn?.startMileage || 0} className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                      value={returnMileage} onChange={e => setReturnMileage(Number(e.target.value))} />
              </div>
              <p className="text-xs text-gray-500">المسافة المقطوعة: {Math.max(0, returnMileage - (selectedRentalForReturn?.startMileage || 0)).toLocaleString()} كم</p>
              <button type="submit" className="w-full bg-green-500 text-black-900 font-bold py-4 rounded-lg hover:bg-green-600 transition-all mt-4">
                  تأكيد الاستلام وإغلاق الملف
              </button>
          </form>
      </Modal>

      {/* Extend Modal */}
      <Modal isOpen={isExtendModalOpen} onClose={() => setIsExtendModalOpen(false)} title="تمديد فترة الإيجار">
          <form onSubmit={handleExtendSubmit} className="space-y-4">
              <div>
                  <label className="block text-gray-400 mb-1 text-sm">عدد الأيام الإضافية</label>
                  <input required type="number" min="1" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                      value={extensionDays} onChange={e => setExtensionDays(Number(e.target.value))} />
              </div>
              {selectedRentalForExtend && (
                  <div className="bg-black-900 p-4 rounded-xl">
                       <div className="flex justify-between text-sm mb-2">
                           <span className="text-gray-400">التكلفة الإضافية:</span>
                           <span className="text-white font-bold">{formatCurrency((cars.find(c => c.id === selectedRentalForExtend.carId)?.dailyRate || 0) * extensionDays)}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                           <span className="text-gray-400">تاريخ الانتهاء الجديد:</span>
                           <span className="text-gold-500 font-bold">
                               {(() => {
                                   const d = new Date(selectedRentalForExtend.expectedEndDate);
                                   d.setDate(d.getDate() + extensionDays);
                                   return formatDateNumeric(d);
                               })()}
                           </span>
                       </div>
                  </div>
              )}
              <button type="submit" className="w-full bg-gold-500 text-black-900 font-bold py-4 rounded-lg hover:bg-gold-600 transition-all mt-4">
                  تحديث العقد
              </button>
          </form>
      </Modal>

        {/* Fine Modal */}
        <Modal isOpen={isFineModalOpen} onClose={() => { setIsFineModalOpen(false); setSelectedRentalForFine(null); }} title="إضافة مخالفة">
          <form onSubmit={handleFineSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 mb-1 text-sm">القيمة (د.أ)</label>
                <input required type="number" min="0" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                  value={fineAmountInput} onChange={e => setFineAmountInput(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 text-sm">التاريخ</label>
                <input required type="date" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                  value={fineDateInput} onChange={e => setFineDateInput(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 text-sm">ملاحظة</label>
                <input type="text" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                  value={fineNoteInput} onChange={e => setFineNoteInput(e.target.value)} placeholder="اختياري" />
              </div>
            </div>
            {selectedRentalForFine && (
            <div className="bg-black-900 p-4 rounded-xl text-sm space-y-2">
               <div className="flex justify-between"><span className="text-gray-400">التكلفة الأساسية:</span><span className="text-white font-bold">{formatCurrency(selectedRentalForFine.baseCost ?? selectedRentalForFine.totalCost)}</span></div>
               <div className="flex justify-between"><span className="text-gray-400">إجمالي المخالفات:</span><span className="text-red-400 font-bold">{formatCurrency((selectedRentalForFine.fines || []).reduce((s,f)=>s+(f.amount||0),0) + (Number(fineAmountInput)||0))}</span></div>
               <div className="flex justify-between border-t border-white/5 pt-2"><span className="text-gray-300 font-bold">الإجمالي الجديد:</span><span className="text-gold-500 font-bold">{formatCurrency((selectedRentalForFine.baseCost ?? selectedRentalForFine.totalCost) + ((selectedRentalForFine.fines || []).reduce((s,f)=>s+(f.amount||0),0) + (Number(fineAmountInput)||0)))}</span></div>
            </div>
            )}
            <button type="submit" className="w-full bg-gold-500 text-black-900 font-bold py-4 rounded-lg hover:bg-gold-600 transition-all mt-2">
              إضافة المخالفة
            </button>
          </form>
        </Modal>

        {/* Payment Modal */}
        <Modal isOpen={isPaymentModalOpen} onClose={() => { setIsPaymentModalOpen(false); setSelectedRentalForPayment(null); }} title="تسجيل دفعة">
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 mb-1 text-sm">القيمة (د.أ)</label>
                <input required type="number" min="0" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                  value={paymentAmountInput} onChange={e => setPaymentAmountInput(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 text_sm">التاريخ</label>
                <input required type="date" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                  value={paymentDateInput} onChange={e => setPaymentDateInput(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 text_sm">ملاحظة</label>
                <input type="text" className="w-full bg-black-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none" 
                  value={paymentNoteInput} onChange={e => setPaymentNoteInput(e.target.value)} placeholder="اختياري" />
              </div>
            </div>
            <button type="submit" className="w-full bg-green-500 text-black-900 font-bold py-4 rounded-lg hover:bg-green-600 transition-all mt-2">
              إضافة الدفعة
            </button>
          </form>
        </Modal>
    </div>
  );
};

export default Rentals;
