import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { inquiryService } from '../services/firebaseService';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Piano Consultation Request',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await inquiryService.createInquiry(formData);
      setFormSubmitted(true);
      setFormData({ name: '', phone: '', email: '', subject: 'Piano Consultation Request', message: '' });
    } catch (err) {
      console.error("Failed to send inquiry:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">{t('contact')}</h1>
          <p className="text-white/50 max-w-2xl mx-auto text-lg italic">
            {t('contact_intro')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info Side */}
          <div className="space-y-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-piano-matte p-8 rounded-3xl border border-white/5">
                   <Phone className="w-8 h-8 text-gold mb-4" />
                   <h3 className="text-lg font-bold mb-2 uppercase tracking-widest">{t('phone')}</h3>
                   <p className="text-white/60">{t('global_phone')}</p>
                </div>
                <div className="bg-piano-matte p-8 rounded-3xl border border-white/5">
                   <Mail className="w-8 h-8 text-gold mb-4" />
                   <h3 className="text-lg font-bold mb-2 uppercase tracking-widest">{t('email')}</h3>
                   <p className="text-white/60">{t('global_email')}</p>
                </div>
             </div>
             
             <div className="bg-piano-matte p-8 rounded-3xl border border-white/5">
                <MapPin className="w-8 h-8 text-gold mb-4" />
                <h3 className="text-lg font-bold mb-2 uppercase tracking-widest">{t('address')}</h3>
                <p className="text-white/60 leading-relaxed">
                   {t('global_address')}
                </p>
             </div>

             <div className="aspect-video rounded-3xl overflow-hidden border border-white/5 grayscale hover:grayscale-0 transition-all duration-700">
                <iframe 
                   src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115470.5283416565!2d-95.698384!3d29.5984435!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8640df2e947d7b37%3A0x6333333333333333!2sSugar%20Land%2C%20TX!5e0!3m2!1sen!2sus!4v1625000000000!5m2!1sen!2sus" 
                   width="100%" 
                   height="100%" 
                   style={{ border: 0 }} 
                   allowFullScreen 
                   loading="lazy"
                ></iframe>
             </div>
          </div>

          {/* Form Side */}
          <div className="bg-piano-matte p-10 rounded-[3rem] border border-gold/20 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -z-0" />
             
             {formSubmitted ? (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="h-full flex flex-col items-center justify-center text-center py-12"
               >
                 <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                 </div>
                 <h2 className="text-3xl font-serif font-bold mb-4">{t('contact_success_title')}</h2>
                 <p className="text-white/50 mb-8 italic">
                   {t('contact_success_msg')}
                   
                 </p>
                 <button 
                   onClick={() => setFormSubmitted(false)}
                   className="text-gold font-bold uppercase tracking-widest hover:underline"
                 >
                   {t('contact_send_another')}
                 </button>
               </motion.div>
             ) : (
               <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                 <div className="flex items-center space-x-3 text-gold mb-4">
                    <MessageSquare className="w-6 h-6" />
                    <h2 className="text-2xl font-serif font-bold text-white">{t('contact_title')}</h2>
                 </div>

                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <fieldset className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{t('name')}</label>
                          <input 
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-piano-black/50 border border-white/5 rounded-xl px-5 py-4 text-white focus:border-gold outline-none transition-all"
                            placeholder="John Doe"
                          />
                       </fieldset>
                       <fieldset className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{t('phone')}</label>
                          <input 
                            required
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-piano-black/50 border border-white/5 rounded-xl px-5 py-4 text-white focus:border-gold outline-none transition-all"
                            placeholder="(555) 000-0000"
                          />
                       </fieldset>
                    </div>

                    <fieldset className="space-y-2">
                       <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{t('email')}</label>
                       <input 
                         type="email"
                         required
                         value={formData.email}
                         onChange={e => setFormData({...formData, email: e.target.value})}
                         className="w-full bg-piano-black/50 border border-white/5 rounded-xl px-5 py-4 text-white focus:border-gold outline-none transition-all"
                         placeholder="email@example.com"
                       />
                    </fieldset>

                    <fieldset className="space-y-2">
                       <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{t('message')}</label>
                       <textarea 
                         required
                         rows={4}
                         value={formData.message}
                         onChange={e => setFormData({...formData, message: e.target.value})}
                         className="w-full bg-piano-black/50 border border-white/5 rounded-xl px-5 py-4 text-white focus:border-gold outline-none transition-all resize-none"
                         placeholder={t('message_placeholder')}
                       />
                    </fieldset>
                 </div>

                 <button 
                   type="submit" 
                   disabled={loading}
                   className="w-full bg-gold hover:bg-gold-dark text-piano-black font-bold py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center space-x-3 disabled:opacity-50"
                 >
                   {loading ? (
                     <div className="w-6 h-6 border-2 border-piano-black border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <>
                        <span className="uppercase tracking-[0.2em]">{t('submit')}</span>
                        <Send className="w-5 h-5" />
                     </>
                   )}
                 </button>

                 <p className="text-[10px] text-center text-white/20 uppercase tracking-widest">
                    {t('contact_privacy')}
                 </p>
               </form>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
