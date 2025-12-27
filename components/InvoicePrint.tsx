import React from 'react';
import { Rental, Car } from '../types';
import { formatCurrency, formatDateSafe, safeString, safeNumber } from '../utils';

interface InvoicePrintProps {
  rental: Rental;
  car: Car;
  onClose: () => void;
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({ rental, car, onClose }) => {
  // Sanitize data - read from rental.customer object
  const customerName = safeString(rental?.customer?.name || 'غير محدد');
  const customerPhone = safeString(rental?.customer?.phone || 'غير محدد');
  const carBrand = safeString(car?.brand || 'غير محدد');
  const carModel = safeString(car?.model || 'غير محدد');
  const carYear = safeNumber(car?.year);
  const carPlate = safeString(car?.plate || 'غير محدد');
  
  const totalCost = safeNumber(rental?.totalCost || rental?.baseCost);
  const fines = Array.isArray(rental?.fines) ? rental.fines : [];
  const payments = Array.isArray(rental?.payments) ? rental.payments : [];
  
  const totalFines = fines.reduce((sum: number, fine: any) => sum + safeNumber(fine?.amount), 0);
  const totalPayments = payments.reduce((sum: number, payment: any) => sum + safeNumber(payment?.amount), 0);
  const outstanding = totalCost + totalFines - totalPayments;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Non-printable controls */}
      <div className="no-print fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-black-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">معاينة الفاتورة</h2>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
              >
                طباعة 🖨️
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>

          {/* Printable Invoice */}
          <div className="print-area p-8 bg-white text-black" dir="rtl">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
              <h1 className="text-4xl font-bold mb-2">بريستيج لتأجير السيارات</h1>
              <p className="text-lg text-gray-600">Prestige Car Rental</p>
              <div className="mt-4 text-sm text-gray-500">
                <p>الأردن - عمان | Jordan - Amman</p>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="mb-8 bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">رقم الفاتورة</p>
                  <p className="font-bold text-lg">{rental.id}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-600 text-sm">تاريخ الإصدار</p>
                  <p className="font-bold text-lg">{formatDateSafe(new Date())}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">معلومات العميل</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">اسم العميل</p>
                  <p className="font-semibold">{customerName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">رقم الهاتف</p>
                  <p className="font-semibold">{customerPhone}</p>
                </div>
              </div>
            </div>

            {/* Car Info */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">معلومات السيارة</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">السيارة</p>
                  <p className="font-semibold">{carBrand} {carModel} {carYear > 0 ? `(${carYear})` : ''}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">رقم اللوحة</p>
                  <p className="font-semibold">{carPlate}</p>
                </div>
              </div>
            </div>

            {/* Rental Period */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">فترة الإيجار</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">من تاريخ</p>
                  <p className="font-semibold">{formatDateSafe(rental.startDate) || 'غير محدد'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">إلى تاريخ</p>
                  <p className="font-semibold">{formatDateSafe(rental.endDate || rental.actualEndDate) || 'غير محدد'}</p>
                </div>
              </div>
            </div>

            {/* Fines Table */}
            {fines.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">المخالفات</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-right">التاريخ</th>
                      <th className="border border-gray-300 p-2 text-right">المبلغ</th>
                      <th className="border border-gray-300 p-2 text-right">الملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fines.map((fine: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2">{formatDateSafe(fine?.date) || '-'}</td>
                        <td className="border border-gray-300 p-2">{formatCurrency(safeNumber(fine?.amount))}</td>
                        <td className="border border-gray-300 p-2">{safeString(fine?.note) || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-left mt-2 font-bold">
                  إجمالي المخالفات: {formatCurrency(totalFines)}
                </div>
              </div>
            )}

            {/* Payments Table */}
            {payments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">الدفعات</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-right">التاريخ</th>
                      <th className="border border-gray-300 p-2 text-right">المبلغ</th>
                      <th className="border border-gray-300 p-2 text-right">الملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2">{formatDateSafe(payment?.date) || '-'}</td>
                        <td className="border border-gray-300 p-2">{formatCurrency(safeNumber(payment?.amount))}</td>
                        <td className="border border-gray-300 p-2">{safeString(payment?.note) || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-left mt-2 font-bold">
                  إجمالي المدفوع: {formatCurrency(totalPayments)}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="mt-8 border-t-2 border-gray-400 pt-6">
              <div className="space-y-2 text-lg">
                <div className="flex justify-between">
                  <span className="font-semibold">التكلفة الأساسية:</span>
                  <span>{formatCurrency(totalCost)}</span>
                </div>
                {totalFines > 0 && (
                  <div className="flex justify-between">
                    <span className="font-semibold">المخالفات:</span>
                    <span>{formatCurrency(totalFines)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xl border-t border-gray-300 pt-2">
                  <span>المجموع الكلي:</span>
                  <span>{formatCurrency(totalCost + totalFines)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="font-semibold">المدفوع:</span>
                  <span>{formatCurrency(totalPayments)}</span>
                </div>
                <div className={`flex justify-between font-bold text-2xl border-t-2 border-gray-400 pt-3 ${outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  <span>{outstanding > 0 ? 'المتبقي:' : 'الفائض:'}</span>
                  <span>{formatCurrency(Math.abs(outstanding))}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-sm text-gray-500 border-t border-gray-300 pt-6">
              <p className="font-semibold">شكراً لتعاملكم معنا</p>
              <p>بريستيج لتأجير السيارات - الأردن</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicePrint;
