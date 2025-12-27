import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Rental, Car } from '../types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    fontSize: 11,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
  },
  total: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

interface PaymentReceiptPDFProps {
  rental: Rental;
  car: Car;
  payment: { id?: string; amount: number; date: string; note?: string };
}

const PaymentReceiptPDF: React.FC<PaymentReceiptPDFProps> = ({ rental, car, payment }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      <Text style={styles.header}>PAYMENT RECEIPT</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Contract ID:</Text>
        <Text style={styles.value}>{rental.id.toUpperCase()}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{new Date(payment.date).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Customer:</Text>
        <Text style={styles.value}>{rental.customer.name}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Vehicle:</Text>
        <Text style={styles.value}>{car.make} {car.model} - {car.plate}</Text>
      </View>
      
      {payment.note && (
        <View style={styles.row}>
          <Text style={styles.label}>Note:</Text>
          <Text style={styles.value}>{payment.note}</Text>
        </View>
      )}
      
      <Text style={styles.total}>Amount Received: {payment.amount} JOD</Text>
    </Page>
  </Document>
);

export default PaymentReceiptPDF;
