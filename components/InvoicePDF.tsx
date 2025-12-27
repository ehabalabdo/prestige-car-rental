import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Rental, Car } from '../types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#000000',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    fontSize: 12,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
  },
  total: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

interface InvoicePDFProps {
  rental: Rental;
  car: Car;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ rental, car }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>RENTAL INVOICE</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Invoice ID:</Text>
        <Text style={styles.value}>{rental.id.toUpperCase()}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Customer:</Text>
        <Text style={styles.value}>{rental.customer.name}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{rental.customer.phone}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Vehicle:</Text>
        <Text style={styles.value}>{car.make} {car.model} ({car.year})</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Plate:</Text>
        <Text style={styles.value}>{car.plate}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Base Cost:</Text>
        <Text style={styles.value}>{rental.baseCost || rental.totalCost} JOD</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Fines:</Text>
        <Text style={styles.value}>{(rental.fines || []).reduce((s,f)=>s+f.amount,0)} JOD</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Payments:</Text>
        <Text style={styles.value}>{(rental.payments || []).reduce((s,p)=>s+p.amount,0)} JOD</Text>
      </View>
      
      <Text style={styles.total}>
        Total Outstanding: {rental.totalCost - (rental.payments || []).reduce((s,p)=>s+p.amount,0)} JOD
      </Text>
    </Page>
  </Document>
);

export default InvoicePDF;
