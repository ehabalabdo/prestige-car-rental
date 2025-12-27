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
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 12,
  },
  amountSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  amountRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
});

interface PaymentReceiptPDFProps {
  rental: any;
  car: any;
  payment: any;
}

export const PaymentReceiptPDF = ({ rental, car, payment }: PaymentReceiptPDFProps) => {
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>إيصال دفع</Text>
          <Text style={styles.companyName}>بريستيج لتأجير السيارات</Text>
        </View>

        {/* معلومات الإيصال */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>رقم العقد:</Text>
            <Text style={styles.value}>{rental.id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ الدفع:</Text>
            <Text style={styles.value}>{formatDate(payment.date)}</Text>
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

        {/* تفاصيل الدفع */}
        {payment.note && (
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>ملاحظات:</Text>
              <Text style={styles.value}>{payment.note}</Text>
            </View>
          </View>
        )}

        {/* المبلغ المدفوع */}
        <View style={styles.amountSection}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>المبلغ المدفوع:</Text>
            <Text style={styles.amountValue}>{formatCurrency(payment.amount)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>شكراً لدفعكم</Text>
          <Text>بريستيج لتأجير السيارات - الأردن</Text>
        </View>
      </Page>
    </Document>
  );
};
