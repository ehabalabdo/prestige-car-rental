import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import cairoFont from '../assets/fonts/Cairo-Regular.woff';

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

export const InvoicePDF = ({ rental, car }: InvoicePDFProps) => {
  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date.seconds * 1000);
    return new Intl.DateTimeFormat('ar-JO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-JO', {
      style: 'currency',
      currency: 'JOD',
    }).format(amount);
  };

  const totalFines = rental.fines?.reduce((sum: number, fine: any) => sum + fine.amount, 0) || 0;
  const totalPayments = rental.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;
  const outstanding = rental.totalCost + totalFines - totalPayments;

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
            <Text style={styles.value}>{rental.id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ الفاتورة:</Text>
            <Text style={styles.value}>{formatDate(new Date())}</Text>
          </View>
        </View>

        {/* معلومات العميل */}
        <View style={styles.section}>
          <Text style={styles.label}>معلومات العميل</Text>
          <View style={styles.row}>
            <Text style={styles.label}>الاسم:</Text>
            <Text style={styles.value}>{rental.customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>الهاتف:</Text>
            <Text style={styles.value}>{rental.customerPhone}</Text>
          </View>
        </View>

        {/* معلومات السيارة */}
        <View style={styles.section}>
          <Text style={styles.label}>معلومات السيارة</Text>
          <View style={styles.row}>
            <Text style={styles.label}>السيارة:</Text>
            <Text style={styles.value}>{car?.brand} {car?.model} ({car?.year})</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>رقم اللوحة:</Text>
            <Text style={styles.value}>{car?.plate}</Text>
          </View>
        </View>

        {/* تفاصيل الإيجار */}
        <View style={styles.section}>
          <Text style={styles.label}>تفاصيل الإيجار</Text>
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ البداية:</Text>
            <Text style={styles.value}>{formatDate(rental.startDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ النهاية:</Text>
            <Text style={styles.value}>{formatDate(rental.endDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>التكلفة الأساسية:</Text>
            <Text style={styles.value}>{formatCurrency(rental.totalCost)}</Text>
          </View>
        </View>

        {/* جدول المخالفات */}
        {rental.fines && rental.fines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>المخالفات</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>التاريخ</Text>
                <Text style={styles.tableCell}>المبلغ</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>الملاحظات</Text>
              </View>
              {rental.fines.map((fine: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{formatDate(fine.date)}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(fine.amount)}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{fine.note || '-'}</Text>
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
        {rental.payments && rental.payments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>الدفعات</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>التاريخ</Text>
                <Text style={styles.tableCell}>المبلغ</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>الملاحظات</Text>
              </View>
              {rental.payments.map((payment: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{formatDate(payment.date)}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(payment.amount)}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{payment.note || '-'}</Text>
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
            <Text style={styles.totalValue}>{formatCurrency(rental.totalCost)}</Text>
          </View>
          {totalFines > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>المخالفات:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalFines)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>المجموع الكلي:</Text>
            <Text style={styles.totalValue}>{formatCurrency(rental.totalCost + totalFines)}</Text>
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
