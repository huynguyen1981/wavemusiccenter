import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { pianoService, orderService, settingsService, eventService, inquiryService } from '../services/firebaseService';
import { Piano, Order, PianoCategory, PianoStatus, MusicEvent, ContactInquiry, EventStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, LogIn, LayoutDashboard, Music, ShoppingCart, LogOut, X, Save, AlertCircle, Settings, Settings2, Calendar, Mail, Youtube, EyeOff, CheckCircle2, Phone, ArrowUpRight, MinusCircle } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'pianos' | 'orders' | 'inquiries' | 'events' | 'content'>('pianos');
  const [pianos, setPianos] = useState<Piano[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<MusicEvent[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPiano, setEditingPiano] = useState<Piano | null>(null);

  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MusicEvent | null>(null);

  // Content Management State
  const [editableTranslations, setEditableTranslations] = useState<Record<string, { en: string; vi: string }>>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);

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
    const [p, o, e, i] = await Promise.all([
      pianoService.getAllPianos(),
      orderService.getAllOrders(),
      eventService.getAllEvents(true),
      inquiryService.getAllInquiries()
    ]);
    setPianos(p);
    setOrders(o);
    setEvents(e);
    setInquiries(i);
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

  const handleDeletePiano = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this piano?")) {
      await pianoService.deletePiano(id);
      fetchData();
    }
  };

  const handleStatusUpdate = async (id: string, status: Order['status']) => {
    await orderService.updateOrderStatus(id, status);
    fetchData();
  };

  const handleInquiryStatus = async (id: string, status: ContactInquiry['status']) => {
    await inquiryService.updateInquiryStatus(id, status);
    fetchData();
  };

  const handleDeleteInquiry = async (id: string) => {
    if (window.confirm("Xóa yêu cầu tư vấn này?")) {
      await inquiryService.deleteInquiry(id);
      fetchData();
    }
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

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm("Bồ có chắc muốn xóa sự kiện này?")) {
      await eventService.deleteEvent(id);
      fetchData();
    }
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
                 activeTab === 'orders' ? 'Đơn hàng & Tư vấn đàn' : 
                 activeTab === 'events' ? 'Sự kiện Music Center' : 
                 activeTab === 'inquiries' ? 'Yêu cầu từ trang Liên hệ' : 
                 'Nội dung Website'}
              </h2>
              <p className="text-white/40 text-sm">Chào bồ, quản lý mọi thứ của Wave Music Center tại đây nhé!</p>
            </div>
            {(activeTab === 'pianos' || activeTab === 'events') && (
              <button
                onClick={() => activeTab === 'pianos' ? handleOpenForm() : handleOpenEventForm()}
                className="bg-gold hover:bg-gold-dark text-piano-black px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>{activeTab === 'pianos' ? 'Thêm Đàn' : 'Thêm Sự Kiện'}</span>
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
                             <img src={getDirectLink(piano.images[0])} alt="" className="w-full h-full object-cover" />
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
          ) : activeTab === 'events' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {events.map(event => (
                 <div key={event.id} className="bg-piano-matte rounded-3xl overflow-hidden border border-white/5 group flex flex-col">
                    <div className="aspect-video relative bg-black/40">
                       {event.youtubeId ? (
                         <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${event.youtubeId}`} title={event.title_en} frameBorder="0" allowFullScreen></iframe>
                       ) : event.images && event.images.length > 0 && event.images[0].trim() !== '' ? (
                         <img 
                           src={getDirectLink(event.images[0])} 
                           alt={event.title_en} 
                           className="w-full h-full object-cover opacity-80"
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-white/10">
                            <Music size={48} />
                         </div>
                       )}
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

                {/* Global Settings Section */}
                <div className="bg-piano-matte p-8 rounded-3xl border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.1)] mb-12">
                   <div className="flex items-center space-x-3 mb-6">
                      <Settings className="w-5 h-5 text-gold" />
                      <h4 className="text-sm uppercase font-bold tracking-widest text-white">Global & Security Settings</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Admin Emails (Dán Gmail, cách nhau dấu phẩy)</label>
                        <input 
                          value={editableTranslations['admin_emails']?.en || ''}
                          onChange={e => setEditableTranslations({
                            ...editableTranslations, 
                            ['admin_emails']: { en: e.target.value, vi: e.target.value }
                          })}
                          placeholder="nguyenhuy.1981.hcm@gmail.com, example@gmail.com"
                          className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none font-mono text-xs"
                        />
                      </div>
                   </div>
                   <p className="mt-4 text-[10px] text-white/20 italic">Thay đổi các cài đặt này sẽ áp dụng ngay các thay đổi bảo mật và diện mạo cơ bản. Lưu ý: Thêm admin email phải là tài khoản Gmail.</p>
                </div>

                <div className="grid grid-cols-1 gap-12">
                   {Object.keys(UI_TEXT).filter(k => !['website_logo', 'current_theme', 'admin_emails', 'facebook_link', 'instagram_link', 'youtube_link', 'tiktok_link'].includes(k)).map(key => (
                     <div key={key} className="bg-piano-matte p-8 rounded-3xl border border-white/5">
                        <div className="flex items-center justify-between mb-6">
                           <h4 className="text-xs uppercase font-bold tracking-widest text-gold">{key.replace(/_/g, ' ')}</h4>
                           <span className="text-[10px] text-white/20 font-mono">ID: {key}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">English</label>
                              {UI_TEXT[key].en.length > 50 ? (
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
                              {UI_TEXT[key].vi.length > 50 ? (
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

                    {/* Media & Social Links Section */}
                    <div className="mt-16 pt-16 border-t border-white/10 space-y-12">
                       <h3 className="text-2xl font-serif font-bold text-gold">Social Media Links</h3>
                       
                       <div className="bg-piano-matte p-8 rounded-3xl border border-white/5 space-y-8">
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
                    </div>
                 </div>
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
      </AnimatePresence>
    </div>
  );
};
