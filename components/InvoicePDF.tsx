import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import cairoFont from '../assets/fonts/Cairo-Regular.woff';
import { safeString, safeNumber, formatDateSafe, formatCurrency } from '../utils';

// تسجيل الخط العربي
Font.register({
  family: 'Cairo',
  src: cairoFont,
});

// تعريف الأنماط
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Cairo',
    direction: 'rtl',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  companyName: {
    fontSize: 16,
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 12,
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#f0f0f0',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    padding: 8,
  },
  tableCell: {
    fontSize: 10,
    flex: 1,
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#000',
  },
  totalRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
});

interface InvoicePDFProps {
  rental: any;
  car: any;
}

/**
 * BULLETPROOF Invoice PDF Component
 * NEVER crashes even with missing or invalid data
 * All values sanitized before rendering
 */
export const InvoicePDF = ({ rental, car }: InvoicePDFProps) => {
  // CRITICAL: Sanitize all data to prevent crashes
  const rentalId = safeString(rental?.id || 'N/A');
  const customerName = safeString(rental?.customer?.name || rental?.customerName || 'غير محدد');
  const customerPhone = safeString(rental?.customer?.phone || rental?.customerPhone || 'غير محدد');
  
  const carBrand = safeString(car?.brand || car?.make || 'غير محدد');
  const carModel = safeString(car?.model || 'غير محدد');
  const carYear = safeNumber(car?.year);
  const carPlate = safeString(car?.plate || 'غير محدد');
  
  const startDate = rental?.startDate;
  const endDate = rental?.endDate || rental?.actualEndDate;
  const totalCost = safeNumber(rental?.totalCost || rental?.baseCost);
  
  // Calculate totals safely
  const fines = Array.isArray(rental?.fines) ? rental.fines : [];
  const payments = Array.isArray(rental?.payments) ? rental.payments : [];
  
  const totalFines = fines.reduce((sum: number, fine: any) => sum + safeNumber(fine?.amount), 0);
  const totalPayments = payments.reduce((sum: number, payment: any) => sum + safeNumber(payment?.amount), 0);
  const outstanding = totalCost + totalFines - totalPayments;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>فاتورة إيجار سيارة</Text>
          <Text style={styles.companyName}>بريستيج لتأجير السيارات</Text>
        </View>

        {/* معلومات الفاتورة */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>رقم الفاتورة:</Text>
            <Text style={styles.value}>{rentalId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ الفاتورة:</Text>
            <Text style={styles.value}>{formatDateSafe(new Date())}</Text>
          </View>
        </View>

        {/* معلومات العميل */}
        <View style={styles.section}>
          <Text style={styles.label}>معلومات العميل</Text>
          <View style={styles.row}>
            <Text style={styles.label}>الاسم:</Text>
            <Text style={styles.value}>{customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>الهاتف:</Text>
            <Text style={styles.value}>{customerPhone}</Text>
          </View>
        </View>

        {/* معلومات السيارة */}
        <View style={styles.section}>
          <Text style={styles.label}>معلومات السيارة</Text>
          <View style={styles.row}>
            <Text style={styles.label}>السيارة:</Text>
            <Text style={styles.value}>
              {carBrand} {carModel} {carYear > 0 ? `(${carYear})` : ''}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>رقم اللوحة:</Text>
            <Text style={styles.value}>{carPlate}</Text>
          </View>
        </View>

        {/* تفاصيل الإيجار */}
        <View style={styles.section}>
          <Text style={styles.label}>تفاصيل الإيجار</Text>
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ البداية:</Text>
            <Text style={styles.value}>{formatDateSafe(startDate) || 'غير محدد'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ النهاية:</Text>
            <Text style={styles.value}>{formatDateSafe(endDate) || 'غير محدد'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>التكلفة الأساسية:</Text>
            <Text style={styles.value}>{formatCurrency(totalCost)}</Text>
          </View>
        </View>

        {/* جدول المخالفات */}
        {fines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>المخالفات</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>التاريخ</Text>
                <Text style={styles.tableCell}>المبلغ</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>الملاحظات</Text>
              </View>
              {fines.map((fine: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{formatDateSafe(fine?.date) || '-'}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(safeNumber(fine?.amount))}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{safeString(fine?.note) || '-'}</Text>
                </View>
              ))}
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>إجمالي المخالفات:</Text>
              <Text style={styles.value}>{formatCurrency(totalFines)}</Text>
            </View>
          </View>
        )}

        {/* جدول الدفعات */}
        {payments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>الدفعات</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>التاريخ</Text>
                <Text style={styles.tableCell}>المبلغ</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>الملاحظات</Text>
              </View>
              {payments.map((payment: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{formatDateSafe(payment?.date) || '-'}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(safeNumber(payment?.amount))}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{safeString(payment?.note) || '-'}</Text>
                </View>
              ))}
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>إجمالي المدفوع:</Text>
              <Text style={styles.value}>{formatCurrency(totalPayments)}</Text>
            </View>
          </View>
        )}

        {/* الإجماليات */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>التكلفة الأساسية:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalCost)}</Text>
          </View>
          {totalFines > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>المخالفات:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalFines)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>المجموع الكلي:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalCost + totalFines)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>المدفوع:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalPayments)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: outstanding > 0 ? 'red' : 'green' }]}>
              {outstanding > 0 ? 'المتبقي:' : 'الفائض:'}
            </Text>
            <Text style={[styles.totalValue, { color: outstanding > 0 ? 'red' : 'green' }]}>
              {formatCurrency(Math.abs(outstanding))}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>شكراً لتعاملكم معنا</Text>
          <Text>بريستيج لتأجير السيارات - الأردن</Text>
        </View>
      </Page>
    </Document>
  );
};
