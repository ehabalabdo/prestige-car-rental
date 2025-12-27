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

/**
 * BULLETPROOF Payment Receipt PDF Component
 * NEVER crashes even with missing or invalid data
 */
export const PaymentReceiptPDF = ({ rental, car, payment }: PaymentReceiptPDFProps) => {
  // CRITICAL: Sanitize all data to prevent crashes
  const rentalId = safeString(rental?.id || 'N/A');
  const customerName = safeString(rental?.customer?.name || rental?.customerName || 'غير محدد');
  const customerPhone = safeString(rental?.customer?.phone || rental?.customerPhone || 'غير محدد');
  
  const carBrand = safeString(car?.brand || car?.make || 'غير محدد');
  const carModel = safeString(car?.model || 'غير محدد');
  const carYear = safeNumber(car?.year);
  const carPlate = safeString(car?.plate || 'غير محدد');
  
  const paymentDate = payment?.date;
  const paymentAmount = safeNumber(payment?.amount);
  const paymentNote = safeString(payment?.note);

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
            <Text style={styles.value}>{rentalId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ الدفع:</Text>
            <Text style={styles.value}>{formatDateSafe(paymentDate) || 'غير محدد'}</Text>
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

        {/* تفاصيل الدفع */}
        {paymentNote && (
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>ملاحظات:</Text>
              <Text style={styles.value}>{paymentNote}</Text>
            </View>
          </View>
        )}

        {/* المبلغ المدفوع */}
        <View style={styles.amountSection}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>المبلغ المدفوع:</Text>
            <Text style={styles.amountValue}>{formatCurrency(paymentAmount)}</Text>
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
