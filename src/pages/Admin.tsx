import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { pianoService, orderService, settingsService, eventService, inquiryService, lessonService, lessonClipService } from '../services/firebaseService';
import { Piano, Order, PianoCategory, PianoStatus, MusicEvent, ContactInquiry, EventStatus, Lesson, LessonClip } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, LogIn, LayoutDashboard, Music, ShoppingCart, LogOut, X, Save, AlertCircle, Settings, Settings2, Calendar, Mail, Youtube, EyeOff, CheckCircle2, Phone, ArrowUpRight, MinusCircle, BookOpen, Play } from 'lucide-react';
import { cn, formatPrice, getDirectLink } from '../lib/utils';
import { useLanguage } from '../hooks/useLanguage';
import { UI_TEXT } from '../constants';

// Helper component for multiple links (like images)
const MultiInput: React.FC<{
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  helperText?: string;
}> = ({ label, values, onChange, placeholder, helperText }) => {
  const handleAdd = () => onChange([...values, ""]);
  const handleRemove = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues.length > 0 ? newValues : [""]);
  };
  const handleChange = (index: number, val: string) => {
    const newValues = [...values];
    newValues[index] = val;
    onChange(newValues);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">{label}</label>
        <button 
          type="button"
          onClick={handleAdd}
          className="text-gold hover:text-white transition-colors flex items-center space-x-1 text-[10px] uppercase font-bold"
        >
          <Plus size={14} />
          <span>Thêm dòng</span>
        </button>
      </div>
      <div className="space-y-3">
        {values.map((v, i) => (
          <div key={i} className="flex space-x-2">
            <input 
              value={v}
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder={placeholder}
              className="flex-grow bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all text-sm"
            />
            {values.length > 1 && (
              <button 
                type="button"
                onClick={() => handleRemove(i)}
                className="text-white/20 hover:text-red-500 transition-colors p-2"
              >
                <MinusCircle size={20} />
              </button>
            )}
          </div>
        ))}
      </div>
      {helperText && <p className="text-[10px] text-white/20 italic tracking-widest">{helperText}</p>}
    </div>
  );
};

