import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { pianoService, orderService } from '../services/firebaseService';
import { Piano } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { formatPrice, cn, getDirectLink } from '../lib/utils';
import { ChevronLeft, Info, Phone, Mail, CheckCircle2, ShieldCheck, Truck, ChevronRight } from 'lucide-react';

export const PianoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [piano, setPiano] = useState<Piano | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { language, t } = useLanguage();
  
  // Inquiry Form State
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    note: ''
  });

  useEffect(() => {
    if (id) {
      pianoService.getPianoById(id).then(data => {
        setPiano(data);
        setLoading(false);
      });
    }
  }, [id]);

  const images = piano?.images || [];

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!piano) return;
    
    try {
      await orderService.createOrder({
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        customerNote: formData.note,
        pianoId: piano.id,
        pianoTitle: piano.title_en,
        amount: piano.price
      });
      setFormSubmitted(true);
    } catch (err) {
      console.error("Order failed:", err);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-serif text-2xl">Loading...</div>;
  if (!piano) return <div className="h-screen flex items-center justify-center font-serif text-2xl">Not Found</div>;

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/collections" className="inline-flex items-center space-x-2 text-gold hover:text-white mb-12 transition-colors">
        <ChevronLeft size={20} />
        <span className="text-sm font-bold uppercase tracking-widest">{t('all_categories')}</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Gallery Slider */}
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-piano-matte border border-white/5 group">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={getDirectLink(images[activeImageIndex])} 
                alt={piano.title_en}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-4">
               {images.map((img, i) => (
                 <button 
                    key={i} 
                    onClick={() => setActiveImageIndex(i)}
                    className={cn(
                      "rounded-xl overflow-hidden aspect-square border-2 transition-all",
                      activeImageIndex === i ? "border-gold" : "border-transparent opacity-50 hover:opacity-100"
                    )}
                 >
                   <img src={getDirectLink(img)} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-10">
          <div>
            <div className="flex items-center space-x-4 mb-4 font-bold text-gold uppercase tracking-[0.2em] text-sm">
               <span>{piano.brand}</span>
               <span className="w-1 h-1 bg-gold/50 rounded-full" />
               <span>{piano.model}</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
              {language === 'en' ? piano.title_en : piano.title_vi}
            </h1>
            <p className="text-3xl font-serif text-gold font-bold mb-8">
              {formatPrice(piano.price)}
            </p>
            <div className="prose prose-invert max-w-none text-white/60 leading-relaxed text-lg mb-10">
              {language === 'en' ? piano.description_en : piano.description_vi}
            </div>
          </div>

          {/* Form */}
          <div className="bg-piano-matte p-8 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            {formSubmitted ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                 <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
                 <h3 className="text-2xl font-serif font-bold mb-4">{t('submit')} Success!</h3>
                 <p className="text-white/50 mb-8">Chúng tôi sẽ liên hệ bồ sớm nhất có thể.</p>
                 <button onClick={() => setFormSubmitted(false)} className="text-gold font-bold underline">Gửi lại</button>
               </motion.div>
            ) : (
              <form onSubmit={handleInquiry} className="space-y-6">
                 <h3 className="text-xl font-serif font-bold mb-2 flex items-center">
                   <Mail className="w-5 h-5 mr-3 text-gold" />
                   {t('order_now')}
                 </h3>
                 
                 <div className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <fieldset className="space-y-2">
                       <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{t('name')}</label>
                       <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-gold" />
                     </fieldset>
                     <fieldset className="space-y-2">
                       <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{t('phone')}</label>
                       <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-gold" />
                     </fieldset>
                   </div>
                   <fieldset className="space-y-2">
                     <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{t('email')}</label>
                     <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-gold" />
                   </fieldset>
                   <fieldset className="space-y-2">
                     <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{t('message')}</label>
                     <textarea rows={3} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-piano-black border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-gold resize-none" />
                   </fieldset>
                 </div>

                 <button type="submit" className="w-full bg-gold hover:bg-gold-dark text-piano-black font-bold py-5 rounded-xl transition-all shadow-xl">
                   {t('submit')}
                 </button>
              </form>
            )}
          </div>

          <div className="flex items-center space-x-6 pt-4 text-white/40">
             <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-gold" />
                <span className="text-xs uppercase font-bold tracking-widest">Premium Quality</span>
             </div>
             <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-gold" />
                <span className="text-xs uppercase font-bold tracking-widest">Secure Delivery</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
