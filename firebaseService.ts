import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Car, Rental } from './types';

// Collection names
const COLLECTIONS = {
  CARS: 'cars',
  RENTALS: 'rentals',
  HISTORY: 'history'
};

// ============ CARS ============
export const saveCarsToFirestore = async (cars: Car[]): Promise<boolean> => {
  try {
    const promises = cars.map(car => 
      setDoc(doc(db, COLLECTIONS.CARS, car.id), car)
    );
    await Promise.all(promises);
    console.log('[firestore] cars saved');
    return true;
  } catch (error) {
    console.error('Error saving cars to Firestore:', error);
    return false;
  }
};

export const loadCarsFromFirestore = async (): Promise<Car[]> => {
  try {
    const carsCollection = collection(db, COLLECTIONS.CARS);
    const snapshot = await getDocs(carsCollection);
    const cars = snapshot.docs.map(doc => doc.data() as Car);
    return cars;
  } catch (error) {
    console.error('Error loading cars from Firestore:', error);
    return [];
  }
};

export const addCarToFirestore = async (car: Car): Promise<boolean> => {
  try {
    await setDoc(doc(db, COLLECTIONS.CARS, car.id), car);
    return true;
  } catch (error) {
    console.error('Error adding car to Firestore:', error);
    return false;
  }
};

export const deleteCarFromFirestore = async (carId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.CARS, carId));
    return true;
  } catch (error) {
    console.error('Error deleting car from Firestore:', error);
    return false;
  }
};

export const updateCarInFirestore = async (car: Car): Promise<boolean> => {
  try {
    await setDoc(doc(db, COLLECTIONS.CARS, car.id), car);
    return true;
  } catch (error) {
    console.error('Error updating car in Firestore:', error);
    return false;
  }
};

// ============ RENTALS ============
export const saveRentalsToFirestore = async (rentals: Rental[]): Promise<boolean> => {
  try {
    const promises = rentals.map(rental => 
      setDoc(doc(db, COLLECTIONS.RENTALS, rental.id), rental)
    );
    await Promise.all(promises);
    console.log('[firestore] rentals saved');
    return true;
  } catch (error) {
    console.error('Error saving rentals to Firestore:', error);
    return false;
  }
};

export const loadRentalsFromFirestore = async (): Promise<Rental[]> => {
  try {
    const rentalsCollection = collection(db, COLLECTIONS.RENTALS);
    const snapshot = await getDocs(rentalsCollection);
    const rentals = snapshot.docs.map(doc => doc.data() as Rental);
    return rentals;
  } catch (error) {
    console.error('Error loading rentals from Firestore:', error);
    return [];
  }
};

export const addRentalToFirestore = async (rental: Rental): Promise<boolean> => {
  try {
    await setDoc(doc(db, COLLECTIONS.RENTALS, rental.id), rental);
    return true;
  } catch (error) {
    console.error('Error adding rental to Firestore:', error);
    return false;
  }
};

export const deleteRentalFromFirestore = async (rentalId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.RENTALS, rentalId));
    return true;
  } catch (error) {
    console.error('Error deleting rental from Firestore:', error);
    return false;
  }
};

// ============ HISTORY ============
export const saveHistoryToFirestore = async (history: Rental[]): Promise<boolean> => {
  try {
    const promises = history.map(rental => 
      setDoc(doc(db, COLLECTIONS.HISTORY, rental.id), rental)
    );
    await Promise.all(promises);
    console.log('[firestore] history saved');
    return true;
  } catch (error) {
    console.error('Error saving history to Firestore:', error);
    return false;
  }
};

export const loadHistoryFromFirestore = async (): Promise<Rental[]> => {
  try {
    const historyCollection = collection(db, COLLECTIONS.HISTORY);
    const snapshot = await getDocs(historyCollection);
    const history = snapshot.docs.map(doc => doc.data() as Rental);
    return history;
  } catch (error) {
    console.error('Error loading history from Firestore:', error);
    return [];
  }
};

export const addHistoryToFirestore = async (rental: Rental): Promise<boolean> => {
  try {
    await setDoc(doc(db, COLLECTIONS.HISTORY, rental.id), rental);
    return true;
  } catch (error) {
    console.error('Error adding history to Firestore:', error);
    return false;
  }
};

// ============ SYNC FUNCTIONS ============
export const syncAllData = async (cars: Car[], rentals: Rental[], history: Rental[]): Promise<void> => {
  try {
    await Promise.all([
      saveCarsToFirestore(cars),
      saveRentalsToFirestore(rentals),
      saveHistoryToFirestore(history)
    ]);
  } catch (error) {
    console.error('Error syncing data to Firestore:', error);
  }
};

export const loadAllDataFromFirestore = async (): Promise<{
  cars: Car[];
  rentals: Rental[];
  history: Rental[];
}> => {
  try {
    const [cars, rentals, history] = await Promise.all([
      loadCarsFromFirestore(),
      loadRentalsFromFirestore(),
      loadHistoryFromFirestore()
    ]);
    
    console.log('[firestore] load success', {
      cars: cars.length,
      rentals: rentals.length,
      history: history.length
    });
    return { cars, rentals, history };
  } catch (error) {
    console.error('Error loading data from Firestore:', error);
    return { cars: [], rentals: [], history: [] };
  }
};

export const resetFirestoreData = async (): Promise<void> => {
  const collections = [COLLECTIONS.CARS, COLLECTIONS.RENTALS, COLLECTIONS.HISTORY];
  try {
    for (const col of collections) {
      const snapshot = await getDocs(collection(db, col));
      const deletions = snapshot.docs.map(d => deleteDoc(doc(db, col, d.id)));
      await Promise.all(deletions);
    }
    console.log('[firestore] reset success');
  } catch (error) {
    console.error('Error resetting Firestore data:', error);
    throw error;
  }
};
