import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Piano, Order, PianoCategory, MusicEvent, ContactInquiry } from '../types';

const PIANOS_COLLECTION = 'pianos';
const ORDERS_COLLECTION = 'orders';
const EVENTS_COLLECTION = 'events';
const INQUIRIES_COLLECTION = 'inquiries';

export const pianoService = {
  async getAllPianos(category?: PianoCategory) {
    let q = query(collection(db, PIANOS_COLLECTION), orderBy('createdAt', 'desc'));
    if (category) {
      q = query(q, where('category', '==', category));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Piano[];
  },

  async getPianoById(id: string) {
    const docRef = doc(db, PIANOS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Piano;
    }
    return null;
  },

  async addPiano(piano: Omit<Piano, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Date.now();
    const docRef = await addDoc(collection(db, PIANOS_COLLECTION), {
      ...piano,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  },

  async updatePiano(id: string, updates: Partial<Piano>) {
    const docRef = doc(db, PIANOS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now()
    });
  },

  async deletePiano(id: string) {
    await deleteDoc(doc(db, PIANOS_COLLECTION, id));
  }
};

export const orderService = {
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>) {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...order,
      status: 'pending',
      createdAt: Date.now()
    });
    return docRef.id;
  },

  async getAllOrders() {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
  },

  async updateOrderStatus(id: string, status: Order['status']) {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await updateDoc(docRef, { status });
  }
};

export const eventService = {
  async getAllEvents(includeHidden = false) {
    let q = query(collection(db, EVENTS_COLLECTION), orderBy('createdAt', 'desc'));
    if (!includeHidden) {
      q = query(q, where('status', '!=', 'hidden'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MusicEvent[];
  },

  async getEventById(id: string) {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as MusicEvent;
    }
    return null;
  },

  async addEvent(event: Omit<MusicEvent, 'id' | 'createdAt'>) {
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
      ...event,
      createdAt: Date.now()
    });
    return docRef.id;
  },

  async updateEvent(id: string, updates: Partial<MusicEvent>) {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    await updateDoc(docRef, updates);
  },

  async deleteEvent(id: string) {
    await deleteDoc(doc(db, EVENTS_COLLECTION, id));
  }
};

export const inquiryService = {
  async createInquiry(inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) {
    const docRef = await addDoc(collection(db, INQUIRIES_COLLECTION), {
      ...inquiry,
      status: 'new',
      createdAt: Date.now()
    });
    return docRef.id;
  },

  async getAllInquiries() {
    const q = query(collection(db, INQUIRIES_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ContactInquiry[];
  },

  async updateInquiryStatus(id: string, status: ContactInquiry['status']) {
    const docRef = doc(db, INQUIRIES_COLLECTION, id);
    await updateDoc(docRef, { status });
  },

  async deleteInquiry(id: string) {
    await deleteDoc(doc(db, INQUIRIES_COLLECTION, id));
  }
};

const SETTINGS_COLLECTION = 'settings';
const GLOBAL_SETTINGS_ID = 'global';

export const settingsService = {
  async getSettings() {
    const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_ID);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as { translations: Record<string, { en: string; vi: string }> };
    }
    return null;
  },

  async updateSettings(translations: Record<string, { en: string; vi: string }>) {
    const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_ID);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      await updateDoc(docRef, { translations });
    } else {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(docRef, { translations });
    }
  }
};
