export type PianoCategory = 'grand' | 'upright' | 'digital' | 'accessories';
export type PianoStatus = 'available' | 'sold' | 'reserved' | 'coming-soon';

export interface Piano {
  id: string;
  title_en: string;
  title_vi: string;
  description_en: string;
  description_vi: string;
  price: number;
  category: PianoCategory;
  brand: string;
  model: string;
  images: string[];
  status: PianoStatus;
  specifications: {
    label_en: string;
    label_vi: string;
    value: string;
  }[];
  createdAt: number;
  updatedAt: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerNote?: string;
  pianoId: string;
  pianoTitle: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: number;
}

export type EventStatus = 'upcoming' | 'completed' | 'hidden';

export interface MusicEvent {
  id: string;
  title_en: string;
  title_vi: string;
  date: string;
  description_en: string;
  description_vi: string;
  youtubeId: string;
  images: string[];
  status: EventStatus;
  createdAt: number;
}

export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: number;
}

export type Language = 'en' | 'vi';

export interface Translation {
  [key: string]: {
    en: string;
    vi: string;
  };
}