export const Admin: React.FC = () => {
  const { user, loading, isAdmin, login, logout } = useAuth();
  const { dynamicTranslations, refreshSettings } = useLanguage();
  const [activeTab, setActiveTab] = useState<'pianos' | 'lessons' | 'orders' | 'inquiries' | 'events' | 'content' | 'clips'>('pianos');
  const [pianos, setPianos] = useState<Piano[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonClips, setLessonClips] = useState<LessonClip[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<MusicEvent[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPiano, setEditingPiano] = useState<Piano | null>(null);

  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MusicEvent | null>(null);

  // Lesson Clip (Video) Form State
  const [isClipFormOpen, setIsClipFormOpen] = useState(false);
  const [editingClip, setEditingClip] = useState<LessonClip | null>(null);
  const [clipFormData, setClipFormData] = useState({
    title_en: '',
    title_vi: '',
    description_en: '',
    description_vi: '',
    youtubeId: '',
    images: ['']
  });

  // Lesson Management Form State
  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonFormData, setLessonFormData] = useState({
    id: '',
    title_en: '',
    title_vi: '',
    subtitle_en: '',
    subtitle_vi: '',
    content_en: '',
    content_vi: '',
    parentId: '' as string, // will cast to null if empty
    order: 0,
    icon: 'BookOpen'
  });

  // Custom delete confirmation state for safe deleting in iframe sandbox
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Content Management State
  const [editableTranslations, setEditableTranslations] = useState<Record<string, { en: string; vi: string }>>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [contentSubTab, setContentSubTab] = useState<'global' | 'home_about' | 'courses_services' | 'events_contact' | 'socials' | 'stats'>('global');
  const [newEmailInput, setNewEmailInput] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      // Initialize editable translations with defaults or existing dynamics
      const initial = { ...UI_TEXT };
      Object.keys(dynamicTranslations).forEach(key => {
        initial[key] = dynamicTranslations[key];
      });
      setEditableTranslations(initial);
    }
  }, [isAdmin, dynamicTranslations]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await settingsService.updateSettings(editableTranslations);
      await refreshSettings();
      alert("Website content updated successfully!");
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    title_en: '',
    title_vi: '',
    description_en: '',
    description_vi: '',
    price: 0,
    category: 'grand' as PianoCategory,
    brand: '',
    model: '',
    images: [''],
    status: 'available' as PianoStatus
  });

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    const [p, o, e, i, l, lc] = await Promise.all([
      pianoService.getAllPianos(),
      orderService.getAllOrders(),
      eventService.getAllEvents(true),
      inquiryService.getAllInquiries(),
      lessonService.getAllLessons(),
      lessonClipService.getAllLessonClips()
    ]);
    setPianos(p);
    setOrders(o);
    setEvents(e);
    setInquiries(i);
    setLessons(l);
    setLessonClips(lc);
  };

  const handleOpenForm = (piano?: Piano) => {
    if (piano) {
      setEditingPiano(piano);
      setFormData({
        title_en: piano.title_en,
        title_vi: piano.title_vi,
        description_en: piano.description_en,
        description_vi: piano.description_vi,
        price: piano.price,
        category: piano.category,
        brand: piano.brand,
        model: piano.model,
        images: piano.images && piano.images.length > 0 ? piano.images : [''],
        status: piano.status
      });
    } else {
      setEditingPiano(null);
      setFormData({
        title_en: '',
        title_vi: '',
        description_en: '',
        description_vi: '',
        price: 0,
        category: 'grand',
        brand: '',
        model: '',
        images: [''],
        status: 'available'
      });
    }
    setIsFormOpen(true);
  };

  const handleSavePiano = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== ''),
        specifications: []
      };

      if (editingPiano) {
        await pianoService.updatePiano(editingPiano.id, payload);
      } else {
        await pianoService.addPiano(payload as any);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleDeletePiano = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      title: "Xóa Đàn Piano",
      message: "Bồ có chắc chắn muốn xóa cây đàn này ra khỏi kho không?",
      onConfirm: async () => {
        try {
          await pianoService.deletePiano(id);
          fetchData();
        } catch (err) {
          console.error("Delete piano failed:", err);
        }
        setConfirmDelete(null);
      }
    });
  };

  const handleStatusUpdate = async (id: string, status: Order['status']) => {
    await orderService.updateOrderStatus(id, status);
    fetchData();
  };

  const handleInquiryStatus = async (id: string, status: ContactInquiry['status']) => {
    await inquiryService.updateInquiryStatus(id, status);
    fetchData();
  };

  const handleDeleteInquiry = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      title: "Xóa Yêu Cầu Liên Hệ",
      message: "Bồ có chắc chắn muốn xóa yêu cầu tư vấn này không?",
      onConfirm: async () => {
        try {
          await inquiryService.deleteInquiry(id);
          fetchData();
        } catch (err) {
          console.error("Delete inquiry failed:", err);
        }
        setConfirmDelete(null);
      }
    });
  };

  // Event Form
  const [eventFormData, setEventFormData] = useState({
    title_en: '',
    title_vi: '',
    date: '',
    description_en: '',
    description_vi: '',
    youtubeId: '',
    images: [''],
    status: 'upcoming' as EventStatus
  });

  const handleOpenEventForm = (event?: MusicEvent) => {
    if (event) {
      setEditingEvent(event);
      setEventFormData({
        title_en: event.title_en,
        title_vi: event.title_vi,
        date: event.date,
        description_en: event.description_en || '',
        description_vi: event.description_vi || '',
        youtubeId: event.youtubeId,
        images: event.images && event.images.length > 0 ? event.images : [''],
        status: event.status
      });
    } else {
      setEditingEvent(null);
      setEventFormData({
        title_en: '',
        title_vi: '',
        date: '',
        description_en: '',
        description_vi: '',
        youtubeId: '',
        images: [''],
        status: 'upcoming'
      });
    }
    setIsEventFormOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...eventFormData,
        images: eventFormData.images.filter(img => img.trim() !== '')
      };
      
      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, payload);
      } else {
        await eventService.addEvent(payload);
      }
      setIsEventFormOpen(false);
      fetchData();
    } catch (err) {
      console.error("Save event failed:", err);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      title: "Xóa Sự Kiện",
      message: "Bồ có chắc chắn muốn xóa sự kiện này không?",
      onConfirm: async () => {
        try {
          await eventService.deleteEvent(id);
          fetchData();
        } catch (err) {
          console.error("Delete event failed:", err);
        }
        setConfirmDelete(null);
      }
    });
  };

  // Lesson Clips Management Handlers
  const handleOpenClipForm = (clip?: LessonClip) => {
    if (clip) {
      setEditingClip(clip);
      setClipFormData({
        title_en: clip.title_en,
        title_vi: clip.title_vi,
        description_en: clip.description_en || '',
        description_vi: clip.description_vi || '',
        youtubeId: clip.youtubeId,
        images: clip.images && clip.images.length > 0 ? clip.images : ['']
      });
    } else {
      setEditingClip(null);
      setClipFormData({
        title_en: '',
        title_vi: '',
        description_en: '',
        description_vi: '',
        youtubeId: '',
        images: ['']
      });
    }
    setIsClipFormOpen(true);
  };

  const handleSaveClip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...clipFormData,
        images: clipFormData.images.filter(img => img.trim() !== '')
      };
      
      if (editingClip) {
        await lessonClipService.updateLessonClip(editingClip.id, payload);
      } else {
        await lessonClipService.addLessonClip(payload);
      }
      setIsClipFormOpen(false);
      fetchData();
    } catch (err) {
      console.error("Save lesson clip failed:", err);
    }
  };

  const handleDeleteClip = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      title: "Xóa Clip Bài Học",
      message: "Bồ có chắc chắn muốn xóa clip bài học này không?",
      onConfirm: async () => {
        try {
          await lessonClipService.deleteLessonClip(id);
          fetchData();
        } catch (err) {
          console.error("Delete lesson clip failed:", err);
        }
        setConfirmDelete(null);
      }
    });
  };

  const handleOpenLessonForm = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonFormData({
        id: lesson.id,
        title_en: lesson.title_en,
        title_vi: lesson.title_vi,
        subtitle_en: lesson.subtitle_en || '',
        subtitle_vi: lesson.subtitle_vi || '',
        content_en: lesson.content_en || '',
        content_vi: lesson.content_vi || '',
        parentId: lesson.parentId || '',
        order: lesson.order || 0,
        icon: lesson.icon || 'BookOpen'
      });
    } else {
      setEditingLesson(null);
      setLessonFormData({
        id: '',
        title_en: '',
        title_vi: '',
        subtitle_en: '',
        subtitle_vi: '',
        content_en: '',
        content_vi: '',
        parentId: '',
        order: 0,
        icon: 'BookOpen'
      });
    }
    setIsLessonFormOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title_en: lessonFormData.title_en.trim(),
        title_vi: lessonFormData.title_vi.trim(),
        subtitle_en: lessonFormData.subtitle_en.trim() || null,
        subtitle_vi: lessonFormData.subtitle_vi.trim() || null,
        content_en: lessonFormData.content_en.trim() || null,
        content_vi: lessonFormData.content_vi.trim() || null,
        parentId: lessonFormData.parentId ? lessonFormData.parentId : null,
        order: Number(lessonFormData.order) || 0,
        icon: lessonFormData.icon || 'BookOpen'
      };

      if (editingLesson) {
        await lessonService.updateLesson(editingLesson.id, payload);
      } else {
        const idToUse = lessonFormData.id.trim() || lessonFormData.title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        await lessonService.addLesson(idToUse, payload);
      }
      setIsLessonFormOpen(false);
      fetchData();
    } catch (err) {
      console.error("Save lesson failed:", err);
    }
  };

  const handleDeleteLesson = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      title: "Xóa Giáo Trình/Bài Học",
      message: "Bồ có chắc chắn muốn xóa bài học/giáo trình này không? Tất cả các bài học con liên kết và hiển thị trên sơ đồ cây của học viên cũng sẽ bị loại bỏ.",
      onConfirm: async () => {
        try {
          await lessonService.deleteLesson(id);
          fetchData();
        } catch (err) {
          console.error("Delete lesson failed:", err);
        }
        setConfirmDelete(null);
      }
    });
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-piano-black px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-piano-matte p-12 rounded-3xl border border-white/5 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 text-gold">
            <LogIn className="w-10 h-10" />
          </div>
          <h1 className="font-serif text-3xl font-bold mb-4 text-white">Admin Portal</h1>
          <p className="text-white/50 mb-10">Access your dashboard to manage inventory and view customer inquiries.</p>
          <button
            onClick={login}
            className="w-full bg-gold hover:bg-gold-dark text-piano-black font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Login with Google</span>
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center text-center px-4">
        <div className="max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-white/50 mb-8">You do not have permission to access the admin portal. Contact support if you believe this is an error.</p>
          <button onClick={logout} className="text-gold font-bold underline hover:text-white transition-colors">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-piano-black flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-piano-matte border-r border-white/5 hidden lg:flex flex-col">
        <div className="p-8 pb-12">
          <h1 className="font-serif text-xl font-bold text-white tracking-widest uppercase">Admin Panel</h1>
        </div>
        <nav className="flex-grow px-4 space-y-2">
          <button
            onClick={() => setActiveTab('pianos')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'pianos' ? "bg-gold text-piano-black font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <Music className="w-5 h-5" />
            <span>Kho Đàn</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'events' ? "bg-gold text-piano-black font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <Calendar className="w-5 h-5" />
            <span>Sự Kiện</span>
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'lessons' ? "bg-gold text-piano-black font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <BookOpen className="w-5 h-5" />
            <span>Giáo Trình</span>
          </button>
          <button
            onClick={() => setActiveTab('clips')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'clips' ? "bg-gold text-piano-black font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <Youtube className="w-5 h-5" />
            <span>Clip Bài Học</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'orders' ? "bg-gold text-piano-black font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Đơn Hàng</span>
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'inquiries' ? "bg-gold text-piano-black font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <Mail className="w-5 h-5" />
            <span>Liên Hệ</span>
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'content' ? "bg-gold text-piano-black font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <Settings2 className="w-5 h-5" />
            <span>Web Content</span>
          </button>
        </nav>
        <div className="p-8 mt-auto">
          <button onClick={logout} className="flex items-center space-x-2 text-white/40 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="text-xs uppercase font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-12 px-6 lg:px-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold text-white mb-2">
                {activeTab === 'pianos' ? 'Quản lý Kho Đàn' : 
                 activeTab === 'lessons' ? 'Giáo trình & Khóa học' :
                 activeTab === 'clips' ? 'Quản lý Clip Bài Học' :
                 activeTab === 'orders' ? 'Đơn hàng & Tư vấn đàn' : 
                 activeTab === 'events' ? 'Sự kiện Music Center' : 
                 activeTab === 'inquiries' ? 'Yêu cầu từ trang Liên hệ' : 
                 'Nội dung Website'}
              </h2>
              <p className="text-white/40 text-sm">Chào bồ, quản lý mọi thứ của Wave Music Center tại đây nhé!</p>
            </div>
            {(activeTab === 'pianos' || activeTab === 'events' || activeTab === 'lessons' || activeTab === 'clips') && (
              <button
                onClick={() => {
                  if (activeTab === 'pianos') handleOpenForm();
                  else if (activeTab === 'events') handleOpenEventForm();
                  else if (activeTab === 'clips') handleOpenClipForm();
                  else handleOpenLessonForm();
                }}
                className="bg-gold hover:bg-gold-dark text-piano-black px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>
                  {activeTab === 'pianos' ? 'Thêm Đàn' : 
                   activeTab === 'events' ? 'Thêm Sự Kiện' : 
                   activeTab === 'clips' ? 'Thêm Clip' :
                   'Thêm Giáo Trình'}
                </span>
              </button>
            )}
            {activeTab === 'content' && (
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-piano-black px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg"
              >
                <Save className="w-5 h-5" />
                <span>{isSavingSettings ? 'Saving...' : 'Save All Changes'}</span>
              </button>
            )}
          </div>

          {activeTab === 'pianos' ? (
            <div className="bg-piano-matte rounded-3xl border border-white/5 overflow-hidden">
               {/* Piano Table (existing) */}
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/30">
                     <th className="px-6 py-4 font-bold">Instrument</th>
                     <th className="px-6 py-4 font-bold">Category</th>
                     <th className="px-6 py-4 font-bold">Price</th>
                     <th className="px-6 py-4 font-bold">Status</th>
                     <th className="px-6 py-4 font-bold text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {pianos.map(piano => (
                     <tr key={piano.id} className="group hover:bg-white/[0.02]">
                       <td className="px-6 py-6 font-medium text-white">
                         <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden">
                             <img src={getDirectLink(piano.images[0])} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                           </div>
                           <div>
                             <p className="font-bold">{piano.title_en}</p>
                             <p className="text-xs text-white/30">{piano.brand} {piano.model}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-6 text-sm text-white/50">{piano.category}</td>
                       <td className="px-6 py-6 font-serif text-gold">{formatPrice(piano.price)}</td>
                       <td className="px-6 py-6">
                         <span className={cn(
                           "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                           piano.status === 'available' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                         )}>
                           {piano.status}
                         </span>
                       </td>
                       <td className="px-6 py-6 text-right space-x-2">
                         <button onClick={() => handleOpenForm(piano)} className="p-2 text-white/40 hover:text-gold transition-colors"><Edit size={18}/></button>
                         <button onClick={() => handleDeletePiano(piano.id)} className="p-2 text-white/40 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          ) : activeTab === 'lessons' ? (
            <div className="bg-piano-matte rounded-3xl border border-white/5 overflow-hidden">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/30">
                     <th className="px-6 py-4 font-bold">Giáo Trình / Bài Học</th>
                     <th className="px-6 py-4 font-bold">Mục Cha (Parent)</th>
                     <th className="px-6 py-4 font-bold">Thứ Tự (Order)</th>
                     <th className="px-6 py-4 font-bold text-right">Hành Động</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {lessons.sort((a,b) => {
                     if (!a.parentId && b.parentId) return -1;
                     if (a.parentId && !b.parentId) return 1;
                     return a.order - b.order;
                   }).map(lesson => {
                     const parentObj = lessons.find(l => l.id === lesson.parentId);
                     return (
                       <tr key={lesson.id} className="group hover:bg-white/[0.02]">
                         <td className="px-6 py-6 font-medium text-white">
                           <div>
                             <p className="font-bold flex items-center gap-2">
                               <span className="text-gold">[{lesson.id}]</span>
                               {lesson.title_vi}
                             </p>
                             <p className="text-xs text-white/30 italic">{lesson.title_en}</p>
                           </div>
                         </td>
                         <td className="px-6 py-6 text-sm text-white/50">
                           {parentObj ? (
                             <span className="text-gold/80 font-semibold">{parentObj.title_vi}</span>
                           ) : (
                             <span className="text-white/20 italic">Top-level parent</span>
                           )}
                         </td>
                         <td className="px-6 py-6 text-sm text-white/50">{lesson.order}</td>
                         <td className="px-6 py-6 text-right space-x-2">
                           <button onClick={() => handleOpenLessonForm(lesson)} className="p-2 text-white/40 hover:text-gold transition-colors"><Edit size={18}/></button>
                           <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-white/40 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
            </div>
          ) : activeTab === 'clips' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {lessonClips.map(clip => {
                 const title = clip.title_vi || clip.title_en;
                 const thumbnail = clip.images?.[0]
                   ? getDirectLink(clip.images[0])
                   : clip.youtubeId
                     ? `https://img.youtube.com/vi/${clip.youtubeId}/hqdefault.jpg`
                     : null;

                 return (
                   <div key={clip.id} className="bg-piano-matte rounded-3xl overflow-hidden border border-white/5 group flex flex-col">
                      <div className="aspect-video relative bg-black/40">
                                                   {thumbnail ? (
                            <>
                              <img 
                                src={thumbnail} referrerPolicy="no-referrer" 
                                alt={title} 
                                className="w-full h-full object-cover opacity-80"
                              />
                              {clip.youtubeId && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                                  <div className="w-12 h-12 bg-gold text-piano-black rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                                    <Play className="w-5 h-5 fill-current ml-0.5" />
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/10">
                               <Youtube size={48} />
                            </div>
                          )}
                      </div>
                      <div className="p-6 flex-grow flex flex-col">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <h3 className="text-xl font-serif font-bold text-white group-hover:text-gold transition-colors line-clamp-1">{clip.title_vi}</h3>
                               <p className="text-white/40 text-xs italic line-clamp-1 mt-1">{clip.title_en}</p>
                            </div>
                         </div>
                         <div className="mt-auto pt-6 border-t border-white/5 flex justify-end space-x-2">
                            <button onClick={() => handleOpenClipForm(clip)} className="p-2 text-white/40 hover:text-gold transition-colors"><Edit size={18}/></button>
                            <button onClick={() => handleDeleteClip(clip.id)} className="p-2 text-white/40 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                         </div>
                      </div>
                   </div>
                 );
               })}
               {lessonClips.length === 0 && (
                 <div className="col-span-full text-center py-20 text-white/20 border border-dashed border-white/5 rounded-3xl">
                   Chưa có clip bài học nào. Click vào nút "Thêm Clip" phía trên để tạo bồ nhé!
                 </div>
               )}
            </div>
          ) : activeTab === 'events' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {events.map(event => (
                 <div key={event.id} className="bg-piano-matte rounded-3xl overflow-hidden border border-white/5 group flex flex-col">
                    <div className="aspect-video relative bg-black/40">
                       {(() => {
                          const eventTitle = event.title_vi || event.title_en;
                          const thumbnail = event.images?.[0] && event.images[0].trim() !== ''
                            ? getDirectLink(event.images[0])
                            : event.youtubeId
                              ? `https://img.youtube.com/vi/${event.youtubeId}/hqdefault.jpg`
                              : null;
                          return thumbnail ? (
                            <>
                              <img 
                                src={thumbnail} referrerPolicy="no-referrer" 
                                alt={eventTitle} 
                                className="w-full h-full object-cover opacity-80"
                              />
                              {event.youtubeId && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                                  <div className="w-12 h-12 bg-gold text-piano-black rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                                    <Play className="w-5 h-5 fill-current ml-0.5" />
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/10">
                               <Music size={48} />
                            </div>
                          );
                        })()}
                       <div className="absolute top-4 right-4 flex space-x-2">
                          <span className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase",
                            event.status === 'upcoming' ? 'bg-blue-500' : event.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                          )}>
                             {event.status}
                          </span>
                       </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                             <p className="text-gold text-xs font-bold uppercase tracking-widest mb-1">{event.date}</p>
                             <h3 className="text-xl font-serif font-bold text-white group-hover:text-gold transition-colors">{event.title_en}</h3>
                          </div>
                       </div>
                       <div className="mt-auto pt-6 border-t border-white/5 flex justify-end space-x-2">
                          <button onClick={() => handleOpenEventForm(event)} className="p-2 text-white/40 hover:text-gold transition-colors"><Edit size={18}/></button>
                          <button onClick={() => handleDeleteEvent(event.id)} className="p-2 text-white/40 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          ) : activeTab === 'inquiries' ? (
            <div className="space-y-4 pb-20">
               {inquiries.length > 0 ? inquiries.map(inquiry => (
                 <div key={inquiry.id} className="bg-piano-matte p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between gap-8">
                    <div className="space-y-4 flex-grow">
                       <div className="flex items-center space-x-3">
                          <h4 className="text-xl font-serif font-bold text-white">{inquiry.name}</h4>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            inquiry.status === 'new' ? 'bg-gold text-piano-black' : inquiry.status === 'read' ? 'bg-white/10 text-white/40' : 'bg-green-500/20 text-green-500'
                          )}>
                             {inquiry.status}
                          </span>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs tracking-widest font-bold text-white/40 uppercase">
                          <div className="flex items-center"><Phone className="w-3 h-3 mr-2" /> {inquiry.phone}</div>
                          <div className="flex items-center"><Mail className="w-3 h-3 mr-2" /> {inquiry.email}</div>
                       </div>
                       <div className="bg-piano-black/30 p-5 rounded-2xl text-white/60 text-sm italic leading-relaxed">
                          "{inquiry.message}"
                       </div>
                       <p className="text-[10px] text-white/20">{new Date(inquiry.createdAt || 0).toLocaleString()}</p>
                    </div>
                    <div className="flex md:flex-col justify-end items-end gap-4 shrink-0">
                       <select 
                         value={inquiry.status}
                         onChange={(e) => handleInquiryStatus(inquiry.id, e.target.value as any)}
                         className="bg-piano-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-gold outline-none"
                       >
                          <option value="new">Mới</option>
                          <option value="read">Đã xem</option>
                          <option value="replied">Đã phản hồi</option>
                       </select>
                       <button 
                         onClick={() => handleDeleteInquiry(inquiry.id)}
                         className="p-3 bg-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 rounded-xl transition-all"
                       >
                          <Trash2 size={20} />
                       </button>
                    </div>
                 </div>
               )) : (
                 <div className="text-center py-20 text-white/20 border border-dashed border-white/5 rounded-3xl">Chưa có yêu cầu tư vấn nào bồ ơi.</div>
               )}
            </div>
          ) : activeTab === 'orders' ? (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-piano-matte p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-2">
                       <h4 className="text-lg font-bold text-white">{order.customerName}</h4>
                       <span className={cn(
                         "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                         order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                       )}>
                         {order.status}
                       </span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/50">
                      <p className="flex items-center"><ShoppingCart className="w-3 h-3 mr-2 text-gold"/> {order.pianoTitle}</p>
                      <p className="flex items-center"> {order.customerPhone}</p>
                      <p className="flex items-center italic">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value as any)}
                      className="bg-piano-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="space-y-8 pb-32">
                <div className="bg-gold/10 border border-gold/20 p-6 rounded-2xl flex items-start space-x-4 mb-8">
                  <AlertCircle className="w-6 h-6 text-gold shrink-0" />
                  <p className="text-sm text-gold/80 italic">
                    Đây là nơi bồ có thể thay đổi tất cả các đoạn chữ trên website. Chỉnh xong nhớ bấm <strong>"Save All Changes"</strong> ở góc trên nhé!
                  </p>
                </div>

                {/* Content Sub-Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 mb-8">
                  {[
                    { id: 'global', name: 'Hệ Thống & Admin', icon: Settings },
                    { id: 'home_about', name: 'Trang Chủ & Giới Thiệu', icon: LayoutDashboard },
                    { id: 'courses_services', name: 'Khóa Học & Dịch Vụ', icon: BookOpen },
                    { id: 'events_contact', name: 'Sự Kiện & Liên Hệ', icon: Calendar },
                    { id: 'stats', name: 'Chỉ Số & Thống Kê', icon: Settings2 },
                    { id: 'socials', name: 'Mạng Xã Hội', icon: Youtube },
                  ].map((subTab) => {
                    const SubTabIcon = subTab.icon;
                    return (
                      <button
                        key={subTab.id}
                        type="button"
                        onClick={() => setContentSubTab(subTab.id as any)}
                        className={cn(
                          "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all",
                          contentSubTab === subTab.id
                            ? "bg-gold text-piano-black shadow-lg font-bold"
                            : "bg-piano-matte text-white/60 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <SubTabIcon className="w-3.5 h-3.5" />
                        <span>{subTab.name}</span>
                      </button>
                    );
                  })}
                </div>

                {contentSubTab === 'global' && (
                  <div className="bg-piano-matte p-8 rounded-3xl border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.1)] mb-12">
                     <div className="flex items-center space-x-3 mb-6">
                        <Settings className="w-5 h-5 text-gold" />
                        <h4 className="text-sm uppercase font-bold tracking-widest text-white">Global & Security Settings</h4>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Paste Logo URL (PNG/JPG)</label>
                          <input 
                            value={editableTranslations['website_logo']?.en || ''}
                            onChange={e => setEditableTranslations({
                              ...editableTranslations, 
                              ['website_logo']: { en: e.target.value, vi: e.target.value }
                            })}
                            placeholder="https://your-image-link.com/logo.png"
                            className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none font-mono text-xs"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Active Website Theme</label>
                          <select 
                            value={editableTranslations['current_theme']?.en || 'normal'}
                            onChange={e => setEditableTranslations({
                              ...editableTranslations, 
                              ['current_theme']: { en: e.target.value, vi: e.target.value }
                            })}
                            className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                          >
                            <option value="normal">Default (Elegant Gold)</option>
                            <option value="christmas">Christmas (Holiday Season)</option>
                            <option value="spring">Spring (Blossom)</option>
                            <option value="lunar_new_year">Lunar New Year (Tết)</option>
                            <option value="summer">Summer (Sun & Sea)</option>
                            <option value="autumn">Autumn (Falling Leaves)</option>
                            <option value="july4">Independence Day (July 4th)</option>
                            <option value="halloween">Halloween (Spooky)</option>
                            <option value="thanksgiving">Thanksgiving (Harvest)</option>
                          </select>
                        </div>
                     </div>

                     {/* Tags/Chips Interface for Admin Emails */}
                     <div className="space-y-4 pt-6 border-t border-white/5">
                        <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider">
                          Danh Sách Gmail Quản Trị Viên (Admin Emails)
                        </label>
                        
                        <div className="flex gap-2 max-w-md">
                          <input 
                            type="email"
                            value={newEmailInput}
                            onChange={e => setNewEmailInput(e.target.value)}
                            placeholder="nhap.gmail.moi@gmail.com"
                            className="flex-grow bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none text-sm font-mono"
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const emailToAdd = newEmailInput.trim().toLowerCase();
                                if (!emailToAdd || !emailToAdd.includes('@')) {
                                  alert("Vui lòng nhập địa chỉ Gmail hợp lệ!");
                                  return;
                                }
                                const rawEmailsStr = editableTranslations['admin_emails']?.en || '';
                                const allAdminEmails = rawEmailsStr.split(',').map(x => x.trim()).filter(Boolean);
                                if (allAdminEmails.map(x => x.toLowerCase()).includes(emailToAdd)) {
                                  alert("Email này đã có trong danh sách admin!");
                                  return;
                                }
                                const updatedEmails = [...allAdminEmails, emailToAdd];
                                const joinedStr = updatedEmails.join(', ');
                                setEditableTranslations({
                                  ...editableTranslations,
                                  admin_emails: { en: joinedStr, vi: joinedStr }
                                });
                                setNewEmailInput('');
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const emailToAdd = newEmailInput.trim().toLowerCase();
                              if (!emailToAdd || !emailToAdd.includes('@')) {
                                  alert("Vui lòng nhập địa chỉ Gmail hợp lệ!");
                                  return;
                              }
                              const rawEmailsStr = editableTranslations['admin_emails']?.en || '';
                              const allAdminEmails = rawEmailsStr.split(',').map(x => x.trim()).filter(Boolean);
                              if (allAdminEmails.map(x => x.toLowerCase()).includes(emailToAdd)) {
                                  alert("Email này đã có trong danh sách admin!");
                                  return;
                              }
                              const updatedEmails = [...allAdminEmails, emailToAdd];
                              const joinedStr = updatedEmails.join(', ');
                              setEditableTranslations({
                                  ...editableTranslations,
                                  admin_emails: { en: joinedStr, vi: joinedStr }
                              });
                              setNewEmailInput('');
                            }}
                            className="bg-gold hover:bg-gold-dark text-piano-black font-bold px-5 rounded-xl transition-all flex items-center justify-center"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                        <p className="text-[10px] text-white/30 italic">Bồ gõ Gmail rồi bấm nút + hoặc Enter để thêm cực kỳ dễ dàng.</p>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {(() => {
                            const currentUserEmail = user?.email || '';
                            const isOwner = currentUserEmail.toLowerCase() === 'nguyenhuy.1981.hcm@gmail.com';
                            const rawEmailsStr = editableTranslations['admin_emails']?.en || '';
                            const allAdminEmails = rawEmailsStr.split(',').map(x => x.trim()).filter(Boolean);
                            const displayedAdminEmails = isOwner 
                              ? allAdminEmails 
                              : allAdminEmails.filter(e => e.toLowerCase() !== 'nguyenhuy.1981.hcm@gmail.com');

                            return displayedAdminEmails.map((email) => {
                              const isThisOwner = email.toLowerCase() === 'nguyenhuy.1981.hcm@gmail.com';
                              return (
                                <div 
                                  key={email}
                                  className={cn(
                                    "flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-mono tracking-wide",
                                    isThisOwner 
                                      ? "bg-gold/15 border-gold/40 text-gold font-bold" 
                                      : "bg-white/5 border-white/10 text-white/80"
                                  )}
                                >
                                  <span>{email}</span>
                                  {(!isThisOwner || isOwner) && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isThisOwner) {
                                          alert("Không thể xóa tài khoản chủ sở hữu hệ thống!");
                                          return;
                                        }
                                        const updatedEmails = allAdminEmails.filter(e => e.toLowerCase() !== email.toLowerCase());
                                        const joinedStr = updatedEmails.join(', ');
                                        setEditableTranslations({
                                          ...editableTranslations,
                                          admin_emails: { en: joinedStr, vi: joinedStr }
                                        });
                                      }}
                                      className="text-white/40 hover:text-red-500 transition-colors rounded-full p-0.5"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                              );
                            });
                          })()}
                        </div>
                     </div>
                     <p className="mt-4 text-[10px] text-white/20 italic">Thay đổi các cài đặt này sẽ áp dụng ngay các thay đổi bảo mật và diện mạo cơ bản. Lưu ý: Thêm admin email phải là tài khoản Gmail.</p>
                  </div>
                )}

                {contentSubTab === 'socials' && (
                  <div className="bg-piano-matte p-8 rounded-3xl border border-white/5 space-y-8">
                     <div className="flex items-center space-x-3 mb-2">
                        <Youtube className="w-5 h-5 text-gold" />
                        <h3 className="text-lg font-bold text-white">Social Media Links</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Facebook Page URL</label>
                           <input 
                             value={editableTranslations['facebook_link']?.en || ''}
                             onChange={e => setEditableTranslations({
                               ...editableTranslations, 
                               ['facebook_link']: { en: e.target.value, vi: e.target.value }
                             })}
                             placeholder="https://facebook.com/..."
                             className="w-full bg-piano-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none font-mono text-xs"
                           />
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Instagram URL</label>
                           <input 
                             value={editableTranslations['instagram_link']?.en || ''}
                             onChange={e => setEditableTranslations({
                               ...editableTranslations, 
                               ['instagram_link']: { en: e.target.value, vi: e.target.value }
                             })}
                             placeholder="https://instagram.com/..."
                             className="w-full bg-piano-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none font-mono text-xs"
                           />
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">YouTube Channel URL</label>
                           <input 
                             value={editableTranslations['youtube_link']?.en || ''}
                             onChange={e => setEditableTranslations({
                               ...editableTranslations, 
                               ['youtube_link']: { en: e.target.value, vi: e.target.value }
                             })}
                             placeholder="https://youtube.com/@..."
                             className="w-full bg-piano-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none font-mono text-xs"
                           />
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">TikTok URL</label>
                           <input 
                             value={editableTranslations['tiktok_link']?.en || ''}
                             onChange={e => setEditableTranslations({
                               ...editableTranslations, 
                               ['tiktok_link']: { en: e.target.value, vi: e.target.value }
                             })}
                             placeholder="https://tiktok.com/@..."
                             className="w-full bg-piano-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none font-mono text-xs"
                           />
                        </div>
                     </div>
                     <p className="text-[10px] text-white/20 italic">Các hình ảnh và liên kết mạng xã hội được nhóm tại đây để bồ dễ quản lý tập trung.</p>
                  </div>
                )}

                {contentSubTab !== 'global' && contentSubTab !== 'socials' && (() => {
                  const getKeysForSubTab = (tab: typeof contentSubTab) => {
                    const keysMap: Record<string, string[]> = {
                      home_about: ['hero_title', 'hero_subtitle', 'about_title', 'about_content', 'craft_title', 'craft_elegance', 'craft_desc', 'footer_tagline', 'home_hero_img', 'about_hero_img'],
                      courses_services: [
                        'wave_music_center', 'music_center_desc', 'music_center_intro', 'browse_collection', 
                        'edu_shop_desc', 'edu_excellence', 'music_center_hero_img', 'quality_title', 'quality_desc', 
                        'delivery_title', 'delivery_desc', 'tuning_title', 'tuning_desc', 'teaching_title', 'teaching_desc',
                        'featured_pianos', 'collections', 'shop_desc', 'no_pianos', 'all_categories', 
                        'grand_pianos', 'upright_pianos', 'digital_pianos'
                      ],
                      events_contact: [
                        'upcoming_events', 'past_events', 'no_upcoming_events', 'no_past_events', 
                        'lesson_clips_title', 'lesson_clips_desc',
                        'view_event_detail', 'back_to_music_center', 'no_description', 'register_participate', 
                        'status_upcoming', 'status_completed', 'loading_events', 'no_events', 
                        'contact_intro', 'submit', 'global_phone', 'global_email', 'global_address'
                      ],
                      stats: [
                        'stat_years', 'stat_years_label', 'stat_students', 'stat_students_label', 
                        'stat_delivered', 'stat_delivered_label', 'stat_teachers', 'stat_teachers_label', 
                        'stat_events', 'stat_events_label', 'stat_dedication', 'stat_dedication_label'
                      ]
                    };
                    return keysMap[tab] || [];
                  };

                  return (
                    <div className="grid grid-cols-1 gap-12">
                       {getKeysForSubTab(contentSubTab).map(key => (
                         <div key={key} className="bg-piano-matte p-8 rounded-3xl border border-white/5">
                            <div className="flex items-center justify-between mb-6">
                               <h4 className="text-xs uppercase font-bold tracking-widest text-gold">{key.replace(/_/g, ' ')}</h4>
                               <span className="text-[10px] text-white/20 font-mono">ID: {key}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="space-y-2">
                                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">English</label>
                                  {(UI_TEXT[key]?.en || '').length > 50 ? (
                                    <textarea 
                                      value={editableTranslations[key]?.en || ''}
                                      onChange={e => setEditableTranslations({...editableTranslations, [key]: {...editableTranslations[key], en: e.target.value}})}
                                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none resize-none h-32"
                                    />
                                  ) : (
                                    <input 
                                      value={editableTranslations[key]?.en || ''}
                                      onChange={e => setEditableTranslations({...editableTranslations, [key]: {...editableTranslations[key], en: e.target.value}})}
                                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                                    />
                                  )}
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Tiếng Việt</label>
                                  {(UI_TEXT[key]?.vi || '').length > 50 ? (
                                    <textarea 
                                      value={editableTranslations[key]?.vi || ''}
                                      onChange={e => setEditableTranslations({...editableTranslations, [key]: {...editableTranslations[key], vi: e.target.value}})}
                                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none resize-none h-32"
                                    />
                                  ) : (
                                    <input 
                                      value={editableTranslations[key]?.vi || ''}
                                      onChange={e => setEditableTranslations({...editableTranslations, [key]: {...editableTranslations[key], vi: e.target.value}})}
                                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                                    />
                                  )}
                               </div>
                            </div>
                         </div>
                        ))}
                    </div>
                  );
                })()}
             </div>
          )}
        </div>
      </main>

      {/* Piano Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-piano-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative bg-piano-matte w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl p-8 lg:p-12"
            >
              <button 
                onClick={() => setIsFormOpen(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-serif font-bold mb-8">
                {editingPiano ? 'Edit Instrument' : 'New Instrument'}
              </h2>

              <form onSubmit={handleSavePiano} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Title (English)</label>
                    <input 
                      required
                      value={formData.title_en}
                      onChange={e => setFormData({...formData, title_en: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Title (Vietnamese)</label>
                    <input 
                      required
                      value={formData.title_vi}
                      onChange={e => setFormData({...formData, title_vi: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Brand</label>
                    <input 
                      required
                      value={formData.brand}
                      onChange={e => setFormData({...formData, brand: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Model</label>
                    <input 
                      value={formData.model}
                      onChange={e => setFormData({...formData, model: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Price (USD)</label>
                    <input 
                      type="number"
                      required
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value as any})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all"
                    >
                      <option value="grand">Grand Piano</option>
                      <option value="upright">Upright Piano</option>
                      <option value="digital">Digital Piano</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all"
                    >
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="reserved">Reserved</option>
                      <option value="coming-soon">Coming Soon</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Description (English)</label>
                    <textarea 
                      required
                      rows={4}
                      value={formData.description_en}
                      onChange={e => setFormData({...formData, description_en: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all resize-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Mô tả (Tiếng Việt)</label>
                    <textarea 
                      required
                      rows={4}
                      value={formData.description_vi}
                      onChange={e => setFormData({...formData, description_vi: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <MultiInput 
                  label="Image URLs"
                  values={formData.images}
                  onChange={(imgs) => setFormData({...formData, images: imgs})}
                  placeholder="Dán link ảnh Drive/Web vào đây..."
                  helperText="Bồ dán link Drive vào đây hệ thống sẽ tự xử lý để hiển thị được."
                />

                <div className="pt-8 border-t border-white/5">
                  <button
                    type="submit"
                    className="w-full bg-gold hover:bg-gold-dark text-piano-black font-bold py-5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-2xl"
                  >
                    <Save size={20} />
                    <span>Save Instrument</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Event Form Modal */}
      <AnimatePresence>
        {isEventFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEventFormOpen(false)}
              className="absolute inset-0 bg-piano-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative bg-piano-matte w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl p-8 lg:p-12"
            >
              <button 
                onClick={() => setIsEventFormOpen(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-serif font-bold mb-8">
                {editingEvent ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
              </h2>

              <form onSubmit={handleSaveEvent} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Title (EN)</label>
                    <input 
                      required
                      value={eventFormData.title_en}
                      onChange={e => setEventFormData({...eventFormData, title_en: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Tiêu đề (VI)</label>
                    <input 
                      required
                      value={eventFormData.title_vi}
                      onChange={e => setEventFormData({...eventFormData, title_vi: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Thời gian (Date & Time)</label>
                    <input 
                      type="datetime-local"
                      required
                      value={eventFormData.date}
                      onChange={e => setEventFormData({...eventFormData, date: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Trạng thái</label>
                    <select
                      value={eventFormData.status}
                      onChange={e => setEventFormData({...eventFormData, status: e.target.value as any})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                      <option value="hidden">Hidden (Không hiển thị)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Description (English)</label>
                    <textarea 
                      rows={4}
                      value={eventFormData.description_en}
                      onChange={e => setEventFormData({...eventFormData, description_en: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none resize-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Mô tả (Tiếng Việt)</label>
                    <textarea 
                      rows={4}
                      value={eventFormData.description_vi}
                      onChange={e => setEventFormData({...eventFormData, description_vi: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">YouTube Video ID</label>
                  <input 
                    value={eventFormData.youtubeId}
                    onChange={e => setEventFormData({...eventFormData, youtubeId: e.target.value})}
                    className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    placeholder="dQw4w9WgXcQ"
                  />
                  <p className="text-[10px] text-white/20 italic">Chỉ dán ID video từ link Youtube (phần sau v=). Nếu có nhiều video thì để dành bồ nhé, hệ thống hiện ưu tiên 1 video.</p>
                </div>

                <MultiInput 
                  label="Event Gallery Images"
                  values={eventFormData.images}
                  onChange={(imgs) => setEventFormData({...eventFormData, images: imgs})}
                  placeholder="https://link-anh-su-kien.jpg"
                  helperText="Ưu tiên hiển thị hình ảnh trước video Youtube bồ nhé."
                />

                <div className="pt-8 border-t border-white/5">
                  <button
                    type="submit"
                    className="w-full bg-gold hover:bg-gold-dark text-piano-black font-bold py-5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-2xl"
                  >
                    <Save size={20} />
                    <span>Lưu sự kiện</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Lesson Form Modal */}
        {isLessonFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-piano-matte p-8 md:p-12 rounded-[2.5rem] border border-white/5 max-w-4xl w-full relative max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <button 
                onClick={() => setIsLessonFormOpen(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-serif font-bold mb-8">
                {editingLesson ? 'Chỉnh sửa Giáo trình' : 'Thêm Giáo trình / Bài học mới'}
              </h2>

              <form onSubmit={handleSaveLesson} className="space-y-8">
                {/* ID & Parent */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Mã ID (Custom Slug)</label>
                    <input 
                      required
                      disabled={!!editingLesson}
                      value={lessonFormData.id}
                      onChange={e => setLessonFormData({...lessonFormData, id: e.target.value})}
                      placeholder="e.g. piano-programs-for-kids"
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none disabled:opacity-40 font-sans"
                    />
                    <p className="text-[10px] text-white/20 italic">
                      {editingLesson ? 'Không thể thay đổi ID của tài liệu đã tồn tại.' : 'Nhập mã duy nhất viết liền không dấu, dùng gạch ngang.'}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Mục Cha (Parent Lesson)</label>
                    <select
                      value={lessonFormData.parentId}
                      onChange={e => setLessonFormData({...lessonFormData, parentId: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    >
                      <option value="">Không có (Đây là mục cha cấp cao nhất)</option>
                      {lessons.filter(l => !l.parentId && l.id !== editingLesson?.id).map(p => (
                        <option key={p.id} value={p.id}>{p.title_vi} ({p.title_en})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title EN & VI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Tiêu đề (English)</label>
                    <input 
                      required
                      value={lessonFormData.title_en}
                      onChange={e => setLessonFormData({...lessonFormData, title_en: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Tiêu đề (Tiếng Việt)</label>
                    <input 
                      required
                      value={lessonFormData.title_vi}
                      onChange={e => setLessonFormData({...lessonFormData, title_vi: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    />
                  </div>
                </div>

                {/* Subtitle EN & VI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Phụ đề / Mô tả ngắn (English)</label>
                    <input 
                      value={lessonFormData.subtitle_en}
                      onChange={e => setLessonFormData({...lessonFormData, subtitle_en: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Phụ đề / Mô tả ngắn (Tiếng Việt)</label>
                    <input 
                      value={lessonFormData.subtitle_vi}
                      onChange={e => setLessonFormData({...lessonFormData, subtitle_vi: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    />
                  </div>
                </div>

                {/* Order & Icon */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Thứ tự hiển thị (Order)</label>
                    <input 
                      type="number"
                      required
                      value={lessonFormData.order}
                      onChange={e => setLessonFormData({...lessonFormData, order: Number(e.target.value) || 0})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Biểu tượng (Icon)</label>
                    <select
                      value={lessonFormData.icon}
                      onChange={e => setLessonFormData({...lessonFormData, icon: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    >
                      <option value="BookOpen">BookOpen (Sách hướng dẫn)</option>
                      <option value="Music">Music (Nốt nhạc)</option>
                      <option value="Award">Award (Bằng cấp / Thi cử)</option>
                      <option value="DollarSign">DollarSign (Học phí)</option>
                      <option value="FileText">FileText (Điều khoản / Chính sách)</option>
                      <option value="Calendar">Calendar (Lịch trình)</option>
                    </select>
                  </div>
                </div>

                {/* Detailed content EN & VI (Markdown / Text) */}
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Nội dung chi tiết (English) - Hỗ trợ định dạng Markdown</label>
                    <textarea 
                      rows={10}
                      value={lessonFormData.content_en}
                      onChange={e => setLessonFormData({...lessonFormData, content_en: e.target.value})}
                      placeholder="Sử dụng ### cho tiêu đề lớn, #### cho tiêu đề nhỏ, - cho danh sách gạch đầu dòng"
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none resize-none font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Nội dung chi tiết (Tiếng Việt) - Hỗ trợ định dạng Markdown</label>
                    <textarea 
                      rows={10}
                      value={lessonFormData.content_vi}
                      onChange={e => setLessonFormData({...lessonFormData, content_vi: e.target.value})}
                      placeholder="Sử dụng ### cho tiêu đề lớn, #### cho tiêu đề nhỏ, - cho danh sách gạch đầu dòng"
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none resize-none font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <button
                    type="submit"
                    className="w-full bg-gold hover:bg-gold-dark text-piano-black font-bold py-5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-2xl"
                  >
                    <Save size={20} />
                    <span>Lưu Giáo Trình</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Lesson Clip (Video) Form Modal */}
        {isClipFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-piano-matte p-8 md:p-12 rounded-[2.5rem] border border-white/5 max-w-4xl w-full relative max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <button 
                onClick={() => setIsClipFormOpen(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-serif font-bold mb-8">
                {editingClip ? 'Chỉnh sửa Clip bài học' : 'Thêm Clip bài học mới'}
              </h2>

              <form onSubmit={handleSaveClip} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Tiêu đề (English)</label>
                    <input 
                      required
                      value={clipFormData.title_en}
                      onChange={e => setClipFormData({...clipFormData, title_en: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Tiêu đề (Tiếng Việt)</label>
                    <input 
                      required
                      value={clipFormData.title_vi}
                      onChange={e => setClipFormData({...clipFormData, title_vi: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Mô tả (English)</label>
                    <textarea 
                      rows={4}
                      value={clipFormData.description_en}
                      onChange={e => setClipFormData({...clipFormData, description_en: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none resize-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Mô tả (Tiếng Việt)</label>
                    <textarea 
                      rows={4}
                      value={clipFormData.description_vi}
                      onChange={e => setClipFormData({...clipFormData, description_vi: e.target.value})}
                      className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">YouTube Video ID</label>
                  <input 
                    value={clipFormData.youtubeId}
                    onChange={e => setClipFormData({...clipFormData, youtubeId: e.target.value})}
                    className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                    placeholder="dQw4w9WgXcQ"
                  />
                  <p className="text-[10px] text-white/20 italic">Chỉ dán ID video từ link Youtube (phần sau v= hoặc sau embed/).</p>
                </div>

                <MultiInput 
                  label="Gallery Images"
                  values={clipFormData.images}
                  onChange={(imgs) => setClipFormData({...clipFormData, images: imgs})}
                  placeholder="https://link-anh-clip.jpg"
                  helperText="Dán link ảnh đại diện/slide cho bài học này bồ nhé."
                />

                <div className="pt-8 border-t border-white/5">
                  <button
                    type="submit"
                    className="w-full bg-gold hover:bg-gold-dark text-piano-black font-bold py-5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-2xl"
                  >
                    <Save size={20} />
                    <span>Lưu Clip Bài Học</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {confirmDelete && confirmDelete.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-piano-matte p-8 rounded-3xl border border-red-500/20 max-w-md w-full shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500">
                <AlertCircle size={32} />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3 text-white">
                {confirmDelete.title}
              </h3>
              <p className="text-white/60 mb-8 text-sm leading-relaxed">
                {confirmDelete.message}
              </p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmDelete.onConfirm();
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
                >
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
