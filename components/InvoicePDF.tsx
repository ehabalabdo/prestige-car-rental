import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Rental, Car } from '../types';
import { formatCurrency, calculateDays } from '../utils';

// Register fallback font - using Helvetica for now as it's built-in
// Arabic will be rendered as best as possible
const styles = StyleSheet.create({
  page: {
    padding: 40,
  },
  header: {
    backgroundColor: '#111111',
    color: '#d4af37',
    padding: 20,
    textAlign: 'center',
    marginBottom: 30,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  label: {
    fontSize: 12,
    color: '#555555',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 12,
    color: '#000000',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'right',
  },
  itemRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 4,
    borderRadius: 4,
  },
  itemLabel: {
    fontSize: 11,
    color: '#666666',
  },
  itemValue: {
    fontSize: 11,
    color: '#000000',
    fontWeight: 'bold',
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#d4af37',
  },
  totalRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 14,
    color: '#d4af37',
    fontWeight: 'bold',
  },
  finalTotal: {
    fontSize: 18,
    color: '#d4af37',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'right',
  },
});

interface InvoicePDFProps {
  rental: Rental;
  car: Car;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ rental, car }) => {
  const days = calculateDays(rental.startDate, rental.actualEndDate || new Date().toISOString());
  const finesTotal = (rental.fines || []).reduce((sum, f) => sum + (f.amount || 0), 0);
  const paymentsTotal = (rental.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  const outstanding = rental.totalCost - paymentsTotal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText}>فاتورة تأجير مركبة</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>رقم الفاتورة</Text>
            <Text style={styles.value}>{rental.id.toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>التاريخ</Text>
            <Text style={styles.value}>{new Date().toLocaleDateString('ar-JO')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>اسم العميل</Text>
            <Text style={styles.value}>{rental.customer.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>الهاتف</Text>
            <Text style={styles.value}>{rental.customer.phone}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>المركبة</Text>
            <Text style={styles.value}>{`${car.make} ${car.model} (${car.year})`}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>رقم اللوحة</Text>
            <Text style={styles.value}>{car.plate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ الاستلام</Text>
            <Text style={styles.value}>{new Date(rental.startDate).toLocaleDateString('ar-JO')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ التسليم</Text>
            <Text style={styles.value}>
              {rental.actualEndDate ? new Date(rental.actualEndDate).toLocaleDateString('ar-JO') : '-'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>المدة (يوم)</Text>
            <Text style={styles.value}>{days}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>التكلفة الأساسية</Text>
            <Text style={styles.value}>{formatCurrency(rental.baseCost || rental.totalCost)}</Text>
          </View>
        </View>

        {(rental.fines || []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subsectionTitle}>المخالفات</Text>
            {(rental.fines || []).map((fine, index) => (
              <View key={fine.id || index} style={styles.itemRow}>
                <Text style={styles.itemLabel}>
                  {new Date(fine.date).toLocaleDateString('ar-JO')}
                  {fine.note ? ` — ${fine.note}` : ''}
                </Text>
                <Text style={styles.itemValue}>{formatCurrency(fine.amount)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>إجمالي المخالفات</Text>
              <Text style={styles.totalValue}>{formatCurrency(finesTotal)}</Text>
            </View>
          </View>
        )}

        {(rental.payments || []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subsectionTitle}>الدفعات</Text>
            {(rental.payments || []).map((payment, index) => (
              <View key={payment.id || index} style={styles.itemRow}>
                <Text style={styles.itemLabel}>
                  {new Date(payment.date).toLocaleDateString('ar-JO')}
                  {payment.note ? ` — ${payment.note}` : ''}
                </Text>
                <Text style={styles.itemValue}>{formatCurrency(payment.amount)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>إجمالي الدفعات</Text>
              <Text style={styles.totalValue}>{formatCurrency(paymentsTotal)}</Text>
            </View>
          </View>
        )}

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>الإجمالي قبل الدفعات</Text>
            <Text style={styles.totalValue}>{formatCurrency(rental.totalCost)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>المسدّد</Text>
            <Text style={styles.totalValue}>{formatCurrency(paymentsTotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>المتبقي</Text>
            <Text style={styles.totalValue}>{formatCurrency(outstanding)}</Text>
          </View>
          <Text style={styles.finalTotal}>الإجمالي المستحق: {formatCurrency(outstanding)}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
