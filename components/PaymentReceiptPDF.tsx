import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Rental, Car } from '../types';
import { formatCurrency } from '../utils';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    backgroundColor: '#111111',
    color: '#d4af37',
    padding: 15,
    textAlign: 'center',
    marginBottom: 20,
    borderRadius: 6,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  label: {
    fontSize: 11,
    color: '#555555',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 11,
    color: '#000000',
  },
  totalSection: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#d4af37',
  },
  finalTotal: {
    fontSize: 16,
    color: '#d4af37',
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 8,
  },
});

interface PaymentReceiptPDFProps {
  rental: Rental;
  car: Car;
  payment: { id?: string; amount: number; date: string; note?: string };
}

const PaymentReceiptPDF: React.FC<PaymentReceiptPDFProps> = ({ rental, car, payment }) => {
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText}>سند قبض دفعة</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>رقم العقد</Text>
          <Text style={styles.value}>{rental.id.toUpperCase()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>تاريخ السند</Text>
          <Text style={styles.value}>{new Date(payment.date).toLocaleDateString('ar-JO')}</Text>
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
          <Text style={styles.value}>{`${car.make} ${car.model} (${car.year}) — ${car.plate}`}</Text>
        </View>
        {payment.note && (
          <View style={styles.row}>
            <Text style={styles.label}>ملاحظة</Text>
            <Text style={styles.value}>{payment.note}</Text>
          </View>
        )}

        <View style={styles.totalSection}>
          <Text style={styles.finalTotal}>المبلغ المقبوض: {formatCurrency(payment.amount)}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PaymentReceiptPDF;
