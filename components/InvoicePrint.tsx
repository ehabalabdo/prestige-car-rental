import React from 'react';
import { Rental, Car } from '../types';
import { formatCurrency, formatDateSafe, safeString, safeNumber, calculateDays } from '../utils';

interface InvoicePrintProps {
  rental: Rental;
  car: Car;
  onClose: () => void;
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({ rental, car, onClose }) => {
  // CRITICAL: Validate invoice data before rendering anything
  if (!rental || !car) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-red-900/80 text-white p-6 rounded-xl max-w-sm">
          <p className="text-lg font-bold">خطأ: بيانات الفاتورة غير متوفرة</p>
          <button onClick={onClose} className="mt-4 px-6 py-2 bg-white/20 rounded-lg">إغلاق</button>
        </div>
      </div>
    );
  }

  // Validate required fields
  const hasStartDate = rental?.startDate && !isNaN(new Date(rental.startDate).getTime());
  const hasTotalCost = rental?.totalCost !== undefined && !isNaN(Number(rental.totalCost));
  if (!hasStartDate || !hasTotalCost) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-red-900/80 text-white p-6 rounded-xl max-w-sm">
          <p className="text-lg font-bold">خطأ: بيانات ناقصة في الفاتورة</p>
          <button onClick={onClose} className="mt-4 px-6 py-2 bg-white/20 rounded-lg">إغلاق</button>
        </div>
      </div>
    );
  }

  // Sanitize data - read from rental.customer object
  const customerName = safeString(rental?.customer?.name || 'غير محدد');
  const customerPhone = safeString(rental?.customer?.phone || 'غير محدد');
  const carBrand = safeString(car?.brand || car?.make || 'غير محدد');
  const carModel = safeString(car?.model || 'غير محدد');
  const carYear = safeNumber(car?.year);
  const carPlate = safeString(car?.plate || 'غير محدد');
  
  const totalCost = safeNumber(rental?.totalCost || rental?.baseCost);
  const fines = Array.isArray(rental?.fines) ? rental.fines : [];
  const payments = Array.isArray(rental?.payments) ? rental.payments : [];
  
  const totalFines = fines.reduce((sum: number, fine: any) => sum + safeNumber(fine?.amount), 0);
  const totalPayments = payments.reduce((sum: number, payment: any) => sum + safeNumber(payment?.amount), 0);
  const outstanding = totalCost + totalFines - totalPayments;

  // Calculate rental duration
  const days = calculateDays(rental.startDate, rental.endDate || rental.actualEndDate || rental.expectedEndDate);

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

          {/* Preview (Not printed) */}
          <div className="p-8 bg-white text-black" dir="rtl">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-gray-300 pb-6" style={{ color: '#000000' }}>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#000000' }}>بريستيج لتأجير السيارات</h1>
              <p className="text-lg text-gray-600" style={{ color: '#4B5563' }}>Prestige Car Rental</p>
              <div className="mt-4 text-sm text-gray-500" style={{ color: '#6B7280' }}>
                <p>الأردن - عمان | Jordan - Amman</p>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="mb-8 bg-gray-50 p-6 rounded-lg" style={{ backgroundColor: '#F9FAFB', color: '#000000' }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm" style={{ color: '#4B5563' }}>رقم الفاتورة</p>
                  <p className="font-bold text-lg" style={{ color: '#000000' }}>{rental.id}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-600 text-sm" style={{ color: '#4B5563' }}>تاريخ الإصدار</p>
                  <p className="font-bold text-lg" style={{ color: '#000000' }}>{formatDateSafe(new Date())}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-6" style={{ color: '#000000' }}>
              <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2" style={{ color: '#000000' }}>معلومات العميل</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm" style={{ color: '#4B5563' }}>اسم العميل</p>
                  <p className="font-semibold" style={{ color: '#000000' }}>{customerName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm" style={{ color: '#4B5563' }}>رقم الهاتف</p>
                  <p className="font-semibold" style={{ color: '#000000' }}>{customerPhone}</p>
                </div>
              </div>
            </div>

            {/* Car Info */}
            <div className="mb-6" style={{ color: '#000000' }}>
              <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2" style={{ color: '#000000' }}>معلومات السيارة</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm" style={{ color: '#4B5563' }}>السيارة</p>
                  <p className="font-semibold" style={{ color: '#000000' }}>{carBrand} {carModel} {carYear > 0 ? `(${carYear})` : ''}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm" style={{ color: '#4B5563' }}>رقم اللوحة</p>
                  <p className="font-semibold" style={{ color: '#000000' }}>{carPlate}</p>
                </div>
              </div>
            </div>

            {/* Rental Period */}
            <div className="mb-6" style={{ color: '#000000' }}>
              <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2" style={{ color: '#000000' }}>فترة الإيجار</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600 text-sm" style={{ color: '#4B5563' }}>من تاريخ</p>
                  <p className="font-semibold" style={{ color: '#000000' }}>{formatDateSafe(rental.startDate) || 'غير محدد'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm" style={{ color: '#4B5563' }}>إلى تاريخ</p>
                  <p className="font-semibold" style={{ color: '#000000' }}>{formatDateSafe(rental.endDate || rental.actualEndDate) || 'غير محدد'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm" style={{ color: '#4B5563' }}>عدد الأيام</p>
                  <p className="font-semibold" style={{ color: '#000000' }}>{days} يوم</p>
                </div>
              </div>
            </div>

            {/* Fines Table */}
            {fines.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2" style={{ color: '#000000' }}>المخالفات</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-right" style={{ color: '#000000' }}>التاريخ</th>
                      <th className="border border-gray-300 p-2 text-right" style={{ color: '#000000' }}>المبلغ</th>
                      <th className="border border-gray-300 p-2 text-right" style={{ color: '#000000' }}>الملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fines.map((fine: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2" style={{ color: '#000000' }}>{formatDateSafe(fine?.date) || '-'}</td>
                        <td className="border border-gray-300 p-2" style={{ color: '#000000' }}>{formatCurrency(safeNumber(fine?.amount))}</td>
                        <td className="border border-gray-300 p-2" style={{ color: '#000000' }}>{safeString(fine?.note) || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-left mt-2 font-bold" style={{ color: '#000000' }}>
                  إجمالي المخالفات: {formatCurrency(totalFines)}
                </div>
              </div>
            )}

            {/* Payments Table */}
            {payments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2" style={{ color: '#000000' }}>الدفعات</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-right" style={{ color: '#000000' }}>التاريخ</th>
                      <th className="border border-gray-300 p-2 text-right" style={{ color: '#000000' }}>المبلغ</th>
                      <th className="border border-gray-300 p-2 text-right" style={{ color: '#000000' }}>الملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2" style={{ color: '#000000' }}>{formatDateSafe(payment?.date) || '-'}</td>
                        <td className="border border-gray-300 p-2" style={{ color: '#000000' }}>{formatCurrency(safeNumber(payment?.amount))}</td>
                        <td className="border border-gray-300 p-2" style={{ color: '#000000' }}>{safeString(payment?.note) || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-left mt-2 font-bold" style={{ color: '#000000' }}>
                  إجمالي المدفوع: {formatCurrency(totalPayments)}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="mt-8 border-t-2 border-gray-400 pt-6" style={{ color: '#000000' }}>
              <div className="space-y-2 text-lg">
                <div className="flex justify-between" style={{ color: '#000000' }}>
                  <span className="font-semibold">التكلفة الأساسية:</span>
                  <span>{formatCurrency(totalCost)}</span>
                </div>
                {totalFines > 0 && (
                  <div className="flex justify-between" style={{ color: '#000000' }}>
                    <span className="font-semibold">المخالفات:</span>
                    <span>{formatCurrency(totalFines)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xl border-t border-gray-300 pt-2" style={{ color: '#000000' }}>
                  <span>المجموع الكلي:</span>
                  <span>{formatCurrency(totalCost + totalFines)}</span>
                </div>
                <div className="flex justify-between text-green-600" style={{ color: '#059669' }}>
                  <span className="font-semibold">المدفوع:</span>
                  <span>{formatCurrency(totalPayments)}</span>
                </div>
                <div className={`flex justify-between font-bold text-2xl border-t-2 border-gray-400 pt-3`} style={{ color: outstanding > 0 ? '#DC2626' : '#059669' }}>
                  <span>{outstanding > 0 ? 'المتبقي:' : 'الفائض:'}</span>
                  <span>{formatCurrency(Math.abs(outstanding))}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-sm text-gray-500 border-t border-gray-300 pt-6" style={{ color: '#6B7280' }}>
              <p className="font-semibold">شكراً لتعاملكم معنا</p>
              <p>بريستيج لتأجير السيارات - الأردن</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actual Print Area - Hidden on screen, visible on print */}
      <div className="print-area" style={{ display: 'none' }}>
        <div style={{ padding: '20mm', backgroundColor: '#ffffff', color: '#000000', direction: 'rtl' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #d1d5db', paddingBottom: '20px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#000000' }}>بريستيج لتأجير السيارات</h1>
            <p style={{ fontSize: '16px', color: '#6B7280' }}>Prestige Car Rental</p>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '10px' }}>الأردن - عمان | Jordan - Amman</p>
          </div>

          {/* Invoice Info */}
          <div style={{ marginBottom: '20px', backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>رقم الفاتورة</p>
                <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#000000' }}>{rental.id}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>تاريخ الإصدار</p>
                <p style={{ fontWeight: 'bold', color: '#000000' }}>{formatDateSafe(new Date().toISOString())}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid #d1d5db', paddingBottom: '8px', color: '#000000' }}>معلومات العميل</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>الاسم</p>
                <p style={{ fontWeight: 'bold', color: '#000000' }}>{customerName}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>رقم الهاتف</p>
                <p style={{ fontWeight: 'bold', color: '#000000' }}>{customerPhone}</p>
              </div>
            </div>
          </div>

          {/* Car Info */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid #d1d5db', paddingBottom: '8px', color: '#000000' }}>معلومات السيارة</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>السيارة</p>
                <p style={{ fontWeight: 'bold', color: '#000000' }}>{carBrand} {carModel} {carYear > 0 ? `(${carYear})` : ''}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>رقم اللوحة</p>
                <p style={{ fontWeight: 'bold', color: '#000000' }}>{carPlate}</p>
              </div>
            </div>
          </div>

          {/* Rental Period */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid #d1d5db', paddingBottom: '8px', color: '#000000' }}>فترة الإيجار</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>من تاريخ</p>
                <p style={{ fontWeight: 'bold', color: '#000000' }}>{formatDateSafe(rental.startDate) || 'غير محدد'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>إلى تاريخ</p>
                <p style={{ fontWeight: 'bold', color: '#000000' }}>{formatDateSafe(rental.endDate || rental.actualEndDate) || 'غير محدد'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>عدد الأيام</p>
                <p style={{ fontWeight: 'bold', color: '#000000' }}>{days} يوم</p>
              </div>
            </div>
          </div>

          {/* Fines Table */}
          {fines.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid #d1d5db', paddingBottom: '8px', color: '#000000' }}>المخالفات</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F3F4F6' }}>
                    <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right', color: '#000000' }}>التاريخ</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right', color: '#000000' }}>المبلغ</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right', color: '#000000' }}>الملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {fines.map((fine: any, index: number) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #d1d5db', padding: '8px', color: '#000000' }}>{formatDateSafe(fine?.date) || '-'}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '8px', color: '#000000' }}>{formatCurrency(safeNumber(fine?.amount))}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '8px', color: '#000000' }}>{safeString(fine?.note) || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: 'left', marginTop: '8px', fontWeight: 'bold', color: '#000000' }}>
                إجمالي المخالفات: {formatCurrency(totalFines)}
              </div>
            </div>
          )}

          {/* Payments Table */}
          {payments.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid #d1d5db', paddingBottom: '8px', color: '#000000' }}>الدفعات</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F3F4F6' }}>
                    <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right', color: '#000000' }}>التاريخ</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right', color: '#000000' }}>المبلغ</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right', color: '#000000' }}>الملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: any, index: number) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #d1d5db', padding: '8px', color: '#000000' }}>{formatDateSafe(payment?.date) || '-'}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '8px', color: '#000000' }}>{formatCurrency(safeNumber(payment?.amount))}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '8px', color: '#000000' }}>{safeString(payment?.note) || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: 'left', marginTop: '8px', fontWeight: 'bold', color: '#000000' }}>
                إجمالي المدفوع: {formatCurrency(totalPayments)}
              </div>
            </div>
          )}

          {/* Totals */}
          <div style={{ marginTop: '30px', borderTop: '2px solid #9CA3AF', paddingTop: '20px' }}>
            <div style={{ fontSize: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#000000' }}>
                <span style={{ fontWeight: 'bold' }}>التكلفة الأساسية:</span>
                <span>{formatCurrency(totalCost)}</span>
              </div>
              {totalFines > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#000000' }}>
                  <span style={{ fontWeight: 'bold' }}>المخالفات:</span>
                  <span>{formatCurrency(totalFines)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', borderTop: '1px solid #d1d5db', paddingTop: '8px', marginTop: '8px', color: '#000000' }}>
                <span>المجموع الكلي:</span>
                <span>{formatCurrency(totalCost + totalFines)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: '#059669' }}>
                <span style={{ fontWeight: 'bold' }}>المدفوع:</span>
                <span>{formatCurrency(totalPayments)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '20px', borderTop: '2px solid #9CA3AF', paddingTop: '12px', marginTop: '12px', color: outstanding > 0 ? '#DC2626' : '#059669' }}>
                <span>{outstanding > 0 ? 'المتبقي:' : 'الفائض:'}</span>
                <span>{formatCurrency(Math.abs(outstanding))}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#6B7280', borderTop: '1px solid #d1d5db', paddingTop: '20px' }}>
            <p style={{ fontWeight: 'bold' }}>شكراً لتعاملكم معنا</p>
            <p>بريستيج لتأجير السيارات - الأردن</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicePrint;
